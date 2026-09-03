import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  Table,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Alert,
} from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import PaginationControls from "../../components/Common/PaginationControls";
import { toast } from "react-toastify";
import {
  getRealPages,
  createRealPage,
  updateRealPage,
  deleteRealPage,
} from "../../helpers/real_backend_helper";

const PageManager = () => {
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState([]);

  // Pagination State
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // View States: 'list' or 'edit'
  const [viewMode, setViewMode] = useState("list");
  const [selectedPage, setSelectedPage] = useState(null);

  // Form State
  const [formValues, setFormValues] = useState({
    title: "",
    slug: "",
    published: false,
    content: "",
    metaTitle: "",
    metaDescription: "",
  });

  const fetchPages = async () => {
    try {
      setLoading(true);
      const data = await getRealPages();
      const pagesArr = Array.isArray(data) ? data : [];
      setPages(
        pagesArr.map((p) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          status: p.published ? "Published" : "Draft",
          content: p.content || "",
          metaTitle: p.metaTitle || "",
          metaDescription: p.metaDescription || "",
        }))
      );
    } catch (err) {
      console.error("Failed to load pages:", err);
      toast.error("Failed to load pages from server", { autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let updatedForm = {
      ...formValues,
      [name]: type === "checkbox" ? checked : value,
    };

    // Auto-generate slug from title
    if (name === "title" && (!selectedPage || !formValues.slug)) {
      updatedForm.slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
    }

    setFormValues(updatedForm);
  };

  const handleEditClick = (pageObj) => {
    setSelectedPage(pageObj);
    setFormValues({
      title: pageObj.title,
      slug: pageObj.slug,
      published: pageObj.status === "Published",
      content: pageObj.content,
      metaTitle: pageObj.metaTitle,
      metaDescription: pageObj.metaDescription,
    });
    setViewMode("edit");
  };

  const handleAddClick = () => {
    setSelectedPage(null);
    setFormValues({
      title: "",
      slug: "",
      published: false,
      content: "",
      metaTitle: "",
      metaDescription: "",
    });
    setViewMode("edit");
  };

  const savePageObj = async (e) => {
    e.preventDefault();
    if (!formValues.title || !formValues.content) {
      toast.warning("Title and content are required.");
      return;
    }

    try {
      const payload = {
        title: formValues.title,
        slug: formValues.slug || formValues.title.toLowerCase().replace(/\s+/g, "-"),
        content: formValues.content,
        metaTitle: formValues.metaTitle || null,
        metaDescription: formValues.metaDescription || null,
        published: formValues.published,
      };

      if (selectedPage) {
        await updateRealPage(selectedPage.id, payload);
        toast.success("Static page updated successfully!", { autoClose: 2000 });
      } else {
        await createRealPage(payload);
        toast.success("New static page created successfully!", { autoClose: 2000 });
      }

      await fetchPages();
      setViewMode("list");
    } catch (err) {
      console.error("Failed to save page:", err);
      toast.error(err.message || "Failed to save page", { autoClose: 3000 });
    }
  };

  const deletePageObj = async (id) => {
    try {
      await deleteRealPage(id);
      setPages((prev) => prev.filter((p) => p.id !== id));
      toast.success("Static page deleted successfully.", { autoClose: 2000 });
    } catch (err) {
      console.error("Failed to delete page:", err);
      toast.error(err.message || "Failed to delete page", { autoClose: 3000 });
    }
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Content" breadcrumbItem="Page Manager" />

          {successMsg && (
            <Alert color="success" className="mb-4">
              {successMsg}
            </Alert>
          )}

          {viewMode === "list" ? (
            <Row>
              <Col lg="12">
                <Card>
                  <CardBody>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <CardTitle className="mb-0">Static Pages</CardTitle>
                      <Button color="primary" onClick={handleAddClick}>
                        <i className="bx bx-plus me-1"></i> Create Page
                      </Button>
                    </div>

                    <div className="table-responsive">
                      <Table className="table align-middle table-nowrap table-hover">
                        <thead className="table-light">
                          <tr>
                            <th>Title</th>
                            <th>Slug Path</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pages
                            .slice((pageNum - 1) * pageSize, pageNum * pageSize)
                            .map((p) => (
                            <tr key={p.id}>
                              <td>
                                <h5 className="font-size-14 mb-1 text-truncate" style={{ maxWidth: "300px" }}>{p.title}</h5>
                              </td>
                              <td>
                                <code className="text-primary">/{p.slug}</code>
                              </td>
                              <td>
                                <span
                                  className={`badge ${
                                    p.status === "Published" ? "bg-success" : "bg-warning"
                                  }`}
                                >
                                  {p.status}
                                </span>
                              </td>
                              <td>
                                <div className="d-flex gap-2">
                                  <Button
                                    size="sm"
                                    color="info"
                                    outline
                                    onClick={() => handleEditClick(p)}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    color="danger"
                                    outline
                                    onClick={() => deletePageObj(p.id)}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>

                    <PaginationControls
                      currentPage={pageNum}
                      totalItems={pages.length}
                      pageSize={pageSize}
                      onPageChange={setPageNum}
                      onPageSizeChange={(newSize) => {
                        setPageSize(newSize);
                        setPageNum(1);
                      }}
                    />
                  </CardBody>
                </Card>
              </Col>
            </Row>
          ) : (
            <Row>
              <Col lg="12">
                <Card>
                  <CardBody>
                    <CardTitle className="mb-4">
                      {currentPage ? `Edit Page: ${currentPage.title}` : "Create Static Content Page"}
                    </CardTitle>
                    <Form onSubmit={savePageObj}>
                      <Row>
                        <Col lg="8">
                          <FormGroup className="mb-3">
                            <Label for="pageTitle">Page Title</Label>
                            <Input
                              type="text"
                              id="pageTitle"
                              name="title"
                              value={formValues.title}
                              onChange={handleInputChange}
                              placeholder="e.g. Terms of Service"
                              required
                            />
                          </FormGroup>

                          <FormGroup className="mb-3">
                            <Label for="pageSlug">Slug Path (Auto-generated)</Label>
                            <div className="input-group">
                              <span className="input-group-text">/</span>
                              <Input
                                type="text"
                                id="pageSlug"
                                name="slug"
                                value={formValues.slug}
                                onChange={handleInputChange}
                                placeholder="terms-of-service"
                                required
                              />
                            </div>
                          </FormGroup>

                          <FormGroup className="mb-3">
                            <Label for="pageContent">Body Content</Label>
                            <Input
                              type="textarea"
                              id="pageContent"
                              name="content"
                              value={formValues.content}
                              onChange={handleInputChange}
                              rows="14"
                              placeholder="Write clean HTML/Markdown contents for static page..."
                              required
                            />
                          </FormGroup>
                        </Col>

                        <Col lg="4">
                          <FormGroup className="mb-3">
                            <Label for="pageStatus">Status</Label>
                            <Input
                              type="select"
                              id="pageStatus"
                              name="status"
                              value={formValues.status}
                              onChange={handleInputChange}
                            >
                              <option value="Published">Published</option>
                              <option value="Draft">Draft</option>
                            </Input>
                          </FormGroup>

                          <Card className="border bg-light mt-4">
                            <CardBody>
                              <CardTitle className="h6 mb-3">SEO Meta Configurations</CardTitle>
                              <FormGroup className="mb-3">
                                <Label for="metaTitle">SEO Title</Label>
                                <Input
                                  type="text"
                                  id="metaTitle"
                                  name="metaTitle"
                                  value={formValues.metaTitle}
                                  onChange={handleInputChange}
                                  placeholder="e.g. Terms and Conditions - Shop Online"
                                />
                              </FormGroup>
                              <FormGroup className="mb-0">
                                <Label for="metaDescription">SEO Description</Label>
                                <Input
                                  type="textarea"
                                  id="metaDescription"
                                  name="metaDescription"
                                  value={formValues.metaDescription}
                                  onChange={handleInputChange}
                                  rows="4"
                                  placeholder="Summary of terms, user rights and company liability rules..."
                                />
                              </FormGroup>
                            </CardBody>
                          </Card>
                        </Col>
                      </Row>

                      <div className="d-flex justify-content-end gap-2 mt-4">
                        <Button type="button" color="secondary" outline onClick={() => setViewMode("list")}>
                          Cancel
                        </Button>
                        <Button type="submit" color="primary">
                          Save Static Page
                        </Button>
                      </div>
                    </Form>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          )}
        </Container>
      </div>
    </React.Fragment>
  );
};

export default PageManager;
