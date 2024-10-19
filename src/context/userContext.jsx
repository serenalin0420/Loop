import { createContext, useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../utils/firebaseConfig";
import PropTypes from "prop-types";

export const UserContext = createContext();
export const ProfilePictureContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState();
  const [profilePicture, setProfilePicture] = useState("");
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setUser({ uid: user.uid, ...userData });
          setProfilePicture(userData.profile_picture || "");
        } else {
          console.error("無法獲取使用者資訊");
          setUser(null); // 設置為 null 以防萬一
          setProfilePicture("");
        }
      } else {
        setUser(null); // 如果用戶登出或未登入，設置為 null
        setProfilePicture("");
      }
    });
    return () => unsubscribe();
  }, [auth]);
  return (
    <UserContext.Provider value={user}>
      <ProfilePictureContext.Provider
        value={{ profilePicture, setProfilePicture }}
      >
        {children}
      </ProfilePictureContext.Provider>
    </UserContext.Provider>
  );
}

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
