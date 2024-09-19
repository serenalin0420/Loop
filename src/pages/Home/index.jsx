import SwitchBtn from "../../components/SideBar/SwitchBtn";
import { useContext, useEffect, useState } from "react";
import { ViewContext } from "../../context/viewContext";
import dbApi from "../../utils/api";
import StarRating from "../../components/StarRating";
import coin from "../../components/coin.svg";
import { Link } from "react-router-dom";

function Home() {
  const { isProviderView } = useContext(ViewContext);
  const [posts, setPosts] = useState([]);
  const [sortedPosts, setSortedPosts] = useState([]);
  const [btnColor, setBtnColor] = useState("created_time");
  console.log("isProviderView:", isProviderView);

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
        setSortedPosts(postsWithAuthors);
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

  const sortByCreatedTime = () => {
    const sorted = [...posts].sort(
      (a, b) => b.created_time.seconds - a.created_time.seconds,
    );
    setSortedPosts(sorted);
    setBtnColor("created_time");
  };

  const sortByCoinCost = () => {
    const sorted = [...posts].sort((a, b) => b.coin_cost - a.coin_cost);
    setSortedPosts(sorted);
    setBtnColor("coin_cost");
  };

  return (
    <div className="mx-8 mt-20 flex">
      <SwitchBtn />
      <div className="mt-4">
        {isProviderView ? (
          <div className="p-4">
            <div className="mb-4 flex justify-between">
              <div className="flex items-center border-b-2 text-lg font-semibold">
                排序依據
                <button
                  className={`ml-4 rounded-t-lg px-4 py-2 text-base font-normal ${btnColor === "created_time" ? "bg-orange-100 text-yellow-950" : ""}`}
                  onClick={sortByCreatedTime}
                >
                  發文時間
                </button>
                <button
                  className={`ml-1 rounded-t-lg px-4 py-2 text-base font-normal ${btnColor === "coin_cost" ? "bg-orange-100 text-yellow-950" : ""}`}
                  onClick={sortByCoinCost}
                >
                  代幣數量
                </button>
              </div>
              <div className="flex items-center">
                <p className="mr-2 text-sm">找不到你想學的技能嗎?</p>
                <Link
                  to="/create-post?view=teacher"
                  className="rounded-full bg-[#BFAA87] px-5 py-2 font-semibold text-white"
                >
                  發布教學
                </Link>{" "}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {sortedPosts
                .filter((post) => post.type === "發起學習")
                .map((post) => (
                  <Link
                    to={`/post/${post.id}`}
                    key={post.id}
                    className="flex flex-col justify-between rounded-lg border border-gray-300 p-4"
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
                      <div className="ml-auto">
                        <p>{formatDate(post.created_time)}</p>
                        <div className="ml-auto flex size-10 items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="#FF8964"
                            className="size-8"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <p className="mx-2 mt-2">
                      {truncateText(post.description, 24)}
                    </p>
                    <div className="mx-2 mt-4 flex gap-2">
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
                        {post.coin_cost}
                      </p>
                      <button className="ml-auto mr-3 rounded-full bg-amber-600 px-3 py-2 text-xs text-white">
                        學習歷程表
                      </button>
                      <button className="rounded-full bg-slate-200 px-3 py-2 text-xs">
                        傳送訊息
                      </button>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        ) : (
          <div className="p-4">
            <div className="mb-4 flex justify-between">
              <div className="flex items-center border-b-2 text-lg font-semibold">
                排序依據
                <button
                  className={`ml-4 rounded-t-lg px-4 py-2 text-base font-normal ${btnColor === "created_time" ? "bg-orange-100 text-yellow-950" : ""}`}
                  onClick={sortByCreatedTime}
                >
                  發文時間
                </button>
                <button
                  className={`ml-1 rounded-t-lg px-4 py-2 text-base font-normal ${btnColor === "coin_cost" ? "bg-orange-100 text-yellow-950" : ""}`}
                  onClick={sortByCoinCost}
                >
                  代幣數量
                </button>
              </div>
              <div className="flex items-center">
                <p className="mr-2 text-sm">找不到你想學的技能嗎?</p>
                <Link
                  to="/create-post?view=student"
                  className="rounded-full bg-[#BFAA87] px-5 py-2 font-semibold text-white"
                >
                  發起學習
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {sortedPosts
                .filter((post) => post.type === "發起學習")
                .map((post) => (
                  <Link
                    to={`/post/${post.id}`}
                    key={post.id}
                    className="flex flex-col justify-between rounded-lg border border-gray-300 p-4"
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
                      <div className="ml-auto">
                        <p>{formatDate(post.created_time)}</p>
                        <div className="ml-auto flex size-10 items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="#FF8964"
                            className="size-8"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <p className="mx-2 mt-2">
                      {truncateText(post.description, 24)}
                    </p>
                    <div className="mx-2 mt-4 flex gap-2">
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
                        {post.coin_cost}
                      </p>
                      <button className="ml-auto mr-3 rounded-full bg-amber-600 px-3 py-2 text-xs text-white">
                        學習歷程表
                      </button>
                      <button className="rounded-full bg-slate-200 px-3 py-2 text-xs">
                        傳送訊息
                      </button>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
