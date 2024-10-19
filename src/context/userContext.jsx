import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import PropTypes from "prop-types";
import { createContext, useEffect, useState } from "react";
import { db } from "../utils/firebaseConfig";

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
          setUser(null);
          setProfilePicture("");
        }
      } else {
        setUser(null);
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
