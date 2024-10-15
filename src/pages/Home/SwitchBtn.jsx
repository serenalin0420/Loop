import tamtam1 from "../../assets/tamtam1.png";
import tamtam2 from "../../assets/tamtam2.png";
import { useContext } from "react";
import { ViewContext } from "../../context/viewContext";
import PropTypes from "prop-types";

function SwitchBtn({ onSwitch = () => {} }) {
  const { findTeachersView, setFindTeachersView } = useContext(ViewContext);

  const handleSwitch = (view) => {
    setFindTeachersView(view);
    onSwitch();
  };

  return (
    <div className="flex items-center rounded-lg sm:h-56 sm:flex-col sm:justify-between sm:p-4 sm:shadow-md md:h-64 xl:h-72 xl:px-8">
      <h2 className="hidden text-center font-bold text-textcolor sm:flex md:text-lg">
        {findTeachersView ? (
          <>
            想學什麼技能? <br />
            快來看看!
          </>
        ) : (
          <>
            空有技能 <br /> 卻無法施展嗎?
          </>
        )}
      </h2>

      <div className="sm:flex-co ml-2 flex items-center sm:order-last sm:ml-0">
        <p className="mr-2 sm:hidden">想找什麼類型的技能交換?</p>
        <div className="mr-4 flex w-[136px] justify-center rounded-full bg-indian-khaki-400 p-2 sm:mr-0 md:w-40">
          <button
            className={`text-nowrap rounded-full p-1 px-2 text-sm md:px-3 md:text-base ${
              findTeachersView
                ? "text-white"
                : "bg-indian-khaki-100 font-semibold text-indian-khaki-700"
            }`}
            onClick={() => handleSwitch(false)}
          >
            找學生
          </button>
          <button
            className={`text-nowrap rounded-full p-1 px-2 text-sm md:px-3 md:text-base ${
              findTeachersView
                ? "bg-indian-khaki-100 font-semibold text-indian-khaki-700"
                : "text-white"
            }`}
            onClick={() => handleSwitch(true)}
          >
            找老師
          </button>
        </div>
      </div>
      {findTeachersView ? (
        <img
          src={tamtam2}
          className="mb-2 mt-1 w-14 scale-x-[-1] sm:h-20 sm:w-auto sm:scale-100 md:h-28 xl:h-[140px]"
        />
      ) : (
        <img
          src={tamtam1}
          className="mb-2 mt-1 w-14 scale-x-[-1] sm:h-20 sm:w-auto sm:scale-100 md:h-28 xl:h-32"
        />
      )}
    </div>
  );
}

SwitchBtn.propTypes = {
  onSwitch: PropTypes.func,
};

export default SwitchBtn;
