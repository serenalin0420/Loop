import PropTypes from "prop-types";
import coin from "../../components/coin.svg";
import { useReducer, useState, useContext } from "react";
import TimeTable from "../../components/TimeTable";
import { initialState, reducer, actionTypes } from "../../context/postReducer";
import dbApi from "@/utils/api";
import { ViewContext } from "../../context/viewContext";
import { UserContext } from "../../context/userContext";
import infinite from "../../components/infinite.svg";
import { X } from "@phosphor-icons/react";

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
  const [modalState, modalDispatch] = useReducer(reducer, initialState);
  const [selectedCourse, setSelectedCourse] = useState();
  const [selectedCoinCost, setSelectedCoinCost] = useState();
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const { findTeachersView } = useContext(ViewContext);
  const user = useContext(UserContext);

  console.log("findTeachersView", findTeachersView);

  const order = ["體驗", "1", "3", "5", "10"];
  const sortedCourseNum = post.course_num
    ? post.course_num.sort((a, b) => {
        return order.indexOf(a) - order.indexOf(b);
      })
    : [];

  const getDisplayText = (num) => {
    switch (num) {
      case "體驗":
        return "體驗 / 25分鐘";
      case "1":
        return "1 次 / 50分鐘";
      case "3":
        return "3 次 （約2.5小時）";
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

    const isSelected = selectedTimesForDate[time];

    const updatedTimesForDate = {
      ...selectedTimesForDate,
      [time]: !isSelected,
    };

    let newSelectedTimes = !isSelected
      ? [...selectedTimes, `${dateString} ${time}`]
      : selectedTimes.filter((t) => t !== `${dateString} ${time}`);

    const maxSelectableTimes =
      selectedCourse === "體驗" ? 1 : parseInt(selectedCourse, 10);
    if (newSelectedTimes.length > maxSelectableTimes) {
      setErrorMessage(`您只能選擇 ${maxSelectableTimes} 個時段`);
      newSelectedTimes = selectedTimes; // revert to previous state
    } else {
      setErrorMessage("");
      setSelectedTimes(newSelectedTimes);
      modalDispatch({
        type: actionTypes.SET_SELECTED_TIMES,
        payload: {
          ...modalState.selectedTimes,
          [dateString]: updatedTimesForDate,
        },
      });
    }
  };

  const renderTimeSlots = (day) => {
    const dateKey = formatDate(day, "yyyy-MM-dd");
    const timeSlots = post.datetime[dateKey] || {};

    return (
      <div className="flex flex-col items-center">
        {Object.keys(timeSlots).length > 0 ? (
          Object.keys(timeSlots).map((time) => {
            const isAvailable = timeSlots[time];
            const isSelected = modalState.selectedTimes[dateKey]?.[time];
            return (
              <div
                key={time}
                className={`mt-1 flex w-full cursor-pointer flex-col px-3 py-1 text-center ${
                  isAvailable
                    ? "font-semibold text-yellow-800"
                    : "text-zinc-400"
                } ${isSelected ? "bg-yellow-300" : ""}`}
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
    if (
      (selectedCourse === "體驗" && selectedTimes.length < 1) ||
      (selectedCourse !== "體驗" &&
        selectedTimes.length < parseInt(selectedCourse, 10))
    ) {
      setErrorMessage(
        `您需要選擇 ${selectedCourse === "體驗" ? 1 : selectedCourse} 個時段`,
      );
      return;
    }

    const bookingData = {
      post_id: post.post_id,
      demander_uid: findTeachersView ? user.uid : post.author_uid,
      provider_uid: findTeachersView ? post.author_uid : user.uid,
      selected_times: selectedTimes.map(formatSelectedTime),
      status: "pending",
      coins_total: selectedCoinCost,
    };

    try {
      const updatedTimes = Object.keys(modalState.selectedTimes).reduce(
        (acc, date) => {
          const timesForDate = modalState.selectedTimes[date];
          const updatedTimesForDate = Object.keys(timesForDate).reduce(
            (timeAcc, time) => {
              if (timesForDate[time]) {
                timeAcc[time] = false;
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
      console.log("updatedTimes", updatedTimes);

      await dbApi.updatePost(post.post_id, {
        datetime: {
          ...post.datetime,
          ...updatedTimes,
        },
      });

      await dbApi.createBooking(bookingData);

      modalDispatch({
        type: actionTypes.SET_SELECTED_TIMES,
        payload: {},
      });

      setShowModal(false);
    } catch (error) {
      console.error("Error updating post:", error);
    }
  };

  const formatSelectedTime = (time) => {
    const [date, hour] = time.split(" ");
    const dayOfWeek = new Date(date)
      .toLocaleDateString("zh-TW", {
        weekday: "short",
      })
      .replace("週", "");
    const formattedDate = new Date(date).toLocaleDateString("zh-TW", {
      month: "numeric",
      day: "numeric",
    });
    const startTime = `${hour}:00`;
    const endTime = `${parseInt(hour, 10)}:50`;
    return `${formattedDate} (${dayOfWeek})   ${startTime} - ${endTime}`;
  };

  return (
    <div className="mt-8">
      <h1 className="mb-4 text-center text-2xl">上課需求</h1>
      <div className="flex justify-between gap-6">
        {sortedCourseNum.map((num, index) => {
          const coinCost =
            num === "體驗" ? 1 : post.coin_cost * parseInt(num, 10);
          return (
            <div
              key={index}
              className="card flex w-1/4 flex-wrap items-center justify-center gap-3 rounded-md p-4 shadow-md"
              onClick={() => {
                setShowModal(true);
                setSelectedCourse(num);
                setSelectedCoinCost(coinCost);
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
          <div className="relative top-16 flex max-h-[calc(100vh-32px)] flex-col overflow-y-auto rounded-xl bg-white px-8 py-4 shadow-md">
            <div className="flex items-center">
              <img
                src={author.profile_picture}
                className="my-2 mr-3 h-20 w-20 rounded-full border-white bg-red-100 object-cover object-center shadow-md"
                alt="author"
              />
              <div className="flex flex-col">
                <h2 className="mb-1 text-xl font-semibold">{post.title}</h2>
                <h3>{author.name}</h3>
              </div>
              {selectedCourse && (
                <div className="ml-52 mr-8 mt-auto text-lg">
                  次數：{selectedCourse}
                </div>
              )}
              <div className="mt-auto flex items-center text-lg">
                獲得：
                <img
                  src={coin}
                  alt="coin"
                  className="mr-2 size-8 object-cover"
                />
                <p className="text-lg">x {selectedCoinCost}</p>
              </div>
              <button
                className="ml-auto self-start p-2"
                onClick={() => setShowModal(false)}
              >
                <X className="size-6" />
              </button>
            </div>

            <div className="mt-2 flex gap-4">
              <div className="flex flex-col rounded-b-lg shadow-md">
                <div className="flex h-12 w-full items-center rounded-t-lg bg-zinc-500 px-6 text-xl text-white">
                  <img
                    src={infinite}
                    alt="infinite-logo"
                    className="mr-2 mt-2 w-14 object-cover"
                  />
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
              <div className="flex flex-col items-center">
                <h3 className="mt-12 text-lg font-semibold">已選擇的時段</h3>
                <ul>
                  {selectedTimes.map((time, index) => (
                    <li key={index}>{formatSelectedTime(time)}</li>
                  ))}
                </ul>
                {errorMessage && (
                  <div className="mt-4 text-sm text-red-500">
                    {errorMessage}
                  </div>
                )}
                <button
                  className="mt-auto self-end rounded-md bg-orange-400 px-4 py-2 text-white"
                  onClick={handleConfirm}
                >
                  確認
                </button>
              </div>
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
    author_uid: PropTypes.string.isRequired,
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
