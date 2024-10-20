import LoadingSpinner from "@/components/LoadingSpinner";
import { CaretLeft, CheckFat } from "@phosphor-icons/react";
import { useEffect, useReducer } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Infinte } from "../../assets/images";
import TimeTable from "../../components/TimeTable";
import dbApi from "../../utils/api";
import {
  postActionTypes,
  postInitialState,
  postReducer,
} from "../../utils/postReducer";
import CourseSelection from "./CourseSelection";
import Introduction from "./Introduction";

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

function Post() {
  const { postId } = useParams();
  const [postState, postDispatch] = useReducer(postReducer, postInitialState);
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
        postDispatch({ type: postActionTypes.SET_POST, payload: postData });

        if (postData.category_id) {
          const categoryName = await dbApi.getPostCategory(
            postData.category_id,
          );
          postDispatch({
            type: postActionTypes.SET_POST_CATEGORY,
            payload: categoryName,
          });
        }

        if (postData.author_uid) {
          const authorData = await dbApi.getProfile(postData.author_uid);
          postDispatch({
            type: postActionTypes.SET_AUTHOR,
            payload: authorData,
          });
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      }
    };

    fetchPost();
  }, [postId]);

  const handleMonthChange = (e, direction) => {
    e.preventDefault();
    postDispatch({
      type: postActionTypes.SET_CURRENT_MONTH,
      payload: new Date(
        postState.currentMonth.setMonth(
          postState.currentMonth.getMonth() + direction,
        ),
      ),
    });
  };
  const handleWeekChange = (e, direction) => {
    e.preventDefault();
    postDispatch({
      type: postActionTypes.SET_START_OF_WEEK,
      payload: new Date(
        postState.startOfWeek.setDate(
          postState.startOfWeek.getDate() + direction * 7,
        ),
      ),
    });
  };

  const renderTimeSlots = (day) => {
    const dateKey = formatDate(day, "yyyy-MM-dd");
    const timeSlots = postState.post.datetime[dateKey] || {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isPastDate = day < today;

    return (
      <div className="flex flex-col items-center">
        {Object.keys(timeSlots).length > 0 ? (
          Object.keys(timeSlots).map((time) => {
            const isAvailable = timeSlots[time];

            return (
              <div
                key={time}
                className={`mt-1 flex w-full flex-col px-3 py-1 text-center ${
                  isPastDate
                    ? "cursor-not-allowed text-gray-400"
                    : isAvailable
                      ? "font-semibold text-yellow-800"
                      : "cursor-not-allowed text-zinc-400"
                }`}
              >
                {time}
              </div>
            );
          })
        ) : (
          <div className="mt-1 flex w-full flex-col px-3 py-1 text-center text-zinc-400">
            無
          </div>
        )}
      </div>
    );
  };

  if (!postState.post || !postState.author) return <LoadingSpinner />;

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
            {postState.postCategory?.name}
          </h2>
        </div>
        <Introduction post={postState.post} author={postState.author} />
        <CourseSelection
          post={postState.post}
          author={postState.author}
          formatDate={formatDate}
          renderTimeSlots={(day) => renderTimeSlots(day, true)}
        />
        <div className="mt-8 flex flex-col rounded-b-lg shadow-md">
          <div className="flex h-11 items-center rounded-t-lg bg-indian-khaki-400 px-6">
            <Infinte
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
              post={postState.post}
              state={postState}
              dispatch={postDispatch}
              handleMonthChange={handleMonthChange}
              handleWeekChange={handleWeekChange}
              formatDate={formatDate}
              renderTimeSlots={(day) => renderTimeSlots(day, false)}
              message="僅供瀏覽可預約的時段，最多可見未來三個月時間"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Post;
