import PropTypes from "prop-types";

const StarRating = ({ rating }) => {
  const fullStars = Math.floor(rating); // 計算整數部分
  const hasHalfStar = rating % 1 >= 0.25 && rating % 1 < 0.75; // 判斷是否顯示半顆星
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0); // 計算剩餘空星數
  console.log(fullStars, hasHalfStar, emptyStars);

  return (
    <div className="flex">
      {/* 滿星 */}
      {[...Array(fullStars)].map((_, index) => (
        <svg
          key={`full-${index}`}
          className="h-5 w-5 text-yellow-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.54-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.05 9.384c-.784-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
        </svg>
      ))}

      {/* 半星 */}
      {hasHalfStar && (
        <svg className="h-5 w-5" viewBox="0 0 20 20">
          <defs>
            <linearGradient
              id="halfStarGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="50%" stopColor="#FBBF24" /> {/* 黃色的前半部分 */}
              <stop offset="50%" stopColor="#E5E7EB" /> {/* 灰色的後半部分 */}
            </linearGradient>
          </defs>
          <path
            fill="url(#halfStarGradient)"
            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.54-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.05 9.384c-.784-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z"
          />
        </svg>
      )}

      {/* 空星 */}
      {[...Array(emptyStars)].map((_, index) => (
        <svg
          key={`empty-${index}`}
          className="h-5 w-5 text-gray-200"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.54-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.05 9.384c-.784-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
        </svg>
      ))}
    </div>
  );
};

StarRating.propTypes = {
  rating: PropTypes.number.isRequired,
};

export default StarRating;
