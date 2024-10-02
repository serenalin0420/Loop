import PropTypes from "prop-types";
import { X, SmileyWink } from "@phosphor-icons/react";

const IsLoggedIn = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 mt-[60px] flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative flex flex-col items-center rounded-lg bg-white p-6 shadow-lg">
        <button
          className="absolute right-2 top-2 p-2 text-textcolor"
          onClick={onClose}
        >
          <X className="size-6" />
        </button>
        <h2 className="flex items-center text-xl font-bold">
          還沒登入嗎~ <SmileyWink className="ml-1 size-6" />
        </h2>

        <p className="mt-3 text-center">
          發布內容要先登入，
          <br />
          才能查看誰對你的內容有興趣喔！
        </p>
        <button
          className="bg-neon-carrot-400 mt-4 max-w-max rounded-md px-4 py-2 text-white"
          onClick={() => (window.location.href = "/login")}
        >
          前往登入頁
        </button>
      </div>
    </div>
  );
};

IsLoggedIn.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default IsLoggedIn;
