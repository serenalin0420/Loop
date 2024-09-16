import { useEffect, useState } from "react";
import dbApi from "../../utils/api";

function Profile() {
  const [user, setUser] = useState({});

  useEffect(() => {
    const fetchUser = async () => {
      // "9t9UoB1yKuMDYq4gD3yN5bMRcxl2" userId
      const userData = await dbApi.getLearningPortfolio(
        "9t9UoB1yKuMDYq4gD3yN5bMRcxl2",
      );
      setUser(userData);
    };

    fetchUser();
  }, []);
  console.log(user);

  if (!user) return <div>加載中...</div>;

  return (
    <div className="mt-[60px]">
      <img src={user.profile_picture}></img>
    </div>
  );
}
export default Profile;
