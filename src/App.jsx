import { Outlet, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Notification from "./components/Notification";
import { useState, useContext, useEffect } from "react";
import { UserContext } from "../src/context/userContext";

function App() {
  const user = useContext(UserContext);
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    setShowNotifications(false);
  }, [location]);

  const handleNotificationClick = () => {
    setShowNotifications((prev) => !prev);
  };

  return (
    <>
      <Header onNotificationClick={handleNotificationClick} />
      {showNotifications && user && <Notification userId={user.uid} />}
      <Outlet />
      <Footer />
    </>
  );
}

export default App;
