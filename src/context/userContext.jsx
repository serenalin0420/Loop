import { createContext, useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../utils/firebaseConfig";
import PropTypes from "prop-types";

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setUser({ uid: user.uid, ...userData });
        } else {
          console.error("無法獲取使用者資訊");
          setUser(null); // 設置為 null 以防萬一
        }
      } else {
        setUser(null); // 如果用戶登出或未登入，設置為 null
      }
    });

    return () => unsubscribe();
  }, [auth]);
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
