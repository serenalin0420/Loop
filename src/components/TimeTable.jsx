import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import PropTypes from "prop-types";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import Select from "react-select";
import tamtam1 from "../assets/tamtam1.png";
import tamtam2 from "../assets/tamtam2.png";
import customStyles from "../pages/CreatePost/selectorStyles";
import { postActionTypes } from "../utils/postReducer";

const TimeTable = ({
  post,
  state,
  dispatch,
  handleMonthChange,
  handleWeekChange,
  formatDate,
  renderTimeSlots,
  handleTimeRangeSelect,
  message,
  CreatePostRenderCalendar,
}) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const view = queryParams.get("view");

  const [startTime, setStartTime] = useState(7);
  const [endTime, setEndTime] = useState(22);
  const timeOptions = Array.from({ length: 16 }, (_, index) => ({
    value: index + 7,
    label: `${index + 7}:00`,
  }));

  const handleApplyTimeRange = () => {
    const updatedSelectedTimes = { ...state.selectedTimes };
    daysOfWeek.forEach((day) => {
      const dateString = formatDate(day, "yyyy-MM-dd");
      updatedSelectedTimes[dateString] = {};
    });

    handleTimeRangeSelect(startTime, endTime, updatedSelectedTimes);
  };

  const getMonthRange = (currentMonth) => {
    const startOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1,
    );
    const endOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0,
    );
    return { startOfMonth, endOfMonth };
  };

  const renderCalendar = () => {
    const { startOfMonth, endOfMonth } = getMonthRange(state.currentMonth);
    const startDay = startOfMonth.getDay();
    const daysInMonth = endOfMonth.getDate();

    const availableDates = Object.keys(post.datetime).map(
      (dateStr) => new Date(dateStr),
    );
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const calendarDays = [];
    for (let i = 0; i < startDay; i++) {
      calendarDays.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        state.currentMonth.getFullYear(),
        state.currentMonth.getMonth(),
        day,
      );
      const isAvailable = availableDates.some(
        (availableDate) => availableDate.toDateString() === date.toDateString(),
      );
      const isDisabled = date < today || !isAvailable;

      calendarDays.push(
        <div
          key={day}
          className={`cursor-pointer px-2 py-2 text-center text-textcolor ${
            date.toDateString() === state.selectedDate.toDateString()
              ? "rounded-full border-2 border-indian-khaki-600 font-semibold text-indian-khaki-700"
              : ""
          } ${isDisabled ? "cursor-not-allowed opacity-30" : ""}`}
          onClick={() => {
            if (!isDisabled) {
              dispatch({
                type: postActionTypes.SET_SELECTED_DATE,
                payload: date,
              });
              dispatch({
                type: postActionTypes.SET_START_OF_WEEK,
                payload: new Date(date.setDate(date.getDate())),
              });
            }
          }}
        >
          {day}
        </div>,
      );
    }

    return calendarDays;
  };

  const daysOfWeek = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(state.startOfWeek);
    date.setDate(date.getDate() + i);
    return date;
  });

  return (
    <>
      <div className="mb-2 sm:mx-8 sm:max-w-96 md:mx-0 md:mb-4 lg:mr-10 xl:mr-14">
        <div className="mx-3 flex items-center justify-between pb-2 sm:mx-6 md:mx-2 md:pb-4">
          <button onClick={(e) => handleMonthChange(e, -1)}>
            <CaretLeft className="size-6" />
          </button>
          <div>{formatDate(state.currentMonth, "MMM yyyy")}</div>
          <button onClick={(e) => handleMonthChange(e, 1)}>
            <CaretRight className="size-6" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-sm">
          {["日", "一", "二", "三", "四", "五", "六"].map((day, index) => (
            <div key={index} className="text-center font-bold">
              {day}
            </div>
          ))}
          {CreatePostRenderCalendar
            ? CreatePostRenderCalendar()
            : renderCalendar()}
        </div>
        <p className="mx-2 mt-2 text-sm text-zinc-400">{message}</p>
        {view && (
          <div className="mt-3 flex items-center sm:gap-2">
            <div className="flex flex-row items-center">
              <div className="flex items-center md:mb-0">
                <label className="mx-2 hidden sm:inline">從</label>
                <Select
                  value={timeOptions.find(
                    (option) => option.value === startTime,
                  )}
                  onChange={(selectedOption) =>
                    setStartTime(selectedOption.value)
                  }
                  options={timeOptions}
                  className="mr-2 sm:min-w-28 md:min-w-20"
                  styles={customStyles(view)}
                />
              </div>
              <div className="flex items-center">
                <label className="ml-2 mr-2 md:ml-0">到</label>
                <Select
                  value={timeOptions.find((option) => option.value === endTime)}
                  onChange={(selectedOption) =>
                    setEndTime(selectedOption.value)
                  }
                  options={timeOptions}
                  className="mr-2 sm:min-w-28 md:min-w-20"
                  styles={customStyles(view)}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleApplyTimeRange}
              className={`${view === "student" ? "bg-cerulean-300" : "bg-neon-carrot-300"} text-nowrap rounded-full px-4 py-2 text-white`}
            >
              套用
            </button>
          </div>
        )}

        {view === "student" ? (
          <img
            src={tamtam2}
            className="ml-auto mr-6 mt-2 w-12 rotate-3 scale-x-[-1] md:ml-0 md:mt-12 md:w-52 md:-rotate-3 md:scale-x-100"
          ></img>
        ) : (
          <img
            src={tamtam1}
            className="ml-auto mr-6 mt-2 w-12 rotate-3 scale-x-[-1] md:ml-0 md:mt-12 md:w-52 md:-rotate-6 md:scale-x-100"
          ></img>
        )}
      </div>
      <div className="flex flex-col sm:mx-6">
        <div className="mx-3 flex items-center justify-between pb-4">
          <button onClick={(e) => handleWeekChange(e, -1)}>
            <CaretLeft className="size-6" />
          </button>
          <div>
            {formatDate(state.startOfWeek, "MM-dd")} -{" "}
            {formatDate(
              new Date(state.startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000),
              "MM-dd",
            )}
          </div>
          <button onClick={(e) => handleWeekChange(e, 1)}>
            <CaretRight className="size-6" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-x-2 gap-y-1">
          {daysOfWeek.map((day) => (
            <div
              key={day}
              className="text-center font-bold text-indian-khaki-700"
            >
              <div>{formatDate(day, "EEE")}</div>
              <div>{formatDate(day, "dd")}</div>
              <div
                className={`mx-auto mt-1 w-2/3 border-b-4 ${view === "student" ? "border-neon-carrot-500" : "border-cerulean-500"}`}
              ></div>
            </div>
          ))}
        </div>

        <div className="mt-1 grid h-56 grid-cols-7 gap-2 overflow-y-scroll md:h-auto md:overflow-y-visible xl:gap-3">
          {daysOfWeek.map((day) => (
            <div key={day}>{renderTimeSlots(day)}</div>
          ))}
        </div>
      </div>
    </>
  );
};

TimeTable.propTypes = {
  post: PropTypes.object,
  state: PropTypes.object.isRequired,
  dispatch: PropTypes.func,
  handleMonthChange: PropTypes.func.isRequired,
  handleWeekChange: PropTypes.func.isRequired,
  formatDate: PropTypes.func.isRequired,
  renderTimeSlots: PropTypes.func.isRequired,
  handleTimeRangeSelect: PropTypes.func,
  message: PropTypes.string.isRequired,
  CreatePostRenderCalendar: PropTypes.func,
};

export default TimeTable;
