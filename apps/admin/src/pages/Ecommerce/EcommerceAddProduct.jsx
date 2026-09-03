import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardBody,
  CardTitle,
  Col,
  Container,
  Form,
  Input,
  Label,
  Row,
  FormFeedback,
  FormGroup,
  Table,
  Badge,
  Spinner,
} from "reactstrap";
import Dropzone from "react-dropzone";
import * as yup from "yup";
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { addNewProduct, updateProduct } from "../../store/e-commerce/actions";
import { getCategories } from "../../store/category/actions";
import { getProductDetail } from "../../helpers/fakebackend_helper";
import { useCurrency } from "../../helpers/currency_helper";

const EcommerceAddProduct = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { symbol, currencyCode } = useCurrency();
  const currencyBadge = symbol ? symbol.trim() : currencyCode;

  document.title = `${isEditMode ? "Edit" : "Add"} Product | Admin Dashboard`;

  const { categories } = useSelector((state) => state.category);
  const [loadingInitial, setLoadingInitial] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState([]);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [variants, setVariants] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);

  // Load categories
  useEffect(() => {
    dispatch(getCategories({ all: "true" }));
  }, [dispatch]);

  // Flatten categories list for dropdown
  const categoryOptions = useMemo(() => {
    const list = [];
    const traverse = (cats, depth = 0) => {
      if (!Array.isArray(cats)) return;
      cats.forEach((cat) => {
        list.push({
          id: cat.id,
          name: `${"— ".repeat(depth)}${cat.name}`,
        });
        if (cat.children && cat.children.length > 0) {
          traverse(cat.children, depth + 1);
        }
      });
    };
    traverse(categories || []);
    return list;
  }, [categories]);

  // Generate a default SKU if creating
  const generateRandomSku = (prefix = "PRD") => {
    const random = Math.floor(100000 + Math.random() * 900000);
    return `${prefix}-${random}`;
  };

  // Formik configuration
  const formik = useFormik({
    initialValues: {
      name: "",
      sku: isEditMode ? "" : generateRandomSku(),
      barcode: "",
      categoryId: "",
      price: "",
      compareAtPrice: "",
      costPrice: "",
      stock: 50,
      trackStock: true,
      published: true,
      description: "",
      richContent: "",
    },
    validationSchema: yup.object().shape({
      name: yup.string().trim().required("Please enter product name"),
      sku: yup.string().trim().required("Please enter product SKU"),
      price: yup
        .number()
        .typeError("Price must be a number")
        .positive("Price must be greater than 0")
        .required("Please enter product price"),
      compareAtPrice: yup
        .number()
        .typeError("Compare price must be a number")
        .nullable()
        .notRequired(),
      costPrice: yup
        .number()
        .typeError("Cost price must be a number")
        .nullable()
        .notRequired(),
      stock: yup
        .number()
        .typeError("Stock must be a number")
        .min(0, "Stock cannot be negative")
        .required("Please enter stock quantity"),
      categoryId: yup.string().nullable().notRequired(),
      description: yup.string().nullable().notRequired(),
    }),
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);
        const payload = {
          name: values.name.trim(),
          sku: values.sku.trim() || generateRandomSku(),
          barcode: values.barcode ? values.barcode.trim() : null,
          categoryId: values.categoryId && values.categoryId !== "" ? values.categoryId : null,
          price: Number(values.price),
          compareAtPrice: values.compareAtPrice && Number(values.compareAtPrice) > 0 ? Number(values.compareAtPrice) : null,
          costPrice: values.costPrice && Number(values.costPrice) > 0 ? Number(values.costPrice) : null,
          stock: Number(values.stock || 0),
          trackStock: Boolean(values.trackStock),
          published: Boolean(values.published),
          description: values.description ? values.description.trim() : null,
          richContent: values.richContent ? values.richContent.trim() : null,
          tags: tags,
          images: images.map((img, idx) => ({
            url: img.url,
            isPrimary: Boolean(img.isPrimary || idx === 0),
            position: idx,
          })),
          variants: variants
            .filter((v) => v.name && v.name.trim())
            .map((v) => ({
              name: v.name.trim(),
              sku: v.sku?.trim() || `${values.sku}-${v.name.toLowerCase().replace(/\s+/g, "-")}`,
              price: Number(v.price || values.price),
              compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
              stock: Number(v.stock || 0),
              imageUrl: v.imageUrl || null,
            })),
        };

        if (isEditMode) {
          payload.id = id;
          dispatch(updateProduct(payload));
        } else {
          dispatch(addNewProduct(payload));
        }

        // Navigate back to products list
        setTimeout(() => {
          setIsSubmitting(false);
          navigate("/ecommerce-products");
        }, 800);
      } catch (err) {
        setIsSubmitting(false);
        console.error("Product submit error:", err);
        toast.error(err.message || "Failed to save product", { autoClose: 3000 });
      }
    },
  });

  // Load existing product details for edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const loadProduct = async () => {
        try {
          setLoadingInitial(true);
          const data = await getProductDetail(id);
          if (data) {
            formik.setValues({
              name: data.name || "",
              sku: data.sku || "",
              barcode: data.barcode || "",
              categoryId: data.categoryId || data.category?.id || "",
              price: data.price !== undefined ? data.price : "",
              compareAtPrice: data.compareAtPrice || "",
              costPrice: data.costPrice || "",
              stock: data.stock !== undefined ? data.stock : 0,
              trackStock: data.trackStock !== false,
              published: data.published !== false,
              description: data.description || "",
              richContent: data.richContent || "",
            });

            if (Array.isArray(data.images) && data.images.length > 0) {
              setImages(data.images.map((img) => ({ url: img.url, isPrimary: img.isPrimary })));
            } else if (data.image) {
              setImages([{ url: data.image, isPrimary: true }]);
            }

            if (Array.isArray(data.variants)) {
              setVariants(data.variants);
            }

            if (Array.isArray(data.tags)) {
              setTags(data.tags.map((t) => (typeof t === "object" ? t.name : t)));
            }
          }
        } catch (err) {
          console.error("Failed to load product for editing:", err);
          toast.error("Failed to load product details", { autoClose: 3000 });
        } finally {
          setLoadingInitial(false);
        }
      };
      loadProduct();
    }
  }, [id, isEditMode]);

  // Handle SKU auto-generation button
  const handleAutoGenerateSku = () => {
    const prefix = formik.values.name
      ? formik.values.name
          .substring(0, 3)
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, "SKU")
      : "PRD";
    formik.setFieldValue("sku", generateRandomSku(prefix));
  };

  // Image handling
  const handleAddImageUrl = () => {
    if (!imageUrlInput || !imageUrlInput.trim()) return;
    const url = imageUrlInput.trim();
    setImages((prev) => [...prev, { url, isPrimary: prev.length === 0 }]);
    setImageUrlInput("");
  };

  const handleDropFiles = (acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const previewUrl = reader.result;
        setImages((prev) => [...prev, { url: previewUrl, isPrimary: prev.length === 0 }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const setPrimaryImage = (index) => {
    setImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      }))
    );
  };

  // Variant handling
  const addVariantRow = () => {
    setVariants((prev) => [
      ...prev,
      {
        name: "",
        sku: "",
        price: formik.values.price || "",
        compareAtPrice: "",
        stock: 10,
      },
    ]);
  };

  const updateVariantField = (index, field, value) => {
    setVariants((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const removeVariantRow = (index) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  // Tag handling
  const handleAddTag = (e) => {
    if (e.key === "Enter" || e.type === "click") {
      e.preventDefault();
      if (tagInput.trim() && !tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
        setTagInput("");
      }
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (Object.keys(formik.errors).length > 0) {
      toast.error("Please fill in required fields: " + Object.keys(formik.errors).join(", "));
    }
    formik.handleSubmit(e);
  };

  if (loadingInitial) {
    return (
      <div className="page-content">
        <Container fluid>
          <div className="text-center py-5">
            <Spinner color="primary" />
            <p className="mt-2 text-muted">Loading product data...</p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs
            title="Ecommerce"
            breadcrumbItem={isEditMode ? "Edit Product" : "Add Product"}
          />

          <Form onSubmit={handleFormSubmit}>
            <Row>
              {/* Left Main Column: Core Info, Pricing, Variants */}
              <Col lg={8}>
                {/* Basic Information */}
                <Card>
                  <CardBody>
                    <CardTitle tag="h5" className="mb-3">
                      Basic Information
                    </CardTitle>
                    <Row>
                      <Col md={12}>
                        <FormGroup className="mb-3">
                          <Label htmlFor="name">
                            Product Name <span className="text-danger">*</span>
                          </Label>
                          <Input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="e.g. Wireless Noise-Canceling Headphones"
                            value={formik.values.name}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            invalid={formik.touched.name && Boolean(formik.errors.name)}
                          />
                          {formik.touched.name && formik.errors.name && (
                            <FormFeedback>{formik.errors.name}</FormFeedback>
                          )}
                        </FormGroup>
                      </Col>

                      <Col md={6}>
                        <FormGroup className="mb-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <Label htmlFor="sku">
                              SKU (Stock Keeping Unit) <span className="text-danger">*</span>
                            </Label>
                            <Button
                              color="link"
                              size="sm"
                              className="p-0 text-decoration-none"
                              type="button"
                              onClick={handleAutoGenerateSku}
                            >
                              Auto Generate
                            </Button>
                          </div>
                          <Input
                            id="sku"
                            name="sku"
                            type="text"
                            placeholder="e.g. WH-1000XM5"
                            value={formik.values.sku}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            invalid={formik.touched.sku && Boolean(formik.errors.sku)}
                          />
                          {formik.touched.sku && formik.errors.sku && (
                            <FormFeedback>{formik.errors.sku}</FormFeedback>
                          )}
                        </FormGroup>
                      </Col>

                      <Col md={6}>
                        <FormGroup className="mb-3">
                          <Label htmlFor="barcode">Barcode / UPC / ISBN</Label>
                          <Input
                            id="barcode"
                            name="barcode"
                            type="text"
                            placeholder="e.g. 012345678901"
                            value={formik.values.barcode}
                            onChange={formik.handleChange}
                          />
                        </FormGroup>
                      </Col>

                      <Col md={12}>
                        <FormGroup className="mb-3">
                          <Label htmlFor="description">Short Description</Label>
                          <Input
                            id="description"
                            name="description"
                            type="textarea"
                            rows={3}
                            placeholder="Brief summary of the product features..."
                            value={formik.values.description}
                            onChange={formik.handleChange}
                          />
                        </FormGroup>
                      </Col>

                      <Col md={12}>
                        <FormGroup className="mb-0">
                          <Label htmlFor="richContent">Detailed Specifications / Overview</Label>
                          <Input
                            id="richContent"
                            name="richContent"
                            type="textarea"
                            rows={5}
                            placeholder="Full detailed product overview, technical specs, warranty details..."
                            value={formik.values.richContent}
                            onChange={formik.handleChange}
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                  </CardBody>
                </Card>

                {/* Pricing & Inventory */}
                <Card>
                  <CardBody>
                    <CardTitle tag="h5" className="mb-3">
                      Pricing & Inventory
                    </CardTitle>
                    <Row>
                      <Col md={4}>
                        <FormGroup className="mb-3">
                          <Label htmlFor="price">
                            Regular Price ({currencyBadge}) <span className="text-danger">*</span>
                          </Label>
                          <Input
                            id="price"
                            name="price"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={formik.values.price}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            invalid={formik.touched.price && Boolean(formik.errors.price)}
                          />
                          {formik.touched.price && formik.errors.price && (
                            <FormFeedback>{formik.errors.price}</FormFeedback>
                          )}
                        </FormGroup>
                      </Col>

                      <Col md={4}>
                        <FormGroup className="mb-3">
                          <Label htmlFor="compareAtPrice">Compare-at Price ({currencyBadge})</Label>
                          <Input
                            id="compareAtPrice"
                            name="compareAtPrice"
                            type="number"
                            step="0.01"
                            placeholder="0.00 (original strike price)"
                            value={formik.values.compareAtPrice}
                            onChange={formik.handleChange}
                          />
                        </FormGroup>
                      </Col>

                      <Col md={4}>
                        <FormGroup className="mb-3">
                          <Label htmlFor="costPrice">Cost per Item ({currencyBadge})</Label>
                          <Input
                            id="costPrice"
                            name="costPrice"
                            type="number"
                            step="0.01"
                            placeholder="0.00 (for margin calculation)"
                            value={formik.values.costPrice}
                            onChange={formik.handleChange}
                          />
                        </FormGroup>
                      </Col>

                      <Col md={6}>
                        <FormGroup className="mb-3">
                          <Label htmlFor="stock">
                            Stock Quantity <span className="text-danger">*</span>
                          </Label>
                          <Input
                            id="stock"
                            name="stock"
                            type="number"
                            placeholder="50"
                            value={formik.values.stock}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            invalid={formik.touched.stock && Boolean(formik.errors.stock)}
                          />
                          {formik.touched.stock && formik.errors.stock && (
                            <FormFeedback>{formik.errors.stock}</FormFeedback>
                          )}
                        </FormGroup>
                      </Col>

                      <Col md={6}>
                        <FormGroup className="mb-3">
                          <Label className="d-block">Inventory Tracking</Label>
                          <div className="form-check form-switch form-switch-md mt-2">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id="trackStockSwitch"
                              checked={formik.values.trackStock}
                              onChange={(e) =>
                                formik.setFieldValue("trackStock", e.target.checked)
                              }
                            />
                            <label className="form-check-label ms-2" htmlFor="trackStockSwitch">
                              Track stock level & block purchase when out of stock
                            </label>
                          </div>
                        </FormGroup>
                      </Col>
                    </Row>
                  </CardBody>
                </Card>

                {/* Media / Images */}
                <Card>
                  <CardBody>
                    <CardTitle tag="h5" className="mb-3">
                      Product Images
                    </CardTitle>

                    {/* Image URL Direct Input */}
                    <div className="d-flex gap-2 mb-3">
                      <Input
                        type="text"
                        placeholder="Paste image URL (e.g. https://images.unsplash.com/...)"
                        value={imageUrlInput}
                        onChange={(e) => setImageUrlInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddImageUrl();
                          }
                        }}
                      />
                      <Button color="secondary" type="button" onClick={handleAddImageUrl}>
                        Add URL
                      </Button>
                    </div>

                    {/* Dropzone */}
                    <Dropzone onDrop={handleDropFiles} accept={{ "image/*": [] }}>
                      {({ getRootProps, getInputProps }) => (
                        <div className="dropzone border-dashed rounded p-4 text-center">
                          <div {...getRootProps()} style={{ cursor: "pointer" }}>
                            <input {...getInputProps()} />
                            <i className="display-4 text-muted bx bxs-cloud-upload mb-2" />
                            <h5>Drop files here or click to browse</h5>
                            <p className="text-muted font-size-12 mb-0">
                              Supports JPG, PNG, WEBP formats
                            </p>
                          </div>
                        </div>
                      )}
                    </Dropzone>

                    {/* Image Thumbnails List */}
                    {images.length > 0 && (
                      <div className="d-flex flex-wrap gap-3 mt-3">
                        {images.map((img, index) => (
                          <div
                            key={index}
                            className="position-relative border rounded p-1 bg-light text-center"
                            style={{ width: "120px" }}
                          >
                            <img
                              src={img.url}
                              alt={`Product ${index + 1}`}
                              className="rounded img-fluid"
                              style={{ height: "90px", objectFit: "cover", width: "100%" }}
                            />
                            {img.isPrimary ? (
                              <Badge color="primary" className="position-absolute top-0 start-0 m-1">
                                Primary
                              </Badge>
                            ) : (
                              <Button
                                color="link"
                                size="sm"
                                className="font-size-11 p-0 text-muted d-block w-100 mt-1"
                                type="button"
                                onClick={() => setPrimaryImage(index)}
                              >
                                Set Primary
                              </Button>
                            )}
                            <Button
                              color="danger"
                              size="sm"
                              className="position-absolute top-0 end-0 m-1 rounded-circle p-0"
                              style={{ width: "20px", height: "20px", lineHeight: "1" }}
                              type="button"
                              onClick={() => removeImage(index)}
                            >
                              &times;
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardBody>
                </Card>

                {/* Product Variants */}
                <Card>
                  <CardBody>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <CardTitle tag="h5" className="mb-1">
                          Product Variants
                        </CardTitle>
                        <p className="text-muted font-size-12 mb-0">
                          Add options such as different colors, sizes, or models.
                        </p>
                      </div>
                      <Button color="outline-primary" size="sm" type="button" onClick={addVariantRow}>
                        <i className="bx bx-plus me-1"></i> Add Variant
                      </Button>
                    </div>

                    {variants.length > 0 ? (
                      <div className="table-responsive">
                        <Table className="align-middle table-nowrap mb-0" size="sm">
                          <thead className="table-light">
                            <tr>
                              <th>Variant Name (e.g. Red / L)</th>
                              <th>Variant SKU</th>
                              <th>Price ({currencyBadge})</th>
                              <th>Stock</th>
                              <th style={{ width: "40px" }}></th>
                            </tr>
                          </thead>
                          <tbody>
                            {variants.map((variant, index) => (
                              <tr key={index}>
                                <td>
                                  <Input
                                    type="text"
                                    placeholder="e.g. Midnight Blue / XL"
                                    value={variant.name}
                                    onChange={(e) =>
                                      updateVariantField(index, "name", e.target.value)
                                    }
                                  />
                                </td>
                                <td>
                                  <Input
                                    type="text"
                                    placeholder="SKU-RED-L"
                                    value={variant.sku}
                                    onChange={(e) =>
                                      updateVariantField(index, "sku", e.target.value)
                                    }
                                  />
                                </td>
                                <td>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="Price"
                                    value={variant.price}
                                    onChange={(e) =>
                                      updateVariantField(index, "price", e.target.value)
                                    }
                                  />
                                </td>
                                <td>
                                  <Input
                                    type="number"
                                    placeholder="Stock"
                                    value={variant.stock}
                                    onChange={(e) =>
                                      updateVariantField(index, "stock", e.target.value)
                                    }
                                  />
                                </td>
                                <td>
                                  <Button
                                    color="link"
                                    className="text-danger p-0"
                                    type="button"
                                    onClick={() => removeVariantRow(index)}
                                  >
                                    <i className="mdi mdi-trash-can font-size-16"></i>
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    ) : (
                      <p className="text-muted font-size-13 text-center py-2 mb-0">
                        No variants added. This product will be sold as a single standard item.
                      </p>
                    )}
                  </CardBody>
                </Card>
              </Col>

              {/* Right Sidebar Column: Category, Status, Tags, Actions */}
              <Col lg={4}>
                {/* Organization & Category */}
                <Card>
                  <CardBody>
                    <CardTitle tag="h5" className="mb-3">
                      Organization
                    </CardTitle>

                    {/* Category Selection */}
                    <FormGroup className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <Label htmlFor="categoryId" className="mb-0">
                          Category
                        </Label>
                        <Button
                          color="link"
                          size="sm"
                          className="p-0 text-decoration-none font-size-12"
                          type="button"
                          onClick={() => navigate("/ecommerce-categories")}
                        >
                          Manage Categories
                        </Button>
                      </div>
                      <Input
                        id="categoryId"
                        name="categoryId"
                        type="select"
                        className="form-select"
                        value={formik.values.categoryId}
                        onChange={formik.handleChange}
                      >
                        <option value="">-- Select Category --</option>
                        {categoryOptions.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </Input>
                    </FormGroup>

                    {/* Status & Visibility */}
                    <FormGroup className="mb-3">
                      <Label htmlFor="published">Visibility Status</Label>
                      <Input
                        id="published"
                        name="published"
                        type="select"
                        className="form-select"
                        value={formik.values.published ? "true" : "false"}
                        onChange={(e) =>
                          formik.setFieldValue("published", e.target.value === "true")
                        }
                      >
                        <option value="true">Published (Visible in Storefront)</option>
                        <option value="false">Draft (Hidden from customers)</option>
                      </Input>
                    </FormGroup>

                    {/* Tags */}
                    <FormGroup className="mb-0">
                      <Label>Tags</Label>
                      <div className="d-flex gap-2 mb-2">
                        <Input
                          type="text"
                          placeholder="e.g. Summer, Featured"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={handleAddTag}
                        />
                        <Button color="secondary" size="sm" type="button" onClick={handleAddTag}>
                          Add
                        </Button>
                      </div>
                      <div className="d-flex flex-wrap gap-1">
                        {tags.map((t, idx) => (
                          <Badge
                            key={idx}
                            color="info"
                            className="font-size-12 p-2 d-flex align-items-center gap-1"
                          >
                            {t}
                            <span
                              style={{ cursor: "pointer" }}
                              onClick={() => removeTag(t)}
                              title="Remove tag"
                            >
                              &times;
                            </span>
                          </Badge>
                        ))}
                      </div>
                    </FormGroup>
                  </CardBody>
                </Card>

                {/* Form Action Controls */}
                <Card>
                  <CardBody>
                    <CardTitle tag="h5" className="mb-3">
                      Save & Actions
                    </CardTitle>
                    <div className="d-grid gap-2">
                      <Button
                        type="submit"
                        color="primary"
                        size="lg"
                        className="waves-effect waves-light"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <Spinner size="sm" className="me-2" />
                        ) : (
                          <i className="bx bx-save me-1"></i>
                        )}
                        {isEditMode ? "Update Product" : "Publish Product"}
                      </Button>

                      <Button
                        type="button"
                        color="secondary"
                        outline
                        onClick={() => navigate("/ecommerce-products")}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Form>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default EcommerceAddProduct;
