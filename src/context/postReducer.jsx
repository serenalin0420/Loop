export const initialState = {
  subcategories: [],
  skills: [],
  selectedCategory: null,
  selectedDate: new Date(),
  startOfWeek: new Date(),
  currentMonth: new Date(),
  selectedTimes: {},
  userProfile: undefined,
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
    default:
      return state;
  }
};
