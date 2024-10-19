import {
  Bell,
  BookBookmark,
  ChatCircleDots,
  House,
} from "@phosphor-icons/react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import PropTypes from "prop-types";
import { useContext, useEffect, useReducer, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ProfilePictureContext, UserContext } from "../../context/userContext";
import dbApi from "../../utils/api";
import {
  uiActionTypes,
  uiInitialState,
  uiReducer,
} from "../../utils/uiReducer";
import logo from "./loop-logo.png";

function Header({ onNotificationClick, hasUnreadNotifications }) {
  const navigate = useNavigate();
  const auth = getAuth();
  const user = useContext(UserContext);
  const { profilePicture } = useContext(ProfilePictureContext);
  const [uiState, uiDispatch] = useReducer(uiReducer, uiInitialState);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [topChatId, setTopChatId] = useState();
  const location = useLocation();

  useEffect(() => {
    uiDispatch({
      type: uiActionTypes.SET_ICON_WEIGHT,
      icon: "bellWeight",
      payload: "regular",
    });
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
    const newWeight = uiState.bellWeight === "fill" ? "regular" : "fill";

    uiDispatch({
      type: uiActionTypes.SET_ICON_WEIGHT,
      icon: "bellWeight",
      payload: newWeight,
    });
    onNotificationClick();
  };

  return (
    <>
      <header className="fixed left-0 top-0 z-30 flex h-[60px] w-full transform items-center justify-center bg-white shadow-md transition-all duration-500 sm:justify-start">
        <Link to="/" className="relative mx-8 mt-1">
          <img src={logo} alt="Loop" className="w-24" />
        </Link>
        {isLoggedIn ? (
          <>
            <div className="hidden items-center sm:ml-auto sm:flex">
              {user && (
                <Link
                  to={`/learning-portfolio/${user.uid}`}
                  className="mr-1 flex flex-col items-center gap-[2px] p-2 text-[10px] text-indian-khaki-800"
                  title="學習歷程"
                >
                  <BookBookmark
                    className="size-7"
                    weight={uiState.bookmarkWeight}
                    onMouseEnter={() =>
                      uiDispatch({
                        type: uiActionTypes.SET_ICON_WEIGHT,
                        icon: "bookmarkWeight",
                        payload: "fill",
                      })
                    }
                    onMouseLeave={() =>
                      uiDispatch({
                        type: uiActionTypes.SET_ICON_WEIGHT,
                        icon: "bookmarkWeight",
                        payload: "regular",
                      })
                    }
                  />
                  學習歷程
                </Link>
              )}
              <Link
                to={topChatId ? `/chat/${topChatId}` : "/chat"}
                className="mr-1 flex flex-col items-center gap-[2px] p-2 text-[10px] text-indian-khaki-800"
                title="訊息"
              >
                <ChatCircleDots
                  className="size-7"
                  weight={uiState.chatWeight}
                  onMouseEnter={() =>
                    uiDispatch({
                      type: uiActionTypes.SET_ICON_WEIGHT,
                      icon: "chatWeight",
                      payload: "fill",
                    })
                  }
                  onMouseLeave={() =>
                    uiDispatch({
                      type: uiActionTypes.SET_ICON_WEIGHT,
                      icon: "chatWeight",
                      payload: "regular",
                    })
                  }
                />
                訊息
              </Link>
              <button
                className="relative mr-1 flex flex-col items-center gap-[2px] p-2 text-[10px] text-indian-khaki-800"
                onClick={handleNotificationClick}
                title="通知"
              >
                <Bell
                  className="size-7"
                  weight={uiState.bellWeight}
                  onMouseEnter={() =>
                    uiDispatch({
                      type: uiActionTypes.SET_ICON_WEIGHT,
                      icon: "bellWeight",
                      payload: "fill",
                    })
                  }
                  onMouseLeave={() =>
                    uiDispatch({
                      type: uiActionTypes.SET_ICON_WEIGHT,
                      icon: "bellWeight",
                      payload: "regular",
                    })
                  }
                />
                {hasUnreadNotifications && (
                  <span className="absolute right-2 top-[6px] h-3 w-3 rounded-full bg-red-400"></span>
                )}
                通知
              </button>
              <Link to="/profile" className="mx-2">
                <img
                  src={profilePicture}
                  className="mr-[72px] size-10 rounded-full bg-red-100 object-cover object-center"
                  alt="author"
                />
              </Link>
            </div>
            <button
              onClick={handleLogout}
              className="absolute right-2 top-3 rounded-full px-4 py-2 transition hover:bg-indian-khaki-300 hover:text-white active:bg-indian-khaki-300"
            >
              登出
            </button>
          </>
        ) : (
          <button
            onClick={handleLogin}
            className="absolute right-2 top-3 rounded-full px-4 py-2 transition hover:bg-indian-khaki-300 hover:text-white active:bg-indian-khaki-300"
          >
            登入
          </button>
        )}
      </header>

      {/* Header for mobile */}

      {isLoggedIn && (
        <div className="fixed bottom-0 left-0 z-20 flex h-[60px] w-full transform items-center justify-between bg-white px-4 shadow-[0_-1px_3px_rgba(0,0,0,0.1)] transition-all duration-500 xs:px-6 sm:hidden">
          <Link
            to="/"
            className="mr-1 flex flex-col items-center gap-[2px] p-2 text-[10px] text-indian-khaki-800"
          >
            <House
              className="size-7"
              weight={uiState.houseWeight}
              onMouseEnter={() =>
                uiDispatch({
                  type: uiActionTypes.SET_ICON_WEIGHT,
                  icon: "houseWeight",
                  payload: "fill",
                })
              }
              onMouseLeave={() =>
                uiDispatch({
                  type: uiActionTypes.SET_ICON_WEIGHT,
                  icon: "houseWeight",
                  payload: "regular",
                })
              }
            />
            首頁
          </Link>
          {user && (
            <Link
              to={`/learning-portfolio/${user.uid}`}
              className="mr-1 flex flex-col items-center gap-[2px] p-2 text-[10px] text-indian-khaki-800"
            >
              <BookBookmark
                className="size-7"
                weight={uiState.bookmarkWeight}
                onMouseEnter={() =>
                  uiDispatch({
                    type: uiActionTypes.SET_ICON_WEIGHT,
                    icon: "bookmarkWeight",
                    payload: "fill",
                  })
                }
                onMouseLeave={() =>
                  uiDispatch({
                    type: uiActionTypes.SET_ICON_WEIGHT,
                    icon: "bookmarkWeight",
                    payload: "regular",
                  })
                }
              />
              學習歷程表
            </Link>
          )}
          <Link
            to={topChatId ? `/chat/${topChatId}` : "/chat"}
            className="mr-1 flex flex-col items-center gap-[2px] p-2 text-[10px] text-indian-khaki-800"
          >
            <ChatCircleDots
              className="size-7"
              weight={uiState.chatWeight}
              onMouseEnter={() =>
                uiDispatch({
                  type: uiActionTypes.SET_ICON_WEIGHT,
                  icon: "chatWeight",
                  payload: "fill",
                })
              }
              onMouseLeave={() =>
                uiDispatch({
                  type: uiActionTypes.SET_ICON_WEIGHT,
                  icon: "chatWeight",
                  payload: "regular",
                })
              }
            />
            訊息
          </Link>
          <button
            className="relative mr-1 flex flex-col items-center gap-[2px] p-2 text-[10px] text-indian-khaki-800"
            onClick={handleNotificationClick}
          >
            <Bell
              className="size-7"
              weight={uiState.bellWeight}
              onMouseEnter={() =>
                uiDispatch({
                  type: uiActionTypes.SET_ICON_WEIGHT,
                  icon: "bellWeight",
                  payload: "fill",
                })
              }
              onMouseLeave={() =>
                uiDispatch({
                  type: uiActionTypes.SET_ICON_WEIGHT,
                  icon: "bellWeight",
                  payload: "regular",
                })
              }
            />
            {hasUnreadNotifications && (
              <span className="absolute right-2 top-[6px] h-3 w-3 rounded-full bg-red-400"></span>
            )}
            通知
          </button>
          <Link to="/profile" className="mx-2">
            <img
              src={profilePicture}
              className="size-10 rounded-full bg-red-100 object-cover object-center"
              alt="author"
            />
          </Link>
        </div>
      )}
    </>
  );
}

Header.propTypes = {
  onNotificationClick: PropTypes.func.isRequired,
  hasUnreadNotifications: PropTypes.bool.isRequired,
};

export default Header;
