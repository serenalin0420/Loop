export const profileInitialState = {
  userName: "",
  bio: "",
  skills: [{}],
  bgImage: "",
  errorMessages: {
    userName: "",
    bio: "",
    profilePicture: "",
  },
  otherPicture: "",
};

export const profileActionTypes = {
  SET_PROFILE: "SET_PROFILE",
  SET_USERNAME: "SET_USERNAME",
  SET_BIO: "SET_BIO",
  SET_SKILLS: "SET_SKILLS",
  SET_BG_IMAGE: "SET_BG_IMAGE",
  SET_ERROR_MESSAGE: "SET_ERROR_MESSAGE",
};

export function profileReducer(state, action) {
  switch (action.type) {
    case profileActionTypes.SET_PROFILE:
      return {
        ...state,
        userName: action.payload.userName || "",
        bio: action.payload.bio || "",
        skills: action.payload.skills || [],
        bgImage: action.payload.bgImage || "",
      };

    case profileActionTypes.SET_USERNAME:
      return { ...state, userName: action.payload };
    case profileActionTypes.SET_BIO:
      return { ...state, bio: action.payload };
    case profileActionTypes.SET_SKILLS:
      return { ...state, skills: action.payload };
    case profileActionTypes.SET_BG_IMAGE:
      return { ...state, bgImage: action.payload };
    case profileActionTypes.SET_ERROR_MESSAGE:
      return {
        ...state,
        errorMessages: {
          ...state.errorMessages,
          [action.field]: action.message,
        },
      };
    default:
      return state;
  }
}
