import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { Calendar } from "@/components/ui/calendar";
import { useQuery } from "@tanstack/react-query";
import dbApi from "../../utils/api";
import { useState } from "react";

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

const coinsOptions = [
  { value: "trial", label: "試教" },
  { value: 1, label: "1堂" },
  { value: 3, label: "3堂" },
  { value: 5, label: "5堂" },
  { value: 10, label: "10堂" },
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

function CreatePost() {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm();

  const [subcategories, setSubcategories] = useState([]);
  const [skills, setSkills] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState();

  const {
    data: categories,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: dbApi.getCategories,
  });

  const handleCategoryChange = (selectedOption) => {
    setSelectedCategory(selectedOption);
    setSubcategories(selectedOption ? selectedOption.subcategories : []);
    setSkills(selectedOption ? selectedOption.skills : []);
    setValue("subcategories", []);
    setValue("skills", []);
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
                        options={subcategories.map((sub) => ({
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
                      options={skills?.map((skill) => ({
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
              <label className="mr-11 text-xl">介紹</label>
              <textarea
                {...register("description", { required: true })}
                className="w-2/5 min-w-96 bg-slate-100 py-2 pl-3 text-base"
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

              <div className="mb-6 mt-3 flex h-10 items-center">
                <label className="mr-2 text-xl">課程次數</label>
                <div className="flex flex-col">
                  <Controller
                    name="coinsOptions"
                    control={control}
                    rules={{
                      validate: (value) =>
                        value.length >= 3 && value.length <= 4,
                    }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={coinsOptions}
                        isMulti
                        components={makeAnimated()}
                        className="basic-multi-select min-w-60"
                        classNamePrefix="select"
                        styles={customStyles}
                      />
                    )}
                  />
                  {errors.coinsOptions && (
                    <span className="mt-1 text-sm text-red-400">
                      請至少選擇三個次課程，最多四次
                    </span>
                  )}
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
