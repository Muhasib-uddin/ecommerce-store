// =============================================================
// Real API Endpoint URLs — All paths relative to API_URL base
// =============================================================

// AUTH
export const POST_REAL_LOGIN = "/api/v1/auth/login";
export const POST_REAL_REGISTER = "/api/v1/auth/register";
export const POST_REAL_FORGOT_PASSWORD = "/api/v1/auth/forgot-password";
export const POST_REAL_RESET_PASSWORD = "/api/v1/auth/reset-password";
export const POST_REAL_LOGOUT = "/api/v1/auth/logout";
export const GET_REAL_PROFILE = "/api/v1/auth/me";
export const POST_REAL_PROFILE = "/api/v1/auth/profile";
export const POST_REAL_REFRESH = "/api/v1/auth/refresh";

// PRODUCTS
export const GET_PRODUCTS = "/api/v1/products";
export const GET_PRODUCTS_DETAIL = "/api/v1/products";
export const ADD_NEW_PRODUCT = "/api/v1/products";
export const UPDATE_PRODUCT = "/api/v1/products";
export const DELETE_PRODUCT = "/api/v1/products";

// CATEGORIES
export const GET_CATEGORIES = "/api/v1/categories";
export const ADD_NEW_CATEGORY = "/api/v1/categories";
export const UPDATE_CATEGORY = "/api/v1/categories";
export const DELETE_CATEGORY = "/api/v1/categories";

// ORDERS
export const GET_ORDERS = "/api/v1/orders";
export const ADD_NEW_ORDER = "/api/v1/orders";
export const UPDATE_ORDER = "/api/v1/orders"; // PUT /:id/status
export const DELETE_ORDER = "/api/v1/orders"; // DELETE /:id

// CART
export const GET_CART_DATA = "/api/v1/carts";

// CUSTOMERS (Admin)
export const GET_CUSTOMERS = "/api/v1/customers/admin/list";
export const ADD_NEW_CUSTOMER = "/api/v1/auth/register";
export const UPDATE_CUSTOMER = "/api/v1/customers"; // No admin endpoint yet
export const DELETE_CUSTOMER = "/api/v1/customers"; // No admin endpoint yet

// REVIEWS
export const GET_REVIEWS = "/api/v1/reviews";

// PROMOTIONS
export const GET_COUPONS = "/api/v1/promotions/coupons";
export const GET_DISCOUNTS = "/api/v1/promotions/discounts";
export const GET_FLASH_SALES = "/api/v1/promotions/flash-sales";

// CMS
export const GET_BLOG_POSTS = "/api/v1/cms/blog/posts";
export const GET_BLOG_CATEGORIES = "/api/v1/cms/blog/categories";
export const GET_PAGES = "/api/v1/cms/pages";
export const GET_NAV_MENUS = "/api/v1/cms/menus";
export const GET_POPUPS = "/api/v1/cms/popups";

// SETTINGS
export const GET_SETTINGS = "/api/v1/settings";

// DASHBOARD
export const GET_DASHBOARD_STATS = "/api/v1/dashboard/stats";

// UPLOADS
export const POST_UPLOAD = "/api/v1/uploads";

// WEBHOOKS
export const GET_WEBHOOKS = "/api/v1/webhooks";
export const GET_API_KEYS = "/api/v1/webhooks/api-keys";

// =============================================================
// Legacy URLs (kept for backward compatibility with template pages)
// These pages still use mock/fake data and are not yet wired to real API
// =============================================================

// Legacy Auth (fake backend — still used when DEFAULTAUTH !== "real")
export const POST_FAKE_REGISTER = "/post-fake-register";
export const POST_FAKE_LOGIN = "/post-fake-login";
export const POST_FAKE_JWT_LOGIN = "/post-jwt-login";
export const POST_FAKE_PASSWORD_FORGET = "/fake-forget-pwd";
export const POST_FAKE_JWT_PASSWORD_FORGET = "/jwt-forget-pwd";
export const SOCIAL_LOGIN = "/social-login";
export const POST_EDIT_JWT_PROFILE = "/post-jwt-profile";
export const POST_EDIT_PROFILE = "/post-fake-profile";

// Legacy template pages (no real API — uses MockAdapter / local data)
export const GET_EVENTS = "/events";
export const ADD_NEW_EVENT = "/add/event";
export const UPDATE_EVENT = "/update/event";
export const DELETE_EVENT = "/delete/event";
export const GET_CHATS = "/chats";
export const GET_GROUPS = "/groups";
export const GET_CONTACTS = "/contacts";
export const GET_MESSAGES = "/messages";
export const ADD_MESSAGE = "/add/messages";
export const DELETE_MESSAGE = "/delete/message";
export const GET_MAILS_LIST = "/mailslists";
export const SELECT_FOLDER = "/folders";
export const GET_SELECTED_MAILS = "/selectedmails";
export const SET_FOLDER_SELECTED_MAILS = "/setfolderonmail";
export const DELETE_MAIL = "/delete/mail";
export const TRASH_MAIL = "/trash/mail";
export const STARED_MAIL = "/stared/mail";
export const GET_MAILS_ID = "/mail:id";
export const GET_SHOPS = "/shops";
export const GET_WALLET = "/wallet";
export const GET_CRYPTO_ORDERS = "/crypto/orders";
export const GET_CRYPTO_PRODUCTS = "/crypto-products";
export const GET_INVOICES = "/invoices";
export const GET_INVOICE_DETAIL = "/invoice";
export const GET_JOB_LIST = "/jobs";
export const ADD_NEW_JOB_LIST = "/add/job";
export const UPDATE_JOB_LIST = "/update/job";
export const DELETE_JOB_LIST = "/delete/job";
export const GET_APPLY_JOB = "/jobApply";
export const DELETE_APPLY_JOB = "add/applyjob";
export const GET_PROJECTS = "/projects";
export const GET_PROJECT_DETAIL = "/project";
export const UPDATE_PROJECT = "/update/project";
export const DELETE_PROJECT = "/delete/project";
export const GET_TASKS = "/tasks";
export const DELETE_KANBAN = "/delete/tasks";
export const ADD_CARD_DATA = "/add/tasks";
export const UPDATE_CARD_DATA = "/update/tasks";
export const GET_USERS = "/users";
export const GET_USER_PROFILE = "/user";
export const ADD_NEW_USER = "/add/user";
export const UPDATE_USER = "/update/user";
export const DELETE_USER = "/delete/user";
export const GET_VISITOR_DATA = "/visitor-data";
export const TOP_SELLING_DATA = "/top-selling-data";
export const GET_DASHBOARD_EMAILCHART = "/dashboard/email-chart";
export const GET_WALLET_DATA = "/wallet-balance-data";
export const GET_STATISTICS_DATA = "/Statistics-data";
export const GET_EARNING_DATA = "/earning-charts-data";
export const GET_PRODUCT_COMMENTS = "/comments-product";
export const ON_LIKNE_COMMENT = "/comments-product-action";
export const ON_ADD_REPLY = "/comments-product-add-reply";
export const ON_ADD_COMMENT = "/comments-product-add-comment";
