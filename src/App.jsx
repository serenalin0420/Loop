import { Outlet, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Notification from "./components/Notification";
import { useState, useContext, useEffect, useRef } from "react";
import { UserContext } from "../src/context/userContext";

function App() {
  const user = useContext(UserContext);
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  useEffect(() => {
    setShowNotifications(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

  const handleNotificationClick = () => {
    setShowNotifications((prev) => !prev);
  };

  return (
    <>
      <Header onNotificationClick={handleNotificationClick} />
      {showNotifications && (
        <div ref={notificationRef}>
          <Notification userId={user.uid} />
        </div>
      )}
      <Outlet />
      <Footer />
    </>
  );
}

export default App;
