import { useEffect, useState, useContext } from "react";
import dbApi from "../../utils/api";
import { UserContext } from "../../context/userContext";
import EditableSection from "./EditableSection";

function Profile() {
  const user = useContext(UserContext);
  // const [userProfile, setUserProfile] = useState({});
  console.log(user);

  if (!user) return <div>加載中...</div>;

  return (
    <div className="mt-16">
      <div className="relative flex justify-center">
        <img
          className="h-44 w-full object-cover object-center"
          src="https://images.pexels.com/photos/1227511/pexels-photo-1227511.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
        ></img>
        <div className="absolute -bottom-16">
          <img
            src={user.profile_picture}
            className="m-2 size-24 rounded-full object-cover object-center shadow-md"
            alt="author"
          />
          <p className="text-center font-semibold">{user.name}</p>
        </div>
      </div>
      <EditableSection />
    </div>
  );
}
export default Profile;
