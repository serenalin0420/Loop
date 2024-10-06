import PropTypes from "prop-types";
import {
  Translate,
  FileJs,
  Camera,
  PaintBrush,
  Racquet,
  CookingPot,
  CurrencyCircleDollar,
  MusicNotes,
  GameController,
  StarOfDavid,
  DotsThree,
  Infinity,
} from "@phosphor-icons/react";
import { useState } from "react";
import Select from "react-select";

function SubCategories({ categories, onCategoryClick }) {
  const [selectedCategory, setSelectedCategory] = useState("全部");

  const categoriesWithIcons = [
    {
      name: "語言",
      icon: Translate,
    },
    {
      name: "程式語言",
      icon: FileJs,
    },
    {
      name: "攝影剪輯",
      icon: Camera,
    },
    {
      name: "美術設計",
      icon: PaintBrush,
    },
    {
      name: "運動健身",
      icon: Racquet,
    },
    {
      name: "料理烘焙",
      icon: CookingPot,
    },
    {
      name: "投資理財",
      icon: CurrencyCircleDollar,
    },
    {
      name: "音樂",
      icon: MusicNotes,
    },
    {
      name: "遊戲",
      icon: GameController,
    },
    {
      name: "魔法",
      icon: StarOfDavid,
    },
    {
      name: "其他",
      icon: DotsThree,
    },
  ];

  const sortedCategories = categories.sort(
    (a, b) =>
      categoriesWithIcons.findIndex((cat) => cat.name === a.name) -
      categoriesWithIcons.findIndex((cat) => cat.name === b.name),
  );

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    onCategoryClick(category);
  };

  const options = [
    { value: "全部", label: "全部" },
    ...sortedCategories.map((category) => ({
      value: category.id,
      label: category.name,
    })),
  ];

  const handleChange = (selectedOption) => {
    if (selectedOption) {
      handleCategoryClick(selectedOption.value);
    }
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
    option: (provided, state) => ({
      ...provided,
      fontSize: "16px", // 選項的文字大小
      backgroundColor: state.isSelected
        ? "#e1dac7"
        : state.isFocused && "#f1ede3",

      color: state.isSelected ? "#262626" : "#525252",
      ":active": {
        backgroundColor: "#e1dac7",
      },
    }),
  };

  return (
    <div className="flex w-full items-center gap-3 rounded-lg p-2 sm:mt-8 sm:flex-col sm:gap-2 sm:p-4 sm:px-0 sm:shadow-md">
      <h2 className="text-center font-bold text-textcolor md:text-lg">
        學習分類
      </h2>
      <div className="hidden w-full flex-col items-center gap-2 sm:flex">
        <div
          className={`text-indian-khaki-700 flex w-full cursor-pointer items-center gap-4 px-6 py-1 text-sm md:text-base xl:px-10 ${
            selectedCategory === "全部" ? "bg-stone-200 font-bold" : ""
          }`}
          onClick={() => handleCategoryClick("全部")}
        >
          <div className="rounded-full bg-stone-100 p-2">
            <Infinity
              className="text-indian-khaki-700 size-6"
              weight={selectedCategory === "全部" ? "bold" : "regular"}
            />
          </div>
          全部
        </div>
        {sortedCategories.map((category) => {
          const categoryWithIcon = categoriesWithIcons.find(
            (cat) => cat.name === category.name,
          );
          const IconComponent = categoryWithIcon.icon;
          return (
            <div
              key={category.id}
              className={`text-indian-khaki-700 flex w-full cursor-pointer items-center gap-4 px-6 py-1 text-sm md:text-base xl:px-10 ${
                selectedCategory === category.id ? "bg-stone-200 font-bold" : ""
              }`}
              onClick={() => handleCategoryClick(category.id)}
            >
              <div className="rounded-full bg-stone-100 p-2">
                <IconComponent
                  className="text-indian-khaki-700 size-6"
                  weight={selectedCategory === category.id ? "fill" : "regular"}
                />
              </div>
              {category.name}
            </div>
          );
        })}
      </div>
      <div className="sm:hidden">
        <Select
          options={options}
          onChange={handleChange}
          className="min-w-32"
          placeholder="請選擇分類"
          styles={customStyles}
        />
      </div>
    </div>
  );
}

SubCategories.propTypes = {
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    }),
  ).isRequired,
  onCategoryClick: PropTypes.func.isRequired,
};

export default SubCategories;
