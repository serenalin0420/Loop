import { CaretRight } from "@phosphor-icons/react";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import dbApi from "../../utils/api";

function SavedPosts({ userId }) {
  const [savedPosts, setSavedPosts] = useState([]);

  useEffect(() => {
    const fetchSavedPosts = async () => {
      try {
        if (userId) {
          const userProfile = await dbApi.getProfile(userId);
          setSavedPosts(userProfile.saved_posts);
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
      <h3 className="max-w-max rounded-r-lg bg-indian-khaki-400 px-4 py-2 text-center tracking-wider text-white">
        我的收藏
      </h3>
      <div className="flex flex-col gap-3 px-6 py-4">
        {savedPosts && savedPosts.length > 0 ? (
          savedPosts.map((post) => (
            <Link
              to={`/post/${post.post_id}`}
              key={post.post_id}
              className="flex gap-6 rounded-md bg-neon-carrot-50 px-3 py-2"
            >
              <p className="hidden sm:inline md:text-nowrap">{post.author}</p>
              <p className="font-semibold">{post.title}</p>
              <span className="my-auto ml-2 flex items-center text-nowrap text-sm text-indian-khaki-800">
                <p className="hidden md:inline">查看</p>
                <CaretRight className="hl-1 size-6" />
              </span>
            </Link>
          ))
        ) : (
          <p className="my-2 text-stone-500">
            去看看感興趣的文章，收藏起來吧！
          </p>
        )}
      </div>
    </div>
  );
}

SavedPosts.propTypes = {
  userId: PropTypes.string.isRequired,
};

export default SavedPosts;
