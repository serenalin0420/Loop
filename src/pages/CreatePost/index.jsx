import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { useQuery, useMutation } from "@tanstack/react-query";
import dbApi from "../../utils/api";
import { useReducer, useEffect, useContext, useState } from "react";
import { UserContext } from "@/context/userContext";
import { initialState, actionTypes, reducer } from "../../context/postReducer";
import {
  locations,
  coursesNum,
  coinsOptions,
  timePreferences,
  sortCategories,
} from "./options";
import TimeTable from "../../components/TimeTable";
import { useLocation, useNavigate } from "react-router-dom";
import customStyles from "./selectorStyles";

const sortCategoriesFn = (categories) => {
  const categoryOrder = sortCategories.reduce((acc, category, index) => {
    acc[category] = index;
    return acc;
  }, {});

  return categories.sort((a, b) => {
    return categoryOrder[a.name] - categoryOrder[b.name];
  });
};

function CreatePost() {
  const user = useContext(UserContext);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const view = queryParams.get("view");
  const introductionPlaceholder =
    view === "student"
      ? "為什麼想學這個技能? \n多描述你的動機和規劃，讓別人主動來找你交流吧!"
      : "介紹一下你擁有的能力吧! \n多描述你的經驗和技能，讓別人主動來找你交流吧!";

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user && user.uid) {
        const profile = await dbApi.getProfile(user.uid);
        dispatch({ type: "SET_USER_PROFILE", payload: profile });
      }
    };

    fetchUserProfile();
  }, [user]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    dispatch({
      type: actionTypes.SET_START_OF_WEEK,
      payload: state.selectedDate,
    });
  }, [state.selectedDate]);

  const {
    data: categories,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: dbApi.getCategories,
  });

  const handleCategoryChange = (selectedOption) => {
    const selectedCategory = categories.find(
      (cat) => cat.id === selectedOption.value,
    );
    dispatch({
      type: actionTypes.SET_SELECTED_CATEGORY,
      payload: selectedOption,
    });
    dispatch({
      type: actionTypes.SET_SUBCATEGORIES,
      payload: selectedCategory ? selectedCategory.subcategories : [],
    });
    dispatch({
      type: actionTypes.SET_SKILLS,
      payload: selectedCategory ? selectedCategory.skills : [],
    });
    setValue("subcategories", null);
    setValue("skills", []);
  };

  // 切換到下一月或前一月
  const handleMonthChange = (e, direction) => {
    e.preventDefault();
    dispatch({
      type: actionTypes.SET_CURRENT_MONTH,
      payload: new Date(
        state.currentMonth.setMonth(state.currentMonth.getMonth() + direction),
      ),
    });
  };

  // 切換到下一周或前一周
  const handleWeekChange = (e, direction) => {
    e.preventDefault();
    dispatch({
      type: actionTypes.SET_START_OF_WEEK,
      payload: new Date(
        state.startOfWeek.setDate(state.startOfWeek.getDate() + direction * 7),
      ),
    });
  };
  const daysOfWeek = Array.from({ length: 7 }, (_, index) => {
    const newDate = new Date(state.startOfWeek);
    newDate.setDate(newDate.getDate() + index);
    return newDate;
  });

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
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
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
      const isDisabled = date > maxDate || date < today;
      calendarDays.push(
        <div
          key={day}
          className={`mx-2 cursor-pointer p-1 text-center sm:p-2 md:mx-1 md:px-0 lg:mx-0 lg:px-3 lg:py-2 ${date.toDateString() === state.selectedDate.toDateString() ? `rounded-full border-2 ${view === "student" ? "border-neon-carrot-500" : "border-cerulean-500"}` : ""} ${isDisabled ? "cursor-not-allowed opacity-30" : ""}`}
          onClick={() =>
            !isDisabled &&
            dispatch({ type: actionTypes.SET_SELECTED_DATE, payload: date })
          }
        >
          {day}
        </div>,
      );
    }

    return calendarDays;
  };

  const handleTimeSlotClick = (date, time) => {
    const dateString = formatDate(date, "yyyy-MM-dd");
    const selectedTimesForDate = state.selectedTimes[dateString] || {};

    // 檢查該時間段是否已經被選取
    const isSelected = selectedTimesForDate[time];

    // 如果已經被選取，則移除該時間段；否則，添加該時間段
    const updatedTimesForDate = {
      ...selectedTimesForDate,
      [time]: isSelected ? undefined : true,
    };

    // 移除值為 undefined 的鍵
    if (isSelected) {
      delete updatedTimesForDate[time];
    }

    dispatch({
      type: actionTypes.SET_SELECTED_TIMES,
      payload: {
        ...state.selectedTimes,
        [dateString]: updatedTimesForDate,
      },
    });
  };

  const renderTimeSlots = (day) => {
    const now = new Date();
    const isToday = day.toDateString() === now.toDateString();
    const currentHour = now.getHours();
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);

    return Array.from({ length: 16 }, (_, index) => index + 7).map((time) => {
      const isBeforeToday =
        day < new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const isDisabled =
        isBeforeToday || (isToday && time <= currentHour) || day > maxDate;
      const isSelected =
        state.selectedTimes[formatDate(day, "yyyy-MM-dd")]?.[time]; // 檢查是否被選取
      return (
        <div
          key={time}
          className={`mt-1 flex w-full cursor-pointer flex-col px-1 py-1 text-center md:px-2 lg:px-4 ${isSelected ? (view === "student" ? "bg-neon-carrot-200" : "bg-cerulean-200") : ""} ${isDisabled ? "cursor-not-allowed opacity-30" : ""}`}
          onClick={() => !isDisabled && handleTimeSlotClick(day, time)}
        >
          {time}
        </div>
      );
    });
  };

  const handleTimeRangeSelect = (startTime, endTime) => {
    const updatedSelectedTimes = { ...state.selectedTimes };
    const now = new Date();
    const currentHour = now.getHours();
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);

    daysOfWeek.forEach((day) => {
      const dateString = formatDate(day, "yyyy-MM-dd");
      const selectedTimesForDate = updatedSelectedTimes[dateString] || {};

      for (let time = startTime; time <= endTime; time++) {
        const isToday = day.toDateString() === now.toDateString();
        const isBeforeToday =
          day < new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const isDisabled =
          isBeforeToday || (isToday && time <= currentHour) || day > maxDate;

        if (!isDisabled) {
          selectedTimesForDate[time] = true;
        }
      }

      updatedSelectedTimes[dateString] = selectedTimesForDate;
    });

    dispatch({
      type: actionTypes.SET_SELECTED_TIMES,
      payload: updatedSelectedTimes,
    });
  };

  const mutation = useMutation({
    mutationFn: (postData) => dbApi.savePostToDatabase(postData), // 確保這裡的函數定義正確
    onSuccess: () => {
      console.log("Post saved successfully!");
      reset({
        title: "",
        type: "",
        category: null,
        subcategories: [],
        skills: [],
        location: [],
        description: "",
        timePreferences: [],
        coins: null,
        coursesNum: [],
        introVideo: "",
        referenceMaterial: "",
      }); // 重置表單
      dispatch({ type: "SET_SELECTED_TIMES", payload: {} }); // 重置 selectedTimes

      // 重置日曆到今天的日期
      const today = new Date();
      dispatch({ type: actionTypes.SET_SELECTED_DATE, payload: today });
      dispatch({ type: actionTypes.SET_START_OF_WEEK, payload: today });
    },

    onError: (error) => {
      console.error("Error saving post: ", error);
    },
  });

  const onSubmit = (data, event) => {
    event.preventDefault();
    setIsModalVisible(true);
    setTimeout(() => {
      setIsModalVisible(false);
      navigate(`/`);
    }, 3000);
    const postData = {
      title: data.title,
      type: view === "student" ? "發起學習" : "發布教學",
      author_uid: user.uid,
      category_id: data.category?.value,
      subcategories: data.subcategories?.map((sub) => sub.value),
      skills: data.skills?.map((skill) => skill.value),
      location: data.location?.map((loc) => loc.label),
      description: data.description,
      time_preference: data.timePreferences?.map((pref) => pref.label),
      coin_cost: data.coins?.value,
      course_num: data.coursesNum?.map((num) => num.value),
      datetime: state.selectedTimes,
      video_url: data.introVideo,
      attachment_url: data.referenceMaterial,
    };
    mutation.mutate(postData);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading categories</div>;

  return (
    <div
      className={`py-24 ${view !== "student" ? "bg-[#fcf9f5]" : "bg-slate-50"}`}
    >
      <div className="px-6 md:px-8 lg:px-16">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mx-auto flex max-w-screen-xl flex-col justify-center rounded-lg bg-white px-6 py-3 shadow-md md:px-8 lg:px-12 xl:px-28"
        >
          <h1 className="border-b border-b-zinc-300 pb-2 text-center text-xl font-semibold">
            {view !== "student" ? "發布教學" : "發起學習"}
          </h1>

          <div className="h-auto py-3">
            <div className="mb-3 flex items-center">
              <label className="mr-7 flex items-center text-nowrap text-sm md:mr-9 md:text-base">
                標題
                <span className="ml-1 mt-2 text-lg font-bold text-red-500">
                  *
                </span>
              </label>
              <input
                {...register("title", { required: true })}
                className={`w-3/5 rounded-sm px-3 py-2 text-sm text-textcolor md:w-2/5 md:min-w-96 md:text-base ${view !== "student" ? "bg-neon-carrot-50 focus:outline-neon-carrot-300" : "bg-cerulean-50 focus:outline-cerulean-300"} ${errors.title ? "border border-red-400 placeholder:text-red-300" : "placeholder:text-zinc-300"}`}
                placeholder={errors.title ? "必填" : "請簡短描述你的貼文內容"}
              />
            </div>

            <div className="mb-3">
              <div className="mb-3 flex flex-wrap items-center">
                <div className="flex h-10 items-center">
                  <label className="mr-7 flex items-center text-nowrap text-sm md:mr-9 md:text-base">
                    類別
                    <span className="ml-1 mt-2 text-lg font-bold text-red-500">
                      *
                    </span>
                  </label>
                  <Controller
                    name="category"
                    control={control}
                    rules={{ required: true }}
                    defaultValue={null}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={sortCategoriesFn(categories || []).map(
                          (cat) => ({
                            value: cat.id,
                            label: cat.name,
                          }),
                        )}
                        value={field.value || null}
                        onChange={(selectedOption) => {
                          field.onChange(selectedOption);
                          handleCategoryChange(selectedOption);
                        }}
                        components={makeAnimated()}
                        className={`w-1/3 min-w-32 md:w-1/4 ${errors.category ? "rounded border border-red-400" : ""}`}
                        styles={customStyles(view)}
                        placeholder="語言"
                      />
                    )}
                  />
                </div>
                <div className="ml-[68px] mt-2 flex w-5/6 flex-wrap items-center md:ml-3 md:mt-0 md:w-4/6">
                  <Controller
                    name="subcategories"
                    control={control}
                    rules={{ required: true }}
                    defaultValue={[]}
                    render={({ field }) => (
                      <Select
                        {...field}
                        value={field.value || []}
                        options={(state.subcategories || []).map((sub) => ({
                          value: sub,
                          label: sub,
                        }))}
                        isMulti
                        className={`w-5/6 md:w-4/6 lg:w-3/4 ${errors.subcategories ? "rounded border border-red-400" : ""}`}
                        onChange={(selectedOption) => {
                          field.onChange(selectedOption);
                          setValue("subcategories", selectedOption);
                        }}
                        styles={customStyles(view)}
                        placeholder="請先選擇類別"
                      />
                    )}
                  />
                </div>
              </div>
              {view !== "student" && (
                <div className="flex w-full flex-wrap items-center md:w-5/6 lg:min-w-36">
                  <label className="mr-7 flex items-center text-nowrap text-sm md:mr-9 md:text-base">
                    專長
                    <span className="ml-1 mt-2 text-lg font-bold text-red-500">
                      *
                    </span>
                  </label>
                  <Controller
                    name="skills"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={state.skills?.map((skill) => ({
                          value: skill,
                          label: skill,
                        }))}
                        isMulti
                        components={makeAnimated()}
                        className={`w-4/6 md:w-4/6 ${errors.skills ? "rounded border border-red-400" : ""}`}
                        classNamePrefix="select"
                        styles={customStyles(view)}
                        placeholder="請先選擇類別"
                      />
                    )}
                  />
                </div>
              )}
            </div>

            <div className="mb-3 flex w-full flex-wrap items-center md:w-5/6 lg:min-w-36">
              <label className="mr-1 flex items-center text-sm md:text-base">
                時間偏好
                <span className="mt-1 text-lg font-bold text-red-500 md:ml-1">
                  *
                </span>
              </label>
              <Controller
                name="timePreferences"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={timePreferences}
                    isMulti
                    className={`w-4/6 md:w-4/6 ${errors.timePreferences ? "rounded border border-red-400" : ""}`}
                    classNamePrefix="select"
                    styles={customStyles(view)}
                    placeholder="平日/白天、周末/晚上..."
                  />
                )}
              />
            </div>
            <div className="mb-3 flex w-full flex-wrap items-center md:w-5/6 lg:min-w-36">
              <label className="mr-7 flex items-center text-sm md:mr-9 md:text-base">
                地點
                <span className="ml-1 mt-2 text-lg font-bold text-red-500">
                  *
                </span>
              </label>
              <Controller
                name="location"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={locations}
                    isMulti
                    className={`w-4/6 md:w-4/6 ${errors.location ? "rounded border border-red-400" : ""}`}
                    classNamePrefix="select"
                    components={makeAnimated()}
                    styles={customStyles(view)}
                    placeholder="線上、台北市..."
                  />
                )}
              />
            </div>

            <div className="mb-3 flex items-center">
              <label className="mr-7 flex items-center text-nowrap text-sm md:mr-9 md:text-base">
                介紹
                <span className="ml-1 mt-2 text-lg font-bold text-red-500">
                  *
                </span>
              </label>
              <textarea
                {...register("description", { required: true })}
                className={`min-h-28 w-full rounded-sm px-3 py-2 text-sm text-textcolor md:w-4/5 md:text-base ${view !== "student" ? "bg-neon-carrot-50 focus:outline-neon-carrot-300" : "bg-cerulean-50 focus:outline-cerulean-300"} ${errors.description ? "border border-red-400 placeholder:text-red-300" : "placeholder:text-zinc-300"}`}
                placeholder={
                  errors.description
                    ? `必填: ${introductionPlaceholder}`
                    : introductionPlaceholder
                }
              />
            </div>

            <div>
              <div className="flex h-10 items-center">
                <label className="mr-2 flex items-center text-sm md:mr-3 md:text-base">
                  代幣/堂
                  <span className="ml-1 mt-1 text-lg font-bold text-red-500">
                    *
                  </span>
                </label>
                <Controller
                  name="coins"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={coinsOptions}
                      components={makeAnimated()}
                      className={`w-28 min-w-32 ${errors.coins ? "rounded border border-red-400" : ""}`}
                      placeholder="1枚"
                      styles={customStyles(view)}
                    />
                  )}
                />
              </div>

              <div className="mb-6 mt-3 flex flex-wrap items-center">
                <label className="mr-1 flex items-center text-sm md:text-base">
                  課程次數
                  <span className="mt-1 text-lg font-bold text-red-500 md:ml-1">
                    *
                  </span>
                </label>
                <div className="flex flex-col">
                  <Controller
                    name="coursesNum"
                    control={control}
                    rules={{
                      validate: (value) =>
                        value?.length >= 3 && value?.length <= 4,
                    }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={coursesNum}
                        isMulti
                        components={makeAnimated()}
                        className={`min-w-60 ${errors.coursesNum ? "rounded border border-red-400" : ""}`}
                        styles={customStyles(view)}
                        placeholder="請至少選擇三個次課程，最多四次"
                      />
                    )}
                  />
                </div>
              </div>
            </div>
            <div className="mb-4 flex flex-col gap-1 md:flex-row">
              <label className="mb-2 mr-2 text-sm md:mb-0 md:mr-3 md:text-base">
                學習時間
              </label>
              <TimeTable
                state={state}
                handleMonthChange={handleMonthChange}
                handleWeekChange={handleWeekChange}
                formatDate={formatDate}
                renderCalendar={renderCalendar}
                daysOfWeek={daysOfWeek}
                renderTimeSlots={renderTimeSlots}
                handleTimeRangeSelect={handleTimeRangeSelect}
                message="請選擇從今天起，未來三個月內的可用時間"
              />
            </div>
            {view !== "student" && (
              <div className="mb-3 flex h-10 items-center">
                <label className="mr-2 text-sm md:mr-3 md:text-base">
                  介紹影片
                </label>
                <input
                  {...register("introVideo")}
                  className="bg-neon-carrot-50 focus:outline-neon-carrot-300 w-3/5 min-w-60 rounded-sm px-3 py-2 text-sm text-textcolor placeholder:text-zinc-300 md:w-2/5 md:min-w-96 md:text-base"
                  placeholder="請提供影片連結"
                />
              </div>
            )}
            {view !== "student" && (
              <div className="mb-3 flex h-10 items-center">
                <label className="mr-2 text-sm md:mr-3 md:text-base">
                  參考教材
                </label>
                <input
                  {...register("referenceMaterial")}
                  className="bg-neon-carrot-50 focus:outline-neon-carrot-300 w-3/5 min-w-60 rounded-sm px-3 py-2 text-sm text-textcolor placeholder:text-zinc-300 md:w-2/5 md:min-w-96 md:text-base"
                  placeholder="請提供雲端連結"
                />
              </div>
            )}
            <div className="flex justify-center">
              <button
                type="submit"
                className={`rounded-md px-6 py-2 text-base text-white ${view === "student" ? "bg-cerulean-400" : "bg-neon-carrot-400"}`}
              >
                {view !== "student" ? "發布教學" : "發起學習"}
              </button>
            </div>
          </div>
        </form>
        {isModalVisible && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="rounded-md bg-white p-6">
              <p>提交成功！即將返回首頁~</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CreatePost;
