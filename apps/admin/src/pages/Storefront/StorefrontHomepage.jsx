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
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Alert,
  Spinner,
} from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { toast } from "react-toastify";
import { getRealSettings, updateRealSettings } from "../../helpers/real_backend_helper";

const StorefrontHomepage = () => {
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);

  // Announcement Bar State
  const [announcement, setAnnouncement] = useState({
    enabled: true,
    text: "✨ Free shipping on orders over $100! Use code PREMIUM20 for 20% off.",
    bgColor: "#000000",
    textColor: "#ffffff",
    link: "/shop",
  });

  // Hero Sliders State
  const [sliders, setSliders] = useState([
    {
      id: 1,
      title: "Discover Modern Luxury",
      subtitle: "Elevate your style with our premium curated collection.",
      bgImage: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80",
      ctaText: "Shop Collection",
      ctaLink: "/shop",
      active: true,
    },
    {
      id: 2,
      title: "New Season Arrivals",
      subtitle: "Lightweight fabrics and artisanal designs tailored for everyday elegance.",
      bgImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
      ctaText: "Explore Now",
      ctaLink: "/shop?sort=newest",
      active: true,
    },
  ]);

  // Value Props State
  const [valueProps, setValueProps] = useState([
    {
      id: 1,
      title: "Complimentary Shipping",
      description: "Free delivery on qualifying orders. Dispatched in signature packaging.",
      icon: "truck",
      active: true,
    },
    {
      id: 2,
      title: "Hassle-Free Returns",
      description: "30-day dynamic window for premium returns or simple size exchanges.",
      icon: "refresh",
      active: true,
    },
    {
      id: 3,
      title: "Extended Quality Guarantee",
      description: "All luxury goods feature a lifetime promise on craftsmanship and fabrics.",
      icon: "shield",
      active: true,
    },
  ]);

  // Editorial Promo Banners State
  const [promoBanners, setPromoBanners] = useState([
    {
      id: 1,
      badge: "Artisanal Studio",
      title: "Handcrafted Leather Essentials",
      description: "Tanned using pure plant extracts. Designed to age with a rich, unique patina over years of use.",
      bgImage: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=80",
      ctaText: "Shop Accessories",
      ctaLink: "/shop?category=accessories",
      couponCode: "",
      active: true,
    },
    {
      id: 2,
      badge: "Exclusive Offer",
      title: "First Order Discount",
      description: "Unlock 20% off your initial purchase of luxury loungewear. Simply apply the premium promo code during checkout.",
      bgImage: "",
      ctaText: "Shop Apparel",
      ctaLink: "/shop?category=apparel",
      couponCode: "WELCOME20",
      active: true,
    },
  ]);

  // Testimonials State
  const [testimonials, setTestimonials] = useState([
    {
      id: 1,
      quote: "The weight and stitching on the cashmere sweater are outstanding. Truly sits in the highest tier of apparel design.",
      author: "Sophia R.",
      role: "Creative Director",
      stars: 5,
      avatarUrl: "",
      active: true,
    },
    {
      id: 2,
      quote: "Minimalist leather backpack has been my travel companion for 6 months. It has developed a beautiful custom sheen.",
      author: "Liam M.",
      role: "Product Designer",
      stars: 5,
      avatarUrl: "",
      active: true,
    },
    {
      id: 3,
      quote: "Clean, minimalist, customer support answered my shipping queries in under five minutes. Outstanding quality product.",
      author: "Elena K.",
      role: "Interior Stylist",
      stars: 5,
      avatarUrl: "",
      active: true,
    },
  ]);

  // Homepage Sections State
  const [sections, setSections] = useState([
    { id: "hero", name: "Hero Sliders", enabled: true, layout: "fullwidth" },
    { id: "valueProps", name: "Value Propositions", enabled: true, layout: "grid-3-cols" },
    { id: "categories", name: "Featured Categories", enabled: true, layout: "grid-4-cols" },
    { id: "bestsellers", name: "Featured Masterpieces", enabled: true, layout: "grid-4-cols" },
    { id: "promo", name: "Editorial Promo Banners", enabled: true, layout: "split-screen" },
    { id: "testimonials", name: "Reviews & Tastemakers", enabled: true, layout: "cards-3-cols" },
  ]);

  // Modals States
  const [sliderModalOpen, setSliderModalOpen] = useState(false);
  const [editingSlider, setEditingSlider] = useState(null);
  const [sliderForm, setSliderForm] = useState({
    title: "",
    subtitle: "",
    bgImage: "",
    ctaText: "",
    ctaLink: "",
    active: true,
  });

  const [valuePropModalOpen, setValuePropModalOpen] = useState(false);
  const [editingValueProp, setEditingValueProp] = useState(null);
  const [valuePropForm, setValuePropForm] = useState({
    title: "",
    description: "",
    icon: "truck",
    active: true,
  });

  const [promoModalOpen, setPromoModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [promoForm, setPromoForm] = useState({
    badge: "",
    title: "",
    description: "",
    bgImage: "",
    ctaText: "Shop Collection",
    ctaLink: "/shop",
    couponCode: "",
    active: true,
  });

  const [testimonialModalOpen, setTestimonialModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [testimonialForm, setTestimonialForm] = useState({
    quote: "",
    author: "",
    role: "",
    stars: 5,
    avatarUrl: "",
    active: true,
  });

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const data = await getRealSettings();
        if (data && data.themeSettings) {
          const t = data.themeSettings;

          setAnnouncement({
            enabled: t.announcementEnabled === "true" || t.announcement_enabled === "true" || t.announcement_enabled === true,
            text: t.announcementText || t.announcement_text || "✨ Free shipping on orders over $100! Use code PREMIUM20 for 20% off.",
            bgColor: t.announcementBgColor || t.announcement_bg_color || "#000000",
            textColor: t.announcementTextColor || t.announcement_text_color || "#ffffff",
            link: t.announcementLink || t.announcement_link || "/shop",
          });

          if (t.heroSliders || t.hero_sliders) {
            try {
              const raw = t.heroSliders || t.hero_sliders;
              const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
              if (Array.isArray(parsed) && parsed.length > 0) setSliders(parsed);
            } catch (e) {
              console.warn("Could not parse heroSliders:", e);
            }
          }

          if (t.valueProps || t.value_props || t.featureCards || t.feature_cards) {
            try {
              const raw = t.valueProps || t.value_props || t.featureCards || t.feature_cards;
              const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
              if (Array.isArray(parsed) && parsed.length > 0) setValueProps(parsed);
            } catch (e) {
              console.warn("Could not parse valueProps:", e);
            }
          }

          if (t.promoBanners || t.promo_banners) {
            try {
              const raw = t.promoBanners || t.promo_banners;
              const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
              if (Array.isArray(parsed) && parsed.length > 0) setPromoBanners(parsed);
            } catch (e) {
              console.warn("Could not parse promoBanners:", e);
            }
          }

          if (t.testimonials) {
            try {
              const raw = t.testimonials;
              const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
              if (Array.isArray(parsed) && parsed.length > 0) setTestimonials(parsed);
            } catch (e) {
              console.warn("Could not parse testimonials:", e);
            }
          }

          if (t.homepageSections || t.homepage_sections) {
            try {
              const raw = t.homepageSections || t.homepage_sections;
              const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
              if (Array.isArray(parsed) && parsed.length > 0) setSections(parsed);
            } catch (e) {
              console.warn("Could not parse homepageSections:", e);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load homepage settings:", err);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  // --- Announcement Bar Handlers ---
  const handleAnnouncementChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAnnouncement((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const saveAnnouncement = async (e) => {
    e.preventDefault();
    try {
      setSavingAnnouncement(true);
      await updateRealSettings({
        themeSettings: {
          announcementEnabled: String(announcement.enabled),
          announcement_enabled: String(announcement.enabled),
          announcementText: announcement.text,
          announcement_text: announcement.text,
          announcementBgColor: announcement.bgColor,
          announcement_bg_color: announcement.bgColor,
          announcementTextColor: announcement.textColor,
          announcement_text_color: announcement.textColor,
          announcementLink: announcement.link,
          announcement_link: announcement.link,
        },
      });
      toast.success("Announcement bar updated successfully!");
      setSuccessMsg("Announcement bar updated successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      toast.error("Failed to save announcement bar");
    } finally {
      setSavingAnnouncement(false);
    }
  };

  // --- Section Architecture Handlers ---
  const toggleSection = async (id) => {
    const updated = sections.map((sec) => (sec.id === id ? { ...sec, enabled: !sec.enabled } : sec));
    setSections(updated);
    await updateRealSettings({ themeSettings: { homepageSections: updated, homepage_sections: updated } });
  };

  const handleSectionLayoutChange = async (id, layout) => {
    const updated = sections.map((sec) => (sec.id === id ? { ...sec, layout } : sec));
    setSections(updated);
    await updateRealSettings({ themeSettings: { homepageSections: updated, homepage_sections: updated } });
  };

  const moveSection = async (index, direction) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= sections.length) return;
    const updated = [...sections];
    const temp = updated[index];
    updated[index] = updated[nextIndex];
    updated[nextIndex] = temp;
    setSections(updated);
    await updateRealSettings({ themeSettings: { homepageSections: updated, homepage_sections: updated } });
  };

  // --- Hero Slider Handlers ---
  const persistSliders = async (updatedSliders) => {
    try {
      await updateRealSettings({ themeSettings: { heroSliders: updatedSliders, hero_sliders: updatedSliders } });
      toast.success("Hero sliders updated successfully!");
    } catch (err) {
      toast.error("Failed to save hero sliders");
    }
  };

  const openSliderModal = (slider = null) => {
    if (slider) {
      setEditingSlider(slider);
      setSliderForm({ ...slider });
    } else {
      setEditingSlider(null);
      setSliderForm({
        title: "",
        subtitle: "",
        bgImage: "",
        ctaText: "Shop Collection",
        ctaLink: "/shop",
        active: true,
      });
    }
    setSliderModalOpen(true);
  };

  const saveSlider = async () => {
    let updated;
    if (editingSlider) {
      updated = sliders.map((s) => (s.id === editingSlider.id ? { ...sliderForm, id: s.id } : s));
    } else {
      const newId = sliders.length ? Math.max(...sliders.map((s) => Number(s.id) || 0)) + 1 : 1;
      updated = [...sliders, { ...sliderForm, id: newId }];
    }
    setSliders(updated);
    setSliderModalOpen(false);
    await persistSliders(updated);
  };

  const deleteSlider = async (id) => {
    const updated = sliders.filter((s) => s.id !== id);
    setSliders(updated);
    await persistSliders(updated);
  };

  const toggleSliderActive = async (id) => {
    const updated = sliders.map((s) => (s.id === id ? { ...s, active: !s.active } : s));
    setSliders(updated);
    await persistSliders(updated);
  };

  // --- Value Props Handlers ---
  const persistValueProps = async (updatedProps) => {
    try {
      await updateRealSettings({ themeSettings: { valueProps: updatedProps, value_props: updatedProps } });
      toast.success("Value propositions updated successfully!");
    } catch (err) {
      toast.error("Failed to save value propositions");
    }
  };

  const openValuePropModal = (prop = null) => {
    if (prop) {
      setEditingValueProp(prop);
      setValuePropForm({ ...prop });
    } else {
      setEditingValueProp(null);
      setValuePropForm({
        title: "",
        description: "",
        icon: "truck",
        active: true,
      });
    }
    setValuePropModalOpen(true);
  };

  const saveValueProp = async () => {
    let updated;
    if (editingValueProp) {
      updated = valueProps.map((vp) => (vp.id === editingValueProp.id ? { ...valuePropForm, id: vp.id } : vp));
    } else {
      const newId = valueProps.length ? Math.max(...valueProps.map((vp) => Number(vp.id) || 0)) + 1 : 1;
      updated = [...valueProps, { ...valuePropForm, id: newId }];
    }
    setValueProps(updated);
    setValuePropModalOpen(false);
    await persistValueProps(updated);
  };

  const deleteValueProp = async (id) => {
    const updated = valueProps.filter((vp) => vp.id !== id);
    setValueProps(updated);
    await persistValueProps(updated);
  };

  const toggleValuePropActive = async (id) => {
    const updated = valueProps.map((vp) => (vp.id === id ? { ...vp, active: !vp.active } : vp));
    setValueProps(updated);
    await persistValueProps(updated);
  };

  // --- Promo Banners Handlers ---
  const persistPromoBanners = async (updatedBanners) => {
    try {
      await updateRealSettings({ themeSettings: { promoBanners: updatedBanners, promo_banners: updatedBanners } });
      toast.success("Promo banners updated successfully!");
    } catch (err) {
      toast.error("Failed to save promo banners");
    }
  };

  const openPromoModal = (banner = null) => {
    if (banner) {
      setEditingPromo(banner);
      setPromoForm({ ...banner });
    } else {
      setEditingPromo(null);
      setPromoForm({
        badge: "Special Highlight",
        title: "",
        description: "",
        bgImage: "",
        ctaText: "Shop Now",
        ctaLink: "/shop",
        couponCode: "",
        active: true,
      });
    }
    setPromoModalOpen(true);
  };

  const savePromoBanner = async () => {
    let updated;
    if (editingPromo) {
      updated = promoBanners.map((pb) => (pb.id === editingPromo.id ? { ...promoForm, id: pb.id } : pb));
    } else {
      const newId = promoBanners.length ? Math.max(...promoBanners.map((pb) => Number(pb.id) || 0)) + 1 : 1;
      updated = [...promoBanners, { ...promoForm, id: newId }];
    }
    setPromoBanners(updated);
    setPromoModalOpen(false);
    await persistPromoBanners(updated);
  };

  const deletePromoBanner = async (id) => {
    const updated = promoBanners.filter((pb) => pb.id !== id);
    setPromoBanners(updated);
    await persistPromoBanners(updated);
  };

  const togglePromoActive = async (id) => {
    const updated = promoBanners.map((pb) => (pb.id === id ? { ...pb, active: !pb.active } : pb));
    setPromoBanners(updated);
    await persistPromoBanners(updated);
  };

  // --- Testimonials Handlers ---
  const persistTestimonials = async (updatedTestimonials) => {
    try {
      await updateRealSettings({ themeSettings: { testimonials: updatedTestimonials } });
      toast.success("Testimonials updated successfully!");
    } catch (err) {
      toast.error("Failed to save testimonials");
    }
  };

  const openTestimonialModal = (item = null) => {
    if (item) {
      setEditingTestimonial(item);
      setTestimonialForm({ ...item });
    } else {
      setEditingTestimonial(null);
      setTestimonialForm({
        quote: "",
        author: "",
        role: "Verified Client",
        stars: 5,
        avatarUrl: "",
        active: true,
      });
    }
    setTestimonialModalOpen(true);
  };

  const saveTestimonial = async () => {
    let updated;
    if (editingTestimonial) {
      updated = testimonials.map((t) => (t.id === editingTestimonial.id ? { ...testimonialForm, id: t.id } : t));
    } else {
      const newId = testimonials.length ? Math.max(...testimonials.map((t) => Number(t.id) || 0)) + 1 : 1;
      updated = [...testimonials, { ...testimonialForm, id: newId }];
    }
    setTestimonials(updated);
    setTestimonialModalOpen(false);
    await persistTestimonials(updated);
  };

  const deleteTestimonial = async (id) => {
    const updated = testimonials.filter((t) => t.id !== id);
    setTestimonials(updated);
    await persistTestimonials(updated);
  };

  const toggleTestimonialActive = async (id) => {
    const updated = testimonials.map((t) => (t.id === id ? { ...t, active: !t.active } : t));
    setTestimonials(updated);
    await persistTestimonials(updated);
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Storefront" breadcrumbItem="Homepage Manager" />

          {successMsg && (
            <Alert color="success" className="mb-4">
              {successMsg}
            </Alert>
          )}

          {loading ? (
            <div className="text-center py-5">
              <Spinner color="primary" />
              <p className="mt-2 text-muted">Loading homepage configuration...</p>
            </div>
          ) : (
            <Row>
              {/* Announcement Bar Settings */}
              <Col lg="6">
                <Card>
                  <CardBody>
                    <CardTitle className="mb-4">Announcement Bar Settings</CardTitle>
                    <Form onSubmit={saveAnnouncement}>
                      <div className="form-check form-switch mb-3">
                        <Input
                          type="checkbox"
                          className="form-check-input"
                          id="announcementEnabled"
                          name="enabled"
                          checked={announcement.enabled}
                          onChange={handleAnnouncementChange}
                        />
                        <Label className="form-check-label" for="announcementEnabled">
                          Show Announcement Bar
                        </Label>
                      </div>

                      <FormGroup className="mb-3">
                        <Label for="announcementText">Banner Announcement Text</Label>
                        <Input
                          type="text"
                          id="announcementText"
                          name="text"
                          value={announcement.text}
                          onChange={handleAnnouncementChange}
                          disabled={!announcement.enabled}
                        />
                      </FormGroup>

                      <Row>
                        <Col md="6">
                          <FormGroup className="mb-3">
                            <Label for="announcementBgColor">Background Color</Label>
                            <div className="d-flex align-items-center gap-2">
                              <Input
                                type="color"
                                id="announcementBgColor"
                                name="bgColor"
                                value={announcement.bgColor}
                                onChange={handleAnnouncementChange}
                                disabled={!announcement.enabled}
                                style={{ width: "50px", height: "38px", padding: "2px" }}
                              />
                              <Input
                                type="text"
                                name="bgColor"
                                value={announcement.bgColor}
                                onChange={handleAnnouncementChange}
                                disabled={!announcement.enabled}
                              />
                            </div>
                          </FormGroup>
                        </Col>
                        <Col md="6">
                          <FormGroup className="mb-3">
                            <Label for="announcementTextColor">Text Color</Label>
                            <div className="d-flex align-items-center gap-2">
                              <Input
                                type="color"
                                id="announcementTextColor"
                                name="textColor"
                                value={announcement.textColor}
                                onChange={handleAnnouncementChange}
                                disabled={!announcement.enabled}
                                style={{ width: "50px", height: "38px", padding: "2px" }}
                              />
                              <Input
                                type="text"
                                name="textColor"
                                value={announcement.textColor}
                                onChange={handleAnnouncementChange}
                                disabled={!announcement.enabled}
                              />
                            </div>
                          </FormGroup>
                        </Col>
                      </Row>

                      <FormGroup className="mb-3">
                        <Label for="announcementLink">Click-through Destination Link</Label>
                        <Input
                          type="text"
                          id="announcementLink"
                          name="link"
                          value={announcement.link}
                          onChange={handleAnnouncementChange}
                          disabled={!announcement.enabled}
                          placeholder="/shop or /promotions"
                        />
                      </FormGroup>

                      <div className="d-flex justify-content-end">
                        <Button type="submit" color="primary" disabled={savingAnnouncement}>
                          {savingAnnouncement ? "Saving..." : "Save Announcement"}
                        </Button>
                      </div>
                    </Form>
                  </CardBody>
                </Card>
              </Col>

              {/* Homepage Layout Structure */}
              <Col lg="6">
                <Card>
                  <CardBody>
                    <CardTitle className="mb-4">Homepage Section Architecture</CardTitle>
                    <div className="table-responsive">
                      <Table className="table-centered table-nowrap mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Order</th>
                            <th>Section Name</th>
                            <th>Status</th>
                            <th>Layout</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sections.map((section, idx) => (
                            <tr key={section.id}>
                              <td>
                                <div className="btn-group-vertical btn-group-sm">
                                  <Button
                                    color="light"
                                    size="sm"
                                    onClick={() => moveSection(idx, -1)}
                                    disabled={idx === 0}
                                  >
                                    ▲
                                  </Button>
                                  <Button
                                    color="light"
                                    size="sm"
                                    onClick={() => moveSection(idx, 1)}
                                    disabled={idx === sections.length - 1}
                                  >
                                    ▼
                                  </Button>
                                </div>
                              </td>
                              <td className="fw-medium">{section.name}</td>
                              <td>
                                <div className="form-check form-switch">
                                  <Input
                                    type="checkbox"
                                    className="form-check-input"
                                    checked={section.enabled}
                                    onChange={() => toggleSection(section.id)}
                                  />
                                </div>
                              </td>
                              <td>
                                <Input
                                  type="select"
                                  bsSize="sm"
                                  value={section.layout || "grid-4-cols"}
                                  onChange={(e) => handleSectionLayoutChange(section.id, e.target.value)}
                                  style={{ minWidth: "120px" }}
                                >
                                  <option value="fullwidth">Full Width</option>
                                  <option value="contained">Contained Box</option>
                                  <option value="grid-3-cols">3 Columns Grid</option>
                                  <option value="grid-4-cols">4 Columns Grid</option>
                                  <option value="carousel-5-items">Carousel Slider</option>
                                  <option value="split-screen">Split Screen</option>
                                  <option value="cards-3-cols">3 Columns Cards</option>
                                </Input>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </CardBody>
                </Card>
              </Col>

              {/* 1. Hero Sliders Manager */}
              <Col lg="12">
                <Card>
                  <CardBody>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <CardTitle className="h4 mb-0">Hero Sliders & Master Banners</CardTitle>
                      <Button color="primary" onClick={() => openSliderModal()}>
                        + Add New Slide
                      </Button>
                    </div>

                    <div className="table-responsive">
                      <Table className="table-centered table-nowrap align-middle">
                        <thead className="table-light">
                          <tr>
                            <th>Preview</th>
                            <th>Headline & Details</th>
                            <th>CTA Button</th>
                            <th>Active</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sliders.map((slider) => (
                            <tr key={slider.id}>
                              <td style={{ width: "140px" }}>
                                <img
                                  src={slider.bgImage || "https://via.placeholder.com/120x60"}
                                  alt={slider.title}
                                  className="rounded"
                                  style={{ width: "120px", height: "60px", objectFit: "cover" }}
                                  onError={(e) => {
                                    e.target.src = "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=300&q=80";
                                  }}
                                />
                              </td>
                              <td>
                                <h5 className="font-size-14 mb-1">{slider.title}</h5>
                                <p className="text-muted font-size-12 mb-0 max-w-sm text-truncate">
                                  {slider.subtitle}
                                </p>
                              </td>
                              <td>
                                <span className="badge bg-primary me-1">{slider.ctaText || "Shop"}</span>
                                <small className="text-muted">({slider.ctaLink})</small>
                              </td>
                              <td>
                                <div className="form-check form-switch">
                                  <Input
                                    type="checkbox"
                                    className="form-check-input"
                                    checked={slider.active}
                                    onChange={() => toggleSliderActive(slider.id)}
                                  />
                                </div>
                              </td>
                              <td>
                                <div className="d-flex gap-2">
                                  <Button
                                    size="sm"
                                    color="info"
                                    outline
                                    onClick={() => openSliderModal(slider)}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    color="danger"
                                    outline
                                    onClick={() => deleteSlider(slider.id)}
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
                  </CardBody>
                </Card>
              </Col>

              {/* 2. Value Propositions / Highlights Manager */}
              <Col lg="12">
                <Card>
                  <CardBody>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <div>
                        <CardTitle className="h4 mb-1">Value Propositions & Highlights Bar</CardTitle>
                        <p className="text-muted font-size-13 mb-0">Customize the 3-4 feature guarantee badges shown under the hero.</p>
                      </div>
                      <Button color="primary" onClick={() => openValuePropModal()}>
                        + Add Value Prop
                      </Button>
                    </div>

                    <div className="table-responsive">
                      <Table className="table-centered table-nowrap align-middle">
                        <thead className="table-light">
                          <tr>
                            <th>Icon</th>
                            <th>Headline</th>
                            <th>Description</th>
                            <th>Active</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {valueProps.map((vp) => (
                            <tr key={vp.id}>
                              <td style={{ width: "80px" }}>
                                <span className="badge bg-soft-primary text-primary p-2 font-size-14">
                                  {vp.icon || "truck"}
                                </span>
                              </td>
                              <td className="fw-semibold">{vp.title}</td>
                              <td className="text-muted font-size-13">{vp.description}</td>
                              <td>
                                <div className="form-check form-switch">
                                  <Input
                                    type="checkbox"
                                    className="form-check-input"
                                    checked={vp.active !== false}
                                    onChange={() => toggleValuePropActive(vp.id)}
                                  />
                                </div>
                              </td>
                              <td>
                                <div className="d-flex gap-2">
                                  <Button size="sm" color="info" outline onClick={() => openValuePropModal(vp)}>
                                    Edit
                                  </Button>
                                  <Button size="sm" color="danger" outline onClick={() => deleteValueProp(vp.id)}>
                                    Delete
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </CardBody>
                </Card>
              </Col>

              {/* 3. Editorial Promo Banners Manager */}
              <Col lg="12">
                <Card>
                  <CardBody>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <div>
                        <CardTitle className="h4 mb-1">Editorial Promo Banners</CardTitle>
                        <p className="text-muted font-size-13 mb-0">Feature dual editorial promo cards with images, discount codes, and call-to-actions.</p>
                      </div>
                      <Button color="primary" onClick={() => openPromoModal()}>
                        + Add Promo Banner
                      </Button>
                    </div>

                    <div className="table-responsive">
                      <Table className="table-centered table-nowrap align-middle">
                        <thead className="table-light">
                          <tr>
                            <th>Badge & Title</th>
                            <th>Description</th>
                            <th>CTA Button & Link</th>
                            <th>Coupon Code</th>
                            <th>Active</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {promoBanners.map((pb) => (
                            <tr key={pb.id}>
                              <td>
                                {pb.badge && <span className="badge bg-indigo-subtle text-primary mb-1 d-inline-block">{pb.badge}</span>}
                                <h6 className="font-size-14 mb-0">{pb.title}</h6>
                              </td>
                              <td className="text-muted font-size-13 text-truncate" style={{ maxWidth: "250px" }}>
                                {pb.description}
                              </td>
                              <td>
                                <span className="badge bg-secondary me-1">{pb.ctaText || "Shop"}</span>
                                <small className="text-muted">({pb.ctaLink || "/shop"})</small>
                              </td>
                              <td>
                                {pb.couponCode ? (
                                  <span className="badge bg-success font-monospace">{pb.couponCode}</span>
                                ) : (
                                  <span className="text-muted font-size-12">—</span>
                                )}
                              </td>
                              <td>
                                <div className="form-check form-switch">
                                  <Input
                                    type="checkbox"
                                    className="form-check-input"
                                    checked={pb.active !== false}
                                    onChange={() => togglePromoActive(pb.id)}
                                  />
                                </div>
                              </td>
                              <td>
                                <div className="d-flex gap-2">
                                  <Button size="sm" color="info" outline onClick={() => openPromoModal(pb)}>
                                    Edit
                                  </Button>
                                  <Button size="sm" color="danger" outline onClick={() => deletePromoBanner(pb.id)}>
                                    Delete
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </CardBody>
                </Card>
              </Col>

              {/* 4. Testimonials & Tastemakers Manager */}
              <Col lg="12">
                <Card>
                  <CardBody>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <div>
                        <CardTitle className="h4 mb-1">Reviews & Tastemakers</CardTitle>
                        <p className="text-muted font-size-13 mb-0">Client feedback cards and social proof displayed on the homepage.</p>
                      </div>
                      <Button color="primary" onClick={() => openTestimonialModal()}>
                        + Add Testimonial
                      </Button>
                    </div>

                    <div className="table-responsive">
                      <Table className="table-centered table-nowrap align-middle">
                        <thead className="table-light">
                          <tr>
                            <th>Author & Role</th>
                            <th>Quote</th>
                            <th>Rating</th>
                            <th>Active</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {testimonials.map((t) => (
                            <tr key={t.id}>
                              <td>
                                <h6 className="font-size-14 mb-0">{t.author}</h6>
                                <small className="text-muted">{t.role || "Client"}</small>
                              </td>
                              <td className="text-muted font-size-13 fst-italic text-truncate" style={{ maxWidth: "300px" }}>
                                "{t.quote}"
                              </td>
                              <td>
                                <span className="text-warning">{"★".repeat(t.stars || 5)}</span>
                              </td>
                              <td>
                                <div className="form-check form-switch">
                                  <Input
                                    type="checkbox"
                                    className="form-check-input"
                                    checked={t.active !== false}
                                    onChange={() => toggleTestimonialActive(t.id)}
                                  />
                                </div>
                              </td>
                              <td>
                                <div className="d-flex gap-2">
                                  <Button size="sm" color="info" outline onClick={() => openTestimonialModal(t)}>
                                    Edit
                                  </Button>
                                  <Button size="sm" color="danger" outline onClick={() => deleteTestimonial(t.id)}>
                                    Delete
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          )}

          {/* Modal: Add/Edit Hero Slide */}
          <Modal isOpen={sliderModalOpen} toggle={() => setSliderModalOpen(!sliderModalOpen)} size="lg">
            <ModalHeader toggle={() => setSliderModalOpen(!sliderModalOpen)}>
              {editingSlider ? "Edit Hero Slide" : "Add New Hero Slide"}
            </ModalHeader>
            <ModalBody>
              <Form>
                <FormGroup className="mb-3">
                  <Label for="slideTitle">Headline Title</Label>
                  <Input
                    type="text"
                    id="slideTitle"
                    value={sliderForm.title}
                    onChange={(e) => setSliderForm({ ...sliderForm, title: e.target.value })}
                    placeholder="e.g. Discover Modern Luxury"
                  />
                </FormGroup>
                <FormGroup className="mb-3">
                  <Label for="slideSubtitle">Subtitle / Description</Label>
                  <Input
                    type="textarea"
                    rows={2}
                    id="slideSubtitle"
                    value={sliderForm.subtitle}
                    onChange={(e) => setSliderForm({ ...sliderForm, subtitle: e.target.value })}
                    placeholder="e.g. Elevate your everyday style with our premium curated collection."
                  />
                </FormGroup>
                <FormGroup className="mb-3">
                  <Label for="slideBgImage">Background Image URL</Label>
                  <Input
                    type="text"
                    id="slideBgImage"
                    value={sliderForm.bgImage}
                    onChange={(e) => setSliderForm({ ...sliderForm, bgImage: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                  />
                </FormGroup>
                <Row>
                  <Col md="6">
                    <FormGroup className="mb-3">
                      <Label for="slideCtaText">CTA Button Text</Label>
                      <Input
                        type="text"
                        id="slideCtaText"
                        value={sliderForm.ctaText}
                        onChange={(e) => setSliderForm({ ...sliderForm, ctaText: e.target.value })}
                        placeholder="e.g. Shop Collection"
                      />
                    </FormGroup>
                  </Col>
                  <Col md="6">
                    <FormGroup className="mb-3">
                      <Label for="slideCtaLink">CTA Button Destination Link</Label>
                      <Input
                        type="text"
                        id="slideCtaLink"
                        value={sliderForm.ctaLink}
                        onChange={(e) => setSliderForm({ ...sliderForm, ctaLink: e.target.value })}
                        placeholder="e.g. /shop or /category/apparel"
                      />
                    </FormGroup>
                  </Col>
                </Row>
              </Form>
            </ModalBody>
            <ModalFooter>
              <Button color="secondary" onClick={() => setSliderModalOpen(false)}>
                Cancel
              </Button>
              <Button color="primary" onClick={saveSlider}>
                Save Slide
              </Button>
            </ModalFooter>
          </Modal>

          {/* Modal: Add/Edit Value Proposition */}
          <Modal isOpen={valuePropModalOpen} toggle={() => setValuePropModalOpen(!valuePropModalOpen)}>
            <ModalHeader toggle={() => setValuePropModalOpen(!valuePropModalOpen)}>
              {editingValueProp ? "Edit Value Proposition" : "Add Value Proposition"}
            </ModalHeader>
            <ModalBody>
              <Form>
                <FormGroup className="mb-3">
                  <Label for="vpTitle">Title</Label>
                  <Input
                    type="text"
                    id="vpTitle"
                    value={valuePropForm.title}
                    onChange={(e) => setValuePropForm({ ...valuePropForm, title: e.target.value })}
                    placeholder="e.g. Complimentary Shipping"
                  />
                </FormGroup>
                <FormGroup className="mb-3">
                  <Label for="vpDescription">Description</Label>
                  <Input
                    type="textarea"
                    rows={2}
                    id="vpDescription"
                    value={valuePropForm.description}
                    onChange={(e) => setValuePropForm({ ...valuePropForm, description: e.target.value })}
                    placeholder="e.g. Free delivery on qualifying orders."
                  />
                </FormGroup>
                <FormGroup className="mb-3">
                  <Label for="vpIcon">Icon (Lucide name: truck, shield, refresh, sparkles, zap, award, or image URL, or emoji)</Label>
                  <Input
                    type="text"
                    id="vpIcon"
                    value={valuePropForm.icon}
                    onChange={(e) => setValuePropForm({ ...valuePropForm, icon: e.target.value })}
                    placeholder="truck / shield / refresh / 🚚"
                  />
                </FormGroup>
              </Form>
            </ModalBody>
            <ModalFooter>
              <Button color="secondary" onClick={() => setValuePropModalOpen(false)}>
                Cancel
              </Button>
              <Button color="primary" onClick={saveValueProp}>
                Save Proposition
              </Button>
            </ModalFooter>
          </Modal>

          {/* Modal: Add/Edit Promo Banner */}
          <Modal isOpen={promoModalOpen} toggle={() => setPromoModalOpen(!promoModalOpen)} size="lg">
            <ModalHeader toggle={() => setPromoModalOpen(!promoModalOpen)}>
              {editingPromo ? "Edit Promo Banner" : "Add Promo Banner"}
            </ModalHeader>
            <ModalBody>
              <Form>
                <Row>
                  <Col md="4">
                    <FormGroup className="mb-3">
                      <Label for="promoBadge">Badge Text</Label>
                      <Input
                        type="text"
                        id="promoBadge"
                        value={promoForm.badge}
                        onChange={(e) => setPromoForm({ ...promoForm, badge: e.target.value })}
                        placeholder="e.g. Artisanal Studio"
                      />
                    </FormGroup>
                  </Col>
                  <Col md="8">
                    <FormGroup className="mb-3">
                      <Label for="promoTitle">Headline Title</Label>
                      <Input
                        type="text"
                        id="promoTitle"
                        value={promoForm.title}
                        onChange={(e) => setPromoForm({ ...promoForm, title: e.target.value })}
                        placeholder="e.g. Handcrafted Leather Essentials"
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <FormGroup className="mb-3">
                  <Label for="promoDescription">Description Copy</Label>
                  <Input
                    type="textarea"
                    rows={2}
                    id="promoDescription"
                    value={promoForm.description}
                    onChange={(e) => setPromoForm({ ...promoForm, description: e.target.value })}
                    placeholder="e.g. Tanned using pure plant extracts..."
                  />
                </FormGroup>
                <FormGroup className="mb-3">
                  <Label for="promoBgImage">Background Image URL (Optional)</Label>
                  <Input
                    type="text"
                    id="promoBgImage"
                    value={promoForm.bgImage}
                    onChange={(e) => setPromoForm({ ...promoForm, bgImage: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                  />
                </FormGroup>
                <Row>
                  <Col md="4">
                    <FormGroup className="mb-3">
                      <Label for="promoCtaText">Button Text</Label>
                      <Input
                        type="text"
                        id="promoCtaText"
                        value={promoForm.ctaText}
                        onChange={(e) => setPromoForm({ ...promoForm, ctaText: e.target.value })}
                        placeholder="Shop Now"
                      />
                    </FormGroup>
                  </Col>
                  <Col md="4">
                    <FormGroup className="mb-3">
                      <Label for="promoCtaLink">Button Link</Label>
                      <Input
                        type="text"
                        id="promoCtaLink"
                        value={promoForm.ctaLink}
                        onChange={(e) => setPromoForm({ ...promoForm, ctaLink: e.target.value })}
                        placeholder="/shop?category=accessories"
                      />
                    </FormGroup>
                  </Col>
                  <Col md="4">
                    <FormGroup className="mb-3">
                      <Label for="promoCouponCode">Coupon Code (Optional)</Label>
                      <Input
                        type="text"
                        id="promoCouponCode"
                        value={promoForm.couponCode}
                        onChange={(e) => setPromoForm({ ...promoForm, couponCode: e.target.value })}
                        placeholder="WELCOME20"
                      />
                    </FormGroup>
                  </Col>
                </Row>
              </Form>
            </ModalBody>
            <ModalFooter>
              <Button color="secondary" onClick={() => setPromoModalOpen(false)}>
                Cancel
              </Button>
              <Button color="primary" onClick={savePromoBanner}>
                Save Banner
              </Button>
            </ModalFooter>
          </Modal>

          {/* Modal: Add/Edit Testimonial */}
          <Modal isOpen={testimonialModalOpen} toggle={() => setTestimonialModalOpen(!testimonialModalOpen)}>
            <ModalHeader toggle={() => setTestimonialModalOpen(!testimonialModalOpen)}>
              {editingTestimonial ? "Edit Testimonial" : "Add Testimonial"}
            </ModalHeader>
            <ModalBody>
              <Form>
                <FormGroup className="mb-3">
                  <Label for="testAuthor">Author Name</Label>
                  <Input
                    type="text"
                    id="testAuthor"
                    value={testimonialForm.author}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, author: e.target.value })}
                    placeholder="e.g. Sophia R."
                  />
                </FormGroup>
                <FormGroup className="mb-3">
                  <Label for="testRole">Role / Title</Label>
                  <Input
                    type="text"
                    id="testRole"
                    value={testimonialForm.role}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, role: e.target.value })}
                    placeholder="e.g. Creative Director"
                  />
                </FormGroup>
                <FormGroup className="mb-3">
                  <Label for="testQuote">Client Quote</Label>
                  <Input
                    type="textarea"
                    rows={3}
                    id="testQuote"
                    value={testimonialForm.quote}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, quote: e.target.value })}
                    placeholder="e.g. The weight and stitching on the cashmere sweater are outstanding..."
                  />
                </FormGroup>
                <Row>
                  <Col md="6">
                    <FormGroup className="mb-3">
                      <Label for="testStars">Rating (1 to 5 Stars)</Label>
                      <Input
                        type="select"
                        id="testStars"
                        value={testimonialForm.stars}
                        onChange={(e) => setTestimonialForm({ ...testimonialForm, stars: Number(e.target.value) })}
                      >
                        <option value={5}>5 Stars ★★★★★</option>
                        <option value={4}>4 Stars ★★★★☆</option>
                        <option value={3}>3 Stars ★★★☆☆</option>
                      </Input>
                    </FormGroup>
                  </Col>
                  <Col md="6">
                    <FormGroup className="mb-3">
                      <Label for="testAvatar">Avatar Image URL (Optional)</Label>
                      <Input
                        type="text"
                        id="testAvatar"
                        value={testimonialForm.avatarUrl}
                        onChange={(e) => setTestimonialForm({ ...testimonialForm, avatarUrl: e.target.value })}
                        placeholder="https://..."
                      />
                    </FormGroup>
                  </Col>
                </Row>
              </Form>
            </ModalBody>
            <ModalFooter>
              <Button color="secondary" onClick={() => setTestimonialModalOpen(false)}>
                Cancel
              </Button>
              <Button color="primary" onClick={saveTestimonial}>
                Save Testimonial
              </Button>
            </ModalFooter>
          </Modal>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default StorefrontHomepage;
