import { useContext } from "react";
// import dbApi from "../../utils/api";
import { UserContext } from "../../context/userContext";
import EditableSection from "./EditableSection";
import ApplicationFromOthers from "./ApplicationFromOthers";

function Profile() {
  const user = useContext(UserContext);

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
            className="size-28 rounded-full border-2 border-white bg-red-100 object-cover object-center p-2 shadow-md"
            alt="author"
          />
          <p className="text-center font-semibold">{user.name}</p>
        </div>
      </div>
      <div className="mx-28 mt-16">
        <EditableSection />
        <ApplicationFromOthers userId={user.uid} />
      </div>
    </div>
  );
}
export default Profile;
