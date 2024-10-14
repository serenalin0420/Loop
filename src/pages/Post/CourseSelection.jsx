import PropTypes from "prop-types";
import { Coin, Infinte } from "../../assets/images";
import { useReducer, useState, useContext, useEffect } from "react";
import TimeTable from "../../components/TimeTable";
import { initialState, reducer, actionTypes } from "../../context/postReducer";
import dbApi from "@/utils/api";
import { ViewContext } from "../../context/viewContext";
import { UserContext } from "../../context/userContext";
import { X } from "@phosphor-icons/react";
import IsLoggedIn from "../../components/Modal/IsLoggedIn";
import { WarningCircle } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";

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
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const { findTeachersView } = useContext(ViewContext);
  const user = useContext(UserContext);
  const navigate = useNavigate();

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
      setShowErrorModal(true);
      setTimeout(() => {
        setShowErrorModal(false);
        setErrorMessage("");
      }, 3000);
      newSelectedTimes = selectedTimes; // revert to previous state
    } else {
      setErrorMessage("");
      setShowErrorModal(false);
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
                } ${isSelected ? "bg-cerulean-200" : ""}`}
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
    if (errorMessage) {
      return;
    }
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    if (
      (selectedCourse === "體驗" && selectedTimes.length < 1) ||
      (selectedCourse !== "體驗" &&
        selectedTimes.length < parseInt(selectedCourse, 10))
    ) {
      setErrorMessage(
        `您需要選擇 ${selectedCourse === "體驗" ? 1 : selectedCourse} 個時段`,
      );
      setShowErrorModal(true);
      return;
    }
    if (user.uid === post.author_uid) {
      setErrorMessage("您不能預約自己的課程");
      setShowErrorModal(true);
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
    const notifyBooking = {
      from: user.uid,
      postAuthorUid: post.author_uid,
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

      await dbApi.updatePost(post.post_id, {
        datetime: {
          ...post.datetime,
          ...updatedTimes,
        },
      });

      await dbApi.createBooking(bookingData, notifyBooking);

      modalDispatch({
        type: actionTypes.SET_SELECTED_TIMES,
        payload: {},
      });

      setShowModal(false);
      setShowConfirmModal(true);
      setTimeout(() => {
        setShowConfirmModal(false);
        navigate(`/`);
      }, 2000);
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

  useEffect(() => {
    if (showModal) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
      // reset state
      setSelectedCourse();
      setSelectedCoinCost();
      setSelectedTimes([]);
      setErrorMessage("");
      setShowErrorModal(false);
      modalDispatch({
        type: actionTypes.SET_SELECTED_TIMES,
        payload: {},
      });
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [showModal]);

  return (
    <div className="mt-2 flex flex-col rounded-b-lg shadow-md xs:mt-8">
      <div className="flex h-11 items-center rounded-t-lg bg-indian-khaki-400 px-6 text-lg text-white">
        <Infinte alt="infinite-logo" className="mr-2 mt-2 w-12 object-cover" />
        <p className="mt-1">上課需求</p>
      </div>
      <div
        className={`flex flex-col justify-between gap-4 py-4 sm:flex-row ${sortedCourseNum.length === 3 ? "px-12 xs:px-16 xl:px-24" : "px-6"} `}
      >
        {sortedCourseNum.map((num, index) => {
          const coinCost =
            num === "體驗" ? 1 : post.coin_cost * parseInt(num, 10);
          const widthClass =
            sortedCourseNum.length === 3
              ? "sm:w-1/3 sm:mx-2 md:mx-7 xl:mx-6"
              : "sm:w-1/4 ";
          return (
            <div
              key={index}
              className={`flex cursor-pointer ${widthClass} items-center justify-center gap-2 rounded-md border-2 p-2 sm:flex-wrap sm:p-3 lg:p-4`}
              onClick={() => {
                setShowModal(true);
                setSelectedCourse(num);
                setSelectedCoinCost(coinCost);
              }}
            >
              <Coin
                alt="coin"
                className="size-7 object-cover sm:size-10 md:size-12 lg:size-14"
              />
              <p className="md:text-xl">x</p>
              <p className="text-lg font-bold text-yellow-800 md:text-xl lg:text-2xl">
                {coinCost}
              </p>
              <p className="ml-8 text-center text-xs sm:ml-0 sm:text-sm lg:text-base">
                {getDisplayText(num)}
              </p>
            </div>
          );
        })}
      </div>
      {showModal && (
        <div className="fixed inset-0 z-10 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50 px-8 py-32 md:px-16">
          <div className="relative top-20 flex max-h-[calc(100vh-32px)] flex-col overflow-y-auto rounded-lg bg-white px-6 pb-6 pt-4 shadow-md lg:px-8">
            <div className="flex items-center">
              <img
                src={author.profile_picture}
                className="my-2 mr-3 size-14 rounded-full border-white bg-red-100 object-cover object-center shadow-md sm:size-16 lg:size-20"
                alt="author"
              />
              <div className="flex flex-col">
                <h2 className="mb-1 text-nowrap font-semibold lg:text-xl">
                  {post.title}
                </h2>
                <h3 className="text-nowrap">{author.name}</h3>
              </div>
              {selectedCourse && (
                <div className="mb-1 ml-auto mr-4 mt-auto text-nowrap sm:mr-8 lg:mb-0 lg:text-lg">
                  次數：{selectedCourse}
                </div>
              )}
              <div className="mt-auto flex items-center text-nowrap lg:text-lg">
                獲得：
                <Coin alt="coin" className="mr-2 size-8 object-cover" />
                <p className="lg:text-lg">x {selectedCoinCost}</p>
              </div>
              <button
                className="ml-auto self-start p-2"
                onClick={() => setShowModal(false)}
              >
                <X className="size-6" />
              </button>
            </div>

            <div className="mt-2 flex flex-col justify-around md:flex-row lg:justify-start lg:gap-4">
              <div className="flex flex-col rounded-b-lg shadow-md">
                <div className="flex h-10 w-full items-center rounded-t-lg bg-indian-khaki-400 px-6 sm:h-12">
                  <Infinte
                    alt="infinite-logo"
                    className="mr-2 mt-2 w-12 object-cover sm:w-14"
                  />
                  <p className="mt-1 text-white sm:text-lg">學習時間表</p>
                </div>
                <div className="mx-2 my-4 flex flex-col justify-center md:ml-6 lg:flex-row">
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
              <div className="relative ml-4 mt-16 flex flex-col lg:mx-2">
                <div className="sticky top-0 flex w-full flex-col bg-neon-carrot-50 p-4 shadow md:w-52">
                  <h3 className="font-semibold lg:text-lg">已選擇的時段</h3>
                  <ul className="mt-2 grid grid-cols-2 md:grid-cols-1">
                    {selectedTimes.map((time, index) => (
                      <li key={index} className="mt-2 text-nowrap">
                        {formatSelectedTime(time)}
                      </li>
                    ))}
                  </ul>
                  <button
                    className="mt-4 rounded-md bg-neon-carrot-400 px-4 py-2 text-white"
                    onClick={handleConfirm}
                  >
                    確認
                  </button>
                </div>
                {showErrorModal && (
                  <div className="absolute -top-16 mt-4 flex rounded bg-neon-carrot-100 p-2 shadow-md md:relative md:top-0">
                    <WarningCircle className="size-5 text-neon-carrot-700" />
                    <p className="pl-1 text-sm font-semibold text-neon-carrot-700">
                      {errorMessage}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {showLoginModal && (
        <IsLoggedIn
          onClose={() => setShowLoginModal(false)}
          message="預約時段要先登入，才能知道你是誰喔~趕快登入吧！"
        />
      )}
      {showConfirmModal && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50">
          <div className="rounded-lg bg-white p-4 shadow-md">
            <p>您的預約 / 申請已成功送出！</p>
            <p className="text-center">即將返回首頁~</p>
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
