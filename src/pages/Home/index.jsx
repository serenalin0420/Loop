import SwitchBtn from "../../components/SideBar/SwitchBtn";
import { useContext } from "react";
import { ViewContext } from "../../context/viewContext";

function Home() {
  const { isProviderView } = useContext(ViewContext);

  return (
    <div className="">
      <SwitchBtn />
      <div className="mt-4">
        {isProviderView ? (
          <div>
            <h3 className="text-center">學生的內容</h3>
          </div>
        ) : (
          <div>
            <h3 className="text-center">老師</h3>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
