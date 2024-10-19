import { SmileyWink } from "@phosphor-icons/react";
import {
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { Coin } from "../../assets/images";
import IsLoggedIn from "../../components/Modal/IsLoggedIn";
import { UserContext } from "../../context/userContext";
import { ViewContext } from "../../context/viewContext";
import dbApi from "../../utils/api";
import {
  uiActionTypes,
  uiInitialState,
  uiReducer,
} from "../../utils/uiReducer";
import Filter from "./Filter";
import PostCard from "./PostCard";
import SubCategories from "./SubCategories";
import SwitchBtn from "./SwitchBtn";

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
  const [uiState, uiDispatch] = useReducer(uiReducer, uiInitialState);

  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 12;

  useEffect(() => {
    const timer = setTimeout(() => {
      uiDispatch({ type: uiActionTypes.SET_ISLOADING, payload: false });
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      uiDispatch({ type: uiActionTypes.SET_ISLOADING, payload: true });
      try {
        const [fetchedPosts, fetchedCategories, userProfile] =
          await Promise.all([
            dbApi.getAllPosts(),
            dbApi.getCategories(),
            user ? dbApi.getProfile(user.uid) : Promise.resolve(null),
          ]);

        const postsWithAuthors = await Promise.all(
          fetchedPosts.map(async (post) => {
            if (post.author_uid) {
              const authorData = await dbApi.getProfile(post.author_uid);
              return { ...post, author: authorData };
            }
            return post;
          }),
        );
        const sortedPostsByTime = postsWithAuthors.sort(
          (a, b) => b.created_time.seconds - a.created_time.seconds,
        );

        setPosts(sortedPostsByTime);
        setSortedPosts(sortedPostsByTime);

        setCategories(fetchedCategories);
        if (userProfile) setSavedPosts(userProfile.saved_posts);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        uiDispatch({ type: uiActionTypes.SET_ISLOADING, payload: false });
      }
    };
    fetchData();
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

  const handleCreatePostClick = (view) => {
    if (!user) {
      uiDispatch({
        type: uiActionTypes.SHOW_MODAL,
        modalType: "loginModal",
        payload: {
          message: "發布內容要先登入，才能查看誰對你的內容有興趣喔！",
        },
      });
    } else {
      navigate(`/create-post?view=${view}`);
    }
  };

  const handleHeartClick = useCallback(
    async (postId) => {
      if (!user) {
        uiDispatch({
          type: uiActionTypes.SHOW_MODAL,
          modalType: "loginModal",
          payload: {
            message: "收藏貼文需要先登入喔！",
          },
        });
        return;
      }
      try {
        const post = posts.find((p) => p.id === postId);
        if (!post) {
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

  const handleSendMessageClick = useCallback(
    (postAuthorId) => {
      if (!user) {
        uiDispatch({
          type: uiActionTypes.SHOW_MODAL,
          modalType: "loginModal",
          payload: {
            message: "要聯絡對方需要先登入喔！",
          },
        });
      } else {
        window.open(`/chat/${postAuthorId}`, "_blank");
      }
    },
    [user],
  );

  const handleSort = (sortType) => {
    const sorted = [...sortedPosts].sort((a, b) => {
      if (sortType === "created_time") {
        return b.created_time.seconds - a.created_time.seconds;
      } else if (sortType === "coin_cost") {
        return findTeachersView
          ? a.coin_cost - b.coin_cost
          : b.coin_cost - a.coin_cost;
      }
    });
    setSortedPosts(sorted);
    setBtnColor(sortType);
  };

  const filterByCategory = (category) => {
    const filteredPosts =
      category === "全部"
        ? posts
        : posts.filter((post) => post.category_id === category);

    setSortedPosts(filteredPosts);
    setFilterConditions({
      subcategories: [],
      timePreferences: [],
      locations: [],
    });

    setSelectedCategory(category);
  };

  const findStudentsPosts = sortedPosts.filter(
    (post) => post.type === "發布教學",
  );
  const findTeachersPosts = sortedPosts.filter(
    (post) => post.type === "發起學習",
  );

  const postsToDisplay = findTeachersView
    ? findStudentsPosts
    : findTeachersPosts;
  const totalPages = Math.ceil(postsToDisplay.length / postsPerPage);

  const currentPosts = postsToDisplay.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage,
  );

  const handlePageChange = (direction) => {
    if (direction === "next" && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    } else if (direction === "prev" && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  useEffect(() => {
    setCurrentPage(1);
  }, [findTeachersView]);

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
          categories={categories}
          selectedCategory={selectedCategory}
          onFilterChange={setFilterConditions}
        />
        <div className="my-4 ml-4 mr-4 min-h-screen md:ml-6 lg:mr-8">
          <div className="mb-2 flex justify-between px-1 md:mb-4 md:px-4">
            <div className="flex items-center font-semibold text-textcolor lg:text-lg">
              <p className="hidden xs:inline">排序依據</p>
              <button
                className={`rounded-full px-3 py-2 text-base font-normal xs:ml-2 lg:ml-4 lg:px-4 ${btnColor === "created_time" ? "bg-indian-khaki-100 font-semibold text-indian-khaki-700" : "text-textcolor"}`}
                onClick={() => handleSort("created_time")}
              >
                發文時間
              </button>
              <button
                className={`rounded-full px-3 py-2 text-base font-normal lg:px-4 ${btnColor === "coin_cost" ? "bg-indian-khaki-100 font-semibold text-indian-khaki-700" : "text-textcolor"}`}
                onClick={() => handleSort("coin_cost")}
              >
                代幣數量
              </button>
            </div>
            <div className="flex items-center">
              <p className="mr-2 hidden text-sm text-textcolor lg:inline">
                {findTeachersView
                  ? "找不到你想學的技能嗎?"
                  : " 找不到想學你技能的人嗎?"}
              </p>
              <button
                className="rounded-full bg-indian-khaki-400 px-4 py-2 font-semibold text-white"
                onClick={() =>
                  handleCreatePostClick(
                    findTeachersView ? "student" : "teacher",
                  )
                }
              >
                {findTeachersView ? "發起學習" : "發布教學"}
              </button>
            </div>
          </div>
          <div
            className={`grid gap-5 ${
              postsToDisplay.length === 0
                ? "grid-cols-1"
                : "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"
            }`}
          >
            {uiState.isLoading ? (
              <div className="col-span-3 mt-6 flex h-[60vh] items-center justify-center">
                <div className="flex flex-col items-center justify-center text-indian-khaki-800">
                  <Coin className="my-2 size-16 animate-swing" />
                  <p>請再稍等一下...</p>
                </div>
              </div>
            ) : postsToDisplay.length === 0 ? (
              <div className="mt-6 flex h-5/6 items-center justify-center">
                <div className="flex justify-center text-stone-600">
                  找不到貼文， 你來發一篇吧！
                  <SmileyWink className="size-6" />
                </div>
              </div>
            ) : (
              currentPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  savedPosts={savedPosts}
                  handleHeartClick={handleHeartClick}
                  handleSendMessageClick={handleSendMessageClick}
                />
              ))
            )}
          </div>
        </div>
        {postsToDisplay.length > postsPerPage && (
          <div className="mt-4 flex h-7 items-center justify-center">
            <button
              onClick={() => handlePageChange("prev")}
              disabled={currentPage === 1}
              className="px-1 text-indian-khaki-800 hover:border-b hover:border-b-textcolor disabled:opacity-40"
            >
              上一頁
            </button>
            <p className="mx-4 text-textcolor">
              第 {currentPage} / {totalPages} 頁
            </p>
            <button
              onClick={() => handlePageChange("next")}
              disabled={currentPage === totalPages}
              className="px-1 text-indian-khaki-800 hover:border-b hover:border-b-textcolor disabled:opacity-40"
            >
              下一頁
            </button>
          </div>
        )}
      </div>
      {uiState.loginModal.show && (
        <IsLoggedIn
          onClose={() =>
            uiDispatch({
              type: uiActionTypes.HIDE_MODAL,
              modalType: "loginModal",
            })
          }
          message={uiState.loginModal.message}
        />
      )}
    </div>
  );
}

export default Home;
