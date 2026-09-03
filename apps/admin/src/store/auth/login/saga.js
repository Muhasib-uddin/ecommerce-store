import { call, put, takeEvery, takeLatest } from "redux-saga/effects";

// Login Redux States
import { LOGIN_USER, LOGOUT_USER, SOCIAL_LOGIN } from "./actionTypes";
import { apiError, loginSuccess, logoutUserSuccess } from "./actions";

// Include Both Helper File with needed methods
import { getFirebaseBackend } from "../../../helpers/firebase_helper";
import {
  postFakeLogin,
  postJwtLogin,
  postSocialLogin,
} from "../../../helpers/fakebackend_helper";

// Real API backend helpers
import {
  realLogin,
  realSocialLogin,
  realLogout,
} from "../../../helpers/real_backend_helper";

const fireBaseBackend = getFirebaseBackend();

const ADMIN_ALLOWED_ROLES = ["SUPER_ADMIN", "STORE_MANAGER", "MARKETING", "SUPPORT"];

function* loginUser({ payload: { user, history } }) {
  try {
    if (import.meta.env.VITE_APP_DEFAULTAUTH === "real") {
      const response = yield call(realLogin, {
        email: user.email,
        password: user.password,
      });

      // API returns { success: true, data: { user: { id, email, firstName, lastName, role }, accessToken, requires2FA, tempToken } }
      if (response.data?.requires2FA) {
        yield put(
          apiError("Two-factor authentication is active on this account. Please verify with your 2FA token.")
        );
        return;
      }

      const rawUser = response.data?.user || response.data || response;
      const accessToken = response.data?.accessToken || response.accessToken;
      const userData = accessToken ? { ...rawUser, accessToken } : rawUser;

      // Role Pre-check: Reject customer accounts upfront with clear security message
      if (userData.role === "CUSTOMER" || !ADMIN_ALLOWED_ROLES.includes(userData.role)) {
        yield call(realLogout);
        localStorage.removeItem("authUser");
        yield put(
          apiError("Access Denied: Customer accounts cannot access the Admin Portal. Please use an administrative account.")
        );
        return;
      }

      localStorage.setItem("authUser", JSON.stringify(userData));
      yield put(loginSuccess(userData));
      history("/dashboard");
    } else if (import.meta.env.VITE_APP_DEFAULTAUTH === "firebase") {
      const response = yield call(
        fireBaseBackend.loginUser,
        user.email,
        user.password
      );
      yield put(loginSuccess(response));
      history("/dashboard");
    } else if (import.meta.env.VITE_APP_DEFAULTAUTH === "jwt") {
      const response = yield call(postJwtLogin, {
        email: user.email,
        password: user.password,
      });
      localStorage.setItem("authUser", JSON.stringify(response));
      yield put(loginSuccess(response));
      history("/dashboard");
    } else if (import.meta.env.VITE_APP_DEFAULTAUTH === "fake") {
      const response = yield call(postFakeLogin, {
        email: user.email,
        password: user.password,
      });
      localStorage.setItem("authUser", JSON.stringify(response));
      yield put(loginSuccess(response));
      history("/dashboard");
    }
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Unable to connect to the server. Please ensure the backend is running.";
    yield put(apiError(message));
  }
}

function* logoutUser({ payload: { history } }) {
  try {
    localStorage.removeItem("authUser");

    if (import.meta.env.VITE_APP_DEFAULTAUTH === "real") {
      yield call(realLogout);
      yield put(logoutUserSuccess(true));
    } else if (import.meta.env.VITE_APP_DEFAULTAUTH === "firebase") {
      const response = yield call(fireBaseBackend.logout);
      yield put(logoutUserSuccess(response));
    }
    history('/login');
  } catch (error) {
    yield put(apiError(error));
  }
}

function* socialLogin({ payload: { type, history } }) {
  try {
    if (import.meta.env.VITE_APP_DEFAULTAUTH === "real") {
      const demoEmail = `admin.${type.toLowerCase()}@store.com`;
      const response = yield call(realSocialLogin, {
        provider: type,
        email: demoEmail,
        firstName: type.toUpperCase(),
        lastName: "Admin",
      });

      const rawUser = response.data?.user || response.data || response;
      const accessToken = response.data?.accessToken || response.accessToken;
      const userData = accessToken ? { ...rawUser, accessToken } : rawUser;

      // If registered as customer through social login, inform user
      if (userData.role === "CUSTOMER" && !ADMIN_ALLOWED_ROLES.includes(userData.role)) {
        yield call(realLogout);
        localStorage.removeItem("authUser");
        yield put(
          apiError("Access Denied: Social account created as customer. Administrative permission required.")
        );
        return;
      }

      localStorage.setItem("authUser", JSON.stringify(userData));
      yield put(loginSuccess(userData));
      history("/dashboard");
    } else if (import.meta.env.VITE_APP_DEFAULTAUTH === "firebase") {
      const fireBaseBackend = getFirebaseBackend();
      const response = yield call(fireBaseBackend.socialLoginUser, type);
      if (response) {
        localStorage.setItem("authUser", JSON.stringify(response));
        yield put(loginSuccess(response));
        history("/dashboard");
      } else {
        history("/login");
      }
    }
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Social login failed. Please try standard login.";
    yield put(apiError(message));
  }
}

function* authSaga() {
  yield takeEvery(LOGIN_USER, loginUser);
  yield takeLatest(SOCIAL_LOGIN, socialLogin);
  yield takeEvery(LOGOUT_USER, logoutUser);
}

export default authSaga;
