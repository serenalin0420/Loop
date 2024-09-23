import { createContext, useEffect, useState } from "react";
import PropTypes from "prop-types";

export const ViewContext = createContext({
  findTeachersView: false,
  setFindTeachersView: () => {},
});

export const ViewProvider = ({ children }) => {
  const [findTeachersView, setFindTeachersView] = useState(false);

  useEffect(() => {
    // 這裡可以添加任何需要在 findTeachersView 變化時執行的邏輯
    console.log("findTeachersView changed:", findTeachersView);
  }, [findTeachersView]);

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
