import { CaretLineDown, CaretLineUp } from "@phosphor-icons/react";
import PropTypes from "prop-types";
import { useContext, useEffect, useState } from "react";
import Select from "react-select";
import { ViewContext } from "../../context/viewContext";
import { locations, timePreferences } from "../CreatePost/options";

const customStyles = {
  control: (provided, state) => ({
    ...provided,
    fontSize: "16px",
    padding: " 2px 0",
    borderRadius: "0.375rem",
    borderColor: state.isFocused && "#bfaa87",
    boxShadow: state.isFocused && "#bfaa87",
    "&:hover": {
      borderColor: state.isFocused && "#bfaa87",
    },
  }),
  multiValue: (provided) => {
    const isMobile = window.innerWidth < 768;
    return {
      ...provided,
      fontSize: isMobile ? "14px" : "16px",
      backgroundColor: "#c2e4f5",
      borderRadius: "0.375rem",
      marginRight: isMobile ? "8px" : "12px",
    };
  },
  multiValueLabel: (provided) => {
    const isMobile = window.innerWidth < 768;
    return {
      ...provided,
      fontSize: isMobile ? "14px" : "16px",
      paddingLeft: "8px",
      paddingRight: "0",
    };
  },
  multiValueRemove: (provided) => ({
    ...provided,
    fontSize: "14px",
    padding: "0 6px",
    borderRadius: "0.375rem",
    ":hover": { backgroundColor: "#8cd0ed" },
  }),
};

function Filter({ categories, selectedCategory, onFilterChange }) {
  const { findTeachersView } = useContext(ViewContext);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [selectedTimePreferences, setSelectedTimePreferences] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };

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

  useEffect(() => {
    onFilterChange({
      subcategories: [],
      timePreferences: [],
      locations: [],
    });
    setSelectedSubcategories([]);
    setSelectedTimePreferences([]);
    setSelectedLocations([]);
  }, [onFilterChange, findTeachersView]);

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
              className="max-w-72 rounded-md"
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
          <Select
            placeholder="請選擇偏好的時間"
            options={timePreferences}
            isMulti
            className="min-w-52 max-w-72 rounded-md"
            styles={customStyles}
            onChange={(selectedOptions) => {
              setSelectedTimePreferences(
                selectedOptions.map((option) => option.label),
              );
            }}
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
          <Select
            placeholder="線上, 台北市..."
            options={locations}
            isMulti
            className="min-w-52 rounded-md"
            styles={customStyles}
            onChange={(selectedOptions) => {
              setSelectedLocations(
                selectedOptions.map((option) => option.label),
              );
            }}
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
          <Select
            placeholder="線上, 台北市..."
            options={locations}
            isMulti
            className="min-w-52 rounded-md"
            styles={customStyles}
            onChange={(selectedOptions) => {
              setSelectedLocations(
                selectedOptions.map((option) => option.label),
              );
            }}
          />
        </div>
      </div>
    </div>
  );
}

Filter.propTypes = {
  categories: PropTypes.arrayOf(PropTypes.object),
  selectedCategory: PropTypes.string,
  onFilterChange: PropTypes.func.isRequired,
};
export default Filter;
