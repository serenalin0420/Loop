import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import dbApi from "../../utils/api";
import { locations, timePreferences } from "../CreatePost/options";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import { CaretLineDown, CaretLineUp } from "@phosphor-icons/react";

function Filter({ selectedCategory, onFilterChange }) {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const { control } = useForm();
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [selectedTimePreferences, setSelectedTimePreferences] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetchedCategories = await dbApi.getCategories();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      const category = categories.find((cat) => cat.id === selectedCategory);
      if (category) {
        setSubcategories(category.subcategories || []);
      } else {
        setSubcategories([]);
      }
    } else {
      setSubcategories([]);
    }
  }, [selectedCategory, categories]);

  useEffect(() => {
    onFilterChange({
      subcategories: selectedSubcategories,
      timePreferences: selectedTimePreferences,
      locations: selectedLocations,
    });
  }, [
    selectedSubcategories,
    selectedTimePreferences,
    selectedLocations,
    onFilterChange,
  ]);

  const handleSubcategoryChange = (subcategory) => {
    setSelectedSubcategories((prev) =>
      prev.includes(subcategory)
        ? prev.filter((item) => item !== subcategory)
        : [...prev, subcategory],
    );
  };

  const handleTimePreferenceChange = (timePreference) => {
    setSelectedTimePreferences((prev) =>
      prev.includes(timePreference)
        ? prev.filter((item) => item !== timePreference)
        : [...prev, timePreference],
    );
  };
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      fontSize: "16px", // 控制框的文字大小
      padding: " 2px 0",
      borderRadius: "0.375rem",
      borderColor: state.isFocused && "#bfaa87",
      boxShadow: state.isFocused && "#bfaa87",
      "&:hover": {
        borderColor: state.isFocused && "#bfaa87",
      },
    }),
    option: (provided) => ({
      ...provided,
      fontSize: "16px", // 選項的文字大小
    }),
    multiValue: (provided) => {
      const isMobile = window.innerWidth < 768;
      return {
        ...provided,
        fontSize: "16px", // 多選值的文字大小
        backgroundColor: "#c2e4f5",
        borderRadius: "0.375rem",
        marginRight: isMobile ? "8px" : "12px",
      };
    },
    multiValueLabel: (provided) => ({
      ...provided,
      fontSize: "16px", // 多選值標籤的文字大小
      paddingLeft: "10px",
      paddingRight: "0",
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      fontSize: "16px", // 多選值刪除按鈕的文字大小
      padding: "0 8px",
      borderRadius: "0.375rem",
      ":hover": { backgroundColor: "#8cd0ed" },
    }),
  };

  return (
    <div className="relative mx-4 mr-4 rounded-lg p-2 shadow sm:px-0 sm:shadow-md md:ml-6 md:p-0 lg:mr-8">
      {isDropdownVisible ? (
        ""
      ) : (
        <h2 className="text-nowrap font-semibold text-textcolor sm:pl-4 md:hidden">
          篩選 : 子類別、時間、地點
        </h2>
      )}
      <span
        className="absolute right-4 top-2 ml-auto flex max-w-max cursor-pointer items-center px-2 text-sm text-indian-khaki-700 md:hidden"
        onClick={toggleDropdown}
      >
        {isDropdownVisible ? "收起" : "打開"}
        {isDropdownVisible ? (
          <CaretLineUp className="ml-2 size-6 text-indian-khaki-700" />
        ) : (
          <CaretLineDown className="ml-2 size-6 text-indian-khaki-700" />
        )}
      </span>

      {subcategories.length > 0 && (
        <div
          className={`flex items-center sm:px-6 md:pt-6 ${isDropdownVisible ? "pl-2 pt-4" : "p-0"}`}
        >
          <h3 className="mr-3 hidden text-nowrap font-semibold md:inline lg:mr-6">
            類別
          </h3>
          <div
            className={`hidden w-full md:flex md:flex-wrap md:gap-y-2 ${isDropdownVisible ? "block" : "hidden"}`}
          >
            {subcategories.length > 0 &&
              subcategories.map((subcategory, index) => (
                <span
                  key={index}
                  className={`mr-3 cursor-pointer text-nowrap rounded-md px-3 py-1 ${
                    selectedSubcategories.includes(subcategory)
                      ? "bg-cerulean-200"
                      : "bg-cerulean-100"
                  }`}
                  onClick={() => {
                    console.log("Clicked subcategory:", subcategory);
                    handleSubcategoryChange(subcategory);
                  }}
                >
                  {subcategory}
                </span>
              ))}
          </div>
          <div
            className={`flex w-full items-center md:hidden ${isDropdownVisible ? "block" : "hidden"}`}
          >
            <h3
              className={`mr-3 text-nowrap font-semibold md:hidden ${isDropdownVisible ? "block" : "hidden"}`}
            >
              類別
            </h3>
            <Select
              options={subcategories.map((subcategory) => ({
                value: subcategory,
                label: subcategory,
              }))}
              isMulti
              placeholder="請選擇子類別"
              className="rounded-md"
              styles={customStyles}
              onChange={(selectedOptions) => {
                setSelectedSubcategories(
                  selectedOptions.map((option) => option.value),
                );
              }}
              value={selectedSubcategories.map((subcategory) => ({
                value: subcategory,
                label: subcategory,
              }))}
            />
          </div>
        </div>
      )}
      <div
        className={`flex items-center sm:px-6 md:pt-6 ${isDropdownVisible ? "pl-2 pt-2" : "p-0"}`}
      >
        <h3 className="mr-3 hidden text-nowrap font-semibold text-textcolor md:inline lg:mr-6">
          時間
        </h3>
        <div className="hidden w-full md:flex md:flex-wrap md:gap-y-2">
          {timePreferences &&
            timePreferences.map((time) => (
              <span
                key={time.value}
                className={`mr-3 cursor-pointer text-nowrap rounded-md px-3 py-1 ${
                  selectedTimePreferences.includes(time.label)
                    ? "bg-cerulean-200"
                    : "bg-cerulean-100"
                }`}
                onClick={() => handleTimePreferenceChange(time.label)}
              >
                {time.label}
              </span>
            ))}
        </div>

        <div
          className={`flex w-full items-center md:hidden ${isDropdownVisible ? "block" : "hidden"}`}
        >
          <h3
            className={`mr-3 text-nowrap font-semibold md:hidden ${isDropdownVisible ? "block" : "hidden"}`}
          >
            時間
          </h3>
          <Controller
            name="timePreferences"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                placeholder="請選擇偏好的時間"
                options={timePreferences}
                isMulti
                className="rounded-md"
                styles={customStyles}
                onChange={(selectedOptions) => {
                  field.onChange(selectedOptions);
                  setSelectedTimePreferences(
                    selectedOptions.map((option) => option.label),
                  );
                }}
              />
            )}
          />
        </div>
      </div>
      <div
        className={`flex items-center gap-y-2 sm:px-6 md:py-6 ${isDropdownVisible ? "pb-4 pl-2 pt-2" : "p-0"}`}
      >
        <h3 className="mr-3 hidden text-nowrap font-semibold text-textcolor md:inline lg:mr-6">
          地點
        </h3>
        <div className="hidden w-full md:flex md:flex-wrap md:gap-y-2">
          <Controller
            name="location"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                placeholder="線上, 台北市..."
                options={locations}
                isMulti
                className="min-w-52 rounded-md"
                styles={customStyles}
                onChange={(selectedOptions) => {
                  field.onChange(selectedOptions);
                  setSelectedLocations(
                    selectedOptions.map((option) => option.label),
                  );
                }}
              />
            )}
          />
        </div>

        <div
          className={`flex w-full items-center md:hidden ${
            isDropdownVisible ? "block" : "hidden"
          }`}
        >
          <h3
            className={`mr-3 text-nowrap font-semibold md:hidden ${
              isDropdownVisible ? "block" : "hidden"
            }`}
          >
            地點
          </h3>
          <Controller
            name="location"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                placeholder="線上, 台北市..."
                options={locations}
                isMulti
                className="min-w-52 rounded-md"
                styles={customStyles}
                onChange={(selectedOptions) => {
                  field.onChange(selectedOptions);
                  setSelectedLocations(
                    selectedOptions.map((option) => option.label),
                  );
                }}
              />
            )}
          />
        </div>
      </div>
    </div>
  );
}

Filter.propTypes = {
  selectedCategory: PropTypes.string,
  onFilterChange: PropTypes.func.isRequired,
};
export default Filter;
