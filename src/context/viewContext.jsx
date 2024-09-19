import { createContext, useEffect, useState } from "react";
import PropTypes from "prop-types";

export const ViewContext = createContext({
  isProviderView: false,
  setIsProviderView: () => {},
});

export const ViewProvider = ({ children }) => {
  const [isProviderView, setIsProviderView] = useState(false);

  useEffect(() => {
    // 這裡可以添加任何需要在 isProviderView 變化時執行的邏輯
    console.log("isProviderView changed:", isProviderView);
  }, [isProviderView]);

  return (
    <ViewContext.Provider value={{ isProviderView, setIsProviderView }}>
      {children}
    </ViewContext.Provider>
  );
};

ViewProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
