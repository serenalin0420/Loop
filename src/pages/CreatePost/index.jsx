import { UserContext } from "@/context/userContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useContext, useEffect, useReducer } from "react";
import { Controller, useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { Coin } from "../../assets/images";
import TimeTable from "../../components/TimeTable";
import dbApi from "../../utils/api";
import {
  postActionTypes,
  postInitialState,
  postReducer,
} from "../../utils/postReducer";
import {
  uiActionTypes,
  uiInitialState,
  uiReducer,
} from "../../utils/uiReducer";
import {
  coinsOptions,
  coursesNum,
  locations,
  sortCategories,
  timePreferences,
} from "./options";
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

const getIntroductionPlaceholder = (view) => {
  return view === "student"
    ? "為什麼想學這個技能? \n多描述你的動機和規劃，讓別人主動來找你交流吧!"
    : "介紹一下你擁有的能力吧! \n多描述你的經驗和技能，讓別人主動來找你交流吧!";
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

const handleCategoryChange = (
  categories,
  selectedOption,
  setValue,
  postDispatch,
) => {
  const selectedCategory = categories.find(
    (cat) => cat.id === selectedOption.value,
  );
  postDispatch({
    type: postActionTypes.SET_SELECTED_CATEGORY,
    payload: selectedOption,
  });
  postDispatch({
    type: postActionTypes.SET_SUBCATEGORIES,
    payload: selectedCategory ? selectedCategory.subcategories : [],
  });
  postDispatch({
    type: postActionTypes.SET_SKILLS,
    payload: selectedCategory ? selectedCategory.skills : [],
  });
  setValue("subcategories", null);
  setValue("skills", []);
};

function CreatePost() {
  const user = useContext(UserContext);
  const [postState, postDispatch] = useReducer(postReducer, postInitialState);
  const [uiState, uiDispatch] = useReducer(uiReducer, uiInitialState);
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const view = queryParams.get("view");
  const introductionPlaceholder = getIntroductionPlaceholder(view);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user && user.uid) {
        const profile = await dbApi.getProfile(user.uid);
        postDispatch({ type: "SET_USER_PROFILE", payload: profile });
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
    setError,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    postDispatch({
      type: postActionTypes.SET_START_OF_WEEK,
      payload: postState.selectedDate,
    });
  }, [postState.selectedDate]);

  const {
    data: categories,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: dbApi.getCategories,
  });

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
  const daysOfWeek = Array.from({ length: 7 }, (_, index) => {
    const newDate = new Date(postState.startOfWeek);
    newDate.setDate(newDate.getDate() + index);
    return newDate;
  });

  const renderCalendar = () => {
    const { startOfMonth, endOfMonth } = getMonthRange(postState.currentMonth);
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
        postState.currentMonth.getFullYear(),
        postState.currentMonth.getMonth(),
        day,
      );
      const isDisabled = date > maxDate || date < today;
      calendarDays.push(
        <div
          key={day}
          className={`mx-2 cursor-pointer p-1 text-center sm:p-2 md:mx-1 md:px-0 lg:mx-0 lg:px-3 lg:py-2 ${date.toDateString() === postState.selectedDate.toDateString() ? `rounded-full border-2 ${view === "student" ? "border-neon-carrot-500" : "border-cerulean-500"}` : ""} ${isDisabled ? "cursor-not-allowed opacity-30" : ""}`}
          onClick={() =>
            !isDisabled &&
            postDispatch({
              type: postActionTypes.SET_SELECTED_DATE,
              payload: date,
            })
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
    const selectedTimesForDate = postState.selectedTimes[dateString] || {};

    const isSelected = selectedTimesForDate[time];

    const updatedTimesForDate = {
      ...selectedTimesForDate,
      [time]: isSelected ? undefined : true,
    };

    if (isSelected) {
      delete updatedTimesForDate[time];
    }

    postDispatch({
      type: postActionTypes.SET_SELECTED_TIMES,
      payload: {
        ...postState.selectedTimes,
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
        postState.selectedTimes[formatDate(day, "yyyy-MM-dd")]?.[time];
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

  const handleTimeRangeSelect = (
    startTime,
    endTime,
    updatedSelectedTimes = { ...postState.selectedTimes },
  ) => {
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

    postDispatch({
      type: postActionTypes.SET_SELECTED_TIMES,
      payload: updatedSelectedTimes,
    });
  };

  const mutation = useMutation({
    mutationFn: (postData) => dbApi.savePostToDatabase(postData),
    onSuccess: () => {
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
      });
      postDispatch({ type: "SET_SELECTED_TIMES", payload: {} });

      const today = new Date();
      postDispatch({ type: postActionTypes.SET_SELECTED_DATE, payload: today });
      postDispatch({ type: postActionTypes.SET_START_OF_WEEK, payload: today });
    },

    onError: (error) => {
      console.error("Error saving post: ", error);
    },
  });

  const onSubmit = (data, event) => {
    event.preventDefault();

    const hasSelectedDateTime = Object.values(postState.selectedTimes).some(
      (times) => Object.values(times).some((selected) => selected),
    );

    if (!hasSelectedDateTime) {
      setError("timeTable", {
        type: "manual",
        message: "請選擇日期和時間",
      });

      return;
    }

    uiDispatch({
      type: uiActionTypes.SHOW_MODAL,
      modalType: "autoCloseModal",
      payload: {
        message: "提交成功！即將返回首頁~",
      },
    });

    setTimeout(() => {
      uiDispatch({
        type: uiActionTypes.HIDE_MODAL,
        modalType: "autoCloseModal",
      });
      navigate(`/`);
    }, 2000);
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
      datetime: postState.selectedTimes,
      video_url: data.introVideo,
      attachment_url: data.referenceMaterial,
    };
    mutation.mutate(postData);
  };

  if (isLoading)
    return (
      <div className="col-span-3 mt-6 flex h-screen items-center justify-center">
        <div className="flex flex-col items-center justify-center text-indian-khaki-800">
          <Coin className="my-2 size-16 animate-swing" />
          <p>請再稍等一下...</p>
        </div>
      </div>
    );
  if (error) return <div>Error loading categories</div>;

  return (
    <div
      className={`py-20 md:py-24 ${view !== "student" ? "bg-[#fcf9f5]" : "bg-slate-50"}`}
    >
      <div className="px-4 sm:px-6 md:px-8 lg:px-16">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mx-auto flex max-w-screen-xl flex-col justify-center rounded-lg bg-white px-3 py-3 shadow-md sm:px-6 md:px-8 lg:px-12 xl:px-28"
        >
          <h1 className="border-b border-b-zinc-300 pb-2 text-center text-lg font-semibold md:text-xl">
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
                {...register("title", {
                  required: true,
                  setValueAs: (value) => value.trim(),
                })}
                className={`w-3/5 rounded-sm px-3 py-2 text-sm text-textcolor md:w-2/5 md:min-w-96 md:text-base ${view !== "student" ? "bg-neon-carrot-50 focus:outline-neon-carrot-300" : "bg-cerulean-50 focus:outline-cerulean-300"} ${errors.title ? "border border-red-400 placeholder:text-red-300" : "placeholder:text-zinc-400"}`}
                placeholder={
                  errors.title
                    ? "必填，不能僅輸入空格"
                    : "請簡短描述你的貼文內容"
                }
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
                        options={(postState.subcategories || []).map((sub) => ({
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
                        options={postState.skills?.map((skill) => ({
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
                maxLength={1000}
                {...register("description", {
                  required: true,
                  setValueAs: (value) => value.trim(),
                })}
                className={`min-h-28 w-full rounded-sm px-3 py-2 text-sm text-textcolor md:w-4/5 md:text-base ${view !== "student" ? "bg-neon-carrot-50 focus:outline-neon-carrot-300" : "bg-cerulean-50 focus:outline-cerulean-300"} ${errors.description ? "border border-red-400 placeholder:text-red-300" : "placeholder:text-zinc-400"}`}
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
                  {errors.coursesNum && (
                    <span className="mt-1 text-xs text-red-400">
                      請至少選擇三個次課程，最多四次
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="mb-4 flex flex-col gap-1 md:flex-row">
              <label className="mb-2 mr-2 text-sm md:mb-0 md:mr-3 md:text-base">
                學習時間
                {errors.timeTable && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.timeTable.message}
                  </p>
                )}
              </label>
              <TimeTable
                state={postState}
                handleMonthChange={handleMonthChange}
                handleWeekChange={handleWeekChange}
                formatDate={formatDate}
                CreatePostRenderCalendar={renderCalendar}
                renderTimeSlots={renderTimeSlots}
                handleTimeRangeSelect={handleTimeRangeSelect}
                message="請選擇從今天起，未來三個月內的可用時間"
              />
            </div>
            {view !== "student" && (
              <div className="mb-3 flex h-10 items-center">
                <label className="mr-2 text-nowrap text-sm md:mr-3 md:text-base">
                  介紹影片
                </label>
                <input
                  {...register("introVideo")}
                  className="w-4/5 rounded-sm bg-neon-carrot-50 px-3 py-2 text-sm text-textcolor placeholder:text-zinc-400 focus:outline-neon-carrot-300 sm:w-3/5 md:w-2/5 md:min-w-96 md:text-base"
                  placeholder="請提供影片連結"
                />
              </div>
            )}
            {view !== "student" && (
              <div className="mb-3 flex h-10 items-center">
                <label className="mr-2 text-nowrap text-sm md:mr-3 md:text-base">
                  參考教材
                </label>
                <input
                  {...register("referenceMaterial")}
                  className="w-4/5 rounded-sm bg-neon-carrot-50 px-3 py-2 text-sm text-textcolor placeholder:text-zinc-400 focus:outline-neon-carrot-300 sm:w-3/5 md:w-2/5 md:min-w-96 md:text-base"
                  placeholder="請提供連結"
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
        {uiState.autoCloseModal.show && (
          <div className="fixed inset-0 mt-[60px] flex items-center justify-center bg-black bg-opacity-50">
            <div className="rounded-lg bg-white p-6">
              <p>{uiState.autoCloseModal.message}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CreatePost;
