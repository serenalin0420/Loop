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
