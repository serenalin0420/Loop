import PropTypes from "prop-types";
import coin from "../../components/coin.svg";
import { useReducer, useState } from "react";
import TimeTable from "../../components/TimeTable";
import { initialState, reducer, actionTypes } from "../../context/postReducer";
import dbApi from "@/utils/api";

const CourseSelection = ({
  post,
  author,
  handleMonthChange,
  handleWeekChange,
  formatDate,
  renderCalendar,
  daysOfWeek,
}) => {
  const [showModal, setShowModal] = useState(false);
  // 新增一個單獨的狀態來管理 modal 的 timetable
  const [modalState, modalDispatch] = useReducer(reducer, initialState);
  const [selectedCourse, setSelectedCourse] = useState();
  const [selectedCoinCost, setSelectedCoinCost] = useState();

  const order = ["試教", "1", "3", "5", "10"];
  const sortedCourseNum = post.course_num
    ? post.course_num.sort((a, b) => {
        return order.indexOf(a) - order.indexOf(b);
      })
    : [];

  const getDisplayText = (num) => {
    switch (num) {
      case "試教":
        return "試教 / 25分鐘";
      case "1":
        return "1 次 / 50分鐘";
      case "3":
        return "3 次 （約2.5小時） ";
      case "5":
        return "5 次 （約6小時）";
      case "10":
        return "10 次（約８小時）";
      default:
        return `${num} 堂 / 未知時間`;
    }
  };
  const handleTimeSlotClick = (date, time) => {
    const dateString = formatDate(date, "yyyy-MM-dd");
    const selectedTimesForDate = modalState.selectedTimes[dateString] || {};

    // 檢查該時間段是否已經被選取
    const isSelected = selectedTimesForDate[time];

    const updatedTimesForDate = {
      ...selectedTimesForDate,
      [time]: !isSelected,
    };

    modalDispatch({
      type: actionTypes.SET_SELECTED_TIMES,
      payload: {
        ...modalState.selectedTimes,
        [dateString]: updatedTimesForDate,
      },
    });
  };

  const renderTimeSlots = (day) => {
    const dateKey = formatDate(day, "yyyy-MM-dd");
    const timeSlots = post.datetime[dateKey] || {};

    return (
      <div className="flex flex-col items-center">
        {Object.keys(timeSlots).length > 0 ? (
          Object.keys(timeSlots).map((time) => {
            const isAvailable = timeSlots[time];
            const isSelected = modalState.selectedTimes[dateKey]?.[time]; // 檢查是否被選取
            return (
              <div
                key={time}
                className={`mt-1 flex w-full cursor-pointer flex-col px-3 py-1 text-center ${isAvailable ? "font-semibold text-yellow-800" : "text-zinc-400"} ${isSelected ? "bg-yellow-300" : ""}`}
                onClick={() => isAvailable && handleTimeSlotClick(day, time)}
              >
                {time}
              </div>
            );
          })
        ) : (
          <div className="mt-1 flex w-full cursor-pointer flex-col px-3 py-1 text-center text-zinc-400">
            無
          </div>
        )}
      </div>
    );
  };
  const handleConfirm = async () => {
    try {
      const updatedTimes = Object.keys(modalState.selectedTimes).reduce(
        (acc, date) => {
          const timesForDate = modalState.selectedTimes[date];
          const updatedTimesForDate = Object.keys(timesForDate).reduce(
            (timeAcc, time) => {
              if (timesForDate[time]) {
                timeAcc[time] = false; // 只有選中的時間才更新為 false
              }
              return timeAcc;
            },
            {},
          );
          if (Object.keys(updatedTimesForDate).length > 0) {
            acc[date] = updatedTimesForDate;
          }
          return acc;
        },
        {},
      );

      await dbApi.updatePost(post.post_id, {
        datetime: {
          ...post.datetime,
          ...updatedTimes,
        },
      });

      // 清空選取的時間
      modalDispatch({
        type: actionTypes.SET_SELECTED_TIMES,
        payload: {},
      });

      setShowModal(false);
    } catch (error) {
      console.error("Error updating post:", error);
    }
  };

  return (
    <div className="mt-8">
      <h1 className="mb-4 text-center text-2xl">上課需求</h1>
      <div className="flex justify-between gap-6">
        {sortedCourseNum.map((num, index) => {
          const coinCost =
            num === "試教" ? 1 : post.coin_cost * parseInt(num, 10);
          return (
            <div
              key={index}
              className="card flex w-1/4 flex-wrap items-center justify-center gap-3 rounded-md p-4 shadow-md"
              onClick={() => {
                setShowModal(true);
                setSelectedCourse(num);
                setSelectedCoinCost(coinCost); // 設置選取的 coinCost
              }}
            >
              <img src={coin} alt="coin" className="size-16 object-cover" />
              <p className="text-xl">x</p>
              <p className="text-3xl font-bold text-yellow-900">{coinCost}</p>
              <p className="w-full text-center">{getDisplayText(num)}</p>
            </div>
          );
        })}
      </div>
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative top-16 flex max-h-[calc(100vh-32px)] flex-col overflow-y-auto rounded-md bg-white p-6 shadow-md">
            <div className="flex items-center">
              <div className="m-2.5 h-20 w-20 overflow-hidden rounded-full">
                <img
                  src={author.profile_picture}
                  className="h-full w-full object-cover object-center"
                  alt="author"
                />
              </div>
              <div className="flex flex-col gap-2">
                <h2 className="text-xl font-semibold">{post.title}</h2>
                <h3 className="inline-flex items-center gap-6 text-base">
                  {author.name}
                </h3>
              </div>
              {selectedCourse && (
                <div className="mb-[2px] ml-auto mr-8 mt-auto text-xl">
                  次數：{selectedCourse}
                </div>
              )}
              <div className="mt-auto flex items-center text-xl">
                獲得：
                <img
                  src={coin}
                  alt="coin"
                  className="mr-2 size-8 object-cover"
                />
                <p className="font-bold text-yellow-900">
                  x {selectedCoinCost}
                </p>
              </div>
              <button
                className="self-start p-2"
                onClick={() => setShowModal(false)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="mt-2 flex gap-8">
              <div className="flex flex-col rounded-b-lg shadow-md">
                <div className="flex h-12 w-full items-center rounded-t-lg bg-zinc-500 px-6 text-xl text-white">
                  學習時間表
                </div>
                <div className="m-6 flex justify-center">
                  <TimeTable
                    post={post}
                    state={modalState}
                    dispatch={modalDispatch}
                    handleMonthChange={handleMonthChange}
                    handleWeekChange={handleWeekChange}
                    formatDate={formatDate}
                    renderCalendar={renderCalendar}
                    daysOfWeek={daysOfWeek}
                    renderTimeSlots={renderTimeSlots}
                    message="請選擇您方便的時間"
                  />
                </div>
              </div>

              <button
                className="mt-4 self-end rounded bg-blue-500 px-4 py-2 text-white"
                onClick={handleConfirm}
              >
                確認
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

CourseSelection.propTypes = {
  post: PropTypes.shape({
    post_id: PropTypes.string.isRequired,
    coin_cost: PropTypes.number.isRequired,
    course_num: PropTypes.arrayOf(PropTypes.string),
    title: PropTypes.string.isRequired,
    datetime: PropTypes.object.isRequired,
  }).isRequired,
  author: PropTypes.shape({
    name: PropTypes.string,
    profile_picture: PropTypes.string,
  }).isRequired,
  handleMonthChange: PropTypes.func.isRequired,
  handleWeekChange: PropTypes.func.isRequired,
  formatDate: PropTypes.func.isRequired,
  renderCalendar: PropTypes.func.isRequired,
  daysOfWeek: PropTypes.array.isRequired,
};

export default CourseSelection;
