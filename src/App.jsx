import { Outlet, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Notification from "./components/Notification";
import { useState, useContext, useEffect, useRef } from "react";
import { UserContext } from "../src/context/userContext";
import dbApi from "./utils/api";

function App() {
  const user = useContext(UserContext);
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const intervalRef = useRef(null);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

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
      // console.log(now.getMinutes());
      if (now.getMinutes() >= 50 && now.getMinutes() <= 55) {
        const courseEndtimeNotifications =
          await dbApi.checkCourseEndtimeNotifications(user.uid);
        setNotifications((prevNotifications) => [
          ...courseEndtimeNotifications,
          ...prevNotifications,
        ]);
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
  };

  return (
    <>
      <Header
        onNotificationClick={handleNotificationClick}
        hasUnreadNotifications={hasUnreadNotifications}
      />
      {showNotifications && user && (
        <Notification userId={user.uid} notifications={notifications} />
      )}
      <Outlet />
      <Footer />
    </>
  );
}

export default App;
