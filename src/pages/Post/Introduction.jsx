import PropTypes from "prop-types";
import { Heart, BookBookmark, ChatCircleDots } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { useState, useContext, useEffect, useCallback } from "react";
import { UserContext } from "../../context/UserContext";
import dbApi from "../../utils/api";

const Introduction = ({ post, author }) => {
  const user = useContext(UserContext);
  const [bookmarkWeight, setBookmarkWeight] = useState("regular");
  const [chatWeight, setChatWeight] = useState("regular");
  const [savedPost, setSavedPost] = useState([]);

  const videoUrl = post.video_url;
  const getYouTubeVideoId = (url) => {
    if (url !== undefined) {
      const regExp =
        /(?:youtube\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
      const match = url.match(regExp);
      return match && match[1] ? match[1] : null;
    }
    return null;
  };

  const videoId = getYouTubeVideoId(videoUrl);
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : "";

  useEffect(() => {
    const fetchSavedPosts = async () => {
      try {
        if (user) {
          const userProfile = await dbApi.getProfile(user.uid);
          setSavedPost(userProfile.saved_posts);
        } else {
          console.log("No saved posts found for this user.");
        }
      } catch (error) {
        console.error("Error fetching saved posts:", error);
      }
    };

    if (user) {
      fetchSavedPosts();
    }
  }, [user]);

  const handleHeartClick = useCallback(
    async (postId) => {
      try {
        const postSummary = {
          post_id: postId,
          title: post.title,
          author: author.name,
        };

        const isPostSaved = savedPost.some(
          (savedPost) => savedPost.post_id === postId,
        );

        const updatedSavedPosts = isPostSaved
          ? savedPost.filter((savedPost) => savedPost.post_id !== postId)
          : [...savedPost, postSummary];

        setSavedPost(updatedSavedPosts);
        await dbApi.updateUserSavedPosts(user.uid, updatedSavedPosts);
      } catch (error) {
        console.error("Error updating saved posts:", error);
      }
    },
    [savedPost, user, post, author],
  );

  const handleSendMessageClick = (postAuthourId) => {
    window.open(`/chat/${postAuthourId}`, "_blank");
  };

  return (
    <div className="rounded-lg xs:px-2 xs:py-4 sm:p-4 sm:shadow-md">
      <div className="flex items-center gap-2">
        <Link to={`/profile/${author.uid}`}>
          <img
            src={author.profile_picture}
            className="size-16 rounded-full border-2 border-white bg-red-100 object-cover object-center shadow-md md:size-20"
            alt="author"
          />
        </Link>
        <div className="flex flex-col gap-1">
          <h3 className="flex items-center gap-3 md:text-lg">{author.name}</h3>
          <h4 className="font-semibold md:text-lg">{post.title}</h4>
        </div>
        <Link
          to={`/learning-portfolio/${author.uid}`}
          className="ml-auto flex p-1"
        >
          <span className="flex items-center gap-1 rounded-full bg-sun-100 px-3 py-2 text-sun-900 hover:bg-sun-200 active:bg-sun-200">
            <BookBookmark
              className="size-5"
              weight={bookmarkWeight}
              onMouseEnter={() => setBookmarkWeight("fill")}
              onMouseLeave={() => setBookmarkWeight("regular")}
            />
            <p className="hidden text-sm md:inline">學習歷程</p>
          </span>
        </Link>
        <button
          className="rounded-full bg-sun-400 px-3 py-2 text-sm text-white hover:bg-sun-500 active:bg-sun-500 sm:px-4 md:mr-2"
          onClick={(e) => {
            e.preventDefault();
            handleSendMessageClick(author.uid);
          }}
        >
          <ChatCircleDots
            className="size-5 sm:hidden"
            weight={chatWeight}
            onMouseEnter={() => setChatWeight("fill")}
            onMouseLeave={() => setChatWeight("regular")}
          />
          <p className="hidden sm:inline">傳送訊息</p>
        </button>

        <div className="flex size-8 items-center justify-center md:size-10">
          <Heart
            className="size-7 cursor-pointer md:size-8"
            color="#FF8964"
            weight={
              savedPost.some((savedPost) => savedPost.post_id === post.post_id)
                ? "fill"
                : "bold"
            }
            onClick={(e) => {
              e.preventDefault();
              handleHeartClick(post.post_id);
            }}
          />
        </div>
      </div>

      <div className="mb-4 ml-4 mt-2 flex flex-wrap items-center gap-y-1 sm:ml-6">
        <h3 className="mr-11 text-nowrap">類別 </h3>
        {(post.subcategories ?? []).map((sub, index) => (
          <p
            key={index}
            className="mr-3 text-nowrap rounded-md bg-cerulean-100 px-3 py-1 text-sm xs:text-base"
          >
            {sub}
          </p>
        ))}
      </div>

      {post.type === "發布教學" && (
        <div className="mb-4 ml-4 mt-2 flex flex-wrap items-center gap-y-1 sm:ml-6">
          <h3 className="mr-11 text-nowrap">專長 </h3>
          {(post.skills ?? []).map((skill, index) => (
            <p
              key={index}
              className="mr-3 text-nowrap rounded-md bg-cerulean-100 px-3 py-1 text-sm xs:text-base"
            >
              {skill}
            </p>
          ))}
        </div>
      )}
      <div className="mb-4 ml-4 mt-2 flex flex-wrap items-center gap-y-1 sm:ml-6">
        <h3 className="mr-3 text-nowrap">時間偏好 </h3>
        {(post.time_preference ?? []).map((time, index) => (
          <p
            key={index}
            className="mr-3 text-nowrap rounded-md bg-cerulean-100 px-3 py-1 text-sm xs:text-base"
          >
            {time}
          </p>
        ))}
      </div>
      <div className="mb-4 ml-4 mt-2 flex flex-wrap items-center gap-y-1 sm:ml-6">
        <h3 className="mr-11 text-nowrap">地點 </h3>
        {(post.location ?? []).map((location, index) => (
          <p
            key={index}
            className="mr-3 text-nowrap rounded-md bg-cerulean-100 px-3 py-1 text-sm xs:text-base"
          >
            {location}
          </p>
        ))}
      </div>
      <div className="mb-4 ml-4 mt-2 flex sm:ml-6">
        <h3 className="mr-11 text-nowrap">介紹 </h3>
        <p className="text-sm xs:text-base">{post.description}</p>
      </div>
      {post.type === "發布教學" && (
        <div className="mb-4 ml-4 mt-2 flex sm:ml-6">
          <h3 className="mr-3 text-nowrap">影片介紹 </h3>
          {videoUrl && embedUrl ? (
            <iframe
              className="aspect-video w-3/5 rounded-lg"
              src={embedUrl}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Embedded YouTube Video"
            ></iframe>
          ) : videoUrl === "" ? (
            <p className="text-stone-400">尚未提供影片</p>
          ) : (
            <p className="text-stone-400">無效的影片連結</p>
          )}
        </div>
      )}
      {post.type === "發布教學" && (
        <div className="mb-4 ml-4 mt-2 flex sm:ml-6">
          <h3 className="mr-3 text-nowrap">參考教材 </h3>
          {post.attachment_url === "" ? (
            <p className="text-stone-400">尚未提供相關資料</p>
          ) : (
            <Link
              className="text-sm text-cerulean-600 xs:text-base"
              target="_blank"
              to={post.attachment_url}
            >
              {post.attachment_url}
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

Introduction.propTypes = {
  post: PropTypes.shape({
    post_id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    skills: PropTypes.arrayOf(PropTypes.string),
    time_preference: PropTypes.arrayOf(PropTypes.string),
    location: PropTypes.arrayOf(PropTypes.string),
    description: PropTypes.string,
    type: PropTypes.oneOf(["發起學習", "發布教學"]).isRequired,
    subcategories: PropTypes.arrayOf(PropTypes.string),
    video_url: PropTypes.string,
    attachment_url: PropTypes.string,
  }).isRequired,
  author: PropTypes.shape({
    name: PropTypes.string,
    profile_picture: PropTypes.string,
    review_rating: PropTypes.number,
    uid: PropTypes.string,
  }).isRequired,
};

export default Introduction;
