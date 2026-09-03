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
  getRealBlogPosts,
  getRealBlogCategories,
  createRealBlogPost,
  updateRealBlogPost,
  deleteRealBlogPost,
} from "../../helpers/real_backend_helper";

const BlogManager = () => {
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // View States: 'list' or 'edit'
  const [viewMode, setViewMode] = useState("list");
  const [currentPost, setCurrentPost] = useState(null);

  // Form State
  const [formValues, setFormValues] = useState({
    title: "",
    slug: "",
    authorName: "",
    categoryId: "",
    categoryName: "Design",
    published: false,
    content: "",
    featuredImage: "",
    metaTitle: "",
    metaDescription: "",
  });

  const fetchBlogData = async () => {
    try {
      setLoading(true);
      const [postsData, catsData] = await Promise.all([
        getRealBlogPosts(),
        getRealBlogCategories(),
      ]);
      const postsArr = Array.isArray(postsData) ? postsData : [];
      const catsArr = Array.isArray(catsData) ? catsData : [];
      setCategories(catsArr);
      setPosts(
        postsArr.map((p) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          author: p.authorName || "Admin",
          category: p.category?.name || "Uncategorized",
          categoryId: p.categoryId || "",
          createdDate: p.createdAt ? new Date(p.createdAt).toISOString().split("T")[0] : "",
          status: p.published ? "Published" : "Draft",
          content: p.content || "",
          image: p.featuredImage || "",
          metaTitle: p.metaTitle || "",
          metaDescription: p.metaDescription || "",
        }))
      );
    } catch (err) {
      console.error("Failed to load blog data:", err);
      toast.error("Failed to load blog posts from server", { autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let updatedForm = {
      ...formValues,
      [name]: type === "checkbox" ? checked : value,
    };

    // Auto-generate slug from title
    if (name === "title" && (!currentPost || !formValues.slug)) {
      updatedForm.slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
    }

    setFormValues(updatedForm);
  };

  const handleEditClick = (post) => {
    setCurrentPost(post);
    setFormValues({
      title: post.title,
      slug: post.slug,
      authorName: post.author,
      categoryId: post.categoryId || "",
      categoryName: post.category,
      published: post.status === "Published",
      content: post.content,
      featuredImage: post.image,
      metaTitle: post.metaTitle,
      metaDescription: post.metaDescription,
    });
    setViewMode("edit");
  };

  const handleAddClick = () => {
    setCurrentPost(null);
    setFormValues({
      title: "",
      slug: "",
      authorName: "Admin",
      categoryId: categories[0]?.id || "",
      categoryName: categories[0]?.name || "Design",
      published: false,
      content: "",
      featuredImage: "",
      metaTitle: "",
      metaDescription: "",
    });
    setViewMode("edit");
  };

  const savePost = async (e) => {
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
        authorName: formValues.authorName || "Admin",
        categoryId: formValues.categoryId || null,
        featuredImage: formValues.featuredImage || null,
        metaTitle: formValues.metaTitle || null,
        metaDescription: formValues.metaDescription || null,
        published: formValues.published,
      };

      if (currentPost) {
        await updateRealBlogPost(currentPost.id, payload);
        toast.success("Blog post updated successfully!", { autoClose: 2000 });
      } else {
        await createRealBlogPost(payload);
        toast.success("New blog post created successfully!", { autoClose: 2000 });
      }

      await fetchBlogData();
      setViewMode("list");
    } catch (err) {
      console.error("Failed to save blog post:", err);
      toast.error(err.message || "Failed to save blog post", { autoClose: 3000 });
    }
  };

  const deletePost = async (id) => {
    try {
      await deleteRealBlogPost(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Blog post deleted successfully.", { autoClose: 2000 });
    } catch (err) {
      console.error("Failed to delete blog post:", err);
      toast.error(err.message || "Failed to delete blog post", { autoClose: 3000 });
    }
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Content" breadcrumbItem="Blog Manager" />

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
                      <CardTitle className="mb-0">Blog Posts</CardTitle>
                      <Button color="primary" onClick={handleAddClick}>
                        <i className="bx bx-plus me-1"></i> Create Post
                      </Button>
                    </div>

                    <div className="table-responsive">
                      <Table className="table align-middle table-nowrap table-hover">
                        <thead className="table-light">
                          <tr>
                            <th>Title</th>
                            <th>Author</th>
                            <th>Category</th>
                            <th>Created Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {posts
                            .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                            .map((post) => (
                            <tr key={post.id}>
                              <td>
                                <h5 className="font-size-14 mb-1 text-truncate" style={{ maxWidth: "300px" }}>{post.title}</h5>
                                <p className="text-muted font-size-11 mb-0 text-truncate" style={{ maxWidth: "300px" }}>/{post.slug}</p>
                              </td>
                              <td>{post.author}</td>
                              <td>
                                <span className="badge bg-light text-dark">{post.category}</span>
                              </td>
                              <td>{post.createdDate}</td>
                              <td>
                                <span
                                  className={`badge ${
                                    post.status === "Published" ? "bg-success" : "bg-warning"
                                  }`}
                                >
                                  {post.status}
                                </span>
                              </td>
                              <td>
                                <div className="d-flex gap-2">
                                  <Button
                                    size="sm"
                                    color="info"
                                    outline
                                    onClick={() => handleEditClick(post)}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    color="danger"
                                    outline
                                    onClick={() => deletePost(post.id)}
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
                      currentPage={currentPage}
                      totalItems={posts.length}
                      pageSize={pageSize}
                      onPageChange={setCurrentPage}
                      onPageSizeChange={(newSize) => {
                        setPageSize(newSize);
                        setCurrentPage(1);
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
                      {currentPost ? "Edit Blog Post" : "Create New Blog Post"}
                    </CardTitle>
                    <Form onSubmit={savePost}>
                      <Row>
                        <Col lg="8">
                          <FormGroup className="mb-3">
                            <Label for="postTitle">Post Title</Label>
                            <Input
                              type="text"
                              id="postTitle"
                              name="title"
                              value={formValues.title}
                              onChange={handleInputChange}
                              placeholder="Enter blog post title"
                              required
                            />
                          </FormGroup>

                          <FormGroup className="mb-3">
                            <Label for="postSlug">Slug (Auto-generated)</Label>
                            <Input
                              type="text"
                              id="postSlug"
                              name="slug"
                              value={formValues.slug}
                              onChange={handleInputChange}
                              placeholder="url-friendly-slug"
                              required
                            />
                          </FormGroup>

                          <FormGroup className="mb-3">
                            <Label for="postContent">Content</Label>
                            <Input
                              type="textarea"
                              id="postContent"
                              name="content"
                              value={formValues.content}
                              onChange={handleInputChange}
                              rows="12"
                              placeholder="Write your article markdown/HTML content here..."
                              required
                            />
                          </FormGroup>
                        </Col>

                        <Col lg="4">
                          <FormGroup className="mb-3">
                            <Label for="postStatus">Publishing Status</Label>
                            <Input
                              type="select"
                              id="postStatus"
                              name="status"
                              value={formValues.status}
                              onChange={handleInputChange}
                            >
                              <option value="Published">Published</option>
                              <option value="Draft">Draft</option>
                            </Input>
                          </FormGroup>

                          <FormGroup className="mb-3">
                            <Label for="postCategory">Category</Label>
                            <Input
                              type="select"
                              id="postCategory"
                              name="category"
                              value={formValues.category}
                              onChange={handleInputChange}
                            >
                              <option value="Design">Design</option>
                              <option value="Marketing">Marketing</option>
                              <option value="Trends">Trends</option>
                              <option value="News">News</option>
                            </Input>
                          </FormGroup>

                          <FormGroup className="mb-3">
                            <Label for="postAuthor">Author</Label>
                            <Input
                              type="text"
                              id="postAuthor"
                              name="author"
                              value={formValues.author}
                              onChange={handleInputChange}
                              required
                            />
                          </FormGroup>

                          <FormGroup className="mb-3">
                            <Label for="postImage">Featured Image URL</Label>
                            <Input
                              type="text"
                              id="postImage"
                              name="image"
                              value={formValues.image}
                              onChange={handleInputChange}
                            />
                            {formValues.image && (
                              <img
                                src={formValues.image}
                                alt="Featured Preview"
                                className="img-fluid mt-2 rounded border"
                                style={{ maxHeight: "150px", objectFit: "cover" }}
                              />
                            )}
                          </FormGroup>

                          <Card className="border bg-light mt-3">
                            <CardBody>
                              <CardTitle className="h6 mb-3">SEO Meta Tags</CardTitle>
                              <FormGroup className="mb-3">
                                <Label for="metaTitle">Meta Title</Label>
                                <Input
                                  type="text"
                                  id="metaTitle"
                                  name="metaTitle"
                                  value={formValues.metaTitle}
                                  onChange={handleInputChange}
                                  placeholder="SEO friendly page title"
                                />
                              </FormGroup>
                              <FormGroup className="mb-0">
                                <Label for="metaDescription">Meta Description</Label>
                                <Input
                                  type="textarea"
                                  id="metaDescription"
                                  name="metaDescription"
                                  value={formValues.metaDescription}
                                  onChange={handleInputChange}
                                  rows="3"
                                  placeholder="Short summary for search results"
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
                          Save Post
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

export default BlogManager;
