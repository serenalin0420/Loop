import dbApi from "../../utils/api";
import { UserContext } from "../../context/userContext";
import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import StarRating from "@/components/StarRating";

function LearningPortfolio() {
  const user = useContext(UserContext);
  const { userId: otherUserId } = useParams();
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noPortfolio, setNoPortfolio] = useState(false);

  useEffect(() => {
    const fetchLearningPortfolio = async () => {
      const uid = otherUserId || (user && user.uid);
      if (uid) {
        try {
          const userLearningPortfolio = await dbApi.getLearningPortfolio(uid);
          if (!userLearningPortfolio) {
            console.error("userLearningPortfolio is null or undefined");
            setNoPortfolio(true);
            setLoading(false);
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
          setLoading(false);
        } catch (error) {
          console.error("Error fetching learning portfolio:", error);
        }
      }
    };
    fetchLearningPortfolio();
  }, [user, otherUserId]);

  // console.log(portfolio);

  if (loading) {
    return <div>Loading</div>;
  }

  return (
    <div className="h-screen py-24">
      <div className="mx-6 flex max-w-screen-lg flex-col rounded-lg bg-white shadow-md md:mx-12 lg:mx-28 xl:mx-auto">
        <table className="min-w-full rounded-lg">
          <thead className="bg-button">
            <tr className="text-lg tracking-wide text-white">
              <th className="rounded-tl-lg px-6 py-3">類型</th>
              <th className="px-6 py-3">貼文標題</th>
              <th className="px-6 py-3">技能交換對象</th>
              <th className="px-6 py-3">課程狀態</th>
              <th className="px-6 py-3">評價</th>
              <th className="rounded-tr-lg px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="rounded-lg text-center text-textcolor">
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
                    className={`px-5 py-4 ${index === portfolio.length - 1 ? "rounded-bl-lg" : ""}`}
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
                    className={`px-5 py-4 ${index === portfolio.length - 1 ? "rounded-br-lg" : ""}`}
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
  );
}

export default LearningPortfolio;
