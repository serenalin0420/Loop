import { useEffect, useState } from "react";
import dbApi from "../../utils/api";
import PropTypes from "prop-types";
import coin from "../../assets/coin.svg";
import infinite from "../../assets/infinite.svg";
import { X } from "@phosphor-icons/react";
import { SmileyMelting } from "@phosphor-icons/react";

const ApplicationFromOthers = ({ userId, setCoins }) => {
  const [bookings, setBookings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [postTitle, setPostTitle] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showInsufficientCoinsModal, setShowInsufficientCoinsModal] =
    useState(false);

  useEffect(() => {
    const fetchBookingsAndApplicants = async () => {
      try {
        const bookingsData = await dbApi.getBookingsForUser(userId);
        if (!bookingsData) {
          console.error("No bookings data found");
          return;
        }
        const applicantIds = bookingsData.map((booking) =>
          booking.provider_uid === userId
            ? booking.demander_uid
            : booking.provider_uid,
        );

        const applicantDataPromises = applicantIds.map((id) =>
          dbApi.getProfile(id),
        );
        const applicantsData = await Promise.all(applicantDataPromises);

        const updatedBookingsData = bookingsData.map((booking, index) => ({
          ...booking,
          applicant_uid: applicantIds[index],
          applicant_name: applicantsData[index].name,
          applicant_profile_picture: applicantsData[index].profile_picture,
        }));
        setBookings(updatedBookingsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchBookingsAndApplicants();
  }, [userId]);

  const handleSendMessageClick = (currentBooking) => {
    window.open(`/chat/${currentBooking.applicant_uid}`, "_blank");
  };

  const handleReviewClick = async (booking) => {
    const postTitle = await dbApi.getPostTitle(booking.post_id);
    setSelectedBooking({
      ...booking,
      applicant_name: booking.applicant_name,
      applicant_profile_picture: booking.applicant_profile_picture,
    });
    setPostTitle(postTitle);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
    setPostTitle("");
  };

  const handleRejectClick = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmReject = async () => {
    if (selectedBooking) {
      await dbApi.updateBookingStatus(selectedBooking.id, "cancel");
      setBookings((prevBookings) =>
        prevBookings.filter((booking) => booking.id !== selectedBooking.id),
      );
      setShowConfirmModal(false);
      setShowModal(false);
    }
  };

  const handleAcceptClick = async () => {
    if (selectedBooking) {
      try {
        // 確認代幣足夠
        await dbApi.updateUsersCoins(selectedBooking);

        await dbApi.updateBookingStatus(selectedBooking.id, "confirm");
        setSelectedBooking({ ...selectedBooking, status: "confirm" });

        await dbApi.notifyUsersOnBookingConfirm(selectedBooking, postTitle);

        setBookings((prevBookings) =>
          prevBookings.map((booking) =>
            booking.id === selectedBooking.id
              ? { ...booking, status: "confirm" }
              : booking,
          ),
        );
        const updatedUserProfile = await dbApi.getProfile(userId);
        setCoins(updatedUserProfile.coins);

        setShowModal(false);
        setTimeout(() => {
          setShowSuccessModal(true);
          setTimeout(() => {
            setShowSuccessModal(false);
          }, 2000);
        }, 0);
      } catch (error) {
        if (
          error.message === "Insufficient coins to complete the transaction!"
        ) {
          setShowInsufficientCoinsModal(true);
          setShowModal(false);
        } else {
          console.error("Error accepting booking:", error);
        }
      }
    }
  };

  return (
    <>
      <div className="flex flex-col overflow-x-auto rounded-lg shadow-md">
        <h3 className="max-w-max rounded-r-lg bg-indian-khaki-400 px-4 py-2 text-center tracking-wider text-white">
          他人預約 / 申請
        </h3>
        <div className="flex max-w-full gap-3 overflow-x-auto px-6 py-4">
          {bookings && bookings.length > 0 ? (
            bookings
              .filter(
                (booking) =>
                  booking.status === "pending" || booking.status === "confirm",
              )
              .map((booking, index) => (
                <div
                  key={index}
                  className="flex min-w-[36%] flex-col items-center xs:min-w-[30%] sm:min-w-[42%] md:min-w-[38%] lg:min-w-[25%]"
                >
                  <img
                    src={booking.applicant_profile_picture}
                    className="size-16 rounded-full border-2 border-white bg-red-100 object-cover object-center shadow-md"
                    alt="author"
                  />
                  <p className="mt-2 text-sm">{booking.applicant_name}</p>
                  <button
                    className="mb-4 mt-2 max-w-max rounded-full bg-sun-400 px-3 py-2 text-sm text-white"
                    onClick={() => {
                      const currentBooking = bookings.find(
                        (b) => b.id === booking.id && b.status === "confirm",
                      );
                      if (currentBooking) {
                        handleSendMessageClick(currentBooking);
                      } else {
                        handleReviewClick(bookings[index], booking.applicant);
                      }
                    }}
                  >
                    {bookings.some(
                      (b) => b.id === booking.id && b.status === "confirm",
                    )
                      ? "傳送訊息"
                      : "查看"}
                  </button>
                </div>
              ))
          ) : (
            <p className="my-4 text-stone-500">
              目前沒有人預約，趕快去看看有興趣的貼文!
            </p>
          )}
        </div>
      </div>
      {showModal && selectedBooking && (
        <div className="fixed inset-0 mt-[60px] flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative mx-4 rounded-xl bg-white px-6 py-6 shadow-lg sm:mx-auto md:px-8">
            <button
              className="absolute right-1 top-1 p-2"
              onClick={handleCloseModal}
            >
              <X className="size-6" />
            </button>
            <div className="mb-2 flex">
              <img
                src={selectedBooking.applicant_profile_picture}
                className="size-16 rounded-full border-2 border-white bg-red-100 object-cover object-center shadow-md"
                alt="applicant"
              />
              <div className="ml-1 sm:my-auto">
                <h2 className="my-1 font-semibold">{postTitle}</h2>
                <p>{selectedBooking.applicant_name}</p>
              </div>
              <div className="ml-9 flex flex-col text-sm sm:ml-0 sm:flex-row sm:text-base">
                <p className="ml-2 mr-1 leading-8 sm:ml-8 sm:mt-auto">
                  次數 : {selectedBooking.selected_times.length}
                </p>
                <div className="mt-auto flex flex-col">
                  <div className="mr-2 flex items-center">
                    <p className="pl-2">
                      {selectedBooking.provider_uid === userId
                        ? "獲得 :"
                        : "支付 :"}
                    </p>
                    <img
                      src={coin}
                      alt="coin"
                      className="size-8 object-cover"
                    />
                    <p className="px-1">x {selectedBooking.coins_total}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex h-10 w-full items-center rounded-t-lg bg-indian-khaki-400 px-4 text-white">
              <img
                src={infinite}
                alt="infinite-logo"
                className="mr-2 mt-2 w-12 object-cover"
              />
              <p className="mt-1">學習時間表</p>
            </div>
            {selectedBooking.selected_times.map((time, index) => (
              <p
                key={index}
                className={`px-4 py-2 text-center shadow ${
                  index === selectedBooking.selected_times.length - 1
                    ? "rounded-b-lg"
                    : ""
                } ${index % 2 === 0 ? "bg-white" : "bg-indian-khaki-100"}`}
              >
                {time}
              </p>
            ))}
            <div className="mt-6 flex justify-end">
              <button
                className="mr-4 rounded-md bg-neon-carrot-100 px-4 py-2 shadow"
                onClick={handleRejectClick}
              >
                拒絕
              </button>
              <button
                className="rounded-md bg-neon-carrot-400 px-4 py-2 text-white shadow"
                onClick={handleAcceptClick}
              >
                同意
              </button>
            </div>
          </div>
        </div>
      )}
      {showConfirmModal && (
        <div className="fixed inset-0 mt-[60px] flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 rounded-xl bg-white px-6 py-6 text-center shadow-lg sm:px-12 md:mx-auto md:px-16">
            <p className="text-lg leading-8">
              要拒絕對方的申請嗎? <br />
              再考慮一下吧~別錯過交流的機會!
            </p>
            <div className="flex justify-center">
              <button
                className="mr-4 mt-4 rounded-md bg-neon-carrot-400 px-6 py-2 text-white shadow"
                onClick={() => setShowConfirmModal(false)}
              >
                否
              </button>
              <button
                className="mt-4 rounded-md bg-indian-khaki-100 px-6 py-2 shadow"
                onClick={handleConfirmReject}
              >
                是
              </button>
            </div>
          </div>
        </div>
      )}
      {showSuccessModal && (
        <div className="fixed inset-0 mt-[60px] flex items-center justify-center bg-black bg-opacity-50">
          <div className="rounded-xl bg-white px-12 py-8 text-center shadow-lg">
            <p className="text-lg leading-8">
              恭喜找到技能交換的夥伴!
              <br />
              期待你們的學習旅程~
            </p>
          </div>
        </div>
      )}
      {showInsufficientCoinsModal && (
        <div className="fixed inset-0 mt-[60px] flex items-center justify-center bg-black bg-opacity-50">
          <div className="rounded-xl bg-white px-8 py-6 text-center shadow-md">
            <p className="flex flex-col items-center">
              <span className="mb-1 flex">
                代幣餘額不足 <SmileyMelting className="ml-2 size-6" />
              </span>
              去發布教學來獲得更多代幣吧~
            </p>
            <button
              className="mt-4 rounded-md bg-neon-carrot-400 px-6 py-2 text-white"
              onClick={() => setShowInsufficientCoinsModal(false)}
            >
              關閉
            </button>
          </div>
        </div>
      )}
    </>
  );
};

ApplicationFromOthers.propTypes = {
  userId: PropTypes.string.isRequired,
  setCoins: PropTypes.func.isRequired,
};

export default ApplicationFromOthers;
