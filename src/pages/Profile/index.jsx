import { useState, useContext, useEffect, useRef } from "react";
import { UserContext } from "../../context/userContext";
import ApplicationFromOthers from "./ApplicationFromOthers";
import UserApplication from "./UserApplication";
import coin from "../../components/coin.svg";
import dbApi from "../../utils/api";
import { useQuery } from "@tanstack/react-query";
import { UploadSimple, NotePencil } from "@phosphor-icons/react";

function Profile() {
  const user = useContext(UserContext);
  const [userName, setUserName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState([{ category_name: "", skills: "" }]);
  const [profilePicture, setProfilePicture] = useState("");
  const textareaRef = useRef();

  const {
    data: categories,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: dbApi.getCategories,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (user && user.uid) {
        const userProfile = await dbApi.getProfile(user.uid);
        setUserName(userProfile.name || "");
        setBio(userProfile.bio || "");
        setSkills(userProfile.skills || []);
        setProfilePicture(userProfile.profile_picture || "");
      }
    };
    fetchProfile();
  }, [user]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      textareaRef.current.style.overflow = "hidden";
    }
  }, [bio, isEditing]);

  const handleEditClick = async () => {
    if (isEditing) {
      await dbApi.updateProfile(user.uid, {
        name: userName,
        bio,
        skills,
      });
    }
    setIsEditing(!isEditing);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
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

  const handleNameChange = (e) => {
    setUserName(e.target.value);
  };

  const handleBioChange = (e) => {
    setBio(e.target.value);
  };

  const handleSkillChange = (index, e) => {
    const { name, value } = e.target;
    const updatedSkills = [...skills];
    updatedSkills[index][name] = value;
    setSkills(updatedSkills);
  };

  const addSkill = () => {
    setSkills([...skills, { category_name: "", skills: "" }]);
  };

  const removeSkill = (index) => {
    const updatedSkills = skills.filter((_, i) => i !== index);
    setSkills(updatedSkills);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading categories</div>;

  return (
    <div className="mt-16">
      {user && (
        <div className="relative flex justify-center">
          <img
            className="h-44 w-full object-cover object-center"
            src={user.bg_image}
          ></img>
          <div className="absolute -bottom-20 flex flex-col items-center">
            <img
              src={profilePicture}
              className="size-24 rounded-full border-2 border-white bg-red-100 object-cover object-center p-2 shadow-md"
              alt="author"
            />
            {isEditing && (
              <div className="absolute -right-8 bottom-12 flex items-center justify-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="fileInput"
                />
                <button
                  type="button"
                  className="flex items-center justify-center rounded-full text-sm"
                  onClick={() => document.getElementById("fileInput").click()}
                >
                  <UploadSimple className="mx-1 size-6" />
                  上傳頭像
                </button>
              </div>
            )}
            {isEditing ? (
              <input
                type="text"
                value={userName}
                onChange={handleNameChange}
                className="mt-2 w-4/5 rounded-md bg-slate-200 px-3 py-2"
              />
            ) : (
              <p className="mt-2 text-center font-semibold">{userName}</p>
            )}
          </div>
        </div>
      )}
      <div className="mx-28 mt-16 grid auto-rows-auto grid-cols-2 gap-6">
        <div className="col-span-2">
          <div className="mt-4 flex flex-col">
            <button
              onClick={handleEditClick}
              className="flex max-w-max gap-2 self-end"
            >
              <NotePencil className="size-6" />
              {isEditing ? "儲存" : "編輯個人資料"}
            </button>

            <div className="flex gap-8">
              <div className="flex w-1/2 flex-col rounded-lg shadow-md">
                <h3 className="max-w-max rounded-r-lg bg-[#BFAA87] px-4 py-2 text-center tracking-wider text-white">
                  簡介
                </h3>
                {isEditing ? (
                  <textarea
                    ref={textareaRef}
                    name="bio"
                    value={bio}
                    onChange={handleBioChange}
                    className="mx-6 mb-6 mt-4 rounded-md bg-slate-200 px-3 py-2"
                  />
                ) : (
                  <p className="mx-6 mb-6 mt-4 rounded-md">{bio}</p>
                )}
              </div>

              {/* 技能編輯區 */}
              <div className="flex w-1/2 flex-col rounded-lg shadow-md">
                <h3 className="max-w-max rounded-r-lg bg-[#BFAA87] px-4 py-2 text-center tracking-wider text-white">
                  技能
                </h3>
                {isEditing ? (
                  <div className="mt-4 flex flex-col items-center">
                    {skills.map((skill, index) => (
                      <div
                        key={index}
                        className="mb-3 flex w-full items-center gap-3 px-6"
                      >
                        <select
                          name="category_name"
                          value={skill.category_name}
                          onChange={(e) => handleSkillChange(index, e)}
                          className="rounded-md bg-slate-200 p-2"
                          key={index}
                        >
                          {categories.map((category) => (
                            <option key={category.id} value={category.label}>
                              {category.label}
                            </option>
                          ))}
                        </select>
                        <input
                          name="skills"
                          value={skill.skills}
                          onChange={(e) => handleSkillChange(index, e)}
                          className="w-full rounded-md bg-slate-200 px-3 py-2"
                        />
                        <button
                          onClick={() => removeSkill(index)}
                          className="text-nowrap rounded-sm bg-slate-400 px-2 py-1 text-sm text-white"
                        >
                          刪除
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={addSkill}
                      className="mb-4 mt-2 max-w-max rounded-full bg-yellow-700 px-4 py-2 text-sm text-white"
                    >
                      新增技能
                    </button>
                  </div>
                ) : (
                  <div className="mb-6">
                    {skills.map((skill, index) => (
                      <div
                        key={index}
                        className="mx-6 mt-4 flex items-center gap-3 rounded-md"
                      >
                        <p className="max-w-max rounded-md bg-slate-200 px-3 py-1">
                          {skill.category_name}
                        </p>
                        <p>{skill.skills}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {user && user.uid && (
          <>
            <ApplicationFromOthers userId={user.uid} />
            <UserApplication userId={user.uid} />
          </>
        )}
        <div className="flex flex-col rounded-lg shadow-md">
          <h3 className="max-w-max rounded-r-lg bg-[#BFAA87] px-4 py-2 text-center tracking-wider text-white">
            代幣數量
          </h3>
          <div className="flex items-center gap-2 px-6 py-4">
            <img src={coin} alt="coin" className="size-14 object-cover" />
            <p className="text-xl font-bold text-yellow-900">{user?.coins}枚</p>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Profile;
