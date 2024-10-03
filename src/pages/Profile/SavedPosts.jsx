import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import dbApi from "../../utils/api";
import { Link } from "react-router-dom";
import { CaretRight } from "@phosphor-icons/react";

function SavedPosts({ userId }) {
  const [savedPosts, setSavedPosts] = useState([]);

  useEffect(() => {
    const fetchSavedPosts = async () => {
      try {
        if (userId) {
          const userProfile = await dbApi.getProfile(userId);
          setSavedPosts(userProfile.saved_posts);
        } else {
          console.log("No saved posts found for this user.");
        }
      } catch (error) {
        console.error("Error fetching saved posts:", error);
      }
    };

    if (userId) {
      fetchSavedPosts();
    }
  }, [userId]);

  return (
    <div className="flex flex-col rounded-lg shadow-md">
      <h3 className="max-w-max rounded-r-lg bg-button px-4 py-2 text-center tracking-wider text-white">
        我的收藏
      </h3>
      <div className="flex flex-col gap-3 px-6 py-4">
        {savedPosts.map((post) => (
          <Link
            to={`/post/${post.post_id}`}
            key={post.post_id}
            className="flex gap-6 rounded-md bg-neon-carrot-100 px-3 py-2"
          >
            <p>{post.author}</p>
            <p className="font-semibold">{post.title}</p>
            <span className="ml-auto flex text-textcolor-brown">
              查看 <CaretRight className="ml-1 size-6" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

SavedPosts.propTypes = {
  userId: PropTypes.string.isRequired,
};

export default SavedPosts;
