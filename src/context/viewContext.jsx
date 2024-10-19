import PropTypes from "prop-types";
import { createContext, useState } from "react";

export const ViewContext = createContext({
  findTeachersView: false,
  setFindTeachersView: () => {},
});

export const ViewProvider = ({ children }) => {
  const [findTeachersView, setFindTeachersView] = useState(false);

  return (
    <ViewContext.Provider
      value={{
        findTeachersView: findTeachersView,
        setFindTeachersView: setFindTeachersView,
      }}
    >
      {children}
    </ViewContext.Provider>
  );
};

ViewProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
