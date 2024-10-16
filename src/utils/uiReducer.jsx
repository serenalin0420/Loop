export const uiInitialState = {
  bookmarkWeight: "regular",
  bellWeight: "regular",
  chatWeight: "regular",
  houseWeight: "regular",
  isLoading: true,
  loginModal: {
    show: false,
    message: "",
  },
  autoCloseModal: {
    show: false,
    message: "",
  },
  showModal: false,
  showConfirmModal: false,
};

export const uiActionTypes = {
  SET_ICON_WEIGHT: "SET_ICON_WEIGHT",
  SET_ISLOADING: "SET_ISLOADING",
  SHOW_MODAL: "SHOW_MODAL",
  HIDE_MODAL: "HIDE_MODAL",
  SET_SHOW_MODAL: "SET_SHOW_MODAL",
  SET_CONFIRM_MODAL: "SET_CONFIRM_MODAL",
};

export function uiReducer(state, action) {
  switch (action.type) {
    case uiActionTypes.SET_ICON_WEIGHT:
      return {
        ...state,
        [action.icon]: action.payload,
      };
    case uiActionTypes.SET_ISLOADING:
      return { ...state, isLoading: action.payload };
    case uiActionTypes.SHOW_MODAL:
      return {
        ...state,
        [action.modalType]: {
          show: true,
          message: action.payload.message,
        },
      };
    case uiActionTypes.HIDE_MODAL:
      return {
        ...state,
        [action.modalType]: {
          show: false,
          message: "",
        },
      };
    case uiActionTypes.SET_SHOW_MODAL:
      return { ...state, showModal: action.payload };
    case uiActionTypes.SET_CONFIRM_MODAL:
      return { ...state, showConfirmModal: action.payload };
    default:
      return state;
  }
}
