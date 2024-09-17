import PropTypes from "prop-types";
import coin from "./coin.svg";

const CourseSelection = ({ post }) => {
  const order = ["試教", "1", "3", "5", "10"];
  const sortedCourseNum = post.course_num.sort((a, b) => {
    return order.indexOf(a) - order.indexOf(b);
  });

  const getDisplayText = (num) => {
    switch (num) {
      case "試教":
        return "試教 / 25分鐘";
      case "1":
        return "1 堂 / 50分鐘";
      case "3":
        return "3 堂 / 50分鐘";
      case "5":
        return "5 堂 / 550分鐘";
      case "10":
        return "10 堂 / 50分鐘";
      default:
        return `${num} 堂 / 未知時間`;
    }
  };

  return (
    <div className="mt-8 w-5/6">
      <h1 className="mb-4 text-center text-2xl">上課需求</h1>
      <div className="flex justify-between gap-6">
        {sortedCourseNum.map((num, index) => {
          const coinCost =
            num === "試教" ? 1 : post.coin_cost * parseInt(num, 10);
          return (
            <div
              key={index}
              className="card flex w-1/4 flex-wrap items-center justify-center gap-3 rounded-md p-4 shadow-md"
            >
              <img src={coin} alt="coin" className="size-16 object-cover" />
              <p className="text-xl">x</p>
              <p className="text-3xl font-bold text-yellow-900">{coinCost}</p>
              <p className="w-full text-center">{getDisplayText(num)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
CourseSelection.propTypes = {
  post: PropTypes.shape({
    coin_cost: PropTypes.number.isRequired,
    course_num: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
};

export default CourseSelection;
