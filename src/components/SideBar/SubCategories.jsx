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
    { name: "語言", icon: <Translate className="size-6" /> },
    { name: "程式語言", icon: <FileJs className="size-6" /> },
    { name: "攝影剪輯", icon: <Camera className="size-6" /> },
    { name: "美術設計", icon: <PaintBrush className="size-6" /> },
    { name: "運動健身", icon: <Racquet className="size-6" /> },
    { name: "料理烘焙", icon: <CookingPot className="size-6" /> },
    { name: "投資理財", icon: <CurrencyCircleDollar className="size-6" /> },
    { name: "音樂", icon: <MusicNotes className="size-6" /> },
    { name: "遊戲", icon: <GameController className="size-6" /> },
    { name: "魔法", icon: <StarOfDavid className="size-6" /> },
    { name: "其他", icon: <DotsThree className="size-6" /> },
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
    <div className="mt-8 flex flex-col items-center gap-2 rounded-lg py-4 shadow-md">
      <h2 className="text-center text-lg font-bold">學習分類</h2>
      <div
        className={`flex w-full items-center gap-4 px-10 py-1 ${selectedCategory === "全部" ? "bg-slate-200" : ""}`}
        onClick={() => handleCategoryClick("全部")}
      >
        <div className="rounded-full bg-slate-100 p-2">
          <Infinity className="size-6" />
        </div>
        全部
      </div>
      {sortedCategories.map((category) => {
        const categoryWithIcon = categoriesWithIcons.find(
          (cat) => cat.name === category.name,
        );
        return (
          <div
            key={category.id}
            className={`flex w-full items-center gap-4 px-10 py-1 ${selectedCategory === category.id ? "bg-slate-200" : ""}`}
            onClick={() => handleCategoryClick(category.id)}
          >
            <div className="rounded-full bg-slate-100 p-2">
              {categoryWithIcon.icon}
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
