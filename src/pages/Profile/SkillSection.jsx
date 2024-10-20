import PropTypes from "prop-types";
import Select from "react-select";
import { sortCategories } from "../CreatePost/options";

const sortCategoriesFn = (categories) => {
  const categoryOrder = sortCategories.reduce((acc, category, index) => {
    acc[category] = index;
    return acc;
  }, {});

  return categories.sort((a, b) => {
    return categoryOrder[a.name] - categoryOrder[b.name];
  });
};

const mapCategoriesToOptions = (categories) => {
  const sortedCategories = sortCategoriesFn(categories);
  return sortedCategories.map((category) => ({
    label: category.name,
    value: category.name,
  }));
};
const customStyles = {
  control: (provided, state) => ({
    ...provided,
    fontSize: "16px",
    padding: " 2px 0",
    borderRadius: "0.375rem",
    borderColor: state.isFocused && "#8cd0ed",
    boxShadow: state.isFocused && "#8cd0ed",
    "&:hover": {
      borderColor: state.isFocused && "#8cd0ed",
    },
  }),
  option: (provided, state) => ({
    ...provided,
    fontSize: "16px",
    backgroundColor: state.isSelected
      ? "#c2e4f5"
      : state.isFocused && "#e4f1fa",

    color: state.isSelected ? "#262626" : "#525252",
    ":active": {
      backgroundColor: "#c2e4f5",
    },
  }),
};

const SkillSection = ({
  skills,
  categories,
  isEditing,
  handleSkillChange,
  removeSkill,
  addSkill,
}) => {
  return (
    <>
      <h3 className="max-w-max rounded-r-lg bg-indian-khaki-400 px-4 py-2 text-center tracking-wider text-white">
        技能
      </h3>
      {isEditing ? (
        <div className="mt-4 flex flex-col items-center gap-y-2">
          {skills.map((skill, index) => (
            <div key={index} className="flex w-full items-center gap-3 px-6">
              <Select
                name="category_name"
                placeholder="類別"
                value={mapCategoriesToOptions(categories).find(
                  (option) => option.value === skill.category_name,
                )}
                onChange={(selectedOption) =>
                  handleSkillChange(index, selectedOption)
                }
                options={mapCategoriesToOptions(categories)}
                className="w-7/12 rounded-md"
                styles={customStyles}
              />
              <input
                name="skills"
                value={skill.skills}
                onChange={(e) => handleSkillChange(index, e)}
                className="w-full rounded-md bg-cerulean-100 px-3 py-2"
              />
              <button
                onClick={() => removeSkill(index)}
                className="text-nowrap rounded bg-stone-200 px-2 py-2 text-sm text-stone-500"
              >
                刪除
              </button>
            </div>
          ))}
          <button
            onClick={addSkill}
            className="mb-4 mt-2 max-w-max rounded-full bg-indian-khaki-400 px-4 py-2 text-sm text-white shadow"
          >
            新增技能
          </button>
        </div>
      ) : (
        <div className="mb-6">
          {skills.map((skill, index) => (
            <div
              key={index}
              className="mx-6 mt-4 flex flex-col gap-1 rounded-md md:flex-row md:items-center md:gap-3"
            >
              <p className="max-w-max text-nowrap rounded-md bg-cerulean-100 px-3 py-1">
                {skill.category_name}
              </p>
              <p className="ml-4 md:ml-0">- {skill.skills}</p>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

SkillSection.propTypes = {
  skills: PropTypes.arrayOf(PropTypes.object),
  categories: PropTypes.array.isRequired,
  isEditing: PropTypes.bool.isRequired,
  handleSkillChange: PropTypes.func.isRequired,
  addSkill: PropTypes.func.isRequired,
  removeSkill: PropTypes.func.isRequired,
};

export default SkillSection;
