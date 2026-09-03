import { call, put, takeEvery } from "redux-saga/effects";
import {
  GET_CATEGORIES,
  ADD_NEW_CATEGORY,
  UPDATE_CATEGORY,
  DELETE_CATEGORY,
} from "./actionTypes";
import {
  getCategoriesSuccess,
  getCategoriesFail,
  addCategorySuccess,
  addCategoryFail,
  updateCategorySuccess,
  updateCategoryFail,
  deleteCategorySuccess,
  deleteCategoryFail,
  getCategories as getCategoriesAction,
} from "./actions";
import {
  getCategories as getCategoriesApi,
  addNewCategory as addNewCategoryApi,
  updateCategory as updateCategoryApi,
  deleteCategory as deleteCategoryApi,
} from "../../helpers/fakebackend_helper";
import { toast } from "react-toastify";

function* fetchCategories({ payload }) {
  try {
    const response = yield call(getCategoriesApi, payload);
    yield put(getCategoriesSuccess(response));
  } catch (error) {
    yield put(getCategoriesFail(error));
  }
}

function* onAddNewCategory({ payload: category }) {
  try {
    const response = yield call(addNewCategoryApi, category);
    yield put(addCategorySuccess(response));
    toast.success("Category Created Successfully", { autoClose: 2000 });
    yield put(getCategoriesAction({ all: "true" }));
  } catch (error) {
    yield put(addCategoryFail(error));
    toast.error(error?.response?.data?.message || error.message || "Category Creation Failed", { autoClose: 2000 });
  }
}

function* onUpdateCategory({ payload: category }) {
  try {
    const response = yield call(updateCategoryApi, category);
    yield put(updateCategorySuccess(response));
    toast.success("Category Updated Successfully", { autoClose: 2000 });
    yield put(getCategoriesAction({ all: "true" }));
  } catch (error) {
    yield put(updateCategoryFail(error));
    toast.error(error?.response?.data?.message || error.message || "Category Update Failed", { autoClose: 2000 });
  }
}

function* onDeleteCategory({ payload: category }) {
  try {
    const categoryId = typeof category === "object" ? category.id : category;
    const response = yield call(deleteCategoryApi, categoryId);
    yield put(deleteCategorySuccess(response));
    toast.success("Category Deleted Successfully", { autoClose: 2000 });
    yield put(getCategoriesAction({ all: "true" }));
  } catch (error) {
    yield put(deleteCategoryFail(error));
    toast.error(error?.response?.data?.message || error.message || "Category Deletion Failed", { autoClose: 2000 });
  }
}

function* categorySaga() {
  yield takeEvery(GET_CATEGORIES, fetchCategories);
  yield takeEvery(ADD_NEW_CATEGORY, onAddNewCategory);
  yield takeEvery(UPDATE_CATEGORY, onUpdateCategory);
  yield takeEvery(DELETE_CATEGORY, onDeleteCategory);
}

export default categorySaga;
