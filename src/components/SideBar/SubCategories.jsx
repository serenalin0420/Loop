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

  return (
    <div className="mt-8 flex aspect-auto flex-col items-center gap-2 rounded-lg py-4 shadow-md">
      <h2 className="text-center text-lg font-bold text-textcolor">學習分類</h2>
      <div
        className={`flex w-full cursor-pointer items-center gap-4 px-10 py-1 ${
          selectedCategory === "全部" ? "bg-stone-200" : ""
        }`}
        onClick={() => handleCategoryClick("全部")}
      >
        <div className="rounded-full bg-stone-100 p-2">
          <Infinity
            className="size-6 text-icon"
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
            className={`flex w-full cursor-pointer items-center gap-4 px-10 py-1 ${
              selectedCategory === category.id ? "bg-stone-200" : ""
            }`}
            onClick={() => handleCategoryClick(category.id)}
          >
            <div className="rounded-full bg-stone-100 p-2">
              <IconComponent
                className="size-6 text-icon"
                weight={selectedCategory === category.id ? "fill" : "regular"}
              />
            </div>
            {category.name}
          </div>
        );
      })}
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
