import { useEffect, useState, useReducer } from "react";
import { useParams, useNavigate } from "react-router-dom";
import dbApi from "../../utils/api";
import Introduction from "./Introduction";
import TimeTable from "../../components/TimeTable";
import { initialState, actionTypes, reducer } from "../../context/postReducer";
import CourseSelection from "./CourseSelection";
import infinite from "../../assets/infinite.svg";
import { CaretLeft, CheckFat } from "@phosphor-icons/react";
import coin from "../../assets/coin.svg";

function Post() {
  const { postId } = useParams();
  const [post, setPost] = useState();
  const [author, setAuthor] = useState();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [postCategory, setPostCategory] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleGoBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postData = await dbApi.getSinglePost(postId);
        setPost(postData);

        if (postData.category_id) {
          const categoryName = await dbApi.getPostCategory(
            postData.category_id,
          );
          setPostCategory(categoryName);
        }

        if (postData.author_uid) {
          const authorData = await dbApi.getProfile(postData.author_uid);
          setAuthor(authorData);
        }
        // 設置初始選中的日期為最早可選日期
        const availableDates = Object.keys(postData.datetime).map(
          (dateStr) => new Date(dateStr),
        );
        const earliestAvailableDate = availableDates.reduce(
          (earliest, current) => {
            return current < earliest ? current : earliest;
          },
          new Date(8640000000000000),
        ); // 使用一個非常大的日期作為初始值

        earliestAvailableDate.setHours(0, 0, 0, 0);
        dispatch({
          type: actionTypes.SET_SELECTED_DATE,
          payload: earliestAvailableDate,
        });
        dispatch({
          type: actionTypes.SET_START_OF_WEEK,
          payload: new Date(earliestAvailableDate),
        });
      } catch (error) {
        console.error("Error fetching post:", error);
      }
    };

    fetchPost();
  }, [postId]);

  const handleMonthChange = (e, direction) => {
    e.preventDefault();
    dispatch({
      type: actionTypes.SET_CURRENT_MONTH,
      payload: new Date(
        state.currentMonth.setMonth(state.currentMonth.getMonth() + direction),
      ),
    });
  };
  const handleWeekChange = (e, direction) => {
    e.preventDefault();
    dispatch({
      type: actionTypes.SET_START_OF_WEEK,
      payload: new Date(
        state.startOfWeek.setDate(state.startOfWeek.getDate() + direction * 7),
      ),
    });
  };

  const formatDate = (date, formatStr) => {
    if (formatStr === "yyyy-MM-dd") {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } else if (formatStr === "MM-dd") {
      return date.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
      });
    } else if (formatStr === "EEE") {
      // narrow: "M""五", short: "Mon""週五", long: "Monday"
      return date.toLocaleDateString("zh-CN", { weekday: "narrow" });
    } else if (formatStr === "dd") {
      return date.getDate();
    } else if (formatStr === "MMM yyyy") {
      return date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
    }
  };

  const renderCalendar = () => {
    const startOfMonth = new Date(
      state.currentMonth.getFullYear(),
      state.currentMonth.getMonth(),
      1,
    );
    const endOfMonth = new Date(
      state.currentMonth.getFullYear(),
      state.currentMonth.getMonth() + 1,
      0,
    );
    const startDay = startOfMonth.getDay();
    const daysInMonth = endOfMonth.getDate();

    const availableDates = Object.keys(post.datetime).map(
      (dateStr) => new Date(dateStr),
    );
    const earliestAvailableDate = availableDates.reduce((earliest, current) => {
      return current < earliest ? current : earliest;
    }, new Date(8640000000000000)); // 使用一個非常大的日期作為初始值

    earliestAvailableDate.setHours(0, 0, 0, 0);
    const today = earliestAvailableDate;

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
          className={`cursor-pointer px-2 py-2 text-center ${date.toDateString() === state.selectedDate.toDateString() ? "rounded-full border border-yellow-950" : ""} ${isDisabled ? "cursor-not-allowed opacity-30" : ""}`}
          onClick={() => {
            if (!isDisabled) {
              dispatch({ type: actionTypes.SET_SELECTED_DATE, payload: date });
              dispatch({
                type: actionTypes.SET_START_OF_WEEK,
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

  const renderTimeSlots = (day) => {
    const dateKey = formatDate(day, "yyyy-MM-dd");
    const timeSlots = post.datetime[dateKey] || {};

    return (
      <div className="flex flex-col items-center">
        {Object.keys(timeSlots).length > 0 ? (
          Object.keys(timeSlots).map((time) => {
            const isAvailable = timeSlots[time];

            return (
              <div
                key={time}
                className={`mt-1 flex w-full flex-col px-3 py-1 text-center ${isAvailable ? "font-semibold text-yellow-800" : "text-zinc-400"}`}
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

  if (!post || !author)
    return (
      <div className="col-span-3 mt-6 flex h-screen items-center justify-center">
        <div className="flex flex-col items-center justify-center text-indian-khaki-800">
          <img src={coin} className="my-2 size-16 animate-swing" />
          <p>請再稍等一下...</p>
        </div>
      </div>
    );

  return (
    <div className="my-20 flex justify-center gap-6">
      <div className="mx-4 flex max-w-screen-lg flex-col sm:mx-6 md:mx-12 lg:mx-28 xl:mx-auto">
        <div className="mb-4 flex items-center gap-6">
          <div
            onClick={handleGoBack}
            className="flex cursor-pointer items-center"
          >
            <CaretLeft className="size-6 sm:size-8" />
            返回
          </div>
          <h2 className="text-lg font-semibold sm:text-xl">
            {postCategory?.name}
          </h2>
        </div>
        <Introduction post={post} author={author} />
        <CourseSelection
          post={post}
          author={author}
          handleMonthChange={handleMonthChange}
          handleWeekChange={handleWeekChange}
          formatDate={formatDate}
          renderCalendar={renderCalendar}
          daysOfWeek={daysOfWeek}
          renderTimeSlots={(day) => renderTimeSlots(day, true)}
        />
        <div className="mt-8 flex flex-col rounded-b-lg shadow-md">
          <div className="flex h-11 items-center rounded-t-lg bg-indian-khaki-400 px-6">
            <img
              src={infinite}
              alt="infinite-logo"
              className="mr-2 mt-2 w-12 object-cover"
            />
            <p className="mt-1 text-lg text-white">學習時間表</p>
          </div>
          <p className="mx-10 mt-4 flex items-center text-sm text-indian-khaki-700 sm:text-base">
            <CheckFat
              className="mr-2 size-6 text-indian-khaki-600"
              weight="duotone"
            />
            要預約課程，請先選取您的上課需求~
          </p>
          <div className="mx-4 my-4 flex flex-col justify-center gap-4 md:flex-row">
            <TimeTable
              post={post}
              state={state}
              handleMonthChange={handleMonthChange}
              handleWeekChange={handleWeekChange}
              formatDate={formatDate}
              renderCalendar={renderCalendar}
              daysOfWeek={daysOfWeek}
              renderTimeSlots={(day) => renderTimeSlots(day, false)} // 不可選擇
              message="僅供瀏覽可預約的時段，最多可見未來三個月時間"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Post;
