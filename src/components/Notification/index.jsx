import { useEffect, useState } from "react";
import dbApi from "../../utils/api";
import PropTypes from "prop-types";

const Notification = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);
  console.log(notifications);

  useEffect(() => {
    const unsubscribe = dbApi.listenToNotifications(
      userId,
      (newNotifications) => {
        setNotifications((prevNotifications) => [
          ...newNotifications,
          ...prevNotifications,
        ]);
      },
    );

    return () => unsubscribe();
  }, [userId]);

  return (
    <div className="absolute right-12 top-0 z-30 mt-[72px] rounded-lg bg-slate-100 px-3 py-1">
      {notifications
        .slice()
        .sort((a, b) => b.created_time.seconds - a.created_time.seconds)
        .slice(0, 5)
        .map((notification, index) => (
          <div key={index} className="my-2 rounded-lg bg-slate-300 px-3 py-2">
            <p className="text-sm">{notification.message.split(" ")[0]}</p>
            <p className="text-sm">
              {notification.fromName} {notification.message.split(" ")[1]}
            </p>
            <small className="text-xs">
              {new Date(
                notification.created_time.seconds * 1000,
              ).toLocaleString()}
            </small>
          </div>
        ))}
    </div>
  );
};

Notification.propTypes = {
  userId: PropTypes.string.isRequired,
};

export default Notification;
