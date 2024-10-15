import { ChatCircleDots, Heart } from "@phosphor-icons/react";
import PropTypes from "prop-types";
import { useContext } from "react";
import { Link } from "react-router-dom";
import { Coin } from "../../assets/images";
import { UserContext } from "../../context/userContext";

function PostCard({
  post,
  savedPosts,
  handleHeartClick,
  handleSendMessageClick,
}) {
  const user = useContext(UserContext);
  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(
      timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000,
    );
    return date.toLocaleDateString();
  };

  return (
    <Link
      to={`/post/${post.id}`}
      key={post.id}
      className="flex flex-col justify-between rounded-lg p-4 shadow-sm shadow-stone-300"
    >
      <div className="flex">
        <img
          src={post.author?.profile_picture}
          className="mr-2 size-14 rounded-full border-white bg-red-100 object-cover object-center shadow-md shadow-stone-200"
          alt="author"
        />
        <div className="mt-1">
          <h4 className="mb-1 text-textcolor">{post.author.name}</h4>
          <h3 className="line-clamp-1 font-semibold text-textcolor">
            {post.title}
          </h3>
        </div>
        <div className="ml-auto">
          <div className="ml-auto flex size-10 items-center justify-center">
            <Heart
              className="size-6"
              color="#FF8964"
              weight={
                user
                  ? savedPosts.some(
                      (savedPost) => savedPost.post_id === post.id,
                    )
                    ? "fill"
                    : "bold"
                  : "bold"
              }
              onClick={(e) => {
                e.preventDefault();
                handleHeartClick(post.id);
              }}
            />
          </div>
        </div>
      </div>
      <p className="mx-2 mt-3 line-clamp-2 text-textcolor">
        {post.description}
      </p>
      <div className="mx-2 mt-4 flex gap-2">
        {post.location?.map((loc, index) => (
          <p
            key={index}
            className="rounded-md bg-cerulean-100 px-2 py-1 text-sm"
          >
            {loc}
          </p>
        ))}
      </div>
      <div className="mt-4 flex items-center">
        <p className="ml-2 text-sm">{formatDate(post.created_time)}</p>
        <Coin alt="coin" className="ml-auto mr-1 size-10 object-cover" />
        <p className="text-2xl font-bold text-yellow-800">{post.coin_cost}</p>
        {user?.uid !== post.author_uid && (
          <button
            className="ml-4 mr-2 rounded-full bg-sun-400 p-2 text-sm text-white hover:bg-sun-500 active:bg-sun-500 md:px-4"
            onClick={(e) => {
              e.preventDefault();
              handleSendMessageClick(post.author_uid);
            }}
          >
            <p className="hidden md:flex">傳送訊息</p>
            <ChatCircleDots className="flex size-6 md:hidden" />
          </button>
        )}
      </div>
    </Link>
  );
}

PostCard.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.string.isRequired,
    author: PropTypes.shape({
      name: PropTypes.string,
      profile_picture: PropTypes.string,
    }),
    coin_cost: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    author_uid: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    location: PropTypes.arrayOf(PropTypes.string),
    created_time: PropTypes.object.isRequired,
  }).isRequired,

  savedPosts: PropTypes.arrayOf(PropTypes.object),
  formatDate: PropTypes.func,
  handleHeartClick: PropTypes.func.isRequired,
  handleSendMessageClick: PropTypes.func.isRequired,
};

export default PostCard;
