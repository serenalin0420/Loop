import SwitchBtn from "../../components/SideBar/SwitchBtn";
import { useContext, useEffect, useState } from "react";
import { ViewContext } from "../../context/viewContext";
import dbApi from "../../utils/api";
import StarRating from "../../components/StarRating";
import coin from "../../components/coin.svg";
import { Link } from "react-router-dom";
import { Heart } from "@phosphor-icons/react";
import SubCategories from "../../components/SideBar/SubCategories";
import Filter from "./Filter";

function Home() {
  const { findTeachersView } = useContext(ViewContext);
  const [posts, setPosts] = useState([]);
  const [sortedPosts, setSortedPosts] = useState([]);
  const [btnColor, setBtnColor] = useState("created_time");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("全部");

  const [filterConditions, setFilterConditions] = useState({
    subcategories: [],
    timePreferences: [],
    locations: [],
  });

  console.log("findTeachersView:", findTeachersView);

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
    const fetchCategories = async () => {
      try {
        const fetchedCategories = await dbApi.getCategories();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchPosts();
    fetchCategories();
  }, []);

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
              <div className="flex items-center text-lg font-semibold">
                排序依據
                <button
                  className={`ml-4 rounded-lg px-4 py-2 text-base font-normal ${btnColor === "created_time" ? "bg-orange-100 text-yellow-950" : ""}`}
                  onClick={sortByCreatedTime}
                >
                  發文時間
                </button>
                <button
                  className={`ml-1 rounded-lg px-4 py-2 text-base font-normal ${btnColor === "coin_cost" ? "bg-orange-100 text-yellow-950" : ""}`}
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
            <div className="grid grid-cols-3 gap-4">
              {findStudentsPosts.length === 0 ? (
                <div className="text-center text-gray-500">找不到貼文</div>
              ) : (
                findStudentsPosts.map((post) => (
                  <Link
                    to={`/post/${post.id}`}
                    key={post.id}
                    className="flex flex-col justify-between rounded-lg border border-gray-300 p-4"
                  >
                    <div className="flex">
                      <img
                        src={post.author?.profile_picture}
                        className="mr-2 size-14 rounded-full border-white bg-red-100 object-cover object-center shadow-md"
                        alt="author"
                      />
                      <div className="mt-1">
                        <h4 className="mb-1">{post.author?.name}</h4>
                        <StarRating
                          rating={post.author?.review_rating ?? 0}
                          size="16px"
                        />
                      </div>
                      <div className="ml-auto">
                        <p>{formatDate(post.created_time)}</p>
                        <div className="ml-auto flex size-10 items-center justify-center">
                          <Heart
                            className="size-6"
                            color="#FF8964"
                            weight="bold"
                          />
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
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="p-4">
            <div className="mb-4 flex justify-between px-4">
              <div className="flex items-center text-lg font-semibold">
                排序依據
                <button
                  className={`ml-4 rounded-lg px-4 py-2 text-base font-normal ${btnColor === "created_time" ? "bg-orange-100 text-yellow-950" : ""}`}
                  onClick={sortByCreatedTime}
                >
                  發文時間
                </button>
                <button
                  className={`ml-1 rounded-lg px-4 py-2 text-base font-normal ${btnColor === "coin_cost" ? "bg-orange-100 text-yellow-950" : ""}`}
                  onClick={sortByCoinCost}
                >
                  代幣數量
                </button>
              </div>
              <div className="flex items-center">
                <p className="mr-2 text-sm">找不到想學你技能的人嗎?</p>
                <Link
                  to="/create-post?view=teacher"
                  className="rounded-full bg-[#BFAA87] px-5 py-2 font-semibold text-white"
                >
                  發布教學
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {findTeachersPosts.length === 0 ? (
                <div className="text-center text-gray-500">找不到貼文</div>
              ) : (
                findTeachersPosts.map((post) => (
                  <Link
                    to={`/post/${post.id}`}
                    key={post.id}
                    className="flex flex-col justify-between rounded-lg border border-gray-300 p-4"
                  >
                    <div className="flex">
                      <img
                        src={post.author?.profile_picture}
                        className="mr-2 size-14 rounded-full border-white bg-red-100 object-cover object-center shadow-md"
                        alt="author"
                      />
                      <div className="mt-1">
                        <h4 className="mb-1">{post.author?.name}</h4>
                        <StarRating
                          rating={post.author?.review_rating ?? 0}
                          size="16px"
                        />
                      </div>
                      <div className="ml-auto">
                        <p>{formatDate(post.created_time)}</p>
                        <div className="ml-auto flex size-10 items-center justify-center">
                          <Heart
                            className="size-6"
                            color="#FF8964"
                            weight="bold"
                          />
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
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
