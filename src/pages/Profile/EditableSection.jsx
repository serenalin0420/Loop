import { useState, useContext, useEffect } from "react";
import { UserContext } from "../../context/userContext";
import dbApi from "../../utils/api";
import { useQuery } from "@tanstack/react-query";

const EditableSection = () => {
  const user = useContext(UserContext);
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState([{ category_name: "", skills: "" }]);

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
      const userProfile = await dbApi.getProfile(user.uid);
      setBio(userProfile.bio || "");
      setSkills(userProfile.skills || []);
    };
    fetchProfile();
  }, [user.uid]);

  const handleEditClick = async () => {
    if (isEditing) {
      await dbApi.updateProfile(user.uid, {
        bio,
        skills,
      });
    }
    setIsEditing(!isEditing);
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
    <div className="mx-28 mt-16">
      <div className="flex flex-col">
        <button
          onClick={handleEditClick}
          className="flex max-w-max gap-2 self-end"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
            />
          </svg>
          {isEditing ? "儲存個人資料" : "編輯個人資料"}
        </button>

        <div className="flex gap-8">
          <div className="flex w-1/2 flex-col rounded-lg shadow-md">
            <h3 className="max-w-max rounded-r-lg bg-[#BFAA87] px-6 py-2 text-center tracking-wider text-white">
              簡介
            </h3>
            {isEditing ? (
              <textarea
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
            <h3 className="max-w-max rounded-r-lg bg-[#BFAA87] px-6 py-2 text-center tracking-wider text-white">
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
  );
};

export default EditableSection;
