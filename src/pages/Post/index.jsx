import { useEffect, useState } from "react";
import dbApi from "../../utils/api";

function Post() {
  const [post, setPost] = useState({});

  useEffect(() => {
    const fetchPost = async () => {
      // "rPw8fIV4NqJk9b4RNNcl"要改成postId 這裡應該是從URL直接抓 依變項也要改[postId]
      const postData = await dbApi.getPosts("rPw8fIV4NqJk9b4RNNcl");
      setPost(postData);
    };

    fetchPost();
  }, []);
  console.log(post);

  if (!post) return <div>加載中...</div>;

  return (
    <div className="mt-[60px]">
      <h1>{post.title}</h1>
      <p>Category: {post.category_id}</p>
      <p>Location: {post.location}</p>
      <p>Time Preferences: {post.time_preference}</p>
      <p>Coin Cost: {post.coin_cost}</p>
      <h3>Available Date and Time Slots:</h3>
      <ul>
        {/* 確認 post.datetime 存在 */}
        {post.datetime ? (
          Object.entries(post.datetime).map(([date, times]) => (
            <li key={date}>
              <strong>{date}</strong>:
              {Object.entries(times).map(([time, available]) => (
                <span key={time}>
                  {time}: {available ? "Available" : "Not Available"} &nbsp;
                </span>
              ))}
            </li>
          ))
        ) : (
          <li>No available time slots</li> // Handle case where datetime is undefined or null
        )}
      </ul>
    </div>
  );
}

export default Post;
