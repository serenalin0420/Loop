import PropTypes from "prop-types";
import StarRating from "../../components/StarRating";

const Introduction = ({ post, category, author }) => {
  return (
    <div className="rounded-lg p-4 shadow-md">
      <div className="flex items-center gap-2">
        <img
          src={author.profile_picture}
          className="size-20 rounded-full border-white bg-red-100 object-cover object-center p-1 shadow-md"
          alt="author"
        />
        <div className="flex flex-col gap-2">
          <h3 className="inline-flex items-center gap-6 text-base">
            {author.name}
            <StarRating rating={author.review_rating} />
          </h3>

          <h4 className="font-semibold">{post.title}</h4>
        </div>
      </div>

      <div className="mb-4 ml-6 mt-2 flex items-center">
        <h3 className="mr-11">類別 </h3>
        <p className="mr-3 rounded-md bg-slate-200 px-3 py-1">{category}</p>
        <p className="rounded-md bg-slate-200 px-3 py-1">
          {post.subcategories}
        </p>
      </div>

      {post.type !== "發起學習" && (
        <div className="mb-4 ml-6 mt-2 flex items-center">
          <h3 className="mr-11">專長 </h3>
          {(post.skills ?? []).map((skill, index) => (
            <p key={index} className="mr-3 rounded-md bg-slate-200 px-3 py-1">
              {skill}
            </p>
          ))}
        </div>
      )}
      <div className="mb-4 ml-6 mt-2 flex items-center">
        <h3 className="mr-3">時間偏好 </h3>
        {(post.time_preference ?? []).map((time, index) => (
          <p key={index} className="mr-3 rounded-md bg-slate-200 px-3 py-1">
            {time}
          </p>
        ))}
      </div>
      <div className="mb-4 ml-6 mt-2 flex items-center">
        <h3 className="mr-11">地點 </h3>
        {(post.location ?? []).map((location, index) => (
          <p key={index} className="mr-3 rounded-md bg-slate-200 px-3 py-1">
            {location}
          </p>
        ))}
      </div>
      <div className="mb-4 ml-6 mt-2 flex items-center">
        <h3 className="mr-11 text-nowrap">介紹 </h3>
        <p>{post.description}</p>
      </div>
    </div>
  );
};

Introduction.propTypes = {
  post: PropTypes.shape({
    title: PropTypes.string.isRequired,
    skills: PropTypes.arrayOf(PropTypes.string),
    time_preference: PropTypes.arrayOf(PropTypes.string),
    location: PropTypes.arrayOf(PropTypes.string),
    description: PropTypes.string,
    type: PropTypes.oneOf(["發起學習", "發布教學"]).isRequired,
    subcategories: PropTypes.string,
  }).isRequired,
  category: PropTypes.string.isRequired,
  author: PropTypes.shape({
    name: PropTypes.string,
    profile_picture: PropTypes.string,
    review_rating: PropTypes.number,
  }).isRequired,
};

export default Introduction;
