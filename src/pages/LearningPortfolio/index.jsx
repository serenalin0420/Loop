import dbApi from "../../utils/api";
import { UserContext } from "../../context/userContext";
import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StarRating from "@/components/StarRating";

function LearningPortfolio() {
  const user = useContext(UserContext);
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noPortfolio, setNoPortfolio] = useState(false);

  useEffect(() => {
    const fetchLearningPortfolio = async () => {
      if (user && user.uid) {
        try {
          const userLearningPortfolio = await dbApi.getLearningPortfolio(
            user.uid,
          );
          if (!userLearningPortfolio) {
            console.error("userLearningPortfolio is null or undefined");
            setNoPortfolio(true);
            setLoading(false);
            return;
          }

          const updatedPortfolio = await Promise.all(
            userLearningPortfolio.map(async (item) => {
              const type = user.uid === item.demander_uid ? "學習" : "教學";

              const otherUserId =
                user.uid === item.demander_uid
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
          setLoading(false);
        } catch (error) {
          console.error("Error fetching learning portfolio:", error);
        }
      }
    };
    fetchLearningPortfolio();
  }, [user]);

  console.log(portfolio);

  if (loading) {
    return <div>Loading</div>;
  }

  return (
    <div className="h-screen bg-[#f2f9fd] py-24">
      <div className="mx-6 flex max-w-screen-lg flex-col rounded-xl bg-white shadow-md md:mx-12 lg:mx-28 xl:mx-auto">
        <table className="min-w-full rounded-xl">
          <thead className="bg-[#BFAA87]">
            <tr className="text-lg tracking-wide text-white">
              <th className="rounded-tl-xl px-6 py-3">類型</th>
              <th className="px-6 py-3">貼文標題</th>
              <th className="px-6 py-3">使用者</th>
              <th className="px-6 py-3">課程狀態</th>
              <th className="px-6 py-3">評價</th>
              <th className="rounded-tr-xl px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="rounded-xl text-center text-textcolor">
            {noPortfolio || portfolio.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-12 py-4">
                  還沒開始你的學習嗎?
                </td>
              </tr>
            ) : (
              portfolio.map((item, index) => (
                <tr
                  key={item.booking_id}
                  className={` ${
                    index % 2 === 0 ? "bg-white" : "bg-[#F9F7F3]"
                  } `}
                >
                  <td
                    className={`px-5 py-4 ${index === portfolio.length - 1 ? "rounded-bl-xl" : ""}`}
                  >
                    {item.type}
                  </td>
                  <td className="px-5 py-4">{item.post_title}</td>
                  <td className="px-5 py-4">{item.otherUserName}</td>
                  <td className="px-5 py-4">{item.status}</td>
                  <td className="flex justify-center px-6 py-4">
                    <StarRating rating={item.averageRating} size="18px" />
                  </td>
                  <td
                    className={`px-5 py-4 ${index === portfolio.length - 1 ? "rounded-br-xl" : ""}`}
                  >
                    <Link
                      to={`/learning-portfolio/${item.booking_id}`}
                      className="rounded-full bg-orange-100 px-4 py-2 text-sm text-orange-800 hover:bg-orange-200 active:bg-orange-200"
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
  );
}

export default LearningPortfolio;
