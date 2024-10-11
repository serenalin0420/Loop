import dbApi from "../../utils/api";
import { UserContext } from "../../context/userContext";
import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import StarRating from "@/components/StarRating";
import { Coin } from "../../assets/images";

function LearningPortfolio() {
  const user = useContext(UserContext);
  const { userId: otherUserId } = useParams();
  const [portfolio, setPortfolio] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [noPortfolio, setNoPortfolio] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchLearningPortfolio = async () => {
      const uid = otherUserId || (user && user.uid);
      if (uid) {
        try {
          const userLearningPortfolio = await dbApi.getLearningPortfolio(uid);
          if (!userLearningPortfolio) {
            console.error("userLearningPortfolio is null or undefined");
            setNoPortfolio(true);
            setIsLoading(false);
            return;
          }
          const updatedPortfolio = await Promise.all(
            userLearningPortfolio.map(async (item) => {
              const type = uid === item.demander_uid ? "學習" : "教學";

              const otherUserId =
                uid === item.demander_uid
                  ? item.provider_uid
                  : item.demander_uid;
              const otherUserProfile = await dbApi.getProfile(otherUserId);
              const otherUserName = otherUserProfile.name;

              const booking = await dbApi.getBooking(item.booking_id);

              const status =
                booking.selected_times.length === item.feedback.length
                  ? "已完成"
                  : "進行中";

              const averageRating =
                item.feedback.reduce((acc, curr) => {
                  const demanderRating = curr.demander_rating
                    ? curr.demander_rating
                    : 0;
                  const providerRating = curr.provider_rating
                    ? curr.provider_rating
                    : 0;
                  return acc + demanderRating + providerRating;
                }, 0) /
                (item.feedback.length * 2);

              return {
                ...item,
                type,
                otherUserName,
                status,
                averageRating,
              };
            }),
          );

          setPortfolio(updatedPortfolio);
          setIsLoading(false);
        } catch (error) {
          console.error("Error fetching learning portfolio:", error);
        }
      }
    };
    fetchLearningPortfolio();
  }, [user, otherUserId]);

  if (isLoading) {
    return (
      <div className="col-span-3 mt-6 flex h-screen items-center justify-center">
        <div className="flex flex-col items-center justify-center text-indian-khaki-800">
          <Coin className="my-2 size-16 animate-swing" />
          <p>請再稍等一下...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen py-20 md:py-24">
      <h2 className="mb-4 text-center text-lg font-semibold sm:text-xl">
        學習歷程
      </h2>
      <div className="mx-4 flex max-w-screen-lg flex-col rounded-lg bg-white shadow-md sm:mx-6 md:mx-12 lg:mx-28 xl:mx-auto">
        <div className="overflow-x-auto">
          <table className="min-w-[768px] rounded-lg md:w-full">
            <thead className="bg-indian-khaki-400">
              <tr className="tracking-wide text-white lg:text-lg">
                <th className="text-nowrap rounded-tl-lg px-3 py-4 md:px-6">
                  類型
                </th>
                <th className="px-2 py-3 md:px-6">貼文標題</th>
                <th className="px-2 py-3">技能交換對象</th>
                <th className="px-2 py-3 md:px-4">課程狀態</th>
                <th className="text-nowrap px-6 py-3">評價</th>
                <th className="rounded-tr-lg px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="rounded-lg text-center text-textcolor">
              {noPortfolio || portfolio.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-12 py-4">
                    {user === undefined || user?.uid === otherUserId || !user
                      ? "對方還沒有學習歷程的紀錄，趕快來和他交換技能吧 ! "
                      : "還沒開始你的學習嗎?"}
                  </td>
                </tr>
              ) : (
                portfolio.map((item, index) => (
                  <tr
                    key={item.booking_id}
                    className={` ${
                      index % 2 === 0 ? "bg-white" : "bg-indian-khaki-100"
                    } `}
                  >
                    <td
                      className={`text-nowrap px-4 py-4 md:px-5 ${index === portfolio.length - 1 ? "rounded-bl-lg" : ""}`}
                    >
                      {item.type}
                    </td>
                    <td className="px-2 py-3 md:px-6">{item.post_title}</td>
                    <td className="px-2 py-4">{item.otherUserName}</td>
                    <td className="px-2 py-4 md:px-4">{item.status}</td>
                    <td className="flex justify-center px-2 py-4">
                      <StarRating rating={item.averageRating} size="18px" />
                    </td>
                    <td
                      className={`px-3 py-4 md:px-4 ${index === portfolio.length - 1 ? "rounded-br-lg" : ""}`}
                    >
                      <Link
                        to={
                          otherUserId
                            ? `/learning-portfolio/${otherUserId}/${item.booking_id}`
                            : `/learning-portfolio/${user.uid}/${item.booking_id}`
                        }
                        className="rounded-full bg-neon-carrot-100 px-4 py-2 text-sm text-orange-800 shadow-inner hover:bg-orange-200 active:bg-orange-200"
                        state={{ portfolio: item }}
                      >
                        查看
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default LearningPortfolio;
