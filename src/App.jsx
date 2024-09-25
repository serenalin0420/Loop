import { Outlet } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Notification from "./components/Notification";
import { useState, useContext } from "react";
import { UserContext } from "../src/context/userContext";

function App() {
  const user = useContext(UserContext);
  const [showNotifications, setShowNotifications] = useState(false);
  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <>
      <Header onNotificationClick={handleNotificationClick} />
      {showNotifications && <Notification userId={user.uid} />}
      <Outlet />
      <Footer />
    </>
  );
}

export default App;
