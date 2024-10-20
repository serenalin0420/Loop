import LoadingSpinner from "@/components/LoadingSpinner";
import { NotePencil, UploadSimple } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { useContext, useEffect, useReducer, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Select from "react-select";
import { Coin } from "../../assets/images";
import { ProfilePictureContext, UserContext } from "../../context/userContext";
import dbApi from "../../utils/api";
import {
  profileActionTypes,
  profileInitialState,
  profileReducer,
} from "../../utils/profileReducer";
import { sortCategories } from "../CreatePost/options";
import ApplicationFromOthers from "./ApplicationFromOthers";
import SavedPosts from "./SavedPosts";
import UserApplication from "./UserApplication";

const sortCategoriesFn = (categories) => {
  const categoryOrder = sortCategories.reduce((acc, category, index) => {
    acc[category] = index;
    return acc;
  }, {});

  return categories.sort((a, b) => {
    return categoryOrder[a.name] - categoryOrder[b.name];
  });
};
const customStyles = {
  control: (provided, state) => ({
    ...provided,
    fontSize: "16px",
    padding: " 2px 0",
    borderRadius: "0.375rem",
    borderColor: state.isFocused && "#8cd0ed",
    boxShadow: state.isFocused && "#8cd0ed",
    "&:hover": {
      borderColor: state.isFocused && "#8cd0ed",
    },
  }),
  option: (provided, state) => ({
    ...provided,
    fontSize: "16px",
    backgroundColor: state.isSelected
      ? "#c2e4f5"
      : state.isFocused && "#e4f1fa",

    color: state.isSelected ? "#262626" : "#525252",
    ":active": {
      backgroundColor: "#c2e4f5",
    },
  }),
};

const mapCategoriesToOptions = (categories) => {
  const sortedCategories = sortCategoriesFn(categories);
  return sortedCategories.map((category) => ({
    label: category.name,
    value: category.name,
  }));
};

function Profile() {
  const { userId: paramUserId } = useParams();
  const user = useContext(UserContext);
  const { profilePicture, setProfilePicture } = useContext(
    ProfilePictureContext,
  );
  const [state, dispatch] = useReducer(profileReducer, profileInitialState);
  const [isEditing, setIsEditing] = useState(false);
  const [coins, setCoins] = useState(user?.coins || 0);
  const textareaRef = useRef();
  const [userId, setUserId] = useState(paramUserId || user?.uid);
  const [otherPicture, setOtherPicture] = useState("");

  const {
    data: categories,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: dbApi.getCategories,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!paramUserId && user?.uid) {
      setUserId(user.uid);
    }
  }, [paramUserId, user]);

  useEffect(() => {
    const fetchProfile = async () => {
      const uid = userId || user?.uid;
      if (uid) {
        const userProfile = await dbApi.getProfile(uid);
        dispatch({
          type: profileActionTypes.SET_PROFILE,
          payload: {
            userName: userProfile.name,
            bio: userProfile.bio,
            skills: userProfile.skills,
            bgImage: userProfile.bg_image,
          },
        });
        if (uid === userId) {
          setOtherPicture(userProfile.profile_picture || "");
          setProfilePicture(profilePicture);
        }
      }
    };

    fetchProfile();
  }, [user, userId, setProfilePicture, profilePicture]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      textareaRef.current.style.overflow = "hidden";
    }
  }, [state.bio, isEditing]);

  const handleEditClick = async () => {
    if (Object.values(state.errorMessages).some(Boolean)) return;

    if (isEditing) {
      const filteredSkills = state.skills.filter(
        (skill) => skill.skills.trim() && skill.category_name.trim(),
      );
      dispatch({
        type: profileActionTypes.SET_SKILLS,
        payload: filteredSkills,
      });
      await dbApi.updateProfile(user.uid, {
        name: state.userName,
        bio: state.bio,
        skills: filteredSkills,
      });
    }
    setIsEditing(!isEditing);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    const maxSize = 2 * 1024 * 1024;
    if (!file) {
      dispatch({
        type: profileActionTypes.SET_ERROR_MESSAGE,
        field: "profilePicture",
        message: "請選擇一個文件",
      });
      return;
    }

    if (file.size > maxSize) {
      dispatch({
        type: profileActionTypes.SET_ERROR_MESSAGE,
        field: "profilePicture",
        message: "文件大小不能超過 2 MB",
      });

      return;
    } else {
      dispatch({
        type: profileActionTypes.SET_ERROR_MESSAGE,
        field: "profilePicture",
        message: "",
      });
    }

    if (file) {
      try {
        const downloadURL = await dbApi.uploadProfilePicture(user.uid, file);
        setProfilePicture(downloadURL);
        await dbApi.updateUserProfilePicture(user.uid, downloadURL);
      } catch (error) {
        console.error("Error uploading profile picture: ", error);
      }
    }
  };

  const handleInputChange = (field, maxLength) => (e) => {
    const value = e.target.value;
    if (value.length > maxLength) {
      dispatch({
        type: profileActionTypes.SET_ERROR_MESSAGE,
        field: field,
        message: `${field} 不能超過 ${maxLength} 個字元`,
      });
    } else {
      dispatch({
        type: profileActionTypes.SET_ERROR_MESSAGE,
        field: field,
        message: "",
      });
      dispatch({
        type: profileActionTypes[`SET_${field.toUpperCase()}`],
        payload: value,
      });
    }
  };

  const handleSkillChange = (index, selectedOptionOrEvent) => {
    const updatedSkills = [...state.skills];

    if (selectedOptionOrEvent.target) {
      const newSkillValue = selectedOptionOrEvent.target.value;

      if (newSkillValue.trim() === " ") {
        updatedSkills.splice(index, 1);
      } else {
        updatedSkills[index] = {
          ...updatedSkills[index],
          skills: newSkillValue,
        };
      }
    } else {
      updatedSkills[index] = {
        ...updatedSkills[index],
        category_name: selectedOptionOrEvent.value,
      };
    }
    dispatch({ type: profileActionTypes.SET_SKILLS, payload: updatedSkills });
  };

  const addSkill = () => {
    const updatedSkills = [...state.skills, { category_name: "", skills: "" }];
    dispatch({ type: profileActionTypes.SET_SKILLS, payload: updatedSkills });
  };

  const removeSkill = (index) => {
    const updatedSkills = state.skills.filter((_, i) => i !== index);
    dispatch({ type: profileActionTypes.SET_SKILLS, payload: updatedSkills });
  };

  const isCurrentUser = user && user.uid === userId;

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Error loading categories</div>;

  return (
    <div className="my-16 min-h-screen">
      {isCurrentUser ? (
        <div className="relative flex justify-center">
          <img
            className="h-32 w-full object-cover object-center xs:h-40 md:h-44"
            src={user.bg_image}
          ></img>
          <div className="absolute -bottom-20 flex flex-col items-center">
            <img
              src={profilePicture}
              className="size-20 rounded-full border-2 border-white bg-red-100 object-cover object-center shadow-md md:size-24"
              alt="author"
            />
            {isEditing && (
              <div className="absolute -right-8 bottom-14 flex items-center justify-center sm:bottom-12">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="fileInput"
                />
                <button
                  type="button"
                  className="relative flex cursor-pointer items-center justify-center rounded-full text-sm hover:text-indian-khaki-500 hover:underline"
                  onClick={() => document.getElementById("fileInput").click()}
                >
                  <UploadSimple className="mx-1 size-6" />
                  上傳頭像
                </button>
                {state.errorMessages.profilePicture && (
                  <p className="absolute -bottom-4 left-1 text-nowrap text-xs text-red-400 sm:bottom-1 sm:left-24">
                    {state.errorMessages.profilePicture}
                  </p>
                )}
              </div>
            )}
            {isEditing ? (
              <div className="relative flex justify-center">
                <input
                  type="text"
                  value={state.userName}
                  onChange={handleInputChange("userName", 15)}
                  maxLength={15}
                  className="mt-2 w-5/6 rounded-md bg-cerulean-100 px-3 py-2"
                />
                {state.errorMessages.userName && (
                  <p className="absolute -bottom-5 text-xs text-red-400">
                    {state.errorMessages.userName}
                  </p>
                )}
              </div>
            ) : (
              <p className="mt-2 text-center text-lg font-semibold">
                {state.userName}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="relative flex justify-center">
          <img
            className="h-32 w-full object-cover object-center xs:h-40 md:h-44"
            src={state.bgImage}
          ></img>
          <div className="absolute -bottom-20 flex flex-col items-center">
            <img
              src={userId ? otherPicture : profilePicture}
              className="size-20 rounded-full border-2 border-white bg-red-100 object-cover object-center shadow-md md:size-24"
              alt="author"
            />
            <p className="mt-2 text-center text-lg font-semibold">
              {state.userName}
            </p>
          </div>
        </div>
      )}
      <div
        className={`mt-16 grid max-w-screen-lg auto-rows-auto gap-6 px-4 md:mx-8 md:px-0 lg:mx-auto lg:px-4 ${isCurrentUser ? "sm:grid-cols-2" : ""}`}
      >
        <div className="sm:col-span-2">
          <div className="mt-4 flex flex-col">
            {isCurrentUser && (
              <button
                onClick={handleEditClick}
                className={`flex max-w-max gap-2 self-end rounded-full bg-cerulean-200 px-3 py-2 text-sm font-semibold text-textcolor shadow`}
              >
                <NotePencil className="size-5" />
                {isEditing ? "儲存" : "編輯個人資料"}
              </button>
            )}

            <div
              className={`flex gap-6 ${isCurrentUser ? "flex-col sm:flex-row" : "mt-6 flex-col"}`}
            >
              <div
                className={`flex flex-col rounded-lg shadow-md ${isCurrentUser ? "sm:w-1/2" : "sm:mx-6 md:mx-12"}`}
              >
                <h3 className="max-w-max rounded-r-lg bg-indian-khaki-400 px-4 py-2 text-center tracking-wider text-white">
                  簡介
                </h3>
                {isEditing ? (
                  <div className="relative flex">
                    <textarea
                      ref={textareaRef}
                      name="bio"
                      value={state.bio}
                      onChange={handleInputChange("bio", 200)}
                      maxLength={200}
                      className="mx-6 mb-6 mt-4 w-full rounded-md bg-cerulean-100 px-3 py-2"
                    />
                    {state.errorMessages.bio && (
                      <p className="absolute bottom-1 left-8 text-xs text-red-400">
                        {state.errorMessages.bio}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="mx-6 mb-6 mt-4 rounded-md">{state.bio}</p>
                )}
              </div>

              <div
                className={`flex flex-col rounded-lg shadow-md ${isCurrentUser ? "sm:w-1/2" : "sm:mx-6 md:mx-12"}`}
              >
                <h3 className="max-w-max rounded-r-lg bg-indian-khaki-400 px-4 py-2 text-center tracking-wider text-white">
                  技能
                </h3>
                {isEditing ? (
                  <div className="mt-4 flex flex-col items-center gap-y-2">
                    {state.skills.map((skill, index) => (
                      <div
                        key={index}
                        className="flex w-full items-center gap-3 px-6"
                      >
                        <Select
                          name="category_name"
                          placeholder="類別"
                          value={mapCategoriesToOptions(categories).find(
                            (option) => option.value === skill.category_name,
                          )}
                          onChange={(selectedOption) =>
                            handleSkillChange(index, selectedOption)
                          }
                          options={mapCategoriesToOptions(categories)}
                          className="w-7/12 rounded-md"
                          styles={customStyles}
                        />
                        <input
                          name="skills"
                          value={skill.skills}
                          onChange={(e) => handleSkillChange(index, e)}
                          className="w-full rounded-md bg-cerulean-100 px-3 py-2"
                        />
                        <button
                          onClick={() => removeSkill(index)}
                          className="text-nowrap rounded bg-stone-200 px-2 py-2 text-sm text-stone-500"
                        >
                          刪除
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={addSkill}
                      className="mb-4 mt-2 max-w-max rounded-full bg-indian-khaki-400 px-4 py-2 text-sm text-white shadow"
                    >
                      新增技能
                    </button>
                  </div>
                ) : (
                  <div className="mb-6">
                    {state.skills.map((skill, index) => (
                      <div
                        key={index}
                        className="mx-6 mt-4 flex flex-col gap-1 rounded-md md:flex-row md:items-center md:gap-3"
                      >
                        <p className="max-w-max text-nowrap rounded-md bg-cerulean-100 px-3 py-1">
                          {skill.category_name}
                        </p>
                        <p className="ml-4 md:ml-0">- {skill.skills}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {isCurrentUser && (
          <>
            <ApplicationFromOthers userId={user.uid} setCoins={setCoins} />
            <UserApplication userId={user.uid} />
          </>
        )}
        {isCurrentUser && (
          <div className="flex h-fit flex-col rounded-lg shadow-md">
            <h3 className="max-w-max rounded-r-lg bg-indian-khaki-400 px-4 py-2 text-center tracking-wider text-white">
              代幣數量
            </h3>
            <div className="flex items-center gap-2 px-6 py-4">
              <Coin alt="coin" className="size-14 object-cover" />
              <p className="text-xl font-bold text-yellow-800">{coins}枚</p>
            </div>
          </div>
        )}

        {isCurrentUser && <SavedPosts userId={user.uid} />}
      </div>
    </div>
  );
}
export default Profile;
