import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardBody,
  Col,
  Container,
  Row,
  Input,
  Button,
  Badge,
  Table,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Nav,
  NavItem,
  NavLink,
  Spinner,
} from "reactstrap";
import classnames from "classnames";
import { useDispatch, useSelector } from "react-redux";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { getProducts, deleteProduct } from "../../store/e-commerce/actions";
import { getCategories } from "../../store/category/actions";
import { useCurrency } from "../../helpers/currency_helper";
import PaginationControls from "../../components/Common/PaginationControls";

const EcommerceProducts = () => {
  document.title = "Products | Admin Dashboard";

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { formatCurrency, symbol } = useCurrency();

  const { products, loading } = useSelector((state) => state.ecommerce);
  const { categories } = useSelector((state) => state.category);

  const [activeTab, setActiveTab] = useState("1"); // 1: Table, 2: Grid
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedStock, setSelectedStock] = useState("all");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    dispatch(getProducts());
    dispatch(getCategories({ all: "true" }));
  }, [dispatch]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedStatus, selectedStock]);

  // Flatten categories list for dropdown
  const categoryOptions = useMemo(() => {
    const list = [];
    const traverse = (cats, depth = 0) => {
      if (!Array.isArray(cats)) return;
      cats.forEach((cat) => {
        list.push({
          id: cat.id,
          name: `${"— ".repeat(depth)}${cat.name}`,
          originalName: cat.name,
        });
        if (cat.children && cat.children.length > 0) {
          traverse(cat.children, depth + 1);
        }
      });
    };
    traverse(categories || []);
    return list;
  }, [categories]);

  // Filter products based on search, category, status, stock
  const filteredProducts = useMemo(() => {
    const list = Array.isArray(products) ? products : [];
    return list.filter((product) => {
      // Search
      const matchesSearch =
        !searchTerm ||
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase());

      // Category
      const matchesCategory =
        selectedCategory === "all" ||
        product.categoryId === selectedCategory ||
        product.category?.id === selectedCategory ||
        product.category === selectedCategory ||
        (product.category?.name && product.category.name === selectedCategory);

      // Status
      const isPublished = product.published !== false;
      const matchesStatus =
        selectedStatus === "all" ||
        (selectedStatus === "published" && isPublished) ||
        (selectedStatus === "draft" && !isPublished);

      // Stock
      const stock = Number(product.stock ?? 0);
      const matchesStock =
        selectedStock === "all" ||
        (selectedStock === "instock" && stock > 5) ||
        (selectedStock === "lowstock" && stock > 0 && stock <= 5) ||
        (selectedStock === "outofstock" && stock === 0);

      return matchesSearch && matchesCategory && matchesStatus && matchesStock;
    });
  }, [products, searchTerm, selectedCategory, selectedStatus, selectedStock]);

  // Paginated slice
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  // Metrics
  const metrics = useMemo(() => {
    const list = Array.isArray(products) ? products : [];
    const total = list.length;
    const inStock = list.filter((p) => (Number(p.stock) || 0) > 0).length;
    const outOfStock = list.filter((p) => (Number(p.stock) || 0) === 0).length;
    const published = list.filter((p) => p.published !== false).length;
    return { total, inStock, outOfStock, published };
  }, [products]);

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setDeleteModal(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      dispatch(deleteProduct(productToDelete.id));
      setDeleteModal(false);
      setProductToDelete(null);
    }
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Ecommerce" breadcrumbItem="All Products" />

          {/* Quick Metrics */}
          <Row className="mb-4">
            <Col xl={3} md={6}>
              <Card className="mini-stats-wid mb-0">
                <CardBody>
                  <div className="d-flex">
                    <div className="flex-grow-1">
                      <p className="text-muted fw-medium">Total Products</p>
                      <h4 className="mb-0">{metrics.total}</h4>
                    </div>
                    <div className="avatar-sm rounded-circle bg-primary align-self-center mini-stat-icon">
                      <span className="avatar-title rounded-circle bg-primary">
                        <i className="bx bx-package font-size-24"></i>
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col xl={3} md={6}>
              <Card className="mini-stats-wid mb-0">
                <CardBody>
                  <div className="d-flex">
                    <div className="flex-grow-1">
                      <p className="text-muted fw-medium">In Stock</p>
                      <h4 className="mb-0 text-success">{metrics.inStock}</h4>
                    </div>
                    <div className="avatar-sm rounded-circle bg-success align-self-center mini-stat-icon">
                      <span className="avatar-title rounded-circle bg-success">
                        <i className="bx bx-check-circle font-size-24"></i>
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col xl={3} md={6}>
              <Card className="mini-stats-wid mb-0">
                <CardBody>
                  <div className="d-flex">
                    <div className="flex-grow-1">
                      <p className="text-muted fw-medium">Out of Stock</p>
                      <h4 className="mb-0 text-danger">{metrics.outOfStock}</h4>
                    </div>
                    <div className="avatar-sm rounded-circle bg-danger align-self-center mini-stat-icon">
                      <span className="avatar-title rounded-circle bg-danger">
                        <i className="bx bx-x-circle font-size-24"></i>
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col xl={3} md={6}>
              <Card className="mini-stats-wid mb-0">
                <CardBody>
                  <div className="d-flex">
                    <div className="flex-grow-1">
                      <p className="text-muted fw-medium">Published</p>
                      <h4 className="mb-0 text-info">{metrics.published}</h4>
                    </div>
                    <div className="avatar-sm rounded-circle bg-info align-self-center mini-stat-icon">
                      <span className="avatar-title rounded-circle bg-info">
                        <i className="bx bx-globe font-size-24"></i>
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          {/* Action Bar & Filters */}
          <Card>
            <CardBody>
              <Row className="g-3 align-items-center">
                <Col lg={3} sm={6}>
                  <div className="search-box">
                    <div className="position-relative">
                      <Input
                        type="text"
                        className="form-control"
                        placeholder="Search product, SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <i className="bx bx-search-alt search-icon" />
                    </div>
                  </div>
                </Col>
                <Col lg={2} sm={6}>
                  <Input
                    type="select"
                    className="form-select"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    {categoryOptions.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </Input>
                </Col>
                <Col lg={2} sm={6}>
                  <Input
                    type="select"
                    className="form-select"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </Input>
                </Col>
                <Col lg={2} sm={6}>
                  <Input
                    type="select"
                    className="form-select"
                    value={selectedStock}
                    onChange={(e) => setSelectedStock(e.target.value)}
                  >
                    <option value="all">All Stock Levels</option>
                    <option value="instock">In Stock (&gt;5)</option>
                    <option value="lowstock">Low Stock (1-5)</option>
                    <option value="outofstock">Out of Stock (0)</option>
                  </Input>
                </Col>
                <Col lg={3} className="text-lg-end d-flex justify-content-lg-end gap-2">
                  <Nav pills className="product-view-nav">
                    <NavItem>
                      <NavLink
                        className={classnames({ active: activeTab === "1" })}
                        onClick={() => setActiveTab("1")}
                        style={{ cursor: "pointer" }}
                        title="Table View"
                      >
                        <i className="bx bx-list-ul" />
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        className={classnames({ active: activeTab === "2" })}
                        onClick={() => setActiveTab("2")}
                        style={{ cursor: "pointer" }}
                        title="Grid View"
                      >
                        <i className="bx bx-grid-alt" />
                      </NavLink>
                    </NavItem>
                  </Nav>
                  <Button
                    color="primary"
                    className="btn-rounded waves-effect waves-light"
                    onClick={() => navigate("/ecommerce-add-product")}
                  >
                    <i className="bx bx-plus me-1"></i> Add Product
                  </Button>
                </Col>
              </Row>
            </CardBody>
          </Card>

          {/* Product Content */}
          {loading ? (
            <div className="text-center py-5">
              <Spinner color="primary" />
              <p className="mt-2 text-muted">Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <Card>
              <CardBody className="text-center py-5">
                <i className="bx bx-package display-4 text-muted mb-3"></i>
                <h5>No Products Found</h5>
                <p className="text-muted">
                  {searchTerm || selectedCategory !== "all" || selectedStatus !== "all"
                    ? "Try adjusting your search query or filters."
                    : "Get started by adding your first product."}
                </p>
                <Button
                  color="primary"
                  className="mt-2"
                  onClick={() => navigate("/ecommerce-add-product")}
                >
                  <i className="bx bx-plus me-1"></i> Add New Product
                </Button>
              </CardBody>
            </Card>
          ) : activeTab === "1" ? (
            /* ======================================================== */
            /* TABLE VIEW */
            /* ======================================================== */
            <Card>
              <CardBody className="p-0">
                <div className="table-responsive">
                  <Table className="align-middle table-nowrap table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: "70px" }}>Image</th>
                        <th>Product & SKU</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Status</th>
                        <th className="text-center" style={{ width: "140px" }}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedProducts.map((product) => {
                        const imgUrl =
                          product.images?.[0]?.url ||
                          product.image ||
                          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=150&q=80";
                        const price = parseFloat(product.price || product.newPrice || 0);
                        const comparePrice = product.compareAtPrice
                          ? parseFloat(product.compareAtPrice)
                          : null;
                        const stock = Number(product.stock ?? 0);
                        const isPublished = product.published !== false;
                        const catName =
                          product.category?.name ||
                          (typeof product.category === "string" ? product.category : "Unassigned");

                        return (
                          <tr key={product.id}>
                            <td>
                              <img
                                src={imgUrl}
                                alt={product.name}
                                className="avatar-sm rounded object-fit-cover"
                                onError={(e) => {
                                  e.target.src =
                                    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=150&q=80";
                                }}
                              />
                            </td>
                            <td>
                              <h5 className="font-size-14 mb-1">
                                <Link
                                  to={`/ecommerce-add-product/${product.id}`}
                                  className="text-dark fw-medium text-truncate d-inline-block"
                                  style={{ maxWidth: "260px" }}
                                >
                                  {product.name}
                                </Link>
                              </h5>
                              <span className="text-muted font-size-12">
                                SKU: {product.sku || "N/A"}
                              </span>
                            </td>
                            <td>
                              <Badge color="light" className="text-dark font-size-12 px-2 py-1">
                                {catName}
                              </Badge>
                            </td>
                            <td>
                              <div className="fw-semibold font-size-14 text-dark">
                                {formatCurrency(price)}
                              </div>
                              {comparePrice && comparePrice > price ? (
                                <div className="text-muted font-size-12">
                                  <del>{formatCurrency(comparePrice)}</del>{" "}
                                  <span className="text-danger font-size-11">
                                    (-{Math.round(((comparePrice - price) / comparePrice) * 100)}%)
                                  </span>
                                </div>
                              ) : null}
                            </td>
                            <td>
                              {stock > 5 ? (
                                <Badge color="success-subtle" className="text-success font-size-12">
                                  {stock} in stock
                                </Badge>
                              ) : stock > 0 ? (
                                <Badge color="warning-subtle" className="text-warning font-size-12">
                                  Low: {stock} left
                                </Badge>
                              ) : (
                                <Badge color="danger-subtle" className="text-danger font-size-12">
                                  Out of Stock
                                </Badge>
                              )}
                            </td>
                            <td>
                              {isPublished ? (
                                <Badge color="success" className="font-size-11">
                                  Published
                                </Badge>
                              ) : (
                                <Badge color="secondary" className="font-size-11">
                                  Draft
                                </Badge>
                              )}
                            </td>
                            <td className="text-center">
                              <div className="d-flex gap-1 justify-content-center">
                                <Button
                                  size="sm"
                                  color="light"
                                  className="text-primary"
                                  title="Edit Product"
                                  onClick={() => navigate(`/ecommerce-add-product/${product.id}`)}
                                >
                                  <i className="mdi mdi-pencil font-size-14"></i>
                                </Button>
                                <Button
                                  size="sm"
                                  color="light"
                                  className="text-danger"
                                  title="Delete Product"
                                  onClick={() => handleDeleteClick(product)}
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
                  totalItems={filteredProducts.length}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={(newSize) => {
                    setPageSize(newSize);
                    setCurrentPage(1);
                  }}
                />
              </CardBody>
            </Card>
          ) : (
            /* ======================================================== */
            /* GRID VIEW */
            /* ======================================================== */
            <>
              <Row>
                {paginatedProducts.map((product) => {
                  const imgUrl =
                    product.images?.[0]?.url ||
                    product.image ||
                    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80";
                  const price = parseFloat(product.price || product.newPrice || 0);
                  const comparePrice = product.compareAtPrice
                    ? parseFloat(product.compareAtPrice)
                    : null;
                  const stock = Number(product.stock ?? 0);
                  const isOffer = comparePrice && comparePrice > price;
                  const offerPercent = isOffer
                    ? Math.round(((comparePrice - price) / comparePrice) * 100)
                    : 0;

                  return (
                    <Col xl={3} lg={4} sm={6} key={product.id} className="mb-4">
                      <Card className="h-100 product-box shadow-sm mb-0">
                        <CardBody className="d-flex flex-column">
                          <div className="position-relative text-center mb-3">
                            {isOffer ? (
                              <div className="avatar-sm product-ribbon position-absolute top-0 start-0">
                                <span className="avatar-title rounded-circle bg-danger font-size-11">
                                  -{offerPercent}%
                                </span>
                              </div>
                            ) : null}
                            <img
                              src={imgUrl}
                              alt={product.name}
                              className="img-fluid rounded mx-auto d-block"
                              style={{ height: "180px", objectFit: "cover", width: "100%" }}
                              onError={(e) => {
                                e.target.src =
                                  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80";
                              }}
                            />
                          </div>

                          <div className="mt-auto">
                            <p className="text-muted font-size-12 mb-1">
                              {product.category?.name ||
                                (typeof product.category === "string"
                                  ? product.category
                                  : "Unassigned")}
                            </p>
                            <h5 className="font-size-15 text-truncate mb-2">
                              <Link
                                to={`/ecommerce-add-product/${product.id}`}
                                className="text-dark fw-semibold"
                              >
                                {product.name}
                              </Link>
                            </h5>

                            <div className="d-flex align-items-center justify-content-between mb-2">
                              <div>
                                <span className="font-size-16 fw-bold text-dark me-2">
                                  {formatCurrency(price)}
                                </span>
                                {comparePrice && comparePrice > price ? (
                                  <del className="text-muted font-size-12">
                                    {formatCurrency(comparePrice)}
                                  </del>
                                ) : null}
                              </div>
                              <div>
                                {stock > 0 ? (
                                  <Badge color="success-subtle" className="text-success font-size-11">
                                    {stock} in stock
                                  </Badge>
                                ) : (
                                  <Badge color="danger-subtle" className="text-danger font-size-11">
                                    Out of Stock
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <div className="d-flex gap-2 pt-2 border-top">
                              <Button
                                color="primary"
                                size="sm"
                                className="w-100"
                                onClick={() => navigate(`/ecommerce-add-product/${product.id}`)}
                              >
                                <i className="mdi mdi-pencil me-1"></i> Edit
                              </Button>
                              <Button
                                color="light"
                                size="sm"
                                className="text-danger"
                                onClick={() => handleDeleteClick(product)}
                              >
                                <i className="mdi mdi-delete font-size-14"></i>
                              </Button>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    </Col>
                  );
                })}
              </Row>

              <PaginationControls
                className="mb-4"
                currentPage={currentPage}
                totalItems={filteredProducts.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize);
                  setCurrentPage(1);
                }}
              />
            </>
          )}

          {/* Delete Confirmation Modal */}
          <Modal isOpen={deleteModal} toggle={() => setDeleteModal(!deleteModal)} centered>
            <ModalHeader toggle={() => setDeleteModal(false)}>Delete Product</ModalHeader>
            <ModalBody>
              <div className="text-center py-3">
                <i className="bx bx-trash display-4 text-danger mb-3"></i>
                <h5>Are you sure you want to delete this product?</h5>
                <p className="text-muted mb-0">
                  Product: <strong>{productToDelete?.name}</strong> (SKU:{" "}
                  {productToDelete?.sku || "N/A"})
                </p>
                <small className="text-danger">This action cannot be undone.</small>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="secondary" onClick={() => setDeleteModal(false)}>
                Cancel
              </Button>
              <Button color="danger" onClick={confirmDelete}>
                Yes, Delete Product
              </Button>
            </ModalFooter>
          </Modal>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default EcommerceProducts;
