import { post, get, put, del } from "./api_helper";

// ============================================================
// Auth endpoints
// ============================================================

export const realLogin = (data) => post("/api/v1/auth/login", data);
export const realSocialLogin = (data) => post("/api/v1/auth/social-login", data);
export const realVerify2FALogin = (data) => post("/api/v1/auth/2fa/login-challenge", data);
export const realRegister = (data) => post("/api/v1/auth/register", data);
export const realForgotPassword = (data) => post("/api/v1/auth/forgot-password", data);
export const realResetPassword = (data) => post("/api/v1/auth/reset-password", data);
export const realLogout = () => post("/api/v1/auth/logout", {});
export const realGetProfile = () => get("/api/v1/auth/me");
export const realRefreshToken = () => post("/api/v1/auth/refresh", {});
export const realUpdateProfile = (data) => post("/api/v1/auth/profile", data);

// ============================================================
// Dashboard Stats
// ============================================================

export const getDashboardStats = () =>
  get("/api/v1/dashboard/stats").then(
    (res) => res.data || res
  );

// ============================================================
// Promotions — Coupons
// ============================================================

export const getRealCoupons = () =>
  get("/api/v1/promotions/coupons").then(
    (res) => res.data?.coupons || res.data || res
  );

export const createRealCoupon = (data) =>
  post("/api/v1/promotions/coupons", data).then(
    (res) => res.data?.coupon || res.data || res
  );

export const deleteRealCoupon = (id) =>
  del(`/api/v1/promotions/coupons/${id}`).then(
    (res) => res.data || res
  );

// ============================================================
// Promotions — Discounts
// ============================================================

export const getRealDiscounts = () =>
  get("/api/v1/promotions/discounts").then(
    (res) => res.data?.discounts || res.data || res
  );

export const createRealDiscount = (data) =>
  post("/api/v1/promotions/discounts", data).then(
    (res) => res.data?.discount || res.data || res
  );

export const deleteRealDiscount = (id) =>
  del(`/api/v1/promotions/discounts/${id}`).then(
    (res) => res.data || res
  );

// ============================================================
// Promotions — Flash Sales
// ============================================================

export const getRealFlashSales = () =>
  get("/api/v1/promotions/flash-sales").then(
    (res) => res.data?.flashSales || res.data || res
  );

export const createRealFlashSale = (data) =>
  post("/api/v1/promotions/flash-sales", data).then(
    (res) => res.data?.flashSale || res.data || res
  );

export const deleteRealFlashSale = (id) =>
  del(`/api/v1/promotions/flash-sales/${id}`).then(
    (res) => res.data || res
  );

// ============================================================
// CMS — Blog Posts
// ============================================================

export const getRealBlogPosts = () =>
  get("/api/v1/cms/blog/posts").then(
    (res) => res.data?.posts || res.data || res
  );

export const createRealBlogPost = (data) =>
  post("/api/v1/cms/blog/posts", data).then(
    (res) => res.data?.post || res.data || res
  );

export const updateRealBlogPost = (id, data) =>
  put(`/api/v1/cms/blog/posts/${id}`, data).then(
    (res) => res.data?.post || res.data || res
  );

export const deleteRealBlogPost = (id) =>
  del(`/api/v1/cms/blog/posts/${id}`).then(
    (res) => res.data || res
  );

// ============================================================
// CMS — Blog Categories
// ============================================================

export const getRealBlogCategories = () =>
  get("/api/v1/cms/blog/categories").then(
    (res) => res.data?.categories || res.data || res
  );

export const createRealBlogCategory = (data) =>
  post("/api/v1/cms/blog/categories", data).then(
    (res) => res.data?.category || res.data || res
  );

// ============================================================
// CMS — Pages
// ============================================================

export const getRealPages = () =>
  get("/api/v1/cms/pages").then(
    (res) => res.data?.pages || res.data || res
  );

export const createRealPage = (data) =>
  post("/api/v1/cms/pages", data).then(
    (res) => res.data?.page || res.data || res
  );

export const updateRealPage = (id, data) =>
  put(`/api/v1/cms/pages/${id}`, data).then(
    (res) => res.data?.page || res.data || res
  );

export const deleteRealPage = (id) =>
  del(`/api/v1/cms/pages/${id}`).then(
    (res) => res.data || res
  );

// ============================================================
// CMS — Navigation Menus
// ============================================================

export const getRealNavMenus = (name = "main") =>
  get(`/api/v1/cms/menus/${name}`).then(
    (res) => res.data?.menu || res.data || res
  );

export const createRealNavMenu = (data) =>
  post("/api/v1/cms/menus", data).then(
    (res) => res.data?.menu || res.data || res
  );

export const createRealMenuItem = (data) =>
  post("/api/v1/cms/menus/items", data).then(
    (res) => res.data?.menuItem || res.data || res
  );

export const updateRealMenuItem = (id, data) =>
  put(`/api/v1/cms/menus/items/${id}`, data).then(
    (res) => res.data?.menuItem || res.data || res
  );

export const deleteRealMenuItem = (id) =>
  del(`/api/v1/cms/menus/items/${id}`).then(
    (res) => res.data || res
  );

// ============================================================
// CMS — Popups
// ============================================================

export const getRealPopupConfig = () =>
  get("/api/v1/cms/popups").then(
    (res) => res.data || res
  );

export const updateRealPopupConfig = (data) =>
  put("/api/v1/cms/popups", data).then(
    (res) => res.data || res
  );

// ============================================================
// Settings
// ============================================================

export const getRealSettings = () =>
  get("/api/v1/settings").then(
    (res) => res.data || res
  );

export const updateRealSettings = (data) =>
  put("/api/v1/settings", data).then(
    (res) => res.data || res
  );

// ============================================================
// Reviews (admin moderation)
// ============================================================

export const getRealReviews = (productId) =>
  get(`/api/v1/reviews/product/${productId}`).then(
    (res) => res.data?.reviews || res.data || res
  );

export const moderateRealReview = (id, data) =>
  put(`/api/v1/reviews/${id}/moderate`, data).then(
    (res) => res.data?.review || res.data || res
  );
