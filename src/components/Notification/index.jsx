import { useEffect, useState } from "react";
import dbApi from "../../utils/api";
import PropTypes from "prop-types";
import Modal from "./Modal";

const Notification = ({ userId, notifications }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState();
  const [filledNotifications, setFilledNotifications] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const handleOpenModal = (notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedNotification();
    setFilledNotifications((prev) =>
      new Set(prev).add(selectedNotification.id),
    );
  };

  useEffect(() => {
    const checkFilledNotifications = async () => {
      const filled = new Set();
      for (const notification of notifications) {
        if (notification.type === "course_endtime") {
          const isFilled = await dbApi.hasUserFilledLearningPortfolio(
            userId,
            notification.booking_id,
            notification.sequence_number,
          );

          if (isFilled) {
            filled.add(notification.id);
          }
        }
      }
      setFilledNotifications(filled);
      setLoading(false);
    };

    checkFilledNotifications();
  }, [notifications, userId]);

  // 將通知分類並排序
  const sortedNotifications = notifications.slice().reduce(
    (acc, notification) => {
      if (notification.type === "booking_confirm") {
        acc.bookingConfirm.push(notification);
      } else if (notification.type === "course_endtime") {
        acc.courseEndtime.push(notification);
      }
      return acc;
    },
    { bookingConfirm: [], courseEndtime: [] },
  );

  const allNotifications = [
    ...sortedNotifications.courseEndtime,
    ...sortedNotifications.bookingConfirm,
  ];

  // 根據時間和條件進行排序
  allNotifications.sort((a, b) => {
    const getTime = (notification) => {
      if (notification.type === "course_endtime") {
        const [date, timeRange] = notification.time.split("   ");
        const [startTime] = timeRange.split(" - ");
        const dateTimeString = `${date} ${startTime}`;
        return new Date(dateTimeString).getTime();
      } else if (notification.type === "booking_confirm") {
        return notification.created_time.seconds * 1000;
      }
      return 0;
    };

    // 若 booking_id 相同，type=booking_confirm 的通知排在 type=course_endtime 的下面
    if (a.booking_id === b.booking_id) {
      if (a.type === "booking_confirm" && b.type === "course_endtime") {
        return 1;
      } else if (a.type === "course_endtime" && b.type === "booking_confirm") {
        return -1;
      }
    }

    // 若 booking_id 不同，type=booking_confirm 用 created_time 轉換、type=course_endtime 的用 time 轉換，拿兩者比較
    const timeA = getTime(a);
    const timeB = getTime(b);
    if (timeA !== timeB) {
      return timeB - timeA;
    }

    // 都是 type=course_endtime 的通知，根據 time 排序
    if (a.type === "course_endtime" && b.type === "course_endtime") {
      return timeB - timeA;
    }
  });

  const finalNotifications = allNotifications.slice(0, 5);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="fixed right-12 top-0 z-30 mt-[72px] min-w-48 rounded-lg bg-slate-100 px-3 py-1">
      {finalNotifications.length === 0 ? (
        <p className="px-12">沒有通知</p>
      ) : (
        finalNotifications.map((notification, index) => (
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
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs">
                  {notification.time.split(" ")[0]}
                  {notification.time.split(")")[1]}
                </span>
                {filledNotifications.has(notification.id) ? (
                  <div className="rounded-md bg-stone-400 px-3 py-2 text-xs text-white">
                    已填寫
                  </div>
                ) : (
                  <button
                    className="ml-6 rounded-md bg-amber-500 px-3 py-2 text-xs text-white"
                    onClick={() => handleOpenModal(notification)}
                  >
                    填寫學習歷程
                  </button>
                )}
                {isModalOpen && selectedNotification && (
                  <Modal
                    notification={selectedNotification}
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
  notifications: PropTypes.array.isRequired,
};

export default Notification;
