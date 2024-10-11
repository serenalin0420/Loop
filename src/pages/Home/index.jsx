import SwitchBtn from "../../components/SideBar/SwitchBtn";
import { useContext, useEffect, useState, useCallback } from "react";
import { ViewContext } from "../../context/viewContext";
import { UserContext } from "../../context/userContext";
import dbApi from "../../utils/api";
import { Coin } from "../../assets/images";
import { Link, useNavigate } from "react-router-dom";
import { Heart, SmileyWink, ChatCircleDots } from "@phosphor-icons/react";
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
  const [modalState, setModalState] = useState({ show: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);

  // 可愛的虎爪
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleCreatePostClick = (view) => {
    if (!user) {
      setModalState({
        show: true,
        message: "發布內容要先登入，才能查看誰對你的內容有興趣喔！",
      });
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
      if (!user) {
        setModalState({
          show: true,
          message: "收藏貼文需要先登入喔！",
        });
      }
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
    if (!user) {
      setModalState({
        show: true,
        message: "要聯絡對方需要先登入喔！",
      });
    } else {
      window.open(`/chat/${postAuthourId}`, "_blank");
    }
  };

  const findStudentsPosts = sortedPosts.filter(
    (post) => post.type === "發布教學",
  );
  const findTeachersPosts = sortedPosts.filter(
    (post) => post.type === "發起學習",
  );

  return (
    <div className="my-16 flex max-w-screen-xl flex-col sm:my-20 sm:flex-row md:mx-2 lg:mx-auto">
      <div className="mx-4 flex-col sm:mr-0 lg:ml-8">
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
          <div className="my-4 ml-4 mr-4 md:ml-6 lg:mr-8">
            <div className="mb-2 flex justify-between px-1 md:mb-4 md:px-4">
              <div className="flex items-center font-semibold text-textcolor lg:text-lg">
                <p className="hidden xs:inline">排序依據</p>
                <button
                  className={`rounded-full px-3 py-2 text-base font-normal xs:ml-2 lg:ml-4 lg:px-4 ${btnColor === "created_time" ? "bg-indian-khaki-100 font-semibold text-indian-khaki-700" : "text-textcolor"}`}
                  onClick={sortByCreatedTime}
                >
                  發文時間
                </button>
                <button
                  className={`rounded-full px-3 py-2 text-base font-normal lg:px-4 ${btnColor === "coin_cost" ? "bg-indian-khaki-100 font-semibold text-indian-khaki-700" : "text-textcolor"}`}
                  onClick={sortByCoinCost}
                >
                  代幣數量
                </button>
              </div>
              <div className="flex items-center">
                <p className="mr-2 hidden text-sm text-textcolor lg:inline">
                  找不到你想學的技能嗎?
                </p>
                <button
                  className="rounded-full bg-indian-khaki-400 px-4 py-2 font-semibold text-white"
                  onClick={() => handleCreatePostClick("student")}
                >
                  發起學習
                </button>
              </div>
            </div>
            <div
              className={`grid gap-5 ${findStudentsPosts.length === 0 ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"}`}
            >
              {isLoading ? (
                <div className="col-span-3 mt-6 flex h-[60vh] items-center justify-center">
                  <div className="flex flex-col items-center justify-center text-indian-khaki-800">
                    <Coin className="my-2 size-16 animate-swing" />
                    <p>請再稍等一下...</p>
                  </div>
                </div>
              ) : findStudentsPosts.length === 0 ? (
                <div className="mt-6 flex h-5/6 items-center justify-center">
                  <div className="flex justify-center text-stone-600">
                    找不到貼文， 你來發一篇吧！
                    <SmileyWink className="size-6" />
                  </div>
                </div>
              ) : (
                findStudentsPosts.map((post) => (
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
                          className="rounded-md bg-cerulean-100 px-2 py-1 text-sm"
                        >
                          {loc}
                        </p>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center">
                      <p className="ml-2 text-sm">
                        {formatDate(post.created_time)}
                      </p>
                      <Coin
                        alt="coin"
                        className="ml-auto mr-1 size-10 object-cover"
                      />
                      <p className="text-2xl font-bold text-yellow-800">
                        {post.coin_cost}
                      </p>
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
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="my-4 ml-4 mr-4 md:ml-6 lg:mr-8">
            <div className="mb-2 flex justify-between px-1 md:mb-4 md:px-4">
              <div className="flex items-center font-semibold text-textcolor lg:text-lg">
                <p className="hidden xs:inline">排序依據</p>
                <button
                  className={`rounded-full px-3 py-2 text-base font-normal xs:ml-2 lg:ml-4 lg:px-4 ${btnColor === "created_time" ? "bg-indian-khaki-100 font-semibold text-indian-khaki-700" : "text-textcolor"}`}
                  onClick={sortByCreatedTime}
                >
                  發文時間
                </button>
                <button
                  className={`rounded-full px-3 py-2 text-base font-normal lg:px-4 ${btnColor === "coin_cost" ? "bg-indian-khaki-100 font-semibold text-indian-khaki-700" : "text-textcolor"}`}
                  onClick={sortByCoinCost}
                >
                  代幣數量
                </button>
              </div>
              <div className="flex items-center">
                <p className="mr-2 hidden text-sm text-textcolor lg:inline">
                  找不到想學你技能的人嗎?
                </p>
                <button
                  className="rounded-full bg-indian-khaki-400 px-4 py-2 font-semibold text-white"
                  onClick={() => handleCreatePostClick("teacher")}
                >
                  發布教學
                </button>
              </div>
            </div>
            <div
              className={`grid gap-5 ${findTeachersPosts.length === 0 ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"}`}
            >
              {isLoading ? (
                <div className="col-span-3 mt-6 flex h-[60vh] items-center justify-center">
                  <div className="flex flex-col items-center justify-center text-indian-khaki-800">
                    <Coin className="my-2 size-16 animate-swing" />
                    <p>請再稍等一下...</p>
                  </div>
                </div>
              ) : findTeachersPosts.length === 0 ? (
                <div className="mt-6 flex h-full items-center justify-center">
                  <div className="flex justify-center text-stone-600">
                    找不到貼文， 你來發一篇吧！
                    <SmileyWink className="size-6" />
                  </div>
                </div>
              ) : (
                findTeachersPosts.map((post) => (
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
                              user
                                ? savedPosts.some(
                                    (savedPost) =>
                                      savedPost.post_id === post.id,
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
                      <p className="ml-2 text-sm">
                        {formatDate(post.created_time)}
                      </p>
                      <Coin
                        alt="coin"
                        className="ml-auto mr-1 size-10 object-cover"
                      />
                      <p className="text-2xl font-bold text-yellow-800">
                        {post.coin_cost}
                      </p>
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
                ))
              )}
            </div>
          </div>
        )}
      </div>
      {modalState.show && (
        <IsLoggedIn
          onClose={() => setModalState({ show: false, message: "" })}
          message={modalState.message}
        />
      )}
    </div>
  );
}

export default Home;
