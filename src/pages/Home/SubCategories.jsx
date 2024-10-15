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

function SubCategories({ categories, onCategoryClick }) {
  const [selectedCategory, setSelectedCategory] = useState("全部");

  const sortedCategories = categories.sort(
    (a, b) =>
      categoriesWithIcons.findIndex((cat) => cat.name === a.name) -
      categoriesWithIcons.findIndex((cat) => cat.name === b.name),
  );

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    onCategoryClick(category);
  };

  return (
    <div className="flex w-full items-center gap-3 rounded-lg p-2 sm:mt-8 sm:flex-col sm:gap-2 sm:p-4 sm:px-0 sm:shadow-md">
      <h2 className="text-nowrap text-center font-bold text-textcolor md:text-lg">
        學習分類
      </h2>
      <div className="flex w-full items-center gap-2 overflow-x-auto sm:flex-col">
        <div
          className={`flex w-full cursor-pointer items-center gap-4 text-nowrap rounded-full px-3 py-[6px] text-sm text-indian-khaki-700 sm:rounded-none sm:px-6 sm:py-1 md:text-base xl:px-10 ${
            selectedCategory === "全部" ? "bg-stone-200 font-bold" : ""
          }`}
          onClick={() => handleCategoryClick("全部")}
        >
          <div className="hidden rounded-full bg-stone-100 p-2 sm:block">
            <Infinity
              className="size-6 text-indian-khaki-700"
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
              className={`flex w-full cursor-pointer items-center gap-4 text-nowrap rounded-full px-3 py-[6px] text-sm text-indian-khaki-700 sm:rounded-none sm:px-6 sm:py-1 md:text-base xl:px-10 ${
                selectedCategory === category.id ? "bg-stone-200 font-bold" : ""
              }`}
              onClick={() => handleCategoryClick(category.id)}
            >
              <div className="hidden rounded-full bg-stone-100 p-2 sm:block">
                <IconComponent
                  className="size-6 text-indian-khaki-700"
                  weight={selectedCategory === category.id ? "fill" : "regular"}
                />
              </div>
              {category.name}
            </div>
          );
        })}
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
