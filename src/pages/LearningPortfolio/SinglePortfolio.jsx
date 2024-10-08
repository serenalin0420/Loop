import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import dbApi from "@/utils/api";
import coin from "@/assets/coin.svg";

function SinglePortfolio() {
  const location = useLocation();
  const { userId } = useParams();
  const { portfolio: initialPortfolio } = location.state || {};
  const [portfolio, setPortfolio] = useState(initialPortfolio);
  const [currentFeedbackIndex, setCurrentFeedbackIndex] = useState(0);
  const [providerProfile, setProviderProfile] = useState();
  const [demanderProfile, setDemanderProfile] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!portfolio && userId) {
      const fetchPortfolio = async () => {
        try {
          const fetchedPortfolio = await dbApi.getPortfolio(userId);
          setPortfolio(fetchedPortfolio);
        } catch (error) {
          console.error(error);
        }
      };
      fetchPortfolio();
    }
  }, [portfolio, userId]);

  useEffect(() => {
    if (portfolio) {
      const fetchProfile = async () => {
        try {
          const providerProfile = await dbApi.getProfile(
            portfolio.provider_uid,
          );
          const demanderProfile = await dbApi.getProfile(
            portfolio.demander_uid,
          );
          setProviderProfile(providerProfile);
          setDemanderProfile(demanderProfile);
        } catch (error) {
          console.error(error);
        }
      };
      fetchProfile();
    }
  }, [portfolio]);

  const feedback = portfolio?.feedback || [];
  const currentFeedback = feedback[currentFeedbackIndex] || {};

  const handleGoBack = () => {
    navigate(-1);
  };

  const handlePrevClick = () => {
    setCurrentFeedbackIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : feedback.length - 1,
    );
  };

  const handleNextClick = () => {
    setCurrentFeedbackIndex((prevIndex) =>
      prevIndex < feedback.length - 1 ? prevIndex + 1 : 0,
    );
  };

  const handleDotClick = (index) => {
    setCurrentFeedbackIndex(index);
  };

  if (!portfolio) {
    return (
      <div className="col-span-3 mt-6 flex h-5/6 items-center justify-center">
        <div className="flex flex-col items-center justify-center text-indian-khaki-800">
          <img src={coin} className="my-2 size-16 animate-swing" />
          <p>請再稍等一下...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow py-20">
      <div className="mx-4 mb-4 flex max-w-screen-lg cursor-pointer items-center sm:mx-6 md:mx-12 lg:mx-28 xl:mx-auto">
        <div className="flex items-center gap-6">
          <div
            onClick={handleGoBack}
            className="flex cursor-pointer items-center"
          >
            <CaretLeft className="size-6 sm:size-8" />
            返回
          </div>
          <h2 className="text-lg font-semibold sm:text-xl">學習歷程</h2>
        </div>
      </div>
      <div className="mx-4 py-6 sm:hidden">
        <h1 className="text-center text-xl font-semibold">
          {portfolio.post_title} 第 {currentFeedback.course} 堂
        </h1>
        <div className="mt-4 flex items-center justify-between">
          <CaretLeft
            onClick={handlePrevClick}
            className="size-8 rounded-full bg-indian-khaki-50 p-1 text-indian-khaki-800 hover:bg-indian-khaki-200 active:bg-indian-khaki-200"
            weight="bold"
          />
          <div className="mx-2 w-5/6">
            <div className="mb-6 flex flex-1 justify-between gap-1">
              <div className="flex min-w-16 flex-col items-center gap-2 text-nowrap text-center">
                <img
                  src={providerProfile?.profile_picture}
                  className="size-12 rounded-full border-white bg-red-100 object-cover object-center shadow"
                  alt="author"
                />
                <p className="text-sm sm:text-base">{providerProfile?.name}</p>
              </div>
              <div className="ml-1 flex w-full flex-col">
                <p className="mb-1 ml-1 text-xs sm:text-sm">
                  {currentFeedback.time}
                </p>
                <h4
                  className={`w-full rounded-lg p-3 ${currentFeedback.course % 2 === 0 ? "bg-cerulean-50" : "bg-neon-carrot-50"}`}
                >
                  {currentFeedback.provider_feedback ? (
                    currentFeedback.provider_feedback
                  ) : (
                    <span className="text-stone-400">尚未填寫</span>
                  )}
                </h4>
              </div>
            </div>
            <div className="mb-6 flex flex-1 justify-between gap-1">
              <div className="flex min-w-16 flex-col items-center gap-2 text-nowrap text-center">
                <img
                  src={demanderProfile?.profile_picture}
                  className="size-12 rounded-full border-white bg-red-100 object-cover object-center shadow"
                  alt="author"
                />
                <p className="text-sm">{demanderProfile?.name}</p>
              </div>
              <div className="ml-1 flex w-full flex-col">
                <p className="mb-1 ml-1 text-xs">{currentFeedback.time}</p>
                <h4
                  className={`w-full rounded-lg p-3 ${currentFeedback.course % 2 === 0 ? "bg-cerulean-50" : "bg-neon-carrot-50"}`}
                >
                  {currentFeedback.demander_feedback ? (
                    currentFeedback.demander_feedback
                  ) : (
                    <span className="text-stone-400">尚未填寫</span>
                  )}
                </h4>
              </div>
            </div>
          </div>
          <CaretRight
            onClick={handleNextClick}
            className="size-8 rounded-full bg-indian-khaki-50 p-1 text-indian-khaki-800 hover:bg-indian-khaki-200 active:bg-indian-khaki-200"
            weight="bold"
          />
        </div>

        <div className="mt-4 flex justify-center gap-3">
          {feedback.map((_, index) => (
            <button
              key={index}
              className={`size-2 rounded-full ${index === currentFeedbackIndex ? "bg-indian-khaki-500" : "bg-stone-200"}`}
              onClick={() => handleDotClick(index)}
            ></button>
          ))}
        </div>
      </div>

      {/* desktop */}
      <div className="mx-6 hidden max-w-screen-lg flex-col sm:flex md:mx-12 lg:mx-28 xl:mx-auto">
        <h1 className="mb-4 text-center text-xl font-semibold">
          {portfolio.post_title}
        </h1>
        <div className="mx-auto mb-2 flex items-center gap-2">
          技能提供者:
          <img
            src={providerProfile?.profile_picture}
            className="size-12 rounded-full border-white bg-red-100 object-cover object-center shadow"
            alt="技能提供者"
          />
          <p className="text-base">{providerProfile?.name}</p>
        </div>
        <div className="mx-auto mb-4 flex items-center gap-2">
          技能需求者:
          <img
            src={demanderProfile?.profile_picture}
            className="size-12 rounded-full border-white bg-red-100 object-cover object-center shadow"
            alt="技能需求者"
          />
          <p className="text-base">{demanderProfile?.name}</p>
        </div>
        {portfolio.feedback.map((item, index) => (
          <div
            key={index}
            className="mx-2 mb-6 rounded-xl p-4 shadow md:mx-4 md:px-8 lg:px-12"
          >
            <div className="mx-2 flex">
              <p>第 {item.course} 堂</p>
              <p className="ml-2">{item.time}</p>
            </div>
            <div className="mx-2">
              <div className="mb-4 mt-2 flex items-center gap-2">
                <p className="min-w-20 text-nowrap text-base">
                  {providerProfile?.name}
                </p>
                <h4
                  className={`w-full rounded-lg p-3 md:w-5/6 ${item.course % 2 === 0 ? "bg-cerulean-50" : "bg-neon-carrot-50"}`}
                >
                  {item.provider_feedback ? (
                    item.provider_feedback
                  ) : (
                    <span className="text-stone-400">尚未填寫</span>
                  )}
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <p className="min-w-20 text-nowrap text-base">
                  {demanderProfile?.name}
                </p>
                <h4
                  className={`w-full rounded-lg p-3 md:w-5/6 ${item.course % 2 === 0 ? "bg-cerulean-50" : "bg-neon-carrot-50"}`}
                >
                  {item.demander_feedback ? (
                    item.demander_feedback
                  ) : (
                    <span className="text-stone-400">尚未填寫</span>
                  )}
                </h4>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SinglePortfolio;
