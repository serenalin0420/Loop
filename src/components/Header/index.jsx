import { Link, useNavigate } from "react-router-dom";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState, useContext } from "react";
import logo from "./logo.svg";
import { CalendarDots, Bell } from "@phosphor-icons/react";
import { UserContext } from "../../context/userContext";
import PropTypes from "prop-types";
import { useLocation } from "react-router-dom";

function Header({ onNotificationClick, hasUnreadNotifications }) {
  const navigate = useNavigate();
  const auth = getAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const user = useContext(UserContext);
  const [calendarWeight, setCalendarWeight] = useState("regular");
  const [bellWeight, setBellWeight] = useState("regular");
  const location = useLocation();

  useEffect(() => {
    setBellWeight("regular");
  }, [location]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigate("/login");
      })
      .catch((error) => {
        console.error("登出錯誤:", error.message);
      });
  };

  const handleNotificationClick = () => {
    setBellWeight((prevWeight) => (prevWeight === "fill" ? "regular" : "fill"));
    onNotificationClick();
  };

  return (
    <div className="fixed left-0 top-0 z-20 flex h-[60px] w-full transform items-center bg-white shadow-md transition-all duration-500">
      <Link to="/" className="mx-8">
        <img src={logo} alt="Loop" className="h-auto" />
      </Link>
      <h1 className="text-xl">技能交換</h1>
      {isLoggedIn && (
        <>
          <Link to="/learning-portfolio" className="m-1 ml-auto flex p-2">
            <CalendarDots
              className="size-7"
              color="#6a5e4a"
              weight={calendarWeight}
              onMouseEnter={() => setCalendarWeight("fill")}
              onMouseLeave={() => setCalendarWeight("regular")}
            />
          </Link>
          <button
            className="relative m-1 flex p-2"
            onClick={handleNotificationClick}
          >
            <Bell className="size-7" color="#6a5e4a" weight={bellWeight} />
            {hasUnreadNotifications && (
              <span className="absolute right-2 top-[6px] h-3 w-3 rounded-full bg-red-500"></span>
            )}
          </button>
          <Link to="/profile" className="mx-2">
            <img
              src={user?.profile_picture}
              className="size-12 rounded-full bg-red-100 object-cover object-center"
              alt="author"
            />
          </Link>
          <button
            onClick={handleLogout}
            className="hover:bg-[rgb(191 170 135)] mr-4 mt-1 rounded-lg px-4 py-2 text-base transition hover:text-white"
          >
            登出
          </button>
        </>
      )}
    </div>
  );
}

Header.propTypes = {
  onNotificationClick: PropTypes.func.isRequired,
  hasUnreadNotifications: PropTypes.bool.isRequired,
};

export default Header;
