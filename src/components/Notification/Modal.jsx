import { useRef, useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import { X } from "@phosphor-icons/react";
import { UserContext } from "../../context/userContext";
import dbApi from "../../utils/api";

function Modal({ notification, onClose }) {
  const user = useContext(UserContext);
  const [feedback, setFeedback] = useState("");
  const [suggestions, setSuggestions] = useState("");
  const [rating, setRating] = useState(0);
  const feedbackRef = useRef();
  const suggestionsRef = useRef();

  const handleRating = (index) => {
    setRating(index + 1);
  };

  useEffect(() => {
    if (feedbackRef.current) {
      feedbackRef.current.style.height = "auto";
      feedbackRef.current.style.height = `${feedbackRef.current.scrollHeight}px`;
    }
  }, [feedback]);

  useEffect(() => {
    if (suggestionsRef.current) {
      suggestionsRef.current.style.height = "auto";
      suggestionsRef.current.style.height = `${suggestionsRef.current.scrollHeight}px`;
    }
  }, [suggestions]);

  const handleSubmit = async () => {
    try {
      const data = {
        feedback,
        suggestions,
        rating,
        notification,
      };

      await dbApi.saveLearningPortfolioToDatabase(data, user?.uid);
      onClose();
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-zinc-800 bg-opacity-20">
      <div className="w-1/2 rounded-lg bg-white p-6">
        <div className="flex justify-between">
          <h2 className="text-lg font-bold">
            {`${notification.post_title}  第 ${notification.sequence_number} 堂`}
          </h2>
          <X className="size-6" onClick={onClose} />
        </div>
        <div className="my-4">
          <label>心得</label>
          <textarea
            ref={feedbackRef}
            placeholder="在本次交流中你獲得哪些收穫? 都記錄下來吧~"
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label>其他建議</label>
          <textarea
            ref={suggestionsRef}
            placeholder="有什麼可以做得更好的地方?"
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            value={suggestions}
            onChange={(e) => setSuggestions(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label>評價</label>
          <div className="mt-1 flex gap-1">
            {[...Array(5)].map((_, index) => (
              <svg
                key={index}
                className={`size-8 cursor-pointer ${index < rating ? "text-yellow-400" : "text-slate-200"}`}
                fill="currentColor"
                viewBox="0 0 20 20"
                onClick={() => handleRating(index)}
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.97a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.392 2.46a1 1 0 00-.364 1.118l1.286 3.97c.3.921-.755 1.688-1.54 1.118l-3.392-2.46a1 1 0 00-1.175 0l-3.392 2.46c-.784.57-1.838-.197-1.54-1.118l1.286-3.97a1 1 0 00-.364-1.118L2.34 9.397c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.97z" />
              </svg>
            ))}
          </div>
        </div>
        <div className="flex justify-end">
          <button
            className="mt-4 rounded-md bg-orange-400 px-6 py-2 text-white"
            onClick={handleSubmit}
          >
            送出
          </button>
        </div>
      </div>
    </div>
  );
}

Modal.propTypes = {
  notification: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Modal;
