import { UploadSimple } from "@phosphor-icons/react";
import PropTypes from "prop-types";
import { useRef } from "react";

const ProfilePictureUpload = ({ onChange, errorMessage }) => {
  const fileInputRef = useRef(null);

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="absolute -right-8 bottom-14 flex items-center justify-center sm:bottom-12">
      <input
        type="file"
        accept="image/*"
        onChange={onChange}
        ref={fileInputRef}
        className="hidden"
      />
      <button
        type="button"
        className="relative flex cursor-pointer items-center justify-center rounded-full text-sm hover:text-indian-khaki-500 hover:underline"
        onClick={handleClick}
      >
        <UploadSimple className="mx-1 size-6" />
        上傳頭像
      </button>
      {errorMessage && (
        <p className="absolute -bottom-4 left-1 text-nowrap text-xs text-red-400 sm:bottom-1 sm:left-24">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

ProfilePictureUpload.propTypes = {
  onChange: PropTypes.func.isRequired,
  errorMessage: PropTypes.string.isRequired,
};

export default ProfilePictureUpload;
