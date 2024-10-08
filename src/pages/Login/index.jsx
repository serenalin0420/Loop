import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import dbApi from "@/utils/api";
import logo from "../../components/Header/logo.svg";
import { Link } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const auth = getAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user !== null) {
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  function onSubmit(e) {
    e.preventDefault();
    setError("");
    const redirectTo = location.state?.from || "/";

    if (isRegistering) {
      if (password !== confirmPassword) {
        setError("密碼不一致。");
        return;
      }

      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          dbApi.updateUserDocument(user, isRegistering, username);
          navigate(redirectTo);
        })
        .catch((error) => {
          console.error("註冊錯誤:", error.message);
          handleAuthError(error.code);
        });
    } else {
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          dbApi.updateUserDocument(user, isRegistering, username);
          navigate(redirectTo);
        })
        .catch((error) => {
          console.error("登入錯誤:", error.message);
          handleAuthError(error.code);
        });
    }
  }

  function handleAuthError(code) {
    switch (code) {
      case "auth/invalid-email":
        setError("無效的電子信箱地址。");
        break;
      case "auth/wrong-password":
        setError("密碼錯誤。");
        break;
      case "auth/email-already-in-use":
        setError("電子信箱已被註冊。");
        break;
      case "auth/weak-password":
        setError("密碼至少為6個字元。");
        break;
      default:
        setError("發生未知錯誤，請稍後再試。");
    }
  }

  return (
    <div className="bg-[#fcf8f3] sm:p-4">
      <div className="flex min-h-screen flex-col bg-white bg-mobile-login-bg bg-cover bg-center bg-no-repeat px-4 sm:rounded-xl sm:bg-login-bg md:flex-row md:justify-between md:px-8 lg:px-10 xl:px-16">
        <div className="order-3 flex justify-center gap-20 md:order-1 md:ml-4 md:mr-28 md:mt-36 md:flex-col md:justify-start md:gap-8 lg:mr-44">
          <button
            className={`text-nowrap px-3 py-2 text-lg font-semibold md:px-4 md:text-xl md:tracking-wide ${
              isRegistering
                ? "text-indian-khaki-400"
                : "rounded border-b-4 border-cerulean-400 text-cerulean-900"
            } hidden md:block`}
            onClick={() => setIsRegistering(false)}
          >
            登入
          </button>
          <button
            className={`text-nowrap px-2 py-2 text-lg font-semibold md:px-4 md:text-xl md:tracking-wide ${
              isRegistering
                ? "rounded border-b-4 border-cerulean-400 text-cerulean-900"
                : "text-indian-khaki-400"
            } hidden md:block`}
            onClick={() => setIsRegistering(true)}
          >
            註冊
          </button>
          <button
            className="flex cursor-pointer text-nowrap px-3 py-2 md:hidden"
            onClick={() => setIsRegistering(!isRegistering)}
          >
            <p className="mr-4">
              {isRegistering ? "已有帳號嗎? " : "還沒有帳號嗎?"}
            </p>
            {isRegistering ? "登入" : "註冊 "}
          </button>
        </div>
        <div className="mt-32 flex h-fit flex-col flex-wrap items-center py-4 sm:mt-24 md:order-2 md:w-2/5 md:py-6">
          <Link to="/" className="mx-8 cursor-pointer">
            <img src={logo} alt="Loop" className="w-44 md:w-56" />{" "}
          </Link>
          <h3 className="mt-2 text-center text-cerulean-950">
            以<strong>代幣</strong>為中心將技能平等化，
            <br />
            透過教學獲得<strong className="text-neon-carrot-400">代幣</strong>
            ，用
            <strong className="text-cerulean-500">代幣</strong>換取學習！
          </h3>

          <form className="mt-4 flex-col md:mt-8" onSubmit={onSubmit}>
            {isRegistering && (
              <fieldset>
                <input
                  value={username}
                  placeholder="請輸入你的名字或暱稱~"
                  onChange={(e) => setUsername(e.target.value)}
                  className="mb-3 mt-1 flex min-w-72 rounded-md border border-stone-200 bg-white px-3 py-2 focus:outline-indian-khaki-400"
                  type="text"
                  required
                />
              </fieldset>
            )}
            <fieldset>
              <input
                value={email}
                placeholder="請輸入電子信箱"
                onChange={(e) => setEmail(e.target.value)}
                className="mb-3 mt-1 flex min-w-72 rounded-md border border-stone-200 bg-white px-3 py-2 caret-indian-khaki-700 focus:outline-indian-khaki-400"
                type="email"
                required
              />
            </fieldset>
            <fieldset>
              <input
                value={password}
                placeholder="請輸入密碼"
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                className="mb-3 mt-1 flex min-w-72 rounded-md border border-stone-200 bg-white px-3 py-2 caret-indian-khaki-700 focus:outline-indian-khaki-400"
                required
              />
            </fieldset>
            {isRegistering && (
              <fieldset>
                <input
                  value={confirmPassword}
                  placeholder="請再輸入一次密碼"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  type="password"
                  className="mb-3 mt-1 flex min-w-72 rounded-md border border-stone-200 bg-white px-3 py-2 caret-indian-khaki-700 focus:outline-indian-khaki-400"
                  required
                />
              </fieldset>
            )}
            {error && (
              <p className="text-center text-xs text-red-400">{error}</p>
            )}
            <button className="mt-2 w-full rounded-md bg-indian-khaki-400 px-5 py-2 tracking-widest text-white hover:bg-[#8a7b60] active:bg-[#8a7b60] md:mt-6">
              {isRegistering ? "註冊" : "登入"}
            </button>
          </form>
        </div>
        <h3 className="hidden md:order-2 md:mb-12 md:mr-4 md:mt-auto md:block md:text-center md:font-semibold md:text-indian-khaki-400">
          <span className="block lg:inline">讓你的技能有效地</span>
          <span className="block lg:inline">進入學習的循環</span>
        </h3>
      </div>
    </div>
  );
}
