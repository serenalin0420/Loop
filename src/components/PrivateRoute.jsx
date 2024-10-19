import { UserContext } from "@/context/userContext";
import PropTypes from "prop-types";
import { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Coin } from "../assets/images";

const PrivateRoute = ({ children }) => {
  const user = useContext(UserContext);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (user !== undefined) {
      setIsInitialized(true);
    }
  }, [user]);

  if (!isInitialized) {
    return (
      <div className="col-span-3 mt-6 flex h-screen items-center justify-center">
        <div className="flex flex-col items-center justify-center text-indian-khaki-800">
          <Coin className="my-2 size-16 animate-swing" />
          <p>請再稍等一下...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  return children;
};

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PrivateRoute;
