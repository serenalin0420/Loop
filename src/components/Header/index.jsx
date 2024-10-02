import { Link, useNavigate } from "react-router-dom";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState, useContext } from "react";
import logo from "./logo.svg";
import { BookBookmark, Bell, ChatCircleDots } from "@phosphor-icons/react";
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

  const handleLogin = () => {
    navigate("/login");
  };

  const handleNotificationClick = () => {
    setBellWeight((prevWeight) => (prevWeight === "fill" ? "regular" : "fill"));
    onNotificationClick();
  };

  return (
    <div className="fixed left-0 top-0 z-20 flex h-[60px] w-full transform items-center bg-white shadow-md transition-all duration-500">
      <Link to="/" className="mx-8">
        <img src={logo} alt="Loop" className="w-24" />
      </Link>
      {isLoggedIn ? (
        <>
          <Link
            to="/learning-portfolio"
            className="ml-auto mr-1 flex flex-col items-center gap-[2px] p-2 text-[10px] text-textcolor-brown"
          >
            <BookBookmark
              className="size-7"
              color="#6a5e4a"
              weight={calendarWeight}
              onMouseEnter={() => setCalendarWeight("fill")}
              onMouseLeave={() => setCalendarWeight("regular")}
            />
            學習歷程表
          </Link>
          <Link
            to="/chat"
            className="mr-1 flex flex-col items-center gap-[2px] p-2 text-[10px] text-textcolor-brown"
          >
            <ChatCircleDots className="size-7" color="#6a5e4a" />
            訊息
          </Link>
          <button
            className="relative mr-1 flex flex-col items-center gap-[2px] p-2 text-[10px] text-textcolor-brown"
            onClick={handleNotificationClick}
          >
            <Bell className="size-7" color="#6a5e4a" weight={bellWeight} />
            {hasUnreadNotifications && (
              <span className="absolute right-2 top-[6px] h-3 w-3 rounded-full bg-red-400"></span>
            )}
            通知
          </button>
          <Link to="/profile" className="mx-2">
            <img
              src={user?.profile_picture}
              className="size-10 rounded-full bg-red-100 object-cover object-center"
              alt="author"
            />
          </Link>
          <button
            onClick={handleLogout}
            className="hover:bg-button mr-4 mt-1 rounded-lg px-4 py-2 transition hover:text-white"
          >
            登出
          </button>
        </>
      ) : (
        <button
          onClick={handleLogin}
          className="hover:bg-button ml-auto mr-4 mt-1 rounded-lg px-4 py-2 transition hover:text-white"
        >
          登入
        </button>
      )}
    </div>
  );
}

Header.propTypes = {
  onNotificationClick: PropTypes.func.isRequired,
  hasUnreadNotifications: PropTypes.bool.isRequired,
};

export default Header;
