import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Table,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input,
  FormFeedback,
  Badge,
  Spinner,
} from "reactstrap";
import * as yup from "yup";
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import PaginationControls from "../../components/Common/PaginationControls";
import {
  getCategories,
  addNewCategory,
  updateCategory,
  deleteCategory,
} from "../../store/category/actions";

const CategoryList = () => {
  document.title = "Categories | Admin Dashboard";

  const dispatch = useDispatch();
  const { categories, loading } = useSelector((state) => state.category);

  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  useEffect(() => {
    dispatch(getCategories({ all: "true" }));
  }, [dispatch]);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Flatten categories into an array with depth for hierarchical display and parent dropdown
  const flattenedCategories = useMemo(() => {
    const list = [];
    const traverse = (cats, depth = 0, parentName = "None (Root)") => {
      if (!Array.isArray(cats)) return;
      cats.forEach((cat) => {
        list.push({
          ...cat,
          depth,
          parentName,
          displayName: `${"— ".repeat(depth)}${cat.name}`,
        });
        if (cat.children && cat.children.length > 0) {
          traverse(cat.children, depth + 1, cat.name);
        }
      });
    };
    traverse(categories || []);
    return list;
  }, [categories]);

  // Filtered categories based on search
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return flattenedCategories;
    const term = searchTerm.toLowerCase();
    return flattenedCategories.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.slug.toLowerCase().includes(term) ||
        (c.description && c.description.toLowerCase().includes(term))
    );
  }, [flattenedCategories, searchTerm]);

  // Paginated slice
  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCategories.slice(start, start + pageSize);
  }, [filteredCategories, currentPage, pageSize]);

  // Formik for Add / Edit Category
  const formik = useFormik({
    initialValues: {
      name: "",
      slug: "",
      parentId: "",
      description: "",
      imageUrl: "",
      isActive: true,
    },
    validationSchema: yup.object().shape({
      name: yup.string().trim().required("Please enter category name"),
      slug: yup
        .string()
        .trim()
        .matches(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens")
        .required("Please enter category slug"),
      parentId: yup.string().nullable(),
      description: yup.string().nullable(),
      imageUrl: yup.string().nullable(),
      isActive: yup.boolean(),
    }),
    onSubmit: (values, { resetForm }) => {
      try {
        const payload = {
          name: values.name.trim(),
          slug: values.slug.trim(),
          parentId: values.parentId && values.parentId !== "" ? values.parentId : null,
          description: values.description && values.description.trim() !== "" ? values.description.trim() : null,
          imageUrl: values.imageUrl && values.imageUrl.trim() !== "" ? values.imageUrl.trim() : null,
          isActive: Boolean(values.isActive),
        };

        if (editingCategory) {
          payload.id = editingCategory.id;
          dispatch(updateCategory(payload));
        } else {
          dispatch(addNewCategory(payload));
        }

        setModalOpen(false);
        resetForm();
        setEditingCategory(null);
      } catch (err) {
        console.error("Category save error:", err);
        toast.error("Failed to save category", { autoClose: 3000 });
      }
    },
  });

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    formik.resetForm({
      values: {
        name: "",
        slug: "",
        parentId: "",
        description: "",
        imageUrl: "",
        isActive: true,
      },
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (cat) => {
    setEditingCategory(cat);
    formik.setValues({
      name: cat.name || "",
      slug: cat.slug || "",
      parentId: cat.parentId || "",
      description: cat.description || "",
      imageUrl: cat.imageUrl || "",
      isActive: cat.isActive !== false,
    });
    setModalOpen(true);
  };

  // Auto-slugify when name changes if creating or if slug is untouched
  const handleNameChange = (e) => {
    formik.handleChange(e);
    if (!editingCategory) {
      const slugified = e.target.value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      formik.setFieldValue("slug", slugified);
    }
  };

  const handleDeleteClick = (cat) => {
    setCategoryToDelete(cat);
    setDeleteModal(true);
  };

  const confirmDelete = () => {
    if (categoryToDelete) {
      dispatch(deleteCategory(categoryToDelete.id));
      setDeleteModal(false);
      setCategoryToDelete(null);
    }
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Ecommerce" breadcrumbItem="Categories" />

          {/* Top Metrics & Action Row */}
          <Row className="mb-3">
            <Col md={4}>
              <Card className="mini-stats-wid mb-3 mb-md-0">
                <CardBody>
                  <div className="d-flex">
                    <div className="flex-grow-1">
                      <p className="text-muted fw-medium">Total Categories</p>
                      <h4 className="mb-0">{flattenedCategories.length}</h4>
                    </div>
                    <div className="avatar-sm rounded-circle bg-primary align-self-center mini-stat-icon">
                      <span className="avatar-title rounded-circle bg-primary">
                        <i className="bx bx-category font-size-24"></i>
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col md={8}>
              <Card className="mb-0 h-100">
                <CardBody className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                  <div className="search-box me-2" style={{ minWidth: "260px" }}>
                    <div className="position-relative">
                      <Input
                        type="text"
                        className="form-control"
                        placeholder="Search categories by name, slug..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <i className="bx bx-search-alt search-icon" />
                    </div>
                  </div>
                  <Button
                    color="primary"
                    className="btn-rounded waves-effect waves-light"
                    onClick={handleOpenAddModal}
                  >
                    <i className="bx bx-plus me-1"></i> Add Category
                  </Button>
                </CardBody>
              </Card>
            </Col>
          </Row>

          {/* Categories Table */}
          {loading ? (
            <div className="text-center py-5">
              <Spinner color="primary" />
              <p className="mt-2 text-muted">Loading categories...</p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <Card>
              <CardBody className="text-center py-5">
                <i className="bx bx-category display-4 text-muted mb-3"></i>
                <h5>No Categories Found</h5>
                <p className="text-muted">
                  {searchTerm
                    ? "No categories match your search term."
                    : "Create your first category to start organizing products."}
                </p>
                <Button color="primary" onClick={handleOpenAddModal}>
                  <i className="bx bx-plus me-1"></i> Add Category
                </Button>
              </CardBody>
            </Card>
          ) : (
            <Card>
              <CardBody className="p-0">
                <div className="table-responsive">
                  <Table className="align-middle table-nowrap table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: "60px" }}>Image</th>
                        <th>Category Name</th>
                        <th>Slug</th>
                        <th>Parent Category</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th className="text-center" style={{ width: "120px" }}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedCategories.map((cat) => {
                        const img =
                          cat.imageUrl ||
                          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=100&q=80";

                        return (
                          <tr key={cat.id}>
                            <td>
                              <img
                                src={img}
                                alt={cat.name}
                                className="avatar-xs rounded object-fit-cover"
                                onError={(e) => {
                                  e.target.src =
                                    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=100&q=80";
                                }}
                              />
                            </td>
                            <td>
                              <div
                                style={{
                                  paddingLeft: `${cat.depth * 22}px`,
                                }}
                                className="d-flex align-items-center"
                              >
                                {cat.depth > 0 && (
                                  <i className="bx bx-subdirectory-right me-1 text-muted"></i>
                                )}
                                <span className="fw-semibold text-dark font-size-14">
                                  {cat.name}
                                </span>
                              </div>
                            </td>
                            <td>
                              <code>{cat.slug}</code>
                            </td>
                            <td>
                              <Badge color="light" className="text-muted font-size-12">
                                {cat.parentName}
                              </Badge>
                            </td>
                            <td>
                              <span
                                className="text-muted font-size-13 text-truncate d-inline-block"
                                style={{ maxWidth: "240px" }}
                              >
                                {cat.description || "—"}
                              </span>
                            </td>
                            <td>
                              {cat.isActive !== false ? (
                                <Badge color="success" className="font-size-11">
                                  Active
                                </Badge>
                              ) : (
                                <Badge color="secondary" className="font-size-11">
                                  Inactive
                                </Badge>
                              )}
                            </td>
                            <td className="text-center">
                              <div className="d-flex gap-1 justify-content-center">
                                <Button
                                  size="sm"
                                  color="light"
                                  className="text-primary"
                                  title="Edit Category"
                                  onClick={() => handleOpenEditModal(cat)}
                                >
                                  <i className="mdi mdi-pencil font-size-14"></i>
                                </Button>
                                <Button
                                  size="sm"
                                  color="light"
                                  className="text-danger"
                                  title="Delete Category"
                                  onClick={() => handleDeleteClick(cat)}
                                >
                                  <i className="mdi mdi-delete font-size-14"></i>
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>

                <PaginationControls
                  currentPage={currentPage}
                  totalItems={filteredCategories.length}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={(newSize) => {
                    setPageSize(newSize);
                    setCurrentPage(1);
                  }}
                />
              </CardBody>
            </Card>
          )}

          {/* Add / Edit Category Modal */}
          <Modal isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)} centered>
            <ModalHeader toggle={() => setModalOpen(!modalOpen)}>
              {editingCategory ? "Edit Category" : "Add New Category"}
            </ModalHeader>
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                if (Object.keys(formik.errors).length > 0) {
                  toast.error("Please fill required fields: " + Object.keys(formik.errors).join(", "));
                }
                formik.handleSubmit(e);
              }}
            >
              <ModalBody>
                <FormGroup className="mb-3">
                  <Label htmlFor="cat-name">
                    Category Name <span className="text-danger">*</span>
                  </Label>
                  <Input
                    id="cat-name"
                    name="name"
                    type="text"
                    placeholder="e.g. Footwear, Men's Clothing, Electronics"
                    value={formik.values.name}
                    onChange={handleNameChange}
                    onBlur={formik.handleBlur}
                    invalid={formik.touched.name && Boolean(formik.errors.name)}
                  />
                  {formik.touched.name && formik.errors.name && (
                    <FormFeedback>{formik.errors.name}</FormFeedback>
                  )}
                </FormGroup>

                <FormGroup className="mb-3">
                  <Label htmlFor="cat-slug">
                    Category Slug <span className="text-danger">*</span>
                  </Label>
                  <Input
                    id="cat-slug"
                    name="slug"
                    type="text"
                    placeholder="e.g. footwear, mens-clothing"
                    value={formik.values.slug}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    invalid={formik.touched.slug && Boolean(formik.errors.slug)}
                  />
                  {formik.touched.slug && formik.errors.slug && (
                    <FormFeedback>{formik.errors.slug}</FormFeedback>
                  )}
                  <small className="text-muted">
                    URL-friendly unique identifier (used in storefront navigation and filters).
                  </small>
                </FormGroup>

                <FormGroup className="mb-3">
                  <Label htmlFor="cat-parentId">Parent Category (Optional)</Label>
                  <Input
                    id="cat-parentId"
                    name="parentId"
                    type="select"
                    className="form-select"
                    value={formik.values.parentId}
                    onChange={formik.handleChange}
                  >
                    <option value="">None (Top-level Root Category)</option>
                    {flattenedCategories
                      .filter((c) => !editingCategory || c.id !== editingCategory.id)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.displayName}
                        </option>
                      ))}
                  </Input>
                </FormGroup>

                <FormGroup className="mb-3">
                  <Label htmlFor="cat-imageUrl">Category Banner / Image URL</Label>
                  <Input
                    id="cat-imageUrl"
                    name="imageUrl"
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={formik.values.imageUrl}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    invalid={formik.touched.imageUrl && Boolean(formik.errors.imageUrl)}
                  />
                  {formik.touched.imageUrl && formik.errors.imageUrl && (
                    <FormFeedback>{formik.errors.imageUrl}</FormFeedback>
                  )}
                </FormGroup>

                <FormGroup className="mb-3">
                  <Label htmlFor="cat-desc">Description</Label>
                  <Input
                    id="cat-desc"
                    name="description"
                    type="textarea"
                    rows={3}
                    placeholder="Brief description of products in this category..."
                    value={formik.values.description}
                    onChange={formik.handleChange}
                  />
                </FormGroup>

                <FormGroup className="mb-0">
                  <div className="form-check form-switch form-switch-md">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="isActiveSwitch"
                      checked={formik.values.isActive}
                      onChange={(e) => formik.setFieldValue("isActive", e.target.checked)}
                    />
                    <label className="form-check-label ms-2" htmlFor="isActiveSwitch">
                      Active (Display in storefront menu and product filters)
                    </label>
                  </div>
                </FormGroup>
              </ModalBody>
              <ModalFooter>
                <Button color="secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button color="primary" type="submit" disabled={formik.isSubmitting}>
                  {formik.isSubmitting ? (
                    <Spinner size="sm" className="me-1" />
                  ) : (
                    <i className="bx bx-save me-1"></i>
                  )}
                  {editingCategory ? "Save Changes" : "Create Category"}
                </Button>
              </ModalFooter>
            </Form>
          </Modal>

          {/* Delete Confirmation Modal */}
          <Modal isOpen={deleteModal} toggle={() => setDeleteModal(!deleteModal)} centered>
            <ModalHeader toggle={() => setDeleteModal(false)}>Delete Category</ModalHeader>
            <ModalBody>
              <div className="text-center py-3">
                <i className="bx bx-trash display-4 text-danger mb-3"></i>
                <h5>Are you sure you want to delete this category?</h5>
                <p className="text-muted mb-0">
                  Category: <strong>{categoryToDelete?.name}</strong> (Slug:{" "}
                  {categoryToDelete?.slug})
                </p>
                <small className="text-danger">
                  Any child categories or mapped products will be unlinked from this category.
                </small>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="secondary" onClick={() => setDeleteModal(false)}>
                Cancel
              </Button>
              <Button color="danger" onClick={confirmDelete}>
                Yes, Delete Category
              </Button>
            </ModalFooter>
          </Modal>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default CategoryList;
