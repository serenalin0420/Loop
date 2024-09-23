import tamtam from "./tamtam.svg";
import { useContext } from "react";
import { ViewContext } from "../../context/viewContext";
import PropTypes from "prop-types";

function SwitchBtn({ onSwitch = () => {} }) {
  const { isProviderView, setIsProviderView } = useContext(ViewContext);

  const handleSwitch = (view) => {
    setIsProviderView(view);
    onSwitch();
  };

  return (
    <div className="flex flex-col items-center rounded-lg px-8 py-5 shadow-md">
      <h2 className="text-center text-lg font-bold">
        {isProviderView ? (
          <>
            空有技能 <br /> 卻無法施展嗎?
          </>
        ) : (
          <>
            想學什麼技能? <br />
            快來看看!
          </>
        )}
      </h2>
      <img src={tamtam} className="w-36" />
      <div className="flex w-40 justify-center rounded-full bg-[#BFAA87] p-2">
        <button
          className={`rounded-full p-1 px-3 text-white ${
            isProviderView ? "text-white" : "bg-[#F2EBDF] text-yellow-900"
          }`}
          onClick={() => handleSwitch(false)}
        >
          找老師
        </button>
        <button
          className={`rounded-full p-1 px-3 text-white ${
            isProviderView ? "bg-[#F2EBDF] text-yellow-900" : ""
          }`}
          onClick={() => handleSwitch(true)}
        >
          找學生
        </button>
      </div>
    </div>
  );
}

SwitchBtn.propTypes = {
  onSwitch: PropTypes.func,
};

export default SwitchBtn;
