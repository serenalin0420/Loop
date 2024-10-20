import { UserContext } from "@/context/userContext";
import PropTypes from "prop-types";
import { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";

const PrivateRoute = ({ children }) => {
  const user = useContext(UserContext);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (user !== undefined) {
      setIsInitialized(true);
    }
  }, [user]);

  if (!isInitialized) return <LoadingSpinner />;

  if (!user) {
    return <Navigate to="/" />;
  }

  return children;
};

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PrivateRoute;
