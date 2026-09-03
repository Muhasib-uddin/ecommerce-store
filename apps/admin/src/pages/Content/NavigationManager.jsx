import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Alert,
} from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { toast } from "react-toastify";
import {
  getRealNavMenus,
  createRealMenuItem,
  deleteRealMenuItem,
  updateRealMenuItem,
} from "../../helpers/real_backend_helper";

const NavigationManager = () => {
  const [successMsg, setSuccessMsg] = useState("");
  const [selectedMenu, setSelectedMenu] = useState("header");
  const [loading, setLoading] = useState(true);

  // Menus state
  const [menus, setMenus] = useState([
    {
      id: "header",
      name: "Header Navigation",
      menuId: null,
      items: [],
    },
    {
      id: "footer",
      name: "Footer Navigation",
      menuId: null,
      items: [],
    },
  ]);

  const loadMenu = async (menuName = selectedMenu) => {
    try {
      setLoading(true);
      const data = await getRealNavMenus(menuName);
      if (data && data.items) {
        // Flatten or use items
        const flattenItems = (items, parentId = null) => {
          let res = [];
          items.forEach((item) => {
            res.push({
              id: item.id,
              title: item.title,
              url: item.url,
              position: item.position || 1,
              parentId: item.parentId || parentId,
            });
            if (item.children && item.children.length > 0) {
              res = res.concat(flattenItems(item.children, item.id));
            }
          });
          return res;
        };

        const flat = flattenItems(data.items);
        setMenus((prev) =>
          prev.map((m) =>
            m.id === menuName
              ? { ...m, menuId: data.id, items: flat }
              : m
          )
        );
      }
    } catch (err) {
      console.warn(`Menu "${menuName}" not found or error loading:`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenu(selectedMenu);
  }, [selectedMenu]);

  // Form State
  const [itemForm, setItemForm] = useState({
    title: "",
    url: "",
    position: 1,
    parentId: "",
  });

  const activeMenuObj = menus.find((m) => m.id === selectedMenu) || menus[0];

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setItemForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleMenuChange = (e) => {
    const newMenu = e.target.value;
    setSelectedMenu(newMenu);
    setItemForm({ title: "", url: "", position: 1, parentId: "" });
  };

  const addMenuItem = async (e) => {
    e.preventDefault();
    if (!itemForm.title || !itemForm.url) return;

    if (!activeMenuObj.menuId) {
      // Fallback local update if menu does not exist on server yet
      const newItem = {
        id: Date.now().toString(),
        title: itemForm.title,
        url: itemForm.url,
        position: Number(itemForm.position),
        parentId: itemForm.parentId === "" ? null : itemForm.parentId,
      };
      setMenus((prev) =>
        prev.map((menu) =>
          menu.id === selectedMenu
            ? { ...menu, items: [...menu.items, newItem].sort((a, b) => a.position - b.position) }
            : menu
        )
      );
      setItemForm({ title: "", url: "", position: 1, parentId: "" });
      toast.success("Navigation link added to menu!", { autoClose: 2000 });
      return;
    }

    try {
      const payload = {
        menuId: activeMenuObj.menuId,
        parentId: itemForm.parentId ? itemForm.parentId : null,
        title: itemForm.title,
        url: itemForm.url,
        position: Number(itemForm.position),
      };

      await createRealMenuItem(payload);
      await loadMenu(selectedMenu);
      setItemForm({ title: "", url: "", position: 1, parentId: "" });
      toast.success("Navigation link added to menu!", { autoClose: 2000 });
    } catch (err) {
      console.error("Failed to add menu item:", err);
      toast.error(err.message || "Failed to add menu item", { autoClose: 3000 });
    }
  };

  const deleteMenuItem = async (itemId) => {
    try {
      if (typeof itemId === "string" && itemId.length > 20) {
        await deleteRealMenuItem(itemId);
      }
      setMenus((prev) =>
        prev.map((menu) => {
          if (menu.id === selectedMenu) {
            const filtered = menu.items
              .filter((item) => item.id !== itemId)
              .map((item) => (item.parentId === itemId ? { ...item, parentId: null } : item));
            return { ...menu, items: filtered };
          }
          return menu;
        })
      );
      toast.success("Navigation link deleted.", { autoClose: 2000 });
    } catch (err) {
      console.error("Failed to delete menu item:", err);
      toast.error(err.message || "Failed to delete menu item", { autoClose: 3000 });
    }
  };

  const moveItem = async (itemId, direction) => {
    const items = [...activeMenuObj.items];
    const idx = items.findIndex((item) => item.id === itemId);
    if (idx === -1) return;

    const currentItem = items[idx];
    const sameParentItems = items.filter((it) => it.parentId === currentItem.parentId);
    const sameParentIndex = sameParentItems.findIndex((it) => it.id === itemId);

    const targetSameParentIndex = sameParentIndex + direction;
    if (targetSameParentIndex < 0 || targetSameParentIndex >= sameParentItems.length) {
      return;
    }

    const targetItem = sameParentItems[targetSameParentIndex];
    const tempPos = currentItem.position;
    const targetPos = targetItem.position;

    // Optimistic UI update
    currentItem.position = targetPos;
    targetItem.position = tempPos;

    setMenus((prev) =>
      prev.map((menu) => {
        if (menu.id === selectedMenu) {
          const reordered = [...items].sort((a, b) => {
            if (a.parentId === b.parentId) return a.position - b.position;
            return 0;
          });
          return { ...menu, items: reordered };
        }
        return menu;
      })
    );

    // Persist to backend
    try {
      if (typeof currentItem.id === "string" && currentItem.id.length > 20) {
        await updateRealMenuItem(currentItem.id, { position: targetPos });
      }
      if (typeof targetItem.id === "string" && targetItem.id.length > 20) {
        await updateRealMenuItem(targetItem.id, { position: tempPos });
      }
      await loadMenu(selectedMenu);
    } catch (err) {
      console.error("Failed to persist reordering:", err);
    }
  };

  // Build tree data structure for rendering
  const buildMenuTree = (items) => {
    const roots = items.filter((item) => item.parentId === null);
    const getChildren = (parentId) => items.filter((item) => item.parentId === parentId);

    return roots.map((root) => ({
      ...root,
      children: getChildren(root.id),
    }));
  };

  const menuTree = buildMenuTree(activeMenuObj.items);
  const potentialParents = activeMenuObj.items.filter((item) => item.parentId === null);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Content" breadcrumbItem="Navigation Menus" />

          {successMsg && (
            <Alert color="success" className="mb-4">
              {successMsg}
            </Alert>
          )}

          <Row>
            {/* Menu select and Item Builder */}
            <Col lg="5">
              <Card>
                <CardBody>
                  <CardTitle className="mb-4">Navigation Configuration</CardTitle>

                  <FormGroup className="mb-4">
                    <Label for="selectMenu">Choose Menu to Edit</Label>
                    <Input
                      type="select"
                      id="selectMenu"
                      value={selectedMenu}
                      onChange={handleMenuChange}
                    >
                      {menus.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </Input>
                  </FormGroup>

                  <hr className="my-4" />

                  <CardTitle className="h5 mb-3">Add Menu Link</CardTitle>
                  <Form onSubmit={addMenuItem}>
                    <FormGroup className="mb-3">
                      <Label for="linkTitle">Link Label</Label>
                      <Input
                        type="text"
                        id="linkTitle"
                        name="title"
                        value={itemForm.title}
                        onChange={handleFormChange}
                        placeholder="e.g. Products Catalogue"
                        required
                      />
                    </FormGroup>

                    <FormGroup className="mb-3">
                      <Label for="linkUrl">Redirect URL / Path</Label>
                      <Input
                        type="text"
                        id="linkUrl"
                        name="url"
                        value={itemForm.url}
                        onChange={handleFormChange}
                        placeholder="e.g. /ecommerce-products or https://..."
                        required
                      />
                    </FormGroup>

                    <Row>
                      <Col md="6">
                        <FormGroup className="mb-3">
                          <Label for="linkPosition">Sort Position</Label>
                          <Input
                            type="number"
                            id="linkPosition"
                            name="position"
                            value={itemForm.position}
                            onChange={handleFormChange}
                            min="1"
                            required
                          />
                        </FormGroup>
                      </Col>
                      <Col md="6">
                        <FormGroup className="mb-3">
                          <Label for="linkParent">Parent Link</Label>
                          <Input
                            type="select"
                            id="linkParent"
                            name="parentId"
                            value={itemForm.parentId}
                            onChange={handleFormChange}
                          >
                            <option value="">None (Top Level)</option>
                            {potentialParents.map((parent) => (
                              <option key={parent.id} value={parent.id}>
                                {parent.title}
                              </option>
                            ))}
                          </Input>
                        </FormGroup>
                      </Col>
                    </Row>

                    <Button type="submit" color="primary" className="w-100 mt-2">
                      <i className="bx bx-plus me-1"></i> Add Link Item
                    </Button>
                  </Form>
                </CardBody>
              </Card>
            </Col>

            {/* Tree structure visualizer */}
            <Col lg="7">
              <Card>
                <CardBody>
                  <CardTitle className="mb-4">
                    Menu Tree: <span className="text-primary">{activeMenuObj.name}</span>
                  </CardTitle>
                  <p className="text-muted">Preview the nested tree layout and change link ordering.</p>

                  <div className="bg-light p-3 rounded border">
                    {menuTree.length > 0 ? (
                      <ul className="list-unstyled mb-0">
                        {menuTree.map((item) => (
                          <li key={item.id} className="mb-3">
                            <div className="d-flex justify-content-between align-items-center bg-white p-2 rounded border">
                              <div className="d-flex align-items-center gap-2">
                                <i className="bx bx-move text-muted"></i>
                                <span className="fw-semibold text-dark">{item.title}</span>
                                <code className="text-muted font-size-11">{item.url}</code>
                              </div>
                              <div className="d-flex align-items-center gap-1">
                                <Button size="sm" color="light" onClick={() => moveItem(item.id, -1)}>
                                  <i className="bx bx-up-arrow-alt"></i>
                                </Button>
                                <Button size="sm" color="light" onClick={() => moveItem(item.id, 1)}>
                                  <i className="bx bx-down-arrow-alt"></i>
                                </Button>
                                <Button
                                  size="sm"
                                  color="danger"
                                  outline
                                  onClick={() => deleteMenuItem(item.id)}
                                >
                                  <i className="bx bx-trash"></i>
                                </Button>
                              </div>
                            </div>

                            {/* Nested children */}
                            {item.children && item.children.length > 0 && (
                              <ul className="list-unstyled ps-4 mt-2">
                                {item.children.map((child) => (
                                  <li key={child.id} className="mb-2">
                                    <div
                                      className="d-flex justify-content-between align-items-center bg-white p-2 rounded border"
                                      style={{ borderLeft: "3px solid #556ee6" }}
                                    >
                                      <div className="d-flex align-items-center gap-2">
                                        <i className="bx bx-subdirectory-right text-primary"></i>
                                        <span className="text-dark font-size-13">{child.title}</span>
                                        <code className="text-muted font-size-11">{child.url}</code>
                                      </div>
                                      <div className="d-flex align-items-center gap-1">
                                        <Button size="sm" color="light" onClick={() => moveItem(child.id, -1)}>
                                          <i className="bx bx-up-arrow-alt"></i>
                                        </Button>
                                        <Button size="sm" color="light" onClick={() => moveItem(child.id, 1)}>
                                          <i className="bx bx-down-arrow-alt"></i>
                                        </Button>
                                        <Button
                                          size="sm"
                                          color="danger"
                                          outline
                                          onClick={() => deleteMenuItem(child.id)}
                                        >
                                          <i className="bx bx-trash"></i>
                                        </Button>
                                      </div>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-center py-4 text-muted">
                        Menu is empty. Add links using the creator panel.
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default NavigationManager;
