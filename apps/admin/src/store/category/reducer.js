import {
  GET_CATEGORIES_SUCCESS,
  GET_CATEGORIES_FAIL,
  ADD_CATEGORY_SUCCESS,
  ADD_CATEGORY_FAIL,
  UPDATE_CATEGORY_SUCCESS,
  UPDATE_CATEGORY_FAIL,
  DELETE_CATEGORY_SUCCESS,
  DELETE_CATEGORY_FAIL,
} from "./actionTypes";

const INIT_STATE = {
  categories: [],
  error: {},
  loading: true,
};

const category = (state = INIT_STATE, action) => {
  switch (action.type) {
    case GET_CATEGORIES_SUCCESS:
      return {
        ...state,
        categories: action.payload,
        loading: false,
      };

    case GET_CATEGORIES_FAIL:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case ADD_CATEGORY_SUCCESS:
      return {
        ...state,
        categories: [action.payload, ...state.categories],
      };

    case ADD_CATEGORY_FAIL:
      return {
        ...state,
        error: action.payload,
      };

    case UPDATE_CATEGORY_SUCCESS:
      return {
        ...state,
        categories: state.categories.map((item) =>
          item.id.toString() === action.payload.id.toString()
            ? { ...item, ...action.payload }
            : item
        ),
      };

    case UPDATE_CATEGORY_FAIL:
      return {
        ...state,
        error: action.payload,
      };

    case DELETE_CATEGORY_SUCCESS:
      return {
        ...state,
        categories: state.categories.filter(
          (item) => item.id.toString() !== action.payload.toString()
        ),
      };

    case DELETE_CATEGORY_FAIL:
      return {
        ...state,
        error: action.payload,
      };

    default:
      return state;
  }
};

export default category;
