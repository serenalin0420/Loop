import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { useQuery } from "@tanstack/react-query";
import dbApi from "../../utils/api";
import { useReducer, useEffect } from "react";

const locations = [
  { value: "online", label: "線上" },
  { value: "taipei", label: "台北市" },
  { value: "new_taipei_city", label: "新北市" },
  { value: "keelung", label: "基隆市" },
  { value: "yilan", label: "宜蘭縣" },
  { value: "taoyuan", label: "桃園市" },
  { value: "hsinchu_city", label: "新竹市" },
  { value: "hsinchu_ounty", label: "新竹縣" },
  { value: "miaoli", label: "苗栗縣" },
  { value: "taichung", label: "台中市" },
  { value: "changhua", label: "彰化縣" },
  { value: "nantou", label: "南投縣" },
  { value: "yunlin", label: "雲林縣" },
  { value: "chiayi_county", label: "嘉義縣" },
  { value: "chiayi_city", label: "嘉義市" },
  { value: "tainan", label: "台南市" },
  { value: "kaohsiung", label: "高雄市" },
  { value: "pingtung", label: "屏東縣" },
  { value: "penghu", label: "澎湖縣" },
  { value: "hualien", label: "花蓮縣" },
  { value: "taitung", label: "台東縣" },
  { value: "kinmen", label: "金門縣" },
  { value: "lienchiang", label: "連江縣" },
];

const timePreferences = [
  { value: "weekday_day", label: "平日/白天" },
  { value: "weekday_night", label: "平日/晚上" },
  { value: "weekend_day", label: "周末/白天" },
  { value: "weekend_night", label: "周末/晚上" },
];

const coursesNum = [
  { value: "trial", label: "試教" },
  { value: 1, label: "1堂" },
  { value: 3, label: "3堂" },
  { value: 5, label: "5堂" },
  { value: 10, label: "10堂" },
];

const coinsOptions = [
  { value: 1, label: "1枚" },
  { value: 2, label: "2枚" },
  { value: 3, label: "3枚" },
  { value: 4, label: "4枚" },
  { value: 5, label: "5枚" },
];

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

const initialState = {
  subcategories: [],
  skills: [],
  selectedCategory: null,
  selectedDate: new Date(),
  startOfWeek: new Date(),
  currentMonth: new Date(),
  selectedTimes: {},
};

const actionTypes = {
  SET_SUBCATEGORIES: "SET_SUBCATEGORIES",
  SET_SKILLS: "SET_SKILLS",
  SET_SELECTED_CATEGORY: "SET_SELECTED_CATEGORY",
  SET_SELECTED_DATE: "SET_SELECTED_DATE",
  SET_START_OF_WEEK: "SET_START_OF_WEEK",
  SET_CURRENT_MONTH: "SET_CURRENT_MONTH",
  SET_SELECTED_TIMES: "SET_SELECTED_TIMES",
};

const reducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_SUBCATEGORIES:
      return { ...state, subcategories: action.payload };
    case actionTypes.SET_SKILLS:
      return { ...state, skills: action.payload };
    case actionTypes.SET_SELECTED_CATEGORY:
      return { ...state, selectedCategory: action.payload };
    case actionTypes.SET_SELECTED_DATE:
      return { ...state, selectedDate: action.payload };
    case actionTypes.SET_START_OF_WEEK:
      return { ...state, startOfWeek: action.payload };
    case actionTypes.SET_CURRENT_MONTH:
      return { ...state, currentMonth: action.payload };
    case actionTypes.SET_SELECTED_TIMES:
      return { ...state, selectedTimes: action.payload };
    default:
      return state;
  }
};

function CreatePost() {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm();
  const [state, dispatch] = useReducer(reducer, initialState);

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
    dispatch({
      type: actionTypes.SET_SELECTED_CATEGORY,
      payload: selectedOption,
    });
    dispatch({
      type: actionTypes.SET_SUBCATEGORIES,
      payload: selectedOption ? selectedOption.subcategories : [],
    });
    dispatch({
      type: actionTypes.SET_SKILLS,
      payload: selectedOption ? selectedOption.skills : [],
    });
    setValue("subcategories", []);
    setValue("skills", []);
  };

  // 切換到下一月或前一月
  const handleMonthChange = (direction) => {
    dispatch({
      type: actionTypes.SET_CURRENT_MONTH,
      payload: new Date(
        state.currentMonth.setMonth(state.currentMonth.getMonth() + direction),
      ),
    });
  };

  // 切換到下一周或前一周
  const handleWeekChange = (direction) => {
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
    const options = {
      weekday: "short",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    };
    return date.toLocaleDateString("en-US", options);
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
    dispatch({
      type: actionTypes.SET_SELECTED_TIMES,
      payload: {
        ...state.selectedTimes,
        [dateString]: {
          ...state.selectedTimes[dateString],
          [time]: true,
        },
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
        <a
          key={time}
          className={`mt-1 flex w-full cursor-pointer flex-col px-4 py-1 text-center ${isSelected ? "bg-yellow-400" : ""} ${!isDisabled && !isSelected ? "hover:bg-blue-300" : ""} ${isDisabled ? "cursor-not-allowed opacity-30" : ""}`}
          onClick={() => !isDisabled && handleTimeSlotClick(day, time)}
        >
          {time}
        </a>
      );
    });
  };

  const onSubmit = (data) => console.log(data);
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading categories</div>;

  return (
    <div className="mx-24 mt-[60px] pt-8">
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
              {errors.title && <span>必填</span>}
              <input
                {...register("title", { required: true })}
                className="w-2/5 min-w-96 bg-slate-100 py-2 pl-3 text-base"
                placeholder="請簡短描述你的貼文內容"
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
                    styles={customStyles}
                  />
                )}
              />
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

            <div className="mb-3">
              <div className="mb-3 flex h-10 items-center">
                <label className="mr-12 text-xl">類別</label>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={categories}
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
                    render={({ field }) => (
                      <Select
                        className="w-36 min-w-32"
                        {...field}
                        options={state.subcategories.map((sub) => ({
                          value: sub,
                          label: sub,
                        }))}
                      />
                    )}
                  />
                </div>
              </div>

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
            </div>

            <div className="mb-3 flex items-center">
              <label className="mr-12 text-xl">介紹</label>
              <textarea
                {...register("description", { required: true })}
                className="min-h-24 w-2/5 min-w-96 bg-slate-100 py-2 pl-3 text-base"
                placeholder="介紹一下這則文章的內容吧~"
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
                        value?.length >= 3 && value.length <= 4,
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

              {/* 日期選擇器 */}
              <div className="mb-4 mr-12">
                <div className="mx-2 flex items-center justify-between pb-4">
                  <button onClick={() => handleMonthChange(-1)}>
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
                        d="M15.75 19.5 8.25 12l7.5-7.5"
                      />
                    </svg>
                  </button>
                  <div>{formatDate(state.currentMonth, "MMM yyyy")}</div>
                  <button onClick={() => handleMonthChange(1)}>
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
                        d="m8.25 4.5 7.5 7.5-7.5 7.5"
                      />
                    </svg>
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {["日", "一", "二", "三", "四", "五", "六"].map(
                    (day, index) => (
                      <div key={index} className="text-center font-bold">
                        {day}
                      </div>
                    ),
                  )}
                  {renderCalendar()}
                </div>
                <p className="mx-2 mt-4 text-zinc-400">
                  請選擇從今天起，未來三個月內的可用時間
                </p>
              </div>
              <div className="flex flex-col">
                {/* 切換周的按鈕 */}
                <div className="mx-3 flex items-center justify-between pb-4">
                  <button onClick={() => handleWeekChange(-1)}>
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
                        d="M15.75 19.5 8.25 12l7.5-7.5"
                      />
                    </svg>
                  </button>
                  <div>
                    {formatDate(state.startOfWeek, "MM-dd")} -{" "}
                    {formatDate(
                      new Date(
                        state.startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000,
                      ),
                      "MM-dd",
                    )}
                  </div>
                  <button onClick={() => handleWeekChange(1)}>
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
                        d="m8.25 4.5 7.5 7.5-7.5 7.5"
                      />
                    </svg>
                  </button>
                </div>

                {/* 顯示七天 */}
                <div className="grid grid-cols-7 gap-3">
                  {daysOfWeek.map((day) => (
                    <div
                      key={day}
                      className="text-center font-semibold text-yellow-950"
                    >
                      <div>{formatDate(day, "EEE")}</div> {/* 星期 */}
                      <div>{formatDate(day, "dd")}</div> {/* 日期 */}
                    </div>
                  ))}
                </div>
                {/* 時間段 */}
                <div className="mt-1 grid grid-cols-7 gap-3">
                  {daysOfWeek.map((day) => (
                    <div key={day}>{renderTimeSlots(day)}</div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mb-3 flex h-10 items-center">
              <label className="mr-12 text-xl">介紹影片</label>
              <input
                {...register("introVideo")}
                className="w-2/5 min-w-96 bg-slate-100 py-2 pl-3 text-base"
                placeholder="請提供影片連結"
              />
            </div>

            <div className="mb-3 flex h-10 items-center">
              <label className="mr-12 text-xl">參考教材</label>
              <input
                {...register("referenceMaterial")}
                className="w-2/5 min-w-96 bg-slate-100 py-2 pl-3 text-base"
                placeholder="請提供雲端連結"
              />
            </div>

            <button type="submit">提交</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreatePost;
