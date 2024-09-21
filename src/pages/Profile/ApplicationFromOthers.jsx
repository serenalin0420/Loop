import { useEffect, useState } from "react";
import dbApi from "../../utils/api";
import PropTypes from "prop-types";
import coin from "../../components/coin.svg";
import infinite from "../../components/infinite.svg";

const ApplicationFromOthers = ({ userId }) => {
  const [bookings, setBookings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [postTitle, setPostTitle] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const fetchBookingsAndApplicants = async () => {
      try {
        const bookingsData = await dbApi.getBookingsForUser(userId);
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
      await dbApi.updateBookingStatus(selectedBooking.id, "confirm");
      await dbApi.updateUsersCoins(selectedBooking);
      setSelectedBooking({ ...selectedBooking, status: "confirm" });
      setShowModal(false);
      setTimeout(() => {
        setShowSuccessModal(true);
        setTimeout(() => {
          setShowSuccessModal(false);
        }, 2000);
      }, 0);
    }
  };

  return (
    <div className="flex gap-4">
      <div className="flex w-1/2 flex-col rounded-lg shadow-md">
        <h3 className="max-w-max rounded-r-lg bg-[#BFAA87] px-4 py-2 text-center tracking-wider text-white">
          他人預約 / 申請
        </h3>
        <div className="flex gap-8 px-6 py-4">
          {bookings && bookings.length > 0 ? (
            bookings
              .filter(
                (booking) =>
                  booking.status === "pending" || booking.status === "confirm",
              )
              .map((booking, index) => (
                <div key={index} className="flex flex-col items-center">
                  <img
                    src={booking.applicant_profile_picture}
                    className="size-20 rounded-full border-2 border-white bg-red-100 object-cover object-center p-2 shadow-md"
                    alt="author"
                  />
                  <p className="mt-2">{booking.applicant_name}</p>
                  <button
                    className="mb-4 mt-2 max-w-max rounded-full bg-yellow-700 px-4 py-2 text-sm text-white"
                    onClick={() => {
                      if (
                        selectedBooking &&
                        selectedBooking.id === booking.id &&
                        selectedBooking.status === "confirm"
                      ) {
                        console.log("傳送訊息");
                      } else {
                        handleReviewClick(bookings[index], booking.applicant);
                      }
                    }}
                  >
                    {selectedBooking &&
                    selectedBooking.id === booking.id &&
                    selectedBooking.status === "confirm"
                      ? "傳送訊息"
                      : "審核"}
                  </button>
                </div>
              ))
          ) : (
            <p>Loading applicants...</p>
          )}
        </div>
      </div>
      {showModal && selectedBooking && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="rounded-xl bg-white px-8 py-6 shadow-lg">
            <div className="mb-4 flex">
              <img
                src={selectedBooking.applicant_profile_picture}
                className="size-20 rounded-full border-2 border-white bg-red-100 object-cover object-center p-2 shadow-md"
                alt="applicant"
              />
              <div className="my-auto ml-3">
                <h2 className="mb-2 mt-1 text-lg font-semibold">{postTitle}</h2>
                <p>{selectedBooking.applicant_name}</p>
              </div>
              <p className="mb-2 mr-2 mt-auto">
                次數 : {selectedBooking.selected_times.length}
              </p>
              <div className="flex flex-col items-end">
                <button className="p-2" onClick={handleCloseModal}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                <div className="mr-2 flex items-center">
                  <p className="p-2">
                    {selectedBooking.provider_uid === userId
                      ? "獲得 : "
                      : "支付 : "}
                  </p>
                  <img src={coin} alt="coin" className="size-9 object-cover" />
                  <p className="px-2">x {selectedBooking.coins_total}</p>
                </div>
              </div>
            </div>
            <div className="jus flex h-11 w-full items-center rounded-t-lg bg-zinc-500 px-4 text-white">
              <img
                src={infinite}
                alt="infinite-logo"
                className="mr-2 mt-2 w-12 object-cover"
              />
              學習時間表
            </div>
            {selectedBooking.selected_times.map((time, index) => (
              <p
                key={index}
                className="px-4 py-2 text-center"
                style={{
                  backgroundColor: index % 2 === 0 ? "white" : "lightgray",
                }}
              >
                {time}
              </p>
            ))}
            <div className="flex justify-end">
              <button
                className="mr-4 mt-4 rounded-md bg-slate-300 px-6 py-2"
                onClick={handleRejectClick}
              >
                拒絕
              </button>
              <button
                className="mt-4 rounded-md bg-orange-400 px-6 py-2 text-white"
                onClick={handleAcceptClick}
              >
                同意
              </button>
            </div>
          </div>
        </div>
      )}
      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="rounded-xl bg-white px-20 py-6 text-center shadow-lg">
            <p className="text-lg leading-8">
              要拒絕對方的申請嗎? <br />
              再考慮一下吧~別錯過交流的機會!
            </p>
            <div className="flex justify-center">
              <button
                className="mr-4 mt-4 rounded-md bg-slate-300 px-6 py-2"
                onClick={() => setShowConfirmModal(false)}
              >
                否
              </button>
              <button
                className="mt-4 rounded-md bg-red-400 px-6 py-2 text-white"
                onClick={handleConfirmReject}
              >
                是
              </button>
            </div>
          </div>
        </div>
      )}
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="rounded-xl bg-white px-12 py-8 text-center shadow-lg">
            <p className="text-lg leading-8">
              恭喜找到技能交換的夥伴!
              <br />
              期待你們的學習旅程~
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

ApplicationFromOthers.propTypes = {
  userId: PropTypes.string.isRequired,
};

export default ApplicationFromOthers;
