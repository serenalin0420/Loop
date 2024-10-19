import { useContext, useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { UserContext } from "../src/context/userContext";
import Header from "./components/Header";
import Notification from "./components/Notification";
import dbApi from "./utils/api";

function App() {
  const user = useContext(UserContext);
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const intervalRef = useRef(null);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const isLoginPage = location.pathname === "/login";

  useEffect(() => {
    setShowNotifications(false);
  }, [location]);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = dbApi.listenToNotifications(
      user.uid,
      (newNotifications) => {
        setNotifications((prevNotifications) => {
          const prevNotificationIds = new Set(
            prevNotifications.map((n) => n.id),
          );
          const filteredNewNotifications = newNotifications.filter(
            (n) => !prevNotificationIds.has(n.id),
          );

          const allNotifications = [
            ...filteredNewNotifications,
            ...prevNotifications,
          ];

          const hasUnread = allNotifications.some((n) => !n.read);
          setHasUnreadNotifications(hasUnread);

          return allNotifications;
        });
      },
    );

    const checkNotifications = async () => {
      const now = new Date();
      if (now.getMinutes() >= 50 && now.getMinutes() <= 55) {
        const courseEndtimeNotifications =
          await dbApi.checkCourseEndtimeNotifications(user.uid);
        setNotifications((prevNotifications) => {
          const allNotifications = [
            ...courseEndtimeNotifications,
            ...prevNotifications,
          ];

          const hasUnread = allNotifications.some((n) => !n.read);
          setHasUnreadNotifications(hasUnread);

          return allNotifications;
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
  }, [user]);

  const handleNotificationClick = () => {
    setShowNotifications((prev) => !prev);

    if (!showNotifications) {
      setNotifications((prevNotifications) => {
        const updatedNotifications = prevNotifications.map((notification) => ({
          ...notification,
          read: true,
        }));

        setHasUnreadNotifications(false);

        return updatedNotifications;
      });
    }
  };

  useEffect(() => {
    if (!showNotifications) {
      const unreadNotifications = notifications.filter((n) => !n.read);
      if (unreadNotifications.length > 0) {
        dbApi.markNotificationsAsRead(user.uid, unreadNotifications);
      }
    }
  }, [showNotifications, notifications, user]);

  return (
    <>
      {!isLoginPage && (
        <Header
          onNotificationClick={handleNotificationClick}
          hasUnreadNotifications={hasUnreadNotifications}
        />
      )}
      {showNotifications && user && (
        <Notification userId={user.uid} notifications={notifications} />
      )}
      <Outlet />
    </>
  );
}

export default App;
