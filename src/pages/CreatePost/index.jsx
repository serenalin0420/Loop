import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { useQuery, useMutation } from "@tanstack/react-query";
import dbApi from "../../utils/api";
import { useReducer, useEffect, useContext } from "react";
import { UserContext } from "@/context/userContext";
import { initialState, actionTypes, reducer } from "../../context/postReducer";
import {
  locations,
  coursesNum,
  coinsOptions,
  timePreferences,
} from "./options";
import TimeTable from "../../components/TimeTable";
import { useLocation } from "react-router-dom";

const customStyles = {
  control: (provided) => ({
    ...provided,
    fontSize: "16px", // 控制框的文字大小
  }),
  option: (provided) => ({
    ...provided,
    fontSize: "16px", // 選項的文字大小
  }),
  multiValue: (provided) => ({
    ...provided,
    fontSize: "16px", // 多選值的文字大小
    backgroundColor: "#F0F4FD",
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    fontSize: "16px", // 多選值標籤的文字大小
  }),
};

function CreatePost() {
  const user = useContext(UserContext);
  const [state, dispatch] = useReducer(reducer, initialState);
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
          className={`cursor-pointer px-3 py-2 text-center ${date.toDateString() === state.selectedDate.toDateString() ? "rounded-full border border-yellow-950" : ""} ${isDisabled ? "cursor-not-allowed opacity-30" : ""}`}
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
          className={`mt-1 flex w-full cursor-pointer flex-col px-4 py-1 text-center ${isSelected ? "bg-yellow-300" : ""} ${!isDisabled && !isSelected ? "hover:bg-yellow-100" : ""} ${isDisabled ? "cursor-not-allowed opacity-30" : ""}`}
          onClick={() => !isDisabled && handleTimeSlotClick(day, time)}
        >
          {time}
        </div>
      );
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

  const onSubmit = (data) => {
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
    <div className="mx-24 mt-16 pt-8">
      <div className="h-auto outline">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col justify-center px-8 py-3"
        >
          <h1 className="border-b border-b-slate-500 pb-3 text-center text-2xl">
            發布貼文
          </h1>

          <div className="h-auto py-3">
            <div className="mb-3 items-center">
              <label className="mr-12 text-xl">標題</label>
              <input
                {...register("title", { required: true })}
                className="w-2/5 min-w-96 bg-slate-100 py-2 pl-3 text-base"
                placeholder="請簡短描述你的貼文內容"
              />
              {errors.title && <span>必填</span>}
            </div>

            <div className="mb-3">
              <div className="mb-3 flex h-10 items-center">
                <label className="mr-12 text-xl">類別</label>
                <Controller
                  name="category"
                  control={control}
                  defaultValue={categories?.[0] || null}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={(categories || []).map((cat) => ({
                        value: cat.id,
                        label: cat.name,
                      }))}
                      value={field.value || categories?.[0] || null}
                      onChange={(selectedOption) => {
                        field.onChange(selectedOption);
                        handleCategoryChange(selectedOption);
                      }}
                      components={makeAnimated()}
                      className="w-36 min-w-32"
                    />
                  )}
                />
                <div className="flex h-10">
                  <label className="mr-4 text-xl"></label>
                  <Controller
                    name="subcategories"
                    control={control}
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
                        onChange={(selectedOption) => {
                          field.onChange(selectedOption);
                          setValue("subcategories", selectedOption);
                        }}
                        styles={customStyles}
                      />
                    )}
                  />
                </div>
              </div>
              {view !== "student" && (
                <div className="mb-3 flex h-10 items-center">
                  <label className="mr-12 text-xl">專長</label>
                  <Controller
                    name="skills"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={state.skills?.map((skill) => ({
                          value: skill,
                          label: skill,
                        }))}
                        isMulti
                        components={makeAnimated()}
                        className="basic-multi-select min-w-60"
                        classNamePrefix="select"
                        styles={customStyles}
                      />
                    )}
                  />
                </div>
              )}
            </div>
            <div className="mb-3 flex h-10 items-center">
              <label className="mr-2 text-xl">時間偏好</label>
              <Controller
                name="timePreferences"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={timePreferences}
                    isMulti
                    className="basic-multi-select min-w-60"
                    classNamePrefix="select"
                    styles={customStyles}
                  />
                )}
              />
            </div>
            <div className="mb-3 flex h-10 items-center">
              <label className="mr-12 text-xl">地點</label>
              <Controller
                name="location"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={locations}
                    isMulti
                    className="basic-multi-select min-w-60"
                    classNamePrefix="select"
                    components={makeAnimated()}
                    styles={customStyles}
                  />
                )}
              />
            </div>

            <div className="mb-3 flex items-center">
              <label className="mr-12 text-xl">介紹</label>
              <textarea
                {...register("description", { required: true })}
                className="min-h-24 w-2/5 min-w-96 bg-slate-100 px-3 py-2"
                placeholder={introductionPlaceholder}
              />
              {errors.description && <span>必填</span>}
            </div>

            <div>
              <div className="flex h-10 items-center">
                <label className="mr-5 text-xl">代幣/堂</label>
                <Controller
                  name="coins"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={coinsOptions}
                      components={makeAnimated()}
                      className="w-28 min-w-32"
                    />
                  )}
                />
              </div>

              <div className="mb-6 mt-3 flex items-center">
                <label className="mr-2 text-xl">課程次數</label>
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
                        className="basic-multi-select min-w-60"
                        classNamePrefix="select"
                        styles={customStyles}
                      />
                    )}
                  />
                  {errors.coursesNum && (
                    <span className="mt-1 text-sm text-red-400">
                      請至少選擇三個次課程，最多四次
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="mb-4 flex gap-1">
              <label className="mr-1 text-xl">學習時間</label>
              <TimeTable
                state={state}
                handleMonthChange={handleMonthChange}
                handleWeekChange={handleWeekChange}
                formatDate={formatDate}
                renderCalendar={renderCalendar}
                daysOfWeek={daysOfWeek}
                renderTimeSlots={renderTimeSlots}
                message="請選擇從今天起，未來三個月內的可用時間"
              />
            </div>
            {view !== "student" && (
              <div className="mb-3 flex h-10 items-center">
                <label className="mr-12 text-xl">介紹影片</label>
                <input
                  {...register("introVideo")}
                  className="w-2/5 min-w-96 bg-slate-100 py-2 pl-3 text-base"
                  placeholder="請提供影片連結"
                />
              </div>
            )}
            {view !== "student" && (
              <div className="mb-3 flex h-10 items-center">
                <label className="mr-12 text-xl">參考教材</label>
                <input
                  {...register("referenceMaterial")}
                  className="w-2/5 min-w-96 bg-slate-100 py-2 pl-3 text-base"
                  placeholder="請提供雲端連結"
                />
              </div>
            )}
            <div className="flex justify-center">
              <button
                type="submit"
                className="rounded-md bg-yellow-800 px-6 py-2 text-base text-white"
              >
                發布貼文
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreatePost;
