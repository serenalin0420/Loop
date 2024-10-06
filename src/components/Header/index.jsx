import { Link, useNavigate } from "react-router-dom";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState, useContext } from "react";
import logo from "./logo.svg";
import { BookBookmark, Bell, ChatCircleDots } from "@phosphor-icons/react";
import { UserContext } from "../../context/userContext";
import PropTypes from "prop-types";
import { useLocation } from "react-router-dom";
import dbApi from "../../utils/api";

function Header({ onNotificationClick, hasUnreadNotifications }) {
  const navigate = useNavigate();
  const auth = getAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const user = useContext(UserContext);
  const [calendarWeight, setCalendarWeight] = useState("regular");
  const [bellWeight, setBellWeight] = useState("regular");
  const [topChatId, setTopChatId] = useState();
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

  useEffect(() => {
    const fetchChatList = async () => {
      try {
        const chatListData = await dbApi.getChatList(user.uid);
        const sortedChatList = chatListData.sort((a, b) => {
          const dateA = new Date(
            a.last_message_time.seconds * 1000 +
              a.last_message_time.nanoseconds / 1000000,
          );
          const dateB = new Date(
            b.last_message_time.seconds * 1000 +
              b.last_message_time.nanoseconds / 1000000,
          );
          return dateB - dateA;
        });
        if (sortedChatList.length > 0) {
          setTopChatId(sortedChatList[0].id);
        }
      } catch (error) {
        console.error("Error fetching chat list:", error);
      }
    };

    if (user) {
      fetchChatList();
    }
  }, [user]);

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
          {user && (
            <Link
              to={`/learning-portfolio/${user.uid}`}
              className="text-indian-khaki-800 ml-auto mr-1 flex flex-col items-center gap-[2px] p-2 text-[10px]"
            >
              <BookBookmark
                className="size-7"
                weight={calendarWeight}
                onMouseEnter={() => setCalendarWeight("fill")}
                onMouseLeave={() => setCalendarWeight("regular")}
              />
              學習歷程表
            </Link>
          )}
          <Link
            to={topChatId ? `/chat/${topChatId}` : "/chat"}
            className="text-indian-khaki-800 mr-1 flex flex-col items-center gap-[2px] p-2 text-[10px]"
          >
            <ChatCircleDots className="size-7" />
            訊息
          </Link>
          <button
            className="text-indian-khaki-800 relative mr-1 flex flex-col items-center gap-[2px] p-2 text-[10px]"
            onClick={handleNotificationClick}
          >
            <Bell className="size-7" weight={bellWeight} />
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
            className="hover:bg-indian-khaki-300 active:bg-indian-khaki-300 mr-4 mt-1 rounded-full px-4 py-2 transition hover:text-white"
          >
            登出
          </button>
        </>
      ) : (
        <button
          onClick={handleLogin}
          className="hover:bg-indian-khaki-300 active:bg-indian-khaki-300 ml-auto mr-4 mt-1 rounded-full px-4 py-2 transition hover:text-white"
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
