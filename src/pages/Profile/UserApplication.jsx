import { X } from "@phosphor-icons/react";
import PropTypes from "prop-types";
import { useEffect, useReducer, useState } from "react";
import { Coin, Infinte } from "../../assets/images";
import dbApi from "../../utils/api";
import {
  uiActionTypes,
  uiInitialState,
  uiReducer,
} from "../../utils/uiReducer";

const UserApplication = ({ userId }) => {
  const [uiState, uiDispatch] = useReducer(uiReducer, uiInitialState);
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [postTitle, setPostTitle] = useState("");

  useEffect(() => {
    const fetchBookingsAndApplicants = async () => {
      try {
        const bookingsData = await dbApi.getUserBookings(userId);
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

        const sortedBookings = updatedBookingsData.sort(
          (a, b) => b.created_time.seconds - a.created_time.seconds,
        );

        setBookings(sortedBookings);
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
    uiDispatch({ type: uiActionTypes.SET_SHOW_MODAL, payload: true });
  };

  const handleCloseModal = () => {
    uiDispatch({ type: uiActionTypes.SET_SHOW_MODAL, payload: false });
    setSelectedBooking(null);
    setPostTitle("");
  };

  const handleRejectClick = () => {
    uiDispatch({ type: uiActionTypes.SET_CONFIRM_MODAL, payload: true });
  };

  const handleConfirmReject = async () => {
    if (selectedBooking) {
      await dbApi.updateBookingStatus(selectedBooking.id, "cancel");
      await dbApi.cancelBookingTimes(
        selectedBooking.post_id,
        selectedBooking.selected_times,
      );

      setBookings((prevBookings) =>
        prevBookings.filter((booking) => booking.id !== selectedBooking.id),
      );

      uiDispatch({ type: uiActionTypes.SET_CONFIRM_MODAL, payload: false });
      uiDispatch({ type: uiActionTypes.SET_SHOW_MODAL, payload: false });
    }
  };

  return (
    <>
      <div className="flex flex-col overflow-x-auto rounded-lg shadow-md">
        <h3 className="max-w-max rounded-r-lg bg-indian-khaki-400 px-4 py-2 text-center tracking-wider text-white">
          自己預約 / 申請
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
              還沒找到喜歡的貼文嗎？ 趕快去看看有興趣的貼文！
            </p>
          )}
        </div>
      </div>
      {uiState.showModal && selectedBooking && (
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
                    <Coin alt="coin" className="size-8 object-cover" />
                    <p className="px-1">x {selectedBooking.coins_total}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex h-10 w-full items-center rounded-t-lg bg-indian-khaki-400 px-4 text-white">
              <Infinte
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
                取消預約
              </button>
              <button
                className="rounded-md bg-neon-carrot-400 px-6 py-2 text-white shadow"
                onClick={handleCloseModal}
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}
      {uiState.showConfirmModal && (
        <div className="fixed inset-0 mt-[60px] flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 rounded-xl bg-white px-20 py-6 text-center shadow-lg sm:px-28 md:mx-auto">
            <p className="text-lg leading-8">
              要放棄你的申請嗎? <br />
              再考慮一下吧!
            </p>
            <div className="flex justify-center">
              <button
                className="mr-4 mt-4 rounded-md bg-neon-carrot-400 px-6 py-2 text-white shadow"
                onClick={() => {
                  uiDispatch({
                    type: uiActionTypes.SET_CONFIRM_MODAL,
                    payload: false,
                  });
                }}
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
    </>
  );
};

UserApplication.propTypes = {
  userId: PropTypes.string.isRequired,
};

export default UserApplication;
