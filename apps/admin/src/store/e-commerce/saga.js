import { call, put, takeEvery } from "redux-saga/effects";

// Ecommerce Redux States
import {
  GET_CART_DATA,
  GET_CUSTOMERS,
  GET_ORDERS,
  GET_PRODUCT_DETAIL,
  GET_PRODUCTS,
  ADD_NEW_PRODUCT,
  UPDATE_PRODUCT,
  DELETE_PRODUCT,
  GET_SHOPS,
  ADD_NEW_ORDER,
  DELETE_ORDER,
  UPDATE_ORDER,
  ADD_NEW_CUSTOMER,
  DELETE_CUSTOMER,
  UPDATE_CUSTOMER,
  GET_PRODUCT_COMMENTS,
  ON_LIKE_COMMENT,
  ON_LIKE_REPLY,
  ON_ADD_REPLY,
  ON_ADD_COMMENT,
} from "./actionTypes";
import {
  getCartDataFail,
  getCartDataSuccess,
  getCustomersFail,
  getCustomersSuccess,
  getOrdersFail,
  getOrdersSuccess,
  getProductDetailFail,
  getProductDetailSuccess,
  getProductsFail,
  getProductsSuccess,
  addProductSuccess,
  addProductFail,
  updateProductSuccess,
  updateProductFail,
  deleteProductSuccess,
  deleteProductFail,
  getShopsFail,
  getShopsSuccess,
  addOrderFail,
  addOrderSuccess,
  updateOrderSuccess,
  updateOrderFail,
  deleteOrderSuccess,
  deleteOrderFail,
  addCustomerFail,
  addCustomerSuccess,
  updateCustomerSuccess,
  updateCustomerFail,
  deleteCustomerSuccess,
  deleteCustomerFail,
  getProductCommentsSuccess,
  getProductCommentsFail,
  onLikeCommentSuccess,
  onLikeCommentFail,
  onLikeReplySuccess,
  onLikeReplyFail,
  onAddReplySuccess,
  onAddReplyFail,
  onAddCommentSuccess,
  onAddCommentFail,
} from "./actions";

//Include Both Helper File with needed methods
import {
  getCartData,
  getCustomers,
  getOrders,
  getProducts,
  addNewProduct as addNewProductApi,
  updateProduct as updateProductApi,
  deleteProduct as deleteProductApi,
  getShops,
  getProductDetail,
  addNewOrder,
  updateOrder,
  deleteOrder,
  addNewCustomer,
  updateCustomer,
  deleteCustomer,
  getProductComents as getProductComentsApi,
  onLikeComment as onLikeCommentApi,
  onLikeReply as onLikeReplyApi,
  onAddReply as onAddReplyApi,
  onAddComment as onAddCommentApi,
} from "../../helpers/fakebackend_helper";

// toast
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

function* fetchProducts() {
  try {
    const response = yield call(getProducts);
    yield put(getProductsSuccess(response));
  } catch (error) {
    yield put(getProductsFail(error));
  }
}

function* onAddNewProduct({ payload: product }) {
  try {
    const response = yield call(addNewProductApi, product);
    yield put(addProductSuccess(response));
    toast.success("Product Created Successfully", { autoClose: 2000 });
    yield put(getProducts());
  } catch (error) {
    yield put(addProductFail(error));
    toast.error(error?.response?.data?.message || error.message || "Product Creation Failed", { autoClose: 2000 });
  }
}

function* onUpdateProduct({ payload: product }) {
  try {
    const response = yield call(updateProductApi, product);
    yield put(updateProductSuccess(response));
    toast.success("Product Updated Successfully", { autoClose: 2000 });
    yield put(getProducts());
  } catch (error) {
    yield put(updateProductFail(error));
    toast.error(error?.response?.data?.message || error.message || "Product Update Failed", { autoClose: 2000 });
  }
}

function* onDeleteProduct({ payload: product }) {
  try {
    const productId = typeof product === "object" ? product.id : product;
    const response = yield call(deleteProductApi, productId);
    yield put(deleteProductSuccess(response));
    toast.success("Product Deleted Successfully", { autoClose: 2000 });
    yield put(getProducts());
  } catch (error) {
    yield put(deleteProductFail(error));
    toast.error(error?.response?.data?.message || error.message || "Product Deletion Failed", { autoClose: 2000 });
  }
}

function* fetchProductDetail({ productId }) {
  try {
    const response = yield call(getProductDetail, productId);
    yield put(getProductDetailSuccess(response));
  } catch (error) {
    yield put(getProductDetailFail(error));
  }
}

function* fetchOrders() {
  try {
    const response = yield call(getOrders);
    yield put(getOrdersSuccess(response));
  } catch (error) {
    yield put(getOrdersFail(error));
  }
}

function* fetchCartData() {
  try {
    const response = yield call(getCartData);
    yield put(getCartDataSuccess(response));
  } catch (error) {
    yield put(getCartDataFail(error));
  }
}

function* fetchCustomers() {
  try {
    const response = yield call(getCustomers);
    yield put(getCustomersSuccess(response));
  } catch (error) {
    yield put(getCustomersFail(error));
  }
}

function* onUpdateCustomer({ payload: customer }) {
  try {
    const response = yield call(updateCustomer, customer);
    yield put(updateCustomerSuccess(response));
    toast.success("Customer Update Successfully", { autoClose: 2000 });
  } catch (error) {
    yield put(updateCustomerFail(error));
    toast.error("Customer Update Failed", { autoClose: 2000 });
  }
}

function* onDeleteCustomer({ payload: customer }) {
  try {
    const response = yield call(deleteCustomer, customer);
    yield put(deleteCustomerSuccess(response));
    toast.success("Customer Delete Successfully", { autoClose: 2000 });
  } catch (error) {
    yield put(deleteCustomerFail(error));
    toast.error("Customer Delete Failed", { autoClose: 2000 });
  }
}

function* onAddNewCustomer({ payload: customer }) {
  try {
    const response = yield call(addNewCustomer, customer);
    yield put(addCustomerSuccess(response));
    toast.success("Customer Added Successfully", { autoClose: 2000 });
  } catch (error) {
    yield put(addCustomerFail(error));
    toast.error("Customer Added Failed", { autoClose: 2000 });
  }
}

function* fetchShops() {
  try {
    const response = yield call(getShops);
    yield put(getShopsSuccess(response));
  } catch (error) {
    yield put(getShopsFail(error));
  }
}

function* onUpdateOrder({ payload: order }) {
  try {
    const response = yield call(updateOrder, order);
    yield put(updateOrderSuccess(response));
    toast.success("Order Updated Successfully", { autoClose: 2000 });
  } catch (error) {
    yield put(updateOrderFail(error));
    toast.error("Order Update Failed", { autoClose: 2000 });
  }
}

function* onDeleteOrder({ payload: order }) {
  try {
    const orderId = typeof order === "object" ? order.id : order;
    const response = yield call(deleteOrder, orderId);
    yield put(deleteOrderSuccess(response));
    toast.success("Order Cancelled Successfully", { autoClose: 2000 });
  } catch (error) {
    yield put(deleteOrderFail(error));
    toast.error("Order Cancellation Failed", { autoClose: 2000 });
  }
}

function* onAddNewOrder({ payload: order }) {
  try {
    const response = yield call(addNewOrder, order);
    yield put(addOrderSuccess(response));
    toast.success("Order Added Successfully", { autoClose: 2000 });
  } catch (error) {
    yield put(addOrderFail(error));
    toast.error("Order Added Failed", { autoClose: 2000 });
  }
}

function* getProductComents() {
  try {
    // todo - add product Id to the payload and api
    const response = yield call(getProductComentsApi);
    yield put(getProductCommentsSuccess(response));
  } catch (error) {
    yield put(getProductCommentsFail(error));
  }
}

function* onLikeComment({ payload: { commentId, productId } }) {
  try {
    // todo - add product Id to the payload and api
    const response = yield call(onLikeCommentApi, commentId, productId);
    yield put(onLikeCommentSuccess(response));
  } catch (error) {
    yield put(onLikeCommentFail(error));
  }
}

function* onLikeReply({ payload: { commentId, productId, replyId } }) {
  try {
    // todo - add product Id to the payload and api
    const response = yield call(onLikeReplyApi, commentId, productId, replyId);
    yield put(onLikeReplySuccess(response));
  } catch (error) {
    yield put(onLikeReplyFail(error));
  }
}

function* onAddReply({ payload: { commentId, productId, replyText } }) {
  try {
    const response = yield call(onAddReplyApi, commentId, productId, replyText);
    yield put(onAddReplySuccess(response));
  } catch (error) {
    yield put(onAddReplyFail(error));
  }
}

function* onAddComment({ payload: { productId, commentText } }) {
  try {
    const response = yield call(onAddCommentApi, productId, commentText);
    yield put(onAddCommentSuccess(response));
  } catch (error) {
    yield put(onAddCommentFail(error));
  }
}

function* ecommerceSaga() {
  yield takeEvery(GET_PRODUCTS, fetchProducts);
  yield takeEvery(ADD_NEW_PRODUCT, onAddNewProduct);
  yield takeEvery(UPDATE_PRODUCT, onUpdateProduct);
  yield takeEvery(DELETE_PRODUCT, onDeleteProduct);
  yield takeEvery(GET_PRODUCT_DETAIL, fetchProductDetail);
  yield takeEvery(GET_ORDERS, fetchOrders);
  yield takeEvery(GET_CART_DATA, fetchCartData);
  yield takeEvery(GET_CUSTOMERS, fetchCustomers);
  yield takeEvery(ADD_NEW_CUSTOMER, onAddNewCustomer);
  yield takeEvery(UPDATE_CUSTOMER, onUpdateCustomer);
  yield takeEvery(DELETE_CUSTOMER, onDeleteCustomer);
  yield takeEvery(GET_SHOPS, fetchShops);
  yield takeEvery(ADD_NEW_ORDER, onAddNewOrder);
  yield takeEvery(UPDATE_ORDER, onUpdateOrder);
  yield takeEvery(DELETE_ORDER, onDeleteOrder);
  yield takeEvery(GET_PRODUCT_COMMENTS, getProductComents);
  yield takeEvery(ON_LIKE_COMMENT, onLikeComment);
  yield takeEvery(ON_LIKE_REPLY, onLikeReply);
  yield takeEvery(ON_ADD_REPLY, onAddReply);
  yield takeEvery(ON_ADD_COMMENT, onAddComment);
}

export default ecommerceSaga;
