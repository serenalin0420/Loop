import LoadingSpinner from "@/components/LoadingSpinner";
import { NotePencil } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { useContext, useEffect, useReducer, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Coin } from "../../assets/images";
import { ProfilePictureContext, UserContext } from "../../context/userContext";
import dbApi from "../../utils/api";
import {
  profileActionTypes,
  profileInitialState,
  profileReducer,
} from "../../utils/profileReducer";
import ApplicationFromOthers from "./ApplicationFromOthers";
import ProfilePictureUpload from "./ProfilePictureUpload";
import SavedPosts from "./SavedPosts";
import SkillSection from "./SkillSection";
import UserApplication from "./UserApplication";

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
    const { value } = e.target;
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
              <ProfilePictureUpload
                onChange={handleFileChange}
                errorMessage={state.errorMessages.profilePicture}
              />
            )}
            {isEditing ? (
              <div className="relative flex justify-center">
                <input
                  type="text"
                  value={state.userName}
                  onChange={handleInputChange("userName", 15)}
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
                <SkillSection
                  skills={state.skills}
                  categories={categories}
                  isEditing={isEditing}
                  handleSkillChange={handleSkillChange}
                  removeSkill={removeSkill}
                  addSkill={addSkill}
                />
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
