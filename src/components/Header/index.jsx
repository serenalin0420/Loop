import { Link, useNavigate } from "react-router-dom";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import logo from "./logo.svg";

function Header() {
  const navigate = useNavigate();
  const auth = getAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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

  return (
    <div className="fixed left-0 top-0 z-20 flex h-[60px] w-full transform items-center bg-white shadow-md transition-all duration-500">
      <Link to="/" className="mx-8">
        <img src={logo} alt="Loop" className="h-auto" />
      </Link>
      <h1 className="text-xl">技能交換</h1>
      {isLoggedIn && (
        <>
          <Link
            className="ml-auto mt-1 flex"
            to="/"
            target="_blank"
            rel="noopener noreferrer"
          >
            前台
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="ml-1 size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
              />
            </svg>
          </Link>

          <button
            onClick={handleLogout}
            className="ml-4 mr-4 mt-1 rounded-lg px-4 py-2 text-base text-[#006c98] transition hover:bg-[#006c98] hover:text-white"
          >
            登出
          </button>
        </>
      )}
    </div>
  );
}

export default Header;
