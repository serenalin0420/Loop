import PropTypes from "prop-types";
// import StarRating from "../../components/StarRating";
import { Heart, BookBookmark } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { useState } from "react";

const Introduction = ({ post, author }) => {
  const [bookmarkWeight, setBookmarkWeight] = useState("regular");

  const handleSendMessageClick = (postAuthourId) => {
    window.open(`/chat/${postAuthourId}`, "_blank");
  };
  console.log(author);

  return (
    <div className="rounded-lg p-4 shadow-md">
      <div className="flex items-center gap-2">
        <img
          src={author.profile_picture}
          className="size-20 rounded-full border-white bg-red-100 object-cover object-center p-1 shadow-md"
          alt="author"
        />
        <div className="flex flex-col gap-1">
          <h3 className="flex items-center gap-3 text-lg">
            {author.name}
            {/* <StarRating rating={author.review_rating} /> */}
          </h3>
          <h4 className="text-lg font-semibold">{post.title}</h4>
        </div>
        <Link
          to={`/learning-portfolio/${author.uid}`}
          className="ml-auto flex p-1"
        >
          <span className="flex items-center gap-1 rounded-full bg-sun-100 px-3 py-2 text-sm text-sun-900 hover:bg-sun-200 active:bg-sun-200">
            <BookBookmark
              className="size-5"
              weight={bookmarkWeight}
              onMouseEnter={() => setBookmarkWeight("fill")}
              onMouseLeave={() => setBookmarkWeight("regular")}
            />
            學習歷程表
          </span>
        </Link>
        <button
          className="mr-2 rounded-full bg-sun-400 px-4 py-2 text-sm text-white hover:bg-sun-500 active:bg-sun-500"
          onClick={(e) => {
            e.preventDefault();
            handleSendMessageClick(author.uid);
          }}
        >
          傳送訊息
        </button>

        <div className="flex size-10 items-center justify-center">
          <Heart className="size-8" color="#FF8964" weight="bold" />
        </div>
      </div>

      <div className="mb-4 ml-6 mt-2 flex items-center">
        <h3 className="mr-11">類別 </h3>
        {(post.subcategories ?? []).map((sub, index) => (
          <p key={index} className="mr-3 rounded-md bg-cerulean-100 px-3 py-1">
            {sub}
          </p>
        ))}
      </div>

      {post.type !== "發起學習" && (
        <div className="mb-4 ml-6 mt-2 flex items-center">
          <h3 className="mr-11">專長 </h3>
          {(post.skills ?? []).map((skill, index) => (
            <p
              key={index}
              className="mr-3 rounded-md bg-cerulean-100 px-3 py-1"
            >
              {skill}
            </p>
          ))}
        </div>
      )}
      <div className="mb-4 ml-6 mt-2 flex items-center">
        <h3 className="mr-3">時間偏好 </h3>
        {(post.time_preference ?? []).map((time, index) => (
          <p key={index} className="mr-3 rounded-md bg-cerulean-100 px-3 py-1">
            {time}
          </p>
        ))}
      </div>
      <div className="mb-4 ml-6 mt-2 flex items-center">
        <h3 className="mr-11">地點 </h3>
        {(post.location ?? []).map((location, index) => (
          <p key={index} className="mr-3 rounded-md bg-cerulean-100 px-3 py-1">
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
    subcategories: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  author: PropTypes.shape({
    name: PropTypes.string,
    profile_picture: PropTypes.string,
    review_rating: PropTypes.number,
    uid: PropTypes.string,
    // saved_posts: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
};

export default Introduction;
