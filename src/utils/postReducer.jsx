export const initialState = {
  subcategories: null,
  skills: [],
  selectedCategory: null,
  selectedDate: new Date(),
  startOfWeek: new Date(),
  currentMonth: new Date(),
  selectedTimes: {},
  userProfile: undefined,
  post: null,
  author: null,
  postCategory: null,
  showModal: false,
  selectedCourse: null,
  selectedCoinCost: null,
  errorMessage: "",
  showLoginModal: false,
  showErrorModal: false,
  showConfirmModal: false,
  chosenTimes: [],
};

export const actionTypes = {
  SET_SUBCATEGORIES: "SET_SUBCATEGORIES",
  SET_SKILLS: "SET_SKILLS",
  SET_SELECTED_CATEGORY: "SET_SELECTED_CATEGORY",
  SET_SELECTED_DATE: "SET_SELECTED_DATE",
  SET_START_OF_WEEK: "SET_START_OF_WEEK",
  SET_CURRENT_MONTH: "SET_CURRENT_MONTH",
  SET_SELECTED_TIMES: "SET_SELECTED_TIMES",
  SET_USER_PROFILE: "SET_USER_PROFILE",
  SET_POST: "SET_POST",
  SET_AUTHOR: "SET_AUTHOR",
  SET_POST_CATEGORY: "SET_POST_CATEGORY",
  SET_SHOW_MODAL: "SET_SHOW_MODAL",
  SET_SELECTED_COURSE: "SET_SELECTED_COURSE",
  SET_SELECTED_COIN_COST: "SET_SELECTED_COIN_COST",
  SET_ERROR_MESSAGE: "SET_ERROR_MESSAGE",
  SET_SHOW_LOGIN_MODAL: "SET_SHOW_LOGIN_MODAL",
  SET_SHOW_ERROR_MODAL: "SET_SHOW_ERROR_MODAL",
  SET_SHOW_CONFIRM_MODAL: "SET_SHOW_CONFIRM_MODAL",
  SET_CHOSEN_TIMES: "SET_CHOSEN_TIMES",
};

export const reducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_SUBCATEGORIES:
      return { ...state, subcategories: action.payload };
    case actionTypes.SET_SKILLS:
      return { ...state, skills: action.payload };
    case actionTypes.SET_SELECTED_CATEGORY:
      return { ...state, selectedCategory: action.payload };
    case actionTypes.SET_SELECTED_DATE:
      return { ...state, selectedDate: action.payload };
    case actionTypes.SET_START_OF_WEEK:
      return { ...state, startOfWeek: action.payload };
    case actionTypes.SET_CURRENT_MONTH:
      return { ...state, currentMonth: action.payload };
    case actionTypes.SET_SELECTED_TIMES:
      return { ...state, selectedTimes: action.payload };
    case actionTypes.SET_USER_PROFILE:
      return { ...state, userProfile: action.payload };
    case actionTypes.SET_POST:
      return { ...state, post: action.payload };
    case actionTypes.SET_AUTHOR:
      return { ...state, author: action.payload };
    case actionTypes.SET_POST_CATEGORY:
      return { ...state, postCategory: action.payload };
    case actionTypes.SET_SHOW_MODAL:
      return { ...state, showModal: action.payload };
    case actionTypes.SET_SELECTED_COURSE:
      return { ...state, selectedCourse: action.payload };
    case actionTypes.SET_SELECTED_COIN_COST:
      return { ...state, selectedCoinCost: action.payload };
    case actionTypes.SET_ERROR_MESSAGE:
      return { ...state, errorMessage: action.payload };
    case actionTypes.SET_SHOW_LOGIN_MODAL:
      return { ...state, showLoginModal: action.payload };
    case actionTypes.SET_SHOW_ERROR_MODAL:
      return { ...state, showErrorModal: action.payload };
    case actionTypes.SET_SHOW_CONFIRM_MODAL:
      return { ...state, showConfirmModal: action.payload };
    case actionTypes.SET_CHOSEN_TIMES:
      return { ...state, chosenTimes: action.payload };
    default:
      return state;
  }
};
