import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import dbApi from "@/utils/api";

function SinglePortfolio() {
  const location = useLocation();
  const { portfolio } = location.state || {};
  const [currentFeedbackIndex, setCurrentFeedbackIndex] = useState(0);
  const [providerProfile, setProviderProfile] = useState();
  const [demanderProfile, setDemanderProfile] = useState();
  const feedback = portfolio.feedback;
  const currentFeedback = feedback[currentFeedbackIndex];
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const providerProfile = await dbApi.getProfile(portfolio.provider_uid);
        const demanderProfile = await dbApi.getProfile(portfolio.demander_uid);
        setProviderProfile(providerProfile);
        setDemanderProfile(demanderProfile);
      } catch (error) {
        console.error(error);
      }
    };
    fetchProfile();
  }, [portfolio]);

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
    return <div>Loading...</div>;
  }

  return (
    <div className="h-screen bg-[#f2f9fd] py-20">
      <div
        onClick={handleGoBack}
        className="mx-6 mb-4 flex max-w-screen-lg items-center md:mx-12 lg:mx-28 xl:mx-auto"
      >
        <CaretLeft className="size-8" />
        返回 學習歷程
      </div>
      <div className="mx-6 flex max-w-screen-lg flex-col rounded-xl bg-white px-4 py-6 shadow-md md:mx-12 lg:mx-28 xl:mx-auto">
        <h1 className="text-center text-xl font-semibold">
          {portfolio.post_title} 第 {currentFeedback.course} 堂
        </h1>
        <div className="mt-4 flex items-center justify-between">
          <CaretLeft
            onClick={handlePrevClick}
            className="size-10 rounded-full bg-orange-50 p-2 text-orange-800 hover:bg-orange-200 active:bg-orange-200"
            weight="bold"
          />
          <div className="mx-4 w-4/5">
            <div className="mb-6 flex flex-1 items-center justify-around">
              <div className="text-center">
                <img
                  src={providerProfile?.profile_picture}
                  className="size-16 rounded-full border-white bg-red-100 object-cover object-center p-1"
                  alt="author"
                />
                <p>{providerProfile?.name}</p>
              </div>
              <h4 className="mb-2 ml-3 w-5/6 rounded-lg bg-orange-50 p-4">
                {currentFeedback.provider_feedback ? (
                  currentFeedback.provider_feedback
                ) : (
                  <span className="text-stone-400">尚未填寫</span>
                )}
              </h4>
            </div>
            <div className="mb-6 flex flex-1 items-center justify-around">
              <div className="text-center">
                <img
                  src={demanderProfile?.profile_picture}
                  className="size-16 rounded-full border-white bg-red-100 object-cover object-center p-1"
                  alt="author"
                />
                <p>{demanderProfile?.name}</p>
              </div>
              <h4 className="mb-2 ml-3 w-5/6 rounded-lg bg-orange-50 p-4">
                {currentFeedback.demander_feedback ? (
                  currentFeedback.demander_feedback
                ) : (
                  <span className="text-stone-400">尚未填寫</span>
                )}
              </h4>
            </div>
          </div>

          <CaretRight
            onClick={handleNextClick}
            className="size-10 rounded-full bg-orange-50 p-2 text-orange-800 hover:bg-orange-200 active:bg-orange-200"
            weight="bold"
          />
        </div>

        <div className="mt-4 flex justify-center gap-3">
          {feedback.map((_, index) => (
            <button
              key={index}
              className={`size-2 rounded-full ${index === currentFeedbackIndex ? "bg-orange-400" : "bg-stone-300"}`}
              onClick={() => handleDotClick(index)}
            ></button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SinglePortfolio;
