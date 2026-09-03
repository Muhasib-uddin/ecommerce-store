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
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Alert,
  Spinner,
} from "reactstrap";
import classnames from "classnames";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { toast } from "react-toastify";
import { getRealSettings, updateRealSettings } from "../../helpers/real_backend_helper";
import { useBranding } from "../../context/BrandingContext";

const StorefrontTheme = () => {
  const { refreshBranding } = useBranding();
  const [activeTab, setActiveTab] = useState("1");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Tab 1: Branding State
  const [branding, setBranding] = useState({
    storeName: "LUMIÈRE",
    contactEmail: "support@lumiere.com",
    contactPhone: "+1 (800) 555-0199",
    address: "142 Mercer Street, New York, NY 10012",
    tagline: "Curated premium lifestyle products designed for modern comfort.",
    lightLogo: "",
    darkLogo: "",
    favicon: "",
  });

  // Tab 2: Colors & Typography State
  const [appearance, setAppearance] = useState({
    colorPrimary: "#4f46e5",
    colorSecondary: "#0ea5e9",
    colorBackground: "#ffffff",
    fontFamily: "Inter",
  });

  // Tab 3: Social Media Links
  const [socials, setSocials] = useState({
    facebook: "https://facebook.com",
    instagram: "https://instagram.com",
    twitter: "https://twitter.com",
    youtube: "https://youtube.com",
    tiktok: "https://tiktok.com",
    pinterest: "",
  });

  // Tab 4: Footer State
  const [footer, setFooter] = useState({
    layout: "grid",
    columnsCount: "4",
    copyrightText: "© 2026 LUMIÈRE Store. All rights reserved.",
    footerDescription: "Curated premium lifestyle products designed for modern comfort. Elevate your everyday aesthetic.",
    links: [
      { id: 1, title: "Company", items: "About Us, Careers, Store Locator" },
      { id: 2, title: "Help", items: "FAQ, Shipping, Returns, Support" },
      { id: 3, title: "Shop", items: "New Arrivals, Best Sellers, Sale" },
    ],
  });

  // Tab 5: SEO & OpenGraph State
  const [seo, setSeo] = useState({
    metaTitle: "LUMIÈRE | Curated Luxury Lifestyle & Apparel",
    metaDescription: "Experience refined living with our curated collection of cashmere garments, artisanal leather accessories, and hand-poured minimalist home accents.",
    ogImage: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80",
    keywords: "luxury apparel, cashmere sweaters, leather bags, minimalist decor, premium store",
    twitterHandle: "@lumiere_store",
  });

  // Tab 6: Custom CSS State
  const [customCss, setCustomCss] = useState(
    "/* Custom CSS Rules for Storefront */\n:root {\n  --brand-radius: 1rem;\n}"
  );

  // Fetch real settings from API on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const data = await getRealSettings();
        if (data) {
          const s = data.storeSettings || {};
          const t = data.themeSettings || {};

          setBranding({
            storeName: s.storeName || s.store_name || s.businessName || "LUMIÈRE",
            contactEmail: s.contactEmail || s.contact_email || s.supportEmail || "support@lumiere.com",
            contactPhone: s.contactPhone || s.contact_phone || "+1 (800) 555-0199",
            address: s.address || s.store_address || "142 Mercer Street, New York, NY 10012",
            tagline: s.tagline || "Curated premium lifestyle products designed for modern comfort.",
            lightLogo: s.lightLogo || s.store_logo_light || "",
            darkLogo: s.darkLogo || s.store_logo_dark || "",
            favicon: s.favicon || s.store_favicon || "",
          });

          setAppearance({
            colorPrimary: t.colorPrimary || t.primary_color || "#4f46e5",
            colorSecondary: t.colorSecondary || t.secondary_color || "#0ea5e9",
            colorBackground: t.colorBackground || t.background_color || "#ffffff",
            fontFamily: t.fontFamily || t.font_family || "Inter",
          });

          setSocials({
            facebook: s.socialFacebook || s.social_facebook || "",
            instagram: s.socialInstagram || s.social_instagram || "",
            twitter: s.socialTwitter || s.social_twitter || "",
            youtube: s.socialYoutube || s.social_youtube || "",
            tiktok: s.socialTiktok || s.social_tiktok || "",
            pinterest: s.socialPinterest || s.social_pinterest || "",
          });

          setFooter((prev) => ({
            ...prev,
            copyrightText: s.footerCopyright || s.footer_copyright || prev.copyrightText,
            footerDescription: s.footerDescription || s.footer_description || prev.footerDescription,
            layout: t.footerLayout || t.footer_layout || prev.layout,
            columnsCount: t.footerColumns || t.footer_columns || prev.columnsCount,
          }));

          setSeo({
            metaTitle: s.seoMetaTitle || s.seo_meta_title || s.metaTitle || "LUMIÈRE | Curated Luxury Lifestyle & Apparel",
            metaDescription: s.seoMetaDescription || s.seo_meta_description || s.metaDescription || "Experience refined living with our curated collection of cashmere garments, artisanal leather accessories, and hand-poured minimalist home accents.",
            ogImage: s.seoOgImage || s.seo_og_image || s.ogImage || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80",
            keywords: s.seoKeywords || s.seo_keywords || "luxury apparel, cashmere sweaters, leather bags, minimalist decor, premium store",
            twitterHandle: s.twitterHandle || s.twitter_handle || "@lumiere_store",
          });

          if (t.customCss || t.custom_css) {
            setCustomCss(t.customCss || t.custom_css);
          }
        }
      } catch (err) {
        console.error("Failed to load storefront theme settings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const toggleTab = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  const handleBrandingChange = (e) => {
    const { name, value } = e.target;
    setBranding((prev) => ({ ...prev, [name]: value }));
  };

  const handleAppearanceChange = (e) => {
    const { name, value } = e.target;
    setAppearance((prev) => ({ ...prev, [name]: value }));
  };

  const handleSocialsChange = (e) => {
    const { name, value } = e.target;
    setSocials((prev) => ({ ...prev, [name]: value }));
  };

  const handleFooterChange = (e) => {
    const { name, value } = e.target;
    setFooter((prev) => ({ ...prev, [name]: value }));
  };

  const handleSeoChange = (e) => {
    const { name, value } = e.target;
    setSeo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        storeSettings: {
          storeName: branding.storeName,
          store_name: branding.storeName,
          contactEmail: branding.contactEmail,
          store_email: branding.contactEmail,
          contactPhone: branding.contactPhone,
          address: branding.address,
          tagline: branding.tagline,
          lightLogo: branding.lightLogo,
          darkLogo: branding.darkLogo,
          favicon: branding.favicon,
          footerCopyright: footer.copyrightText,
          footerDescription: footer.footerDescription,
          socialFacebook: socials.facebook,
          socialInstagram: socials.instagram,
          socialTwitter: socials.twitter,
          socialYoutube: socials.youtube,
          socialTiktok: socials.tiktok,
          socialPinterest: socials.pinterest,
          seoMetaTitle: seo.metaTitle,
          seo_meta_title: seo.metaTitle,
          seoMetaDescription: seo.metaDescription,
          seo_meta_description: seo.metaDescription,
          seoOgImage: seo.ogImage,
          seo_og_image: seo.ogImage,
          seoKeywords: seo.keywords,
          seo_keywords: seo.keywords,
          twitterHandle: seo.twitterHandle,
          twitter_handle: seo.twitterHandle,
        },
        themeSettings: {
          colorPrimary: appearance.colorPrimary,
          colorSecondary: appearance.colorSecondary,
          colorBackground: appearance.colorBackground,
          fontFamily: appearance.fontFamily,
          footerLayout: footer.layout,
          footerColumns: footer.columnsCount,
          customCss: customCss,
        },
      };

      await updateRealSettings(payload);
      await refreshBranding();
      toast.success("Storefront theme & branding updated successfully!", { autoClose: 2500 });
      setSuccessMsg("Storefront theme & branding updated successfully!");
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      console.error("Failed to save theme settings:", err);
      toast.error(err.message || "Failed to save theme settings", { autoClose: 3000 });
    } finally {
      setSaving(false);
    }
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Storefront" breadcrumbItem="Theme Settings" />

          {successMsg && (
            <Alert color="success" className="mb-4">
              {successMsg}
            </Alert>
          )}

          {loading ? (
            <div className="text-center py-5">
              <Spinner color="primary" />
              <p className="mt-2 text-muted">Loading theme configuration...</p>
            </div>
          ) : (
            <Row>
              <Col lg="12">
                <Card>
                  <CardBody>
                    <Nav tabs className="nav-tabs-custom nav-justified">
                      <NavItem>
                        <NavLink
                          style={{ cursor: "pointer" }}
                          className={classnames({ active: activeTab === "1" })}
                          onClick={() => toggleTab("1")}
                        >
                          <span className="d-none d-sm-block">Branding & Identity</span>
                        </NavLink>
                      </NavItem>
                      <NavItem>
                        <NavLink
                          style={{ cursor: "pointer" }}
                          className={classnames({ active: activeTab === "2" })}
                          onClick={() => toggleTab("2")}
                        >
                          <span className="d-none d-sm-block">Colors & Styling</span>
                        </NavLink>
                      </NavItem>
                      <NavItem>
                        <NavLink
                          style={{ cursor: "pointer" }}
                          className={classnames({ active: activeTab === "3" })}
                          onClick={() => toggleTab("3")}
                        >
                          <span className="d-none d-sm-block">Social Media Links</span>
                        </NavLink>
                      </NavItem>
                      <NavItem>
                        <NavLink
                          style={{ cursor: "pointer" }}
                          className={classnames({ active: activeTab === "4" })}
                          onClick={() => toggleTab("4")}
                        >
                          <span className="d-none d-sm-block">Footer & Copyright</span>
                        </NavLink>
                      </NavItem>
                      <NavItem>
                        <NavLink
                          style={{ cursor: "pointer" }}
                          className={classnames({ active: activeTab === "5" })}
                          onClick={() => toggleTab("5")}
                        >
                          <span className="d-none d-sm-block">SEO & Social Meta</span>
                        </NavLink>
                      </NavItem>
                      <NavItem>
                        <NavLink
                          style={{ cursor: "pointer" }}
                          className={classnames({ active: activeTab === "6" })}
                          onClick={() => toggleTab("6")}
                        >
                          <span className="d-none d-sm-block">Custom CSS</span>
                        </NavLink>
                      </NavItem>
                    </Nav>

                    <Form onSubmit={handleSave}>
                      <TabContent activeTab={activeTab} className="p-3 text-muted">
                        {/* Tab 1: Branding */}
                        <TabPane tabId="1">
                          <Row className="mt-3">
                            <Col md="6">
                              <FormGroup className="mb-3">
                                <Label for="storeName">Store / Brand Name</Label>
                                <Input
                                  type="text"
                                  id="storeName"
                                  name="storeName"
                                  value={branding.storeName}
                                  onChange={handleBrandingChange}
                                />
                              </FormGroup>
                              <FormGroup className="mb-3">
                                <Label for="tagline">Tagline / Motto</Label>
                                <Input
                                  type="text"
                                  id="tagline"
                                  name="tagline"
                                  value={branding.tagline}
                                  onChange={handleBrandingChange}
                                />
                              </FormGroup>
                              <FormGroup className="mb-3">
                                <Label for="contactEmail">Support Email</Label>
                                <Input
                                  type="email"
                                  id="contactEmail"
                                  name="contactEmail"
                                  value={branding.contactEmail}
                                  onChange={handleBrandingChange}
                                />
                              </FormGroup>
                              <FormGroup className="mb-3">
                                <Label for="contactPhone">Support Phone</Label>
                                <Input
                                  type="text"
                                  id="contactPhone"
                                  name="contactPhone"
                                  value={branding.contactPhone}
                                  onChange={handleBrandingChange}
                                />
                              </FormGroup>
                            </Col>
                            <Col md="6">
                              <FormGroup className="mb-3">
                                <Label for="address">Store / Showroom Physical Address</Label>
                                <Input
                                  type="textarea"
                                  rows="2"
                                  id="address"
                                  name="address"
                                  value={branding.address}
                                  onChange={handleBrandingChange}
                                />
                              </FormGroup>
                              <FormGroup className="mb-3">
                                <Label for="lightLogo">Light Mode Logo Image URL</Label>
                                <Input
                                  type="text"
                                  id="lightLogo"
                                  name="lightLogo"
                                  placeholder="https://... or /logo.png"
                                  value={branding.lightLogo}
                                  onChange={handleBrandingChange}
                                />
                              </FormGroup>
                              <FormGroup className="mb-3">
                                <Label for="darkLogo">Dark Mode Logo Image URL</Label>
                                <Input
                                  type="text"
                                  id="darkLogo"
                                  name="darkLogo"
                                  placeholder="https://... or /logo-dark.png"
                                  value={branding.darkLogo}
                                  onChange={handleBrandingChange}
                                />
                              </FormGroup>
                              <FormGroup className="mb-3">
                                <Label for="favicon">Store Favicon URL</Label>
                                <Input
                                  type="text"
                                  id="favicon"
                                  name="favicon"
                                  placeholder="https://.../favicon.ico"
                                  value={branding.favicon}
                                  onChange={handleBrandingChange}
                                />
                              </FormGroup>
                            </Col>
                          </Row>
                        </TabPane>

                        {/* Tab 2: Appearance & Colors */}
                        <TabPane tabId="2">
                          <Row className="mt-3">
                            <Col md="6">
                              <FormGroup className="mb-3">
                                <Label for="colorPrimary">Primary Brand Accent Color</Label>
                                <div className="d-flex align-items-center gap-2">
                                  <Input
                                    type="color"
                                    id="colorPrimary"
                                    name="colorPrimary"
                                    value={appearance.colorPrimary}
                                    onChange={handleAppearanceChange}
                                    style={{ width: "50px", height: "38px", padding: "2px" }}
                                  />
                                  <Input
                                    type="text"
                                    name="colorPrimary"
                                    value={appearance.colorPrimary}
                                    onChange={handleAppearanceChange}
                                  />
                                </div>
                              </FormGroup>
                              <FormGroup className="mb-3">
                                <Label for="colorSecondary">Secondary Accent Color</Label>
                                <div className="d-flex align-items-center gap-2">
                                  <Input
                                    type="color"
                                    id="colorSecondary"
                                    name="colorSecondary"
                                    value={appearance.colorSecondary}
                                    onChange={handleAppearanceChange}
                                    style={{ width: "50px", height: "38px", padding: "2px" }}
                                  />
                                  <Input
                                    type="text"
                                    name="colorSecondary"
                                    value={appearance.colorSecondary}
                                    onChange={handleAppearanceChange}
                                  />
                                </div>
                              </FormGroup>
                            </Col>
                            <Col md="6">
                              <FormGroup className="mb-3">
                                <Label for="colorBackground">Canvas Background Color</Label>
                                <div className="d-flex align-items-center gap-2">
                                  <Input
                                    type="color"
                                    id="colorBackground"
                                    name="colorBackground"
                                    value={appearance.colorBackground}
                                    onChange={handleAppearanceChange}
                                    style={{ width: "50px", height: "38px", padding: "2px" }}
                                  />
                                  <Input
                                    type="text"
                                    name="colorBackground"
                                    value={appearance.colorBackground}
                                    onChange={handleAppearanceChange}
                                  />
                                </div>
                              </FormGroup>
                              <FormGroup className="mb-3">
                                <Label for="fontFamily">Font Family (Google Fonts)</Label>
                                <Input
                                  type="select"
                                  id="fontFamily"
                                  name="fontFamily"
                                  value={appearance.fontFamily}
                                  onChange={handleAppearanceChange}
                                >
                                  <option value="Inter">Inter (Modern & Clean)</option>
                                  <option value="Geist">Geist (Sleek Minimal)</option>
                                  <option value="Roboto">Roboto</option>
                                  <option value="Open Sans">Open Sans</option>
                                  <option value="Lato">Lato</option>
                                  <option value="Montserrat">Montserrat (Geometric Elegance)</option>
                                  <option value="Nunito">Nunito</option>
                                </Input>
                              </FormGroup>
                            </Col>
                          </Row>
                        </TabPane>

                        {/* Tab 3: Social Media Links */}
                        <TabPane tabId="3">
                          <Row className="mt-3">
                            <Col md="6">
                              <FormGroup className="mb-3">
                                <Label for="instagram">Instagram URL</Label>
                                <Input
                                  type="url"
                                  id="instagram"
                                  name="instagram"
                                  placeholder="https://instagram.com/yourbrand"
                                  value={socials.instagram}
                                  onChange={handleSocialsChange}
                                />
                              </FormGroup>
                              <FormGroup className="mb-3">
                                <Label for="facebook">Facebook URL</Label>
                                <Input
                                  type="url"
                                  id="facebook"
                                  name="facebook"
                                  placeholder="https://facebook.com/yourbrand"
                                  value={socials.facebook}
                                  onChange={handleSocialsChange}
                                />
                              </FormGroup>
                              <FormGroup className="mb-3">
                                <Label for="twitter">Twitter / X URL</Label>
                                <Input
                                  type="url"
                                  id="twitter"
                                  name="twitter"
                                  placeholder="https://twitter.com/yourbrand"
                                  value={socials.twitter}
                                  onChange={handleSocialsChange}
                                />
                              </FormGroup>
                            </Col>
                            <Col md="6">
                              <FormGroup className="mb-3">
                                <Label for="youtube">YouTube URL</Label>
                                <Input
                                  type="url"
                                  id="youtube"
                                  name="youtube"
                                  placeholder="https://youtube.com/@yourbrand"
                                  value={socials.youtube}
                                  onChange={handleSocialsChange}
                                />
                              </FormGroup>
                              <FormGroup className="mb-3">
                                <Label for="tiktok">TikTok URL</Label>
                                <Input
                                  type="url"
                                  id="tiktok"
                                  name="tiktok"
                                  placeholder="https://tiktok.com/@yourbrand"
                                  value={socials.tiktok}
                                  onChange={handleSocialsChange}
                                />
                              </FormGroup>
                              <FormGroup className="mb-3">
                                <Label for="pinterest">Pinterest URL</Label>
                                <Input
                                  type="url"
                                  id="pinterest"
                                  name="pinterest"
                                  placeholder="https://pinterest.com/yourbrand"
                                  value={socials.pinterest}
                                  onChange={handleSocialsChange}
                                />
                              </FormGroup>
                            </Col>
                          </Row>
                        </TabPane>

                        {/* Tab 4: Footer & Copyright */}
                        <TabPane tabId="4">
                          <Row className="mt-3">
                            <Col md="6">
                              <FormGroup className="mb-3">
                                <Label for="footerDescription">Footer Brand Description</Label>
                                <Input
                                  type="textarea"
                                  rows="3"
                                  id="footerDescription"
                                  name="footerDescription"
                                  value={footer.footerDescription}
                                  onChange={handleFooterChange}
                                />
                              </FormGroup>
                              <FormGroup className="mb-3">
                                <Label for="copyrightText">Copyright Text</Label>
                                <Input
                                  type="text"
                                  id="copyrightText"
                                  name="copyrightText"
                                  value={footer.copyrightText}
                                  onChange={handleFooterChange}
                                />
                              </FormGroup>
                            </Col>
                            <Col md="6">
                              <FormGroup className="mb-3">
                                <Label for="layout">Footer Layout</Label>
                                <Input
                                  type="select"
                                  id="layout"
                                  name="layout"
                                  value={footer.layout}
                                  onChange={handleFooterChange}
                                >
                                  <option value="grid">Grid (Multi-Column Standard)</option>
                                  <option value="minimal">Minimal (Clean Single Bar)</option>
                                  <option value="centered">Centered Stacked</option>
                                </Input>
                              </FormGroup>
                            </Col>
                          </Row>
                        </TabPane>

                        {/* Tab 5: SEO & OpenGraph Meta */}
                        <TabPane tabId="5">
                          <Row className="mt-3">
                            <Col md="6">
                              <FormGroup className="mb-3">
                                <Label for="metaTitle">Default Storefront Meta Title</Label>
                                <Input
                                  type="text"
                                  id="metaTitle"
                                  name="metaTitle"
                                  value={seo.metaTitle}
                                  onChange={handleSeoChange}
                                />
                                <small className="text-muted">Used in search engine result headings and browser tabs.</small>
                              </FormGroup>
                              <FormGroup className="mb-3">
                                <Label for="metaDescription">Default Meta Description</Label>
                                <Input
                                  type="textarea"
                                  rows="3"
                                  id="metaDescription"
                                  name="metaDescription"
                                  value={seo.metaDescription}
                                  onChange={handleSeoChange}
                                />
                                <small className="text-muted">Appears in Google search snippets under the title.</small>
                              </FormGroup>
                            </Col>
                            <Col md="6">
                              <FormGroup className="mb-3">
                                <Label for="ogImage">OpenGraph / Social Sharing Image URL</Label>
                                <Input
                                  type="text"
                                  id="ogImage"
                                  name="ogImage"
                                  value={seo.ogImage}
                                  onChange={handleSeoChange}
                                />
                                <small className="text-muted">Preview image when link is shared on WhatsApp, Facebook, iMessage, LinkedIn.</small>
                              </FormGroup>
                              <FormGroup className="mb-3">
                                <Label for="keywords">SEO Keywords (comma separated)</Label>
                                <Input
                                  type="text"
                                  id="keywords"
                                  name="keywords"
                                  value={seo.keywords}
                                  onChange={handleSeoChange}
                                />
                              </FormGroup>
                              <FormGroup className="mb-3">
                                <Label for="twitterHandle">Twitter / X Creator Handle</Label>
                                <Input
                                  type="text"
                                  id="twitterHandle"
                                  name="twitterHandle"
                                  value={seo.twitterHandle}
                                  onChange={handleSeoChange}
                                  placeholder="@lumiere_store"
                                />
                              </FormGroup>
                            </Col>
                          </Row>
                        </TabPane>

                        {/* Tab 6: Custom CSS */}
                        <TabPane tabId="6">
                          <Row className="mt-3">
                            <Col md="12">
                              <FormGroup className="mb-3">
                                <Label for="customCss">Custom Storefront CSS Editor</Label>
                                <Input
                                  type="textarea"
                                  id="customCss"
                                  value={customCss}
                                  onChange={(e) => setCustomCss(e.target.value)}
                                  rows="10"
                                  style={{
                                    fontFamily: "monospace",
                                    backgroundColor: "#1e1e1e",
                                    color: "#d4d4d4",
                                    padding: "15px",
                                  }}
                                />
                                <small className="text-muted">Injected directly into the Storefront header.</small>
                              </FormGroup>
                            </Col>
                          </Row>
                        </TabPane>
                      </TabContent>

                      <div className="d-flex justify-content-end p-3 gap-2">
                        <Button type="submit" color="primary" disabled={saving}>
                          {saving ? "Saving Changes..." : "Save Changes"}
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

export default StorefrontTheme;
