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
  Table,
  Alert,
  Badge,
} from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import PaginationControls from "../../components/Common/PaginationControls";
import { toast } from "react-toastify";
import {
  getRealFlashSales,
  createRealFlashSale,
  deleteRealFlashSale,
} from "../../helpers/real_backend_helper";
import { getProducts } from "../../helpers/fakebackend_helper";

const FlashSales = () => {
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [sales, setSales] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [selectedSaleId, setSelectedSaleId] = useState(null);

  // Pagination for products in flash sale
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Load real flash sales and products
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [salesData, prodsData] = await Promise.all([
          getRealFlashSales(),
          getProducts(),
        ]);
        const salesArr = Array.isArray(salesData) ? salesData : [];
        const prodsArr = Array.isArray(prodsData) ? prodsData : [];
        setAvailableProducts(prodsArr);

        const formattedSales = salesArr.map((s) => {
          const now = new Date().toISOString();
          const startIso = s.startDate ? new Date(s.startDate).toISOString() : "";
          const endIso = s.endDate ? new Date(s.endDate).toISOString() : "";
          let status = "Scheduled";
          if (startIso <= now && endIso >= now) {
            status = "Running";
          } else if (endIso < now) {
            status = "Expired";
          }
          return {
            id: s.id,
            title: s.name || "Flash Sale",
            startDate: s.startDate ? new Date(s.startDate).toISOString().slice(0, 16) : "",
            endDate: s.endDate ? new Date(s.endDate).toISOString().slice(0, 16) : "",
            status,
            products: (s.products || []).map((p) => ({
              id: p.id,
              saleId: s.id,
              name: p.product?.name || "Product",
              originalPrice: parseFloat(p.product?.price || 0),
              promoPrice: parseFloat(p.price || 0),
              stockLimit: p.stock || 0,
              userLimit: p.limitPerUser || 1,
              salesCount: 0,
            })),
          };
        });

        setSales(formattedSales);
        if (formattedSales.length > 0) {
          setSelectedSaleId(formattedSales[0].id);
        }
      } catch (err) {
        console.error("Failed to load flash sales:", err);
        toast.error("Failed to load flash sales from server", { autoClose: 3000 });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Schedule Sale Form
  const [saleForm, setSaleForm] = useState({
    title: "",
    startDate: "",
    endDate: "",
  });

  // Add Product Form
  const [productForm, setProductForm] = useState({
    productId: "",
    name: "",
    originalPrice: 100,
    promoPrice: 50,
    stockLimit: 20,
    userLimit: 1,
  });

  const handleSaleFormChange = (e) => {
    const { name, value } = e.target;
    setSaleForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProductFormChange = (e) => {
    const { name, value } = e.target;
    if (name === "productId") {
      const selected = availableProducts.find((p) => p.id === value);
      setProductForm((prev) => ({
        ...prev,
        productId: value,
        name: selected?.name || "",
        originalPrice: parseFloat(selected?.price || 100),
      }));
    } else {
      setProductForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const scheduleSale = async (e) => {
    e.preventDefault();
    if (!saleForm.title || !saleForm.startDate || !saleForm.endDate) return;

    if (availableProducts.length === 0) {
      toast.warning("No products available to assign to this flash sale.");
      return;
    }

    try {
      const firstProduct = availableProducts[0];
      const payload = {
        name: saleForm.title,
        startDate: new Date(saleForm.startDate).toISOString(),
        endDate: new Date(saleForm.endDate).toISOString(),
        isActive: true,
        products: [
          {
            productId: firstProduct.id,
            price: Number(firstProduct.price ? (parseFloat(firstProduct.price) * 0.7).toFixed(2) : 25),
            limitPerUser: 1,
            stock: Number(firstProduct.stock || 10),
          },
        ],
      };

      const created = await createRealFlashSale(payload);
      const newSale = {
        id: created.id || Date.now(),
        title: saleForm.title,
        startDate: saleForm.startDate,
        endDate: saleForm.endDate,
        status: "Scheduled",
        products: [
          {
            id: Date.now(),
            saleId: created.id,
            name: firstProduct.name,
            originalPrice: parseFloat(firstProduct.price || 0),
            promoPrice: Number((parseFloat(firstProduct.price || 0) * 0.7).toFixed(2)),
            stockLimit: Number(firstProduct.stock || 10),
            userLimit: 1,
            salesCount: 0,
          },
        ],
      };

      setSales((prev) => [newSale, ...prev]);
      setSelectedSaleId(newSale.id);
      setSaleForm({ title: "", startDate: "", endDate: "" });
      toast.success("Flash sale event scheduled successfully!", { autoClose: 2000 });
    } catch (err) {
      console.error("Failed to schedule flash sale:", err);
      toast.error(err.message || "Failed to schedule flash sale", { autoClose: 3000 });
    }
  };

  const addProductToSale = (e) => {
    e.preventDefault();
    if (!productForm.promoPrice) return;

    const newProduct = {
      id: Date.now(),
      saleId: selectedSaleId,
      name: productForm.name || "Product",
      originalPrice: Number(productForm.originalPrice),
      promoPrice: Number(productForm.promoPrice),
      stockLimit: Number(productForm.stockLimit),
      userLimit: Number(productForm.userLimit),
      salesCount: 0,
    };

    setSales((prev) =>
      prev.map((s) =>
        s.id === selectedSaleId
          ? { ...s, products: [...(s.products || []), newProduct] }
          : s
      )
    );
    toast.success("Product added to flash sale promotion!", { autoClose: 2000 });
  };

  const removeProductFromSale = (id) => {
    setSales((prev) =>
      prev.map((s) =>
        s.id === selectedSaleId
          ? { ...s, products: (s.products || []).filter((p) => p.id !== id) }
          : s
      )
    );
    toast.success("Product removed from flash sale.", { autoClose: 2000 });
  };

  const deleteSale = async (id) => {
    try {
      await deleteRealFlashSale(id);
      setSales((prev) => prev.filter((s) => s.id !== id));
      toast.success("Flash sale campaign deleted.", { autoClose: 2000 });
      if (selectedSaleId === id) {
        const remaining = sales.filter((s) => s.id !== id);
        setSelectedSaleId(remaining[0]?.id || null);
      }
    } catch (err) {
      console.error("Failed to delete flash sale:", err);
      toast.error(err.message || "Failed to delete flash sale", { autoClose: 3000 });
    }
  };

  const activeSaleObj = sales.find((s) => s.id === selectedSaleId) || sales[0];
  const filteredProducts = activeSaleObj?.products || [];

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Promotions" breadcrumbItem="Flash Sales" />

          {successMsg && (
            <Alert color="success" className="mb-4">
              {successMsg}
            </Alert>
          )}

          <Row>
            {/* Flash Sale Campaigns Scheduling */}
            <Col lg="4">
              <Card>
                <CardBody>
                  <CardTitle className="mb-4">Schedule Flash Sale Campaign</CardTitle>
                  <Form onSubmit={scheduleSale}>
                    <FormGroup className="mb-3">
                      <Label for="saleTitle">Campaign Event Title</Label>
                      <Input
                        type="text"
                        id="saleTitle"
                        name="title"
                        value={saleForm.title}
                        onChange={handleSaleFormChange}
                        placeholder="e.g. Cyber Monday Shock Deals"
                        required
                      />
                    </FormGroup>
                    <FormGroup className="mb-3">
                      <Label for="startDate">Starts At</Label>
                      <Input
                        type="datetime-local"
                        id="startDate"
                        name="startDate"
                        value={saleForm.startDate}
                        onChange={handleSaleFormChange}
                        required
                      />
                    </FormGroup>
                    <FormGroup className="mb-3">
                      <Label for="endDate">Ends At</Label>
                      <Input
                        type="datetime-local"
                        id="endDate"
                        name="endDate"
                        value={saleForm.endDate}
                        onChange={handleSaleFormChange}
                        required
                      />
                    </FormGroup>
                    <Button type="submit" color="primary" className="w-100">
                      Create Event
                    </Button>
                  </Form>
                </CardBody>
              </Card>

              {/* Event selector list */}
              <Card className="mt-3">
                <CardBody>
                  <CardTitle className="mb-3">Events List</CardTitle>
                  <div className="list-group">
                    {sales.map((sale) => (
                      <button
                        key={sale.id}
                        type="button"
                        className={`list-group-item list-group-item-action ${
                          selectedSaleId === sale.id ? "active" : ""
                        }`}
                        onClick={() => setSelectedSaleId(sale.id)}
                      >
                        <div className="d-flex w-100 justify-content-between">
                          <h6 className={`mb-1 ${selectedSaleId === sale.id ? "text-white" : ""}`}>
                            {sale.title}
                          </h6>
                          <Badge color={sale.status === "Running" ? "success" : "warning"}>
                            {sale.status}
                          </Badge>
                        </div>
                        <p className={`mb-1 font-size-12 ${selectedSaleId === sale.id ? "text-light" : "text-muted"}`}>
                          Ends: {sale.endDate.replace("T", " ")}
                        </p>
                      </button>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </Col>

            {/* Flash Sale Product Selection & Table */}
            <Col lg="8">
              {activeSaleObj ? (
                <>
                  {/* Product allocation manager */}
                  <Card>
                    <CardBody>
                      <CardTitle className="mb-4">
                        Add Promotional Products to:{" "}
                        <span className="text-primary">{activeSaleObj.title}</span>
                      </CardTitle>

                      <Form onSubmit={addProductToSale}>
                        <Row>
                          <Col md="4">
                            <FormGroup className="mb-3">
                              <Label>Product Name</Label>
                              <Input
                                type="select"
                                name="name"
                                value={productForm.name}
                                onChange={handleProductFormChange}
                              >
                                <option value="Luxury Leather Handbag">Luxury Leather Handbag</option>
                                <option value="Smart Fitness Watch S3">Smart Fitness Watch S3</option>
                                <option value="Minimalist Metal Wallet">Minimalist Metal Wallet</option>
                                <option value="Ergonomic Work Desk Chair">Ergonomic Work Desk Chair</option>
                              </Input>
                            </FormGroup>
                          </Col>
                          <Col md="2">
                            <FormGroup className="mb-3">
                              <Label>Reg. Price</Label>
                              <Input
                                type="number"
                                name="originalPrice"
                                value={productForm.originalPrice}
                                onChange={handleProductFormChange}
                                required
                              />
                            </FormGroup>
                          </Col>
                          <Col md="2">
                            <FormGroup className="mb-3">
                              <Label>Sale Price</Label>
                              <Input
                                type="number"
                                name="promoPrice"
                                value={productForm.promoPrice}
                                onChange={handleProductFormChange}
                                required
                              />
                            </FormGroup>
                          </Col>
                          <Col md="2">
                            <FormGroup className="mb-3">
                              <Label>Allocated Stock</Label>
                              <Input
                                type="number"
                                name="stockLimit"
                                value={productForm.stockLimit}
                                onChange={handleProductFormChange}
                                required
                              />
                            </FormGroup>
                          </Col>
                          <Col md="2">
                            <FormGroup className="mb-3">
                              <Label>Max per User</Label>
                              <Input
                                type="number"
                                name="userLimit"
                                value={productForm.userLimit}
                                onChange={handleProductFormChange}
                                required
                              />
                            </FormGroup>
                          </Col>
                        </Row>
                        <div className="d-flex justify-content-between align-items-center">
                          <Button
                            type="button"
                            color="danger"
                            outline
                            size="sm"
                            onClick={() => deleteSale(activeSaleObj.id)}
                          >
                            Delete Entire Sale Event
                          </Button>
                          <Button type="submit" color="success" size="sm">
                            Add Product
                          </Button>
                        </div>
                      </Form>
                    </CardBody>
                  </Card>

                  {/* Campaign Products Table */}
                  <Card className="mt-3">
                    <CardBody>
                      <CardTitle className="mb-4">Promoted Products</CardTitle>
                      <div className="table-responsive">
                        <Table className="table align-middle table-nowrap mb-0 table-hover">
                          <thead className="table-light">
                            <tr>
                              <th>Product</th>
                              <th>Regular Price</th>
                              <th>Promo Price</th>
                              <th>Stock Limit</th>
                              <th>Sold Track</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredProducts.length > 0 ? (
                              filteredProducts
                                .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                                .map((p) => {
                                const soldPercent = Math.min(100, Math.round((p.salesCount / p.stockLimit) * 100));
                                return (
                                  <tr key={p.id}>
                                    <td>
                                      <h6 className="font-size-14 mb-0">{p.name}</h6>
                                      <span className="text-muted font-size-11">
                                        Limit: {p.userLimit} per customer
                                      </span>
                                    </td>
                                    <td>
                                      <del className="text-muted">${p.originalPrice}</del>
                                    </td>
                                    <td>
                                      <span className="text-danger fw-bold">${p.promoPrice}</span>
                                    </td>
                                    <td>{p.stockLimit} units</td>
                                    <td>
                                      <div className="d-flex align-items-center gap-2">
                                        <div className="progress w-100" style={{ height: "6px" }}>
                                          <div
                                            className="progress-bar bg-success"
                                            role="progressbar"
                                            style={{ width: `${soldPercent}%` }}
                                            aria-valuenow={soldPercent}
                                            aria-valuemin="0"
                                            aria-valuemax="100"
                                          />
                                        </div>
                                        <span className="font-size-12 fw-medium">
                                          {p.salesCount}/{p.stockLimit}
                                        </span>
                                      </div>
                                    </td>
                                    <td>
                                      <Button
                                        size="sm"
                                        color="danger"
                                        outline
                                        onClick={() => removeProductFromSale(p.id)}
                                      >
                                        Remove
                                      </Button>
                                    </td>
                                  </tr>
                                );
                              })
                            ) : (
                              <tr>
                                <td colSpan="6" className="text-center py-4 text-muted">
                                  No products added to this flash sale yet. Add products using the form above.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </Table>
                      </div>

                      {filteredProducts.length > 0 && (
                        <PaginationControls
                          currentPage={currentPage}
                          totalItems={filteredProducts.length}
                          pageSize={pageSize}
                          pageSizeOptions={[5, 10, 20]}
                          onPageChange={setCurrentPage}
                          onPageSizeChange={(newSize) => {
                            setPageSize(newSize);
                            setCurrentPage(1);
                          }}
                        />
                      )}
                    </CardBody>
                  </Card>
                </>
              ) : (
                <div className="h-100 d-flex flex-column justify-content-center align-items-center p-5 bg-white border rounded">
                  <i className="bx bx-calendar-event text-muted" style={{ fontSize: "4rem" }}></i>
                  <h5 className="mt-3">No active event selected</h5>
                  <p className="text-muted">Select an event from the list or schedule a new event.</p>
                </div>
              )}
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default FlashSales;
