import { Outlet, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Notification from "./components/Notification";
import { useContext, useEffect, useRef, useReducer } from "react";
import { UserContext } from "../src/context/userContext";
import dbApi from "./utils/api";

const initialState = {
  showNotifications: false,
  notifications: [],
  hasUnreadNotifications: false,
};

function notificationReducer(state, action) {
  switch (action.type) {
    case "TOGGLE_NOTIFICATIONS":
      return {
        ...state,
        showNotifications: !state.showNotifications,
      };
    case "SET_NOTIFICATIONS":
      return {
        ...state,
        notifications: action.payload,
        hasUnreadNotifications: action.payload.some((n) => !n.read),
      };
    case "MARK_AS_READ": {
      const updatedNotifications = state.notifications.map((notification) => ({
        ...notification,
        read: true,
      }));
      return {
        ...state,
        notifications: updatedNotifications,
        hasUnreadNotifications: false,
      };
    }
    default:
      return state;
  }
}

function App() {
  const user = useContext(UserContext);
  const location = useLocation();
  const intervalRef = useRef(null);

  const [state, dispatch] = useReducer(notificationReducer, initialState);

  useEffect(() => {
    dispatch({ type: "TOGGLE_NOTIFICATIONS", payload: false });
  }, [location]);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = dbApi.listenToNotifications(
      user.uid,
      (newNotifications) => {
        dispatch({ type: "SET_NOTIFICATIONS", payload: newNotifications });
      },
    );

    const checkNotifications = async () => {
      const now = new Date();
      if (now.getMinutes() >= 50 && now.getMinutes() <= 55) {
        const courseEndtimeNotifications =
          await dbApi.checkCourseEndtimeNotifications(user.uid);
        dispatch({
          type: "SET_NOTIFICATIONS",
          payload: [...courseEndtimeNotifications, ...state.notifications],
        });
      }
    };

    intervalRef.current = setInterval(checkNotifications, 60000);

    return () => {
      unsubscribe();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [user, state.notifications]);

  const handleNotificationClick = () => {
    dispatch({ type: "TOGGLE_NOTIFICATIONS" });

    if (!state.showNotifications) {
      dispatch({ type: "MARK_AS_READ" });
    }
  };

  useEffect(() => {
    if (state.showNotifications) {
      const unreadNotifications = state.notifications.filter((n) => !n.read);
      if (unreadNotifications.length > 0) {
        dbApi.markNotificationsAsRead(user.uid, unreadNotifications);
      }
    }
  }, [state.showNotifications, state.notifications, user]);

  return (
    <>
      <Header
        onNotificationClick={handleNotificationClick}
        hasUnreadNotifications={state.hasUnreadNotifications}
      />
      {state.showNotifications && user && (
        <Notification userId={user.uid} notifications={state.notifications} />
      )}
      <Outlet />
      <Footer />
    </>
  );
}

export default App;
