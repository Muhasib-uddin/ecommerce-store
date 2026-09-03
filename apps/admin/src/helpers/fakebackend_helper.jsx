import axios from "axios";
import { del, get, post, put } from "./api_helper";
import * as url from "./url_helper";

// ============================================================
// Auth helpers
// ============================================================

// Gets the logged in user data from local session
const getLoggedInUser = () => {
  const user = localStorage.getItem("authUser");
  if (user) return JSON.parse(user);
  return null;
};

const isUserAuthenticated = () => {
  return getLoggedInUser() !== null;
};

// Legacy fake auth (kept for DEFAULTAUTH === "fake" mode)
const postFakeRegister = data => {
  return axios
    .post(url.POST_FAKE_REGISTER, data)
    .then(response => {
      if (response.status >= 200 || response.status <= 299) return response.data;
      throw response.data;
    })
    .catch(err => {
      let message;
      if (err.response && err.response.status) {
        switch (err.response.status) {
          case 404:
            message = "Sorry! the page you are looking for could not be found";
            break;
          case 500:
            message = "Sorry! something went wrong, please contact our support team";
            break;
          case 401:
            message = "Invalid credentials";
            break;
          default:
            message = err[1];
            break;
        }
      }
      throw message;
    });
};

const postFakeLogin = data => post(url.POST_FAKE_LOGIN, data);
const postFakeForgetPwd = data => post(url.POST_FAKE_PASSWORD_FORGET, data);
const postJwtProfile = data => post(url.POST_EDIT_JWT_PROFILE, data);
const postFakeProfile = data => post(url.POST_EDIT_PROFILE, data);

const postJwtRegister = (url, data) => {
  return axios
    .post(url, data)
    .then(response => {
      if (response.status >= 200 || response.status <= 299) return response.data;
      throw response.data;
    })
    .catch(err => {
      var message;
      if (err.response && err.response.status) {
        switch (err.response.status) {
          case 404:
            message = "Sorry! the page you are looking for could not be found";
            break;
          case 500:
            message = "Sorry! something went wrong, please contact our support team";
            break;
          case 401:
            message = "Invalid credentials";
            break;
          default:
            message = err[1];
            break;
        }
      }
      throw message;
    });
};

const postJwtLogin = data => post(url.POST_FAKE_JWT_LOGIN, data);
const postJwtForgetPwd = data => post(url.POST_FAKE_JWT_PASSWORD_FORGET, data);
export const postSocialLogin = data => post(url.SOCIAL_LOGIN, data);

// ============================================================
// E-Commerce: Products (Real API)
// ============================================================

/** GET /api/v1/products — returns { success, data: { products, pagination } } */
export const getProducts = (params = {}) =>
  get(url.GET_PRODUCTS, { params: { limit: 100, published: "all", ...params } }).then(response => {
    const products = response.data?.products || response.products || response;
    return Array.isArray(products)
      ? products.map(p => ({
          ...p,
          image: p.images?.[0]?.url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80",
          newPrice: parseFloat(p.price || 0),
          oldPrice: p.compareAtPrice ? parseFloat(p.compareAtPrice) : parseFloat(p.price || 0),
          rating: p.averageRating ? Math.round(p.averageRating) : 5,
          offer: p.compareAtPrice && parseFloat(p.compareAtPrice) > parseFloat(p.price)
            ? Math.round(((parseFloat(p.compareAtPrice) - parseFloat(p.price)) / parseFloat(p.compareAtPrice)) * 100)
            : 0,
          isOffer: p.compareAtPrice && parseFloat(p.compareAtPrice) > parseFloat(p.price),
          category: p.category?.name || (typeof p.category === 'string' ? p.category : "Unassigned"),
        }))
      : products;
  });

/** GET /api/v1/products/:id — returns { success, data: { product } } */
export const getProductDetail = id =>
  get(`${url.GET_PRODUCTS_DETAIL}/${id}`).then(response => {
    const product = response.data?.product || response.product || response;
    if (product && typeof product === "object") {
      return {
        ...product,
        image: product.images?.[0]?.url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80",
        newPrice: parseFloat(product.price || 0),
        oldPrice: product.compareAtPrice ? parseFloat(product.compareAtPrice) : parseFloat(product.price || 0),
        rating: product.averageRating ? Math.round(product.averageRating) : 5,
        subImage: (product.images || []).map(img => img.url),
      };
    }
    return product;
  });

/** POST /api/v1/products — create new product */
export const addNewProduct = product =>
  post(url.ADD_NEW_PRODUCT, product).then(
    response => response.data?.product || response.product || response
  );

/** PUT /api/v1/products/:id — update existing product */
export const updateProduct = product => {
  const { id, ...data } = product;
  return put(`${url.UPDATE_PRODUCT}/${id}`, data).then(
    response => response.data?.product || response.product || response
  );
};

/** DELETE /api/v1/products/:id — delete product */
export const deleteProduct = productId => {
  const id = typeof productId === "object" ? productId.id : productId;
  return del(`${url.DELETE_PRODUCT}/${id}`).then(() => id);
};

// ============================================================
// E-Commerce: Categories (Real API)
// ============================================================

/** GET /api/v1/categories — returns { success, data: { categories } } */
export const getCategories = (params = { all: "true" }) =>
  get(url.GET_CATEGORIES, { params }).then(
    response => response.data?.categories || response.categories || response
  );

/** POST /api/v1/categories — create new category */
export const addNewCategory = category =>
  post(url.ADD_NEW_CATEGORY, category).then(
    response => response.data?.category || response.category || response
  );

/** PUT /api/v1/categories/:id — update existing category */
export const updateCategory = category => {
  const { id, ...data } = category;
  return put(`${url.UPDATE_CATEGORY}/${id}`, data).then(
    response => response.data?.category || response.category || response
  );
};

/** DELETE /api/v1/categories/:id — delete category */
export const deleteCategory = categoryId => {
  const id = typeof categoryId === "object" ? categoryId.id : categoryId;
  return del(`${url.DELETE_CATEGORY}/${id}`).then(() => id);
};

// ============================================================
// E-Commerce: Orders (Real API)
// ============================================================

/** GET /api/v1/orders — returns { success, data: { orders, pagination } } */
export const getOrders = (params = {}) =>
  get(url.GET_ORDERS, { params: { limit: 100, ...params } }).then(response => {
    const orders = response.data?.orders || response.orders || response;
    // Normalize to match what the admin UI expects
    return Array.isArray(orders)
      ? orders.map(order => {
          const customerFullName = order.user
            ? `${order.user.firstName || ""} ${order.user.lastName || ""}`.trim() || order.user.email
            : order.shippingName || order.billingName || "Guest Customer";
          const customerPhone = order.shippingPhone || order.user?.phone || "N/A";
          const customerEmail = order.user?.email || "N/A";

          return {
            ...order,
            orderId: order.orderNumber || order.id,
            customerName: customerFullName,
            customerPhone: customerPhone,
            customerEmail: customerEmail,
            billingName: order.billingName || order.shippingName || customerFullName,
            shippingName: order.shippingName || customerFullName,
            orderDate: order.createdAt,
            total: parseFloat(order.total || 0),
            status: order.status || "PENDING",
            badgeClass:
              order.paymentStatus === "PAID"
                ? "success"
                : order.paymentStatus === "FAILED"
                ? "danger"
                : "warning",
          };
        })
      : orders;
  });

/** POST /api/v1/orders — create new order */
export const addNewOrder = order =>
  post(url.ADD_NEW_ORDER, order).then(
    response => response.data?.order || response.order || response
  );

/** PUT /api/v1/orders/:id/status — update order status */
export const updateOrder = order => {
  const { id, status, note, trackingNumber, shippingCarrier } = order;
  return put(`${url.UPDATE_ORDER}/${id}/status`, {
    status,
    note: note || `Status updated to ${status}`,
    trackingNumber,
    shippingCarrier,
  }).then(response => {
    const updated = response.data?.order || response.order || response;
    const customerFullName = updated.user
      ? `${updated.user.firstName || ""} ${updated.user.lastName || ""}`.trim() || updated.user.email
      : updated.shippingName || updated.billingName || "Guest Customer";
    return {
      ...updated,
      orderId: updated.orderNumber || updated.id,
      customerName: customerFullName,
      customerPhone: updated.shippingPhone || updated.user?.phone || "N/A",
      customerEmail: updated.user?.email || "N/A",
      billingName: updated.billingName || updated.shippingName || customerFullName,
      shippingName: updated.shippingName || customerFullName,
      orderDate: updated.createdAt,
      total: parseFloat(updated.total || 0),
      status: updated.status || "PENDING",
      badgeClass:
        updated.paymentStatus === "PAID"
          ? "success"
          : updated.paymentStatus === "FAILED"
          ? "danger"
          : "warning",
    };
  });
};

/** DELETE — not supported by API; we cancel instead via status update */
export const deleteOrder = orderId => {
  const id = typeof orderId === "object" ? orderId.id : orderId;
  return put(`${url.DELETE_ORDER}/${id}/status`, {
    status: "CANCELLED",
    note: "Order cancelled by admin",
  }).then(() => id);
};

// ============================================================
// E-Commerce: Cart (Real API)
// ============================================================

/** GET /api/v1/carts — returns { success, data: { cart } } */
export const getCartData = () =>
  get(url.GET_CART_DATA).then(
    response => response.data?.cart || response.cart || response
  );

// ============================================================
// E-Commerce: Customers (Real API)
// ============================================================

/** GET /api/v1/customers/admin/list — returns { success, data: { customers, pagination } } */
export const getCustomers = () =>
  get(url.GET_CUSTOMERS, { params: { limit: 100 } }).then(response => {
    const customers = response.data?.customers || response.customers || response;
    return Array.isArray(customers)
      ? customers.map(c => ({
          ...c,
          username: `${c.firstName || ""} ${c.lastName || ""}`.trim() || c.email,
          joiningDate: c.createdAt,
        }))
      : customers;
  });

/** POST /api/v1/auth/register — create new customer */
export const addNewCustomer = customer =>
  post(url.ADD_NEW_CUSTOMER, {
    email: customer.email,
    password: customer.password || "TempPass123!",
    firstName: customer.firstName || customer.username,
    lastName: customer.lastName || "",
  }).then(response => response.data?.user || response.user || response);

/** Update customer — admin endpoint not available; return as-is */
export const updateCustomer = customer => Promise.resolve(customer);

/** Delete customer — admin endpoint not available; return id */
export const deleteCustomer = customerId => {
  console.warn("Customer delete not supported by API yet");
  const id = typeof customerId === "object" ? customerId.id : customerId;
  return Promise.resolve(id);
};

// ============================================================
// Legacy template page helpers (still use mock/fakeBackend paths)
// ============================================================

export const getShops = () => get(url.GET_SHOPS);
export const getWallet = () => get(url.GET_WALLET);
export const getCryptoOrder = () => get(url.GET_CRYPTO_ORDERS);
export const getCryptoProduct = () => get(url.GET_CRYPTO_PRODUCTS);
export const getInvoices = () => get(url.GET_INVOICES);
export const getInvoiceDetail = id => get(`${url.GET_INVOICE_DETAIL}/${id}`, { params: { id } });
export const getJobList = () => get(url.GET_JOB_LIST);
export const getApplyJob = () => get(url.GET_APPLY_JOB);
export const getProjects = () => get(url.GET_PROJECTS);
export const getProjectsDetails = id => get(`${url.GET_PROJECT_DETAIL}/${id}`, { params: { id } });
export const getTasks = () => get(url.GET_TASKS);
export const addCardData = cardData => post(url.ADD_CARD_DATA, cardData);
export const updateCardData = card => put(url.UPDATE_CARD_DATA, card);
export const deleteKanban = kanban => del(url.DELETE_KANBAN, { headers: { kanban } });
export const getUsers = () => get(url.GET_USERS);
export const addNewUser = user => post(url.ADD_NEW_USER, user);
export const updateUser = user => put(url.UPDATE_USER, user);
export const deleteUser = user => del(url.DELETE_USER, { headers: { user } });
export const addNewJobList = job => post(url.ADD_NEW_JOB_LIST, job);
export const updateJobList = job => put(url.UPDATE_JOB_LIST, job);
export const deleteJobList = job => del(url.DELETE_JOB_LIST, { headers: { job } });
export const deleteApplyJob = data => del(url.DELETE_APPLY_JOB, { headers: { data } });
export const updateProject = project => put(url.UPDATE_PROJECT, project);
export const deleteProject = project => del(url.DELETE_PROJECT, { headers: { project } });
export const getUserProfile = () => get(url.GET_USER_PROFILE);
export const getMailsLists = filter => post(url.GET_MAILS_LIST, { params: filter });
export const deleteMail = mail => del(url.DELETE_MAIL, { headers: { mail } });
export const trashMail = mail => del(url.TRASH_MAIL, { headers: { mail } });
export const staredMail = mail => del(url.STARED_MAIL, { headers: { mail } });
export const getMailsListsId = id => get(`${url.GET_MAILS_ID}/${id}`, { params: { id } });
export const selectFolders = () => get(url.SELECT_FOLDER);
export const getselectedmails = selectedmails => post(url.GET_SELECTED_MAILS, selectedmails);
export const setfolderonmails = (selectedmails, folderId, activeTab) => post(url.SET_FOLDER_SELECTED_MAILS, { selectedmails, folderId, activeTab });
export const addMessage = message => post(url.ADD_MESSAGE, message);
export const deleteMessage = data => del(url.DELETE_MESSAGE, { headers: { data } });
export const getEvents = () => get(url.GET_EVENTS);
export const addNewEvent = event => post(url.ADD_NEW_EVENT, event);
export const updateEvent = event => put(url.UPDATE_EVENT, event);
export const deleteEvent = event => del(url.DELETE_EVENT, { headers: { event } });
export const walletBalanceData = roomId => get(`${url.GET_WALLET_DATA}/${roomId}`, { params: { roomId } });
export const getStatisticData = roomId => get(`${url.GET_STATISTICS_DATA}/${roomId}`, { params: { roomId } });
export const visitorData = roomId => get(`${url.GET_VISITOR_DATA}/${roomId}`, { params: { roomId } });
export const topSellingData = month => get(`${url.TOP_SELLING_DATA}/${month}`, { params: { month } });
export const getEarningChartsData = month => get(`${url.GET_EARNING_DATA}/${month}`, { params: { month } });
export const getDashboardEmailChart = chartType => get(`${url.GET_DASHBOARD_EMAILCHART}/${chartType}`, { param: chartType });

// Legacy chat helpers
export const getChats = () => get(url.GET_CHATS);
export const getGroups = () => get(url.GET_GROUPS);
export const getContacts = () => get(url.GET_CONTACTS);
export const getMessages = roomId => get(`${url.GET_MESSAGES}/${roomId}`, { params: { roomId } });

// Product comments (legacy mock — no real API endpoint yet)
const getProductComents = () => get(url.GET_PRODUCT_COMMENTS);
const onLikeComment = (commentId, productId) => {
  return post(`${url.ON_LIKNE_COMMENT}/${productId}/${commentId}`, {
    params: { commentId, productId },
  });
};
const onLikeReply = (commentId, productId, replyId) => {
  return post(`${url.ON_LIKNE_COMMENT}/${productId}/${commentId}/${replyId}`, {
    params: { commentId, productId, replyId },
  });
};
const onAddReply = (commentId, productId, replyText) => {
  return post(`${url.ON_ADD_REPLY}/${productId}/${commentId}`, {
    params: { commentId, productId, replyText },
  });
};
const onAddComment = (productId, commentText) => {
  return post(`${url.ON_ADD_COMMENT}/${productId}`, {
    params: { productId, commentText },
  });
};

export {
  getLoggedInUser,
  isUserAuthenticated,
  postFakeRegister,
  postFakeLogin,
  postFakeProfile,
  postFakeForgetPwd,
  postJwtRegister,
  postJwtLogin,
  postJwtForgetPwd,
  postJwtProfile,
  getProductComents,
  onLikeComment,
  onLikeReply,
  onAddReply,
  onAddComment,
};
