import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import dbApi from "../../utils/api";
import { locations, timePreferences } from "../CreatePost/options";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";

function Filter({ selectedCategory, onFilterChange }) {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const { control } = useForm();
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [selectedTimePreferences, setSelectedTimePreferences] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);

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
    control: (provided) => ({
      ...provided,
      fontSize: "16px", // 控制框的文字大小
      padding: " 2px 0",
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

  return (
    <div className="mx-4 rounded-lg shadow-md">
      {subcategories.length > 0 && (
        <div className="flex items-center px-6 pt-5">
          <h3 className="mr-6 font-semibold">類別</h3>
          {subcategories.length > 0 &&
            subcategories.map((subcategory, index) => (
              <div
                key={index}
                className={`mr-3 cursor-pointer rounded-md px-3 py-1 ${
                  selectedSubcategories.includes(subcategory)
                    ? "bg-blue-200"
                    : "bg-slate-100"
                }`}
                onClick={() => {
                  console.log("Clicked subcategory:", subcategory);
                  handleSubcategoryChange(subcategory);
                }}
              >
                {subcategory}
              </div>
            ))}
        </div>
      )}
      <div className="flex items-center px-6 pt-6">
        <h3 className="mr-6 font-semibold">時間</h3>
        {timePreferences &&
          timePreferences.map((time) => (
            <div
              key={time.value}
              className={`mr-3 cursor-pointer rounded-md px-3 py-1 ${
                selectedTimePreferences.includes(time.label)
                  ? "bg-blue-200"
                  : "bg-slate-100"
              }`}
              onClick={() => handleTimePreferenceChange(time.label)}
            >
              {time.label}
            </div>
          ))}
      </div>
      <div className="flex items-center px-6 py-6">
        <h3 className="mr-6 font-semibold">地點</h3>
        <Controller
          name="location"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              options={locations}
              isMulti
              className="min-w-36 rounded-md"
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
  );
}

Filter.propTypes = {
  selectedCategory: PropTypes.string,
  onFilterChange: PropTypes.func.isRequired,
};
export default Filter;
