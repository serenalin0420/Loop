import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../utils/firebaseConfig";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const auth = getAuth();
  //   const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user !== null) {
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  async function handleUserDocument(user) {
    const userDocRef = doc(db, "users", user.uid);
    if (isRegistering) {
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        name: "你的名字",
        coins: 10,
        profile_picture:
          "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj5OuPYNMNMB968AvAIEUDprCeMPpidHb3RfNY45kxV_dipXngeswnCCZhwaR4S9Wz8Uaa_QwA_Zy4tnw7nan1CVFfM6OS0SZ51D4Rj79RD__oIFMxjRDAYsdgschVM5zJgdjG9SkpKdEIm/s644/animal_hamster.png",
        bio: "",
        skills: [
          // {
          //   "category_id": "",
          //   "skills": ["日文N3", "資深前端工程師(React, Tailwind)"] // 自填
          // }
        ],
        saved_posts: [
          //   {
          //     post_id: "postefdwwxq33",
          //     created_time: "2024-09-10T10:00:00Z",
          //     title: "",
          //   },
        ],
        review_rating: 0, // 總評分
      });
    }
  }

  function onSubmit(e) {
    e.preventDefault();
    const redirectTo = location.state?.from || "/";
    // setError("");

    if (isRegistering) {
      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          handleUserDocument(user);
          navigate(redirectTo);
        })
        .catch((error) => {
          console.error("註冊錯誤:", error.message);
          //   handleAuthError(error.code);
        });
    } else {
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          handleUserDocument(user);
          navigate(redirectTo);
        })
        .catch((error) => {
          console.error("登入錯誤:", error.message);
          //   handleAuthError(error.code);
        });
    }
  }
  //   function handleAuthError(code) {
  //     switch (code) {
  //       case "auth/invalid-email":
  //         setError("無效的電子信箱地址。");
  //         break;
  //       case "auth/wrong-password":
  //         setError("密碼錯誤。");
  //         break;
  //       case "auth/email-already-in-use":
  //         setError("電子信箱已被註冊。");
  //         break;
  //       case "auth/weak-password":
  //         setError("密碼至少為6個字元。");
  //         break;
  //       default:
  //         setError("發生未知錯誤，請稍後再試。");
  //     }
  //   }

  return (
    <div className="z-0 mb-[76px] flex min-h-[80vh] justify-center md:mx-12 lg:mx-40">
      <div className="ml-0 mt-12 h-fit w-full rounded-md bg-slate-100 p-8 pb-14 md:ml-16 md:max-w-[440px] lg:ml-24 lg:w-[440px]">
        <h1 className="text-2xl">
          {isRegistering ? "後台註冊帳號" : "後台登入"}
        </h1>
        {/* {error && <p className="mt-2 text-sm text-red-600">{error}</p>} */}
        <form className="mt-8 flex-col" onSubmit={onSubmit}>
          <fieldset>
            <label className="items-center text-base font-medium">
              電子信箱
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mb-3 mt-1 flex h-10 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-base placeholder:text-stone-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-stone-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              type="email"
              required
            />
          </fieldset>
          <fieldset>
            <label className="items-center text-base font-medium">密碼</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="mb-3 mt-1 flex h-10 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-base placeholder:text-stone-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-stone-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            />
          </fieldset>
          <button className="mt-6 w-full rounded-md bg-[#006c98] px-5 py-2 tracking-widest text-white hover:bg-[#20556a] active:bg-[#20556a]">
            {isRegistering ? "註冊" : "登入"}
          </button>
          <div className="my-2 flex flex-row justify-center text-center text-gray-600 hover:text-gray-900">
            <p className="mr-4">
              {isRegistering ? "已有帳號嗎?" : "還沒有帳號嗎?"}
            </p>
            <p
              className="border-b-2 border-slate-300 px-2 font-semibold tracking-widest text-[#20556a]"
              onClick={() => setIsRegistering(!isRegistering)}
            >
              {isRegistering ? "登入" : "註冊"}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
