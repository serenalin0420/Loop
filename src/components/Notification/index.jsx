import { useEffect, useRef, useState } from "react";
import dbApi from "../../utils/api";
import PropTypes from "prop-types";
import Modal from "./Modal";

const Notification = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);
  const intervalRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    const unsubscribe = dbApi.listenToNotifications(
      userId,
      (newNotifications) => {
        setNotifications((prevNotifications) => {
          const prevNotificationIds = new Set(
            prevNotifications.map((n) => n.id),
          );
          const filteredNewNotifications = newNotifications.filter(
            (n) => !prevNotificationIds.has(n.id),
          );

          return [...filteredNewNotifications, ...prevNotifications];
        });
      },
    );

    const checkNotifications = async () => {
      const now = new Date();
      console.log(now.getMinutes());
      if (now.getMinutes() >= 50 && now.getMinutes() <= 53) {
        const courseEndtimeNotifications =
          await dbApi.checkCourseEndtimeNotifications(userId);
        setNotifications((prevNotifications) => [
          ...courseEndtimeNotifications,
          ...prevNotifications,
        ]);
      }
    };

    intervalRef.current = setInterval(checkNotifications, 60000);

    return () => {
      unsubscribe();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [userId]);

  console.log(notifications);

  return (
    <div className="fixed right-12 top-0 z-30 mt-[72px] min-w-48 rounded-lg bg-slate-100 px-3 py-1">
      {notifications.length === 0 ? (
        <p className="px-12">沒有通知</p>
      ) : (
        notifications
          .slice()
          .sort((a, b) => b.created_time.seconds - a.created_time.seconds)
          .slice(0, 5)
          .map((notification, index) => (
            <div key={index} className="my-2 rounded-lg bg-slate-200 px-3 py-2">
              <p className="text-sm">{notification.message.split(" ")[0]}</p>
              <p className="text-sm">
                {notification.fromName} {notification.message.split(" ")[1]}
              </p>
              {notification.type === "booking_confirm" && (
                <span className="text-xs">
                  {`${new Date(
                    notification.created_time.seconds * 1000,
                  ).toLocaleDateString("zh-TW", {
                    month: "numeric",
                    day: "numeric",
                  })}  ${new Date(
                    notification.created_time.seconds * 1000,
                  ).toLocaleTimeString("zh-TW", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}`}
                </span>
              )}
              {notification.type === "course_endtime" && (
                <div className="mt-2">
                  <span className="text-xs">
                    {notification.time.split(" ")[0]}
                    {notification.time.split(")")[1]}
                  </span>
                  <button
                    className="ml-6 rounded-md bg-amber-600 px-3 py-2 text-xs text-white"
                    onClick={handleOpenModal}
                  >
                    填寫學習歷程
                  </button>
                  {isModalOpen && (
                    <Modal
                      notification={notification}
                      onClose={handleCloseModal}
                    />
                  )}
                </div>
              )}
            </div>
          ))
      )}
    </div>
  );
};

Notification.propTypes = {
  userId: PropTypes.string.isRequired,
};

export default Notification;
