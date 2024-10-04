import SwitchBtn from "../../components/SideBar/SwitchBtn";
import { useContext, useEffect, useState, useCallback } from "react";
import { ViewContext } from "../../context/viewContext";
import { UserContext } from "../../context/userContext";
import dbApi from "../../utils/api";
import coin from "../../assets/coin.svg";
import { Link, useNavigate } from "react-router-dom";
import { Heart, SmileyWink } from "@phosphor-icons/react";
import SubCategories from "../../components/SideBar/SubCategories";
import Filter from "./Filter";
import IsLoggedIn from "../../components/Modal/IsLoggedIn";

function Home() {
  const user = useContext(UserContext);
  const navigate = useNavigate();
  const { findTeachersView } = useContext(ViewContext);
  const [posts, setPosts] = useState([]);
  const [sortedPosts, setSortedPosts] = useState([]);
  const [btnColor, setBtnColor] = useState("created_time");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [savedPosts, setSavedPosts] = useState([]);
  const [filterConditions, setFilterConditions] = useState({
    subcategories: [],
    timePreferences: [],
    locations: [],
  });
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleCreatePostClick = (view) => {
    if (!user) {
      setShowModal(true);
    } else {
      navigate(`/create-post?view=${view}`);
    }
  };

  // console.log("findTeachersView:", findTeachersView);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
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
      } finally {
        setIsLoading(false);
      }
    };
    const fetchCategories = async () => {
      try {
        const fetchedCategories = await dbApi.getCategories();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    const fetchSavedPosts = async () => {
      try {
        if (user) {
          const userProfile = await dbApi.getProfile(user.uid);
          setSavedPosts(userProfile.saved_posts);
        } else {
          console.log("No saved posts found for this user.");
        }
      } catch (error) {
        console.error("Error fetching saved posts:", error);
      }
    };

    fetchPosts();
    fetchCategories();
    if (user) {
      fetchSavedPosts();
    }
  }, [user]);

  useEffect(() => {
    const filteredPosts = posts.filter((post) => {
      const matchesCategory =
        selectedCategory === "全部" || post.category_id === selectedCategory;

      const matchesSubcategories =
        filterConditions.subcategories.length === 0 ||
        filterConditions.subcategories.some((sub) =>
          (post.subcategories ?? []).includes(sub),
        );

      const matchesTimePreferences =
        filterConditions.timePreferences.length === 0 ||
        filterConditions.timePreferences.some((time) =>
          (post.time_preference ?? []).includes(time),
        );

      const matchesLocations =
        filterConditions.locations.length === 0 ||
        filterConditions.locations.some((loc) =>
          (post.location ?? []).includes(loc),
        );

      return (
        matchesCategory &&
        matchesSubcategories &&
        matchesTimePreferences &&
        matchesLocations
      );
    });

    setSortedPosts(filteredPosts);
  }, [filterConditions, posts, selectedCategory]);

  const handleHeartClick = useCallback(
    async (postId) => {
      try {
        const post = posts.find((p) => p.id === postId);
        if (!post) {
          console.error("Post not found");
          return;
        }

        const postSummary = {
          post_id: postId,
          title: post.title,
          author: post.author.name,
        };

        const isPostSaved = savedPosts.some(
          (savedPost) => savedPost.post_id === postId,
        );

        const updatedSavedPosts = isPostSaved
          ? savedPosts.filter((savedPost) => savedPost.post_id !== postId)
          : [...savedPosts, postSummary];

        setSavedPosts(updatedSavedPosts);
        await dbApi.updateUserSavedPosts(user.uid, updatedSavedPosts);
      } catch (error) {
        console.error("Error updating saved posts:", error);
      }
    },
    [savedPosts, user, posts],
  );

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(
      timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000,
    );
    return date.toLocaleDateString();
  };

  const sortByCreatedTime = () => {
    const sorted = [...sortedPosts].sort(
      (a, b) => b.created_time.seconds - a.created_time.seconds,
    );
    setSortedPosts(sorted);
    setBtnColor("created_time");
  };

  const sortByCoinCost = () => {
    const sorted = [...sortedPosts].sort((a, b) => b.coin_cost - a.coin_cost);
    setSortedPosts(sorted);
    setBtnColor("coin_cost");
  };

  const filterByCategory = (category) => {
    setSortedPosts(posts);
    if (category === "全部") {
      setFilterConditions({
        subcategories: [],
        timePreferences: [],
        locations: [],
      });
      setSelectedCategory("全部");
    } else {
      setSelectedCategory(category);
    }
  };

  const handleSendMessageClick = (postAuthourId) => {
    window.open(`/chat/${postAuthourId}`, "_blank");
  };

  const findStudentsPosts = sortedPosts.filter(
    (post) => post.type === "發布教學",
  );
  const findTeachersPosts = sortedPosts.filter(
    (post) => post.type === "發起學習",
  );

  return (
    <div className="mx-8 mt-20 flex">
      <div className="flex flex-col">
        <SwitchBtn />
        <SubCategories
          categories={categories}
          onCategoryClick={filterByCategory}
        />
      </div>
      <div className="w-full">
        <Filter
          selectedCategory={selectedCategory}
          onFilterChange={setFilterConditions}
        />
        {findTeachersView ? (
          <div className="m-4">
            <div className="mb-4 flex justify-between px-4">
              <div className="flex items-center text-lg font-semibold text-textcolor">
                排序依據
                <button
                  className={`ml-4 rounded-md px-4 py-2 text-base font-normal ${btnColor === "created_time" ? "bg-[#F2EBDF] font-semibold text-yellow-800" : "text-textcolor"}`}
                  onClick={sortByCreatedTime}
                >
                  發文時間
                </button>
                <button
                  className={`ml-1 rounded-lg px-4 py-2 text-base font-normal ${btnColor === "coin_cost" ? "bg-[#F2EBDF] font-semibold text-yellow-800" : "text-textcolor"}`}
                  onClick={sortByCoinCost}
                >
                  代幣數量
                </button>
              </div>
              <div className="flex items-center">
                <p className="mr-2 text-sm text-textcolor">
                  找不到你想學的技能嗎?
                </p>
                <button
                  className="rounded-full bg-button px-4 py-2 font-semibold text-white"
                  onClick={() => handleCreatePostClick("student")}
                >
                  發起學習
                </button>
              </div>
            </div>
            <div
              className={`grid gap-5 ${findTeachersPosts.length === 0 ? "grid-cols-1" : "grid-cols-3"}`}
            >
              {isLoading ? (
                <div className="col-span-3 mt-6 flex items-center justify-center">
                  <div className="flex flex-col items-center justify-center text-textcolor-brown">
                    <img src={coin} className="my-2 size-16 animate-swing" />
                    <p>請再稍等一下...</p>
                  </div>
                </div>
              ) : findTeachersPosts.length === 0 ? (
                <div className="flex justify-center text-stone-600">
                  找不到貼文， 你來發一篇吧！
                  <SmileyWink className="size-6" />
                </div>
              ) : (
                findTeachersPosts.map((post) => (
                  <Link
                    to={`/post/${post.id}`}
                    key={post.id}
                    className="flex flex-col justify-between rounded-lg p-4 shadow-sm shadow-stone-400"
                  >
                    <div className="flex">
                      <img
                        src={post.author?.profile_picture}
                        className="mr-2 size-14 rounded-full border-white bg-red-100 object-cover object-center shadow-md shadow-stone-200"
                        alt="author"
                      />
                      <div className="mt-1">
                        <h4 className="mb-1 text-textcolor">
                          {post.author?.name}
                        </h4>
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
                              savedPosts.some(
                                (savedPost) => savedPost.post_id === post.id,
                              )
                                ? "fill"
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
                          className="rounded-md bg-slate-200 px-2 py-1 text-sm"
                        >
                          {loc}
                        </p>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center">
                      <p className="ml-2 text-sm">
                        {formatDate(post.created_time)}
                      </p>
                      <img
                        src={coin}
                        alt="coin"
                        className="ml-auto mr-1 size-10 object-cover"
                      />
                      <p className="text-2xl font-bold text-yellow-800">
                        {post.coin_cost}
                      </p>
                      <button
                        className="ml-4 mr-2 rounded-full bg-sun-400 px-4 py-2 text-sm text-white"
                        onClick={(e) => {
                          e.preventDefault();
                          handleSendMessageClick(post.author_uid);
                        }}
                      >
                        傳送訊息
                      </button>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="m-4">
            <div className="mb-4 flex justify-between px-4">
              <div className="flex items-center text-lg font-semibold text-textcolor">
                排序依據
                <button
                  className={`ml-4 rounded-lg px-4 py-2 text-base font-normal ${btnColor === "created_time" ? "bg-[#F2EBDF] font-semibold text-yellow-800" : "text-textcolor"}`}
                  onClick={sortByCreatedTime}
                >
                  發文時間
                </button>
                <button
                  className={`ml-1 rounded-lg px-4 py-2 text-base font-normal ${btnColor === "coin_cost" ? "bg-[#F2EBDF] font-semibold text-yellow-800" : "text-textcolor"}`}
                  onClick={sortByCoinCost}
                >
                  代幣數量
                </button>
              </div>
              <div className="flex items-center">
                <p className="mr-2 text-sm text-textcolor">
                  找不到想學你技能的人嗎?
                </p>
                <button
                  className="rounded-full bg-button px-4 py-2 font-semibold text-white"
                  onClick={() => handleCreatePostClick("teacher")}
                >
                  發布教學
                </button>
              </div>
            </div>
            <div
              className={`grid gap-5 ${findStudentsPosts.length === 0 ? "grid-cols-1" : "grid-cols-3"}`}
            >
              {isLoading ? (
                <div className="col-span-3 mt-6 flex items-center justify-center">
                  <div className="text-center text-textcolor-brown">
                    <img src={coin} className="my-2 size-16 animate-swing" />
                    載入中...
                  </div>
                </div>
              ) : findStudentsPosts.length === 0 ? (
                <div className="flex justify-center text-stone-600">
                  找不到貼文， 你來發一篇吧！
                  <SmileyWink className="size-6" />
                </div>
              ) : (
                findTeachersPosts.map((post) => (
                  <Link
                    to={`/post/${post.id}`}
                    key={post.id}
                    className="flex flex-col justify-between rounded-lg p-4 shadow-sm shadow-stone-400"
                  >
                    <div className="flex">
                      <img
                        src={post.author?.profile_picture}
                        className="mr-2 size-14 rounded-full border-white bg-red-100 object-cover object-center shadow-md shadow-stone-200"
                        alt="author"
                      />
                      <div className="mt-1">
                        <h4 className="mb-1 text-textcolor">
                          {post.author?.name}
                        </h4>
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
                              savedPosts.some(
                                (savedPost) => savedPost.post_id === post.id,
                              )
                                ? "fill"
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
                          className="rounded-md bg-slate-200 px-2 py-1 text-sm"
                        >
                          {loc}
                        </p>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center">
                      <p className="ml-2 text-sm">
                        {formatDate(post.created_time)}
                      </p>
                      <img
                        src={coin}
                        alt="coin"
                        className="ml-auto mr-1 size-10 object-cover"
                      />
                      <p className="text-2xl font-bold text-yellow-800">
                        {post.coin_cost}
                      </p>
                      <button
                        className="ml-4 mr-2 rounded-full bg-sun-400 px-4 py-2 text-sm text-white"
                        onClick={(e) => {
                          e.preventDefault();
                          handleSendMessageClick(post.author_uid);
                        }}
                      >
                        傳送訊息
                      </button>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      {showModal && (
        <IsLoggedIn
          onClose={() => setShowModal(false)}
          message="發布內容要先登入，才能查看誰對你的內容有興趣喔！"
        />
      )}
    </div>
  );
}

export default Home;
