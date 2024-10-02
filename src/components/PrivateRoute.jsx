import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "@/context/userContext";
import PropTypes from "prop-types";

const PrivateRoute = ({ children }) => {
  const user = useContext(UserContext);

  if (!user) {
    return <Navigate to="/" />;
  }

  return children;
};

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PrivateRoute;
