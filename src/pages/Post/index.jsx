import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import dbApi from "../../utils/api";
import Introduction from "./Introduction";

function Post() {
  const { postId } = useParams();
  const [post, setPost] = useState();
  const [category, setCategory] = useState("");
  const [author, setAuthor] = useState();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postData = await dbApi.getPosts(postId);
        setPost(postData);

        if (postData.category_id) {
          const categoryData = await dbApi.getPostCategory(
            postData.category_id,
          );
          setCategory(categoryData.name);
        }

        if (postData.author_uid) {
          const authorData = await dbApi.getProfile(postData.author_uid);
          setAuthor(authorData);
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      }
    };

    fetchPost();
  }, [postId]);

  if (!post || !author) return <div>加載中...</div>;

  return (
    <div className="mx-8 mt-16">
      <Introduction post={post} category={category} author={author} />
    </div>
  );
}

export default Post;
