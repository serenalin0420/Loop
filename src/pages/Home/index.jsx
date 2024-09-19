import SwitchBtn from "../../components/SideBar/SwitchBtn";
import { useContext, useEffect, useState } from "react";
import { ViewContext } from "../../context/viewContext";
import dbApi from "../../utils/api";
import StarRating from "../../components/StarRating";
import coin from "../../components/coin.svg";

function Home() {
  const { isProviderView } = useContext(ViewContext);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const fetchedPosts = await dbApi.getAllPosts();
        const postsWithAuthors = await Promise.all(
          fetchedPosts.map(async (post) => {
            if (post.author_uid) {
              const authorData = await dbApi.getProfile(post.author_uid);
              return { ...post, author: authorData };
            }
            return post;
          }),
        );
        setPosts(postsWithAuthors);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchPosts();
  }, []);

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(
      timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000,
    );
    return date.toLocaleDateString();
  };

  const truncateText = (text, maxLength) => {
    if (!text) return "";
    if (text.length <= maxLength) {
      return text;
    }
    return text.slice(0, maxLength) + "...";
  };

  return (
    <div className="mx-8 mt-20 flex">
      <SwitchBtn />
      <div className="mt-4">
        {isProviderView ? (
          <div>
            <h3 className="text-center">學生發的文</h3>
            <button>發布教學</button>
          </div>
        ) : (
          <div className="p-4">
            <button>發起學習</button>
            <div className="grid grid-cols-3 gap-2">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="rounded-lg border border-gray-300 p-4"
                >
                  <div className="flex">
                    <div className="mr-2 size-16 overflow-hidden rounded-full">
                      <img
                        src={post.author?.profile_picture}
                        className="h-full w-full object-cover object-center"
                        alt="author"
                      />
                    </div>
                    <div className="mt-1">
                      <h4 className="mb-1 text-lg">{post.author?.name}</h4>
                      <StarRating
                        rating={post.author?.review_rating ?? 0}
                        size="16px"
                      />
                    </div>
                    <p className="ml-auto">{formatDate(post.created_time)}</p>
                  </div>
                  <p className="mt-2">{truncateText(post.description, 24)}</p>
                  <div className="mt-4 flex gap-2">
                    {post.location?.map((loc, index) => (
                      <p
                        key={index}
                        className="rounded-md bg-slate-200 px-2 py-1 text-sm"
                      >
                        {loc}
                      </p>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center">
                    <img
                      src={coin}
                      alt="coin"
                      className="mr-1 size-10 object-cover"
                    />
                    <p className="text-2xl font-bold text-yellow-900">
                      {" "}
                      {post.coin_cost}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
