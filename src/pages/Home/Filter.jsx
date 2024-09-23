import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import dbApi from "../../utils/api";
import { locations, timePreferences } from "../CreatePost/options";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";

function Filter({ selectedCategory }) {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const { control } = useForm();

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
      //   console.log(category.subcategories);
      if (category) {
        setSubcategories(category.subcategories || []);
      } else {
        setSubcategories([]);
      }
    } else {
      setSubcategories([]);
    }
  }, [selectedCategory, categories]);

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
      <div className="flex items-center px-6 pt-5">
        {subcategories.length > 0 && (
          <h3 className="mr-8 font-semibold">類別</h3>
        )}
        {subcategories.length > 0 &&
          subcategories.map((subcategory) => (
            <div
              key={subcategory.id}
              className="mr-3 rounded-md bg-slate-100 px-3 py-1"
            >
              {subcategory}
            </div>
          ))}
      </div>
      <div className="flex items-center px-6 pt-6">
        <h3 className="mr-8 font-semibold">時間</h3>
        {timePreferences &&
          timePreferences.map((time) => (
            <div key={time} className="mr-3 rounded-md bg-slate-100 px-3 py-1">
              {time.label}
            </div>
          ))}
      </div>
      <div className="flex items-center px-6 py-6">
        <h3 className="mr-5 font-semibold">
          地點
          <br />
          <p className="text-sm text-zinc-400">可多選</p>
        </h3>

        <Controller
          name="location"
          control={control}
          defaultValue={locations[0]}
          render={({ field }) => (
            <Select
              {...field}
              options={locations}
              isMulti
              className="min-w-36 rounded-md"
              styles={customStyles}
            />
          )}
        />
      </div>
    </div>
  );
}

Filter.propTypes = {
  selectedCategory: PropTypes.string,
};
export default Filter;
