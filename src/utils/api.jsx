// 定義抓資料的function
import { db } from "../utils/firebaseConfig";
import {
  doc,
  getDoc,
  getDocs,
  query,
  where,
  collection,
  or,
  addDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

const dbApi = {
  async getAllPosts() {
    try {
      const querySnapshot = await getDocs(collection(db, "posts"));
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error fetching posts:", error);
      throw error;
    }
  },
  async getSinglePost(postId) {
    try {
      const postRef = doc(db, "posts", postId);
      const postSnapshot = await getDoc(postRef);

      if (postSnapshot.exists()) {
        return postSnapshot.data();
      } else {
        console.log("No such post!");
        return null;
      }
    } catch (error) {
      console.error("Error fetching post:", error);
      throw error;
    }
  },

  async getPostCategory(categoryId) {
    try {
      const categoryRef = doc(db, "categories", categoryId);
      const categorySnapshot = await getDoc(categoryRef);

      if (categorySnapshot.exists()) {
        return categorySnapshot.data();
      } else {
        console.log("No such category!");
        return null;
      }
    } catch (error) {
      console.error("Error fetching category:", error);
      throw error;
    }
  },
  async savePostToDatabase(postData) {
    try {
      const docRef = await addDoc(collection(db, "posts"), {});
      const postId = docRef.id;

      // 將生成的 docID 添加到 postData 中，並使用 serverTimestamp
      const postDataWithId = {
        ...postData,
        post_id: postId,
        created_time: serverTimestamp(),
      };

      // 過濾掉 undefined 的字段
      const filteredPostData = Object.fromEntries(
        Object.entries(postDataWithId).filter(
          ([_, value]) => value !== undefined,
        ),
      );

      await setDoc(docRef, filteredPostData);
      console.log("Data successfully written with ID: ", postId);
    } catch (error) {
      console.error("Error writing document: ", error);
    }
  },

  async getProfile(userId) {
    try {
      const userRef = doc(db, "users", userId);
      const userSnapshot = await getDoc(userRef);

      if (userSnapshot.exists()) {
        return userSnapshot.data();
      } else {
        console.log("Cannot find this user!");
        return null;
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  },

  async getLearningPortfolio(userId) {
    try {
      const portfolioQuery = query(
        collection(db, "learning_portfolio"),
        or(
          where("demander_uid", "==", userId),
          where("provider_uid", "==", userId),
        ),
      );
      const portfolioSnapshot = await getDocs(portfolioQuery);
      const learningPortfolios = [];

      portfolioSnapshot.forEach((doc) => {
        learningPortfolios.push({ id: doc.id, ...doc.data() });
      });

      if (learningPortfolios.length > 0) {
        return learningPortfolios;
      } else {
        console.log("No matching portfolios found!");
        return null;
      }
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      throw error;
    }
  },

  async getCategories() {
    try {
      const querySnapshot = await getDocs(collection(db, "categories"));
      return querySnapshot.docs.map((doc) => ({
        value: doc.id,
        label: doc.data().name,
        subcategories: doc.data().subcategories || [],
        skills: doc.data().skills || [],
      }));
    } catch (error) {
      console.error("Error fetching category:", error);
      throw error;
    }
  },
  async updatePost(postId, updatedData) {
    try {
      const postRef = doc(db, "posts", postId);
      await setDoc(postRef, updatedData, { merge: true });
      console.log("Document successfully updated!");
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  },

  async createBooking(bookingData) {
    try {
      const docRef = await addDoc(collection(db, "bookings"), {});
      const bookingId = docRef.id;

      const bookingDataWithId = {
        ...bookingData,
        booking_id: bookingId,
        created_time: serverTimestamp(),
      };

      await setDoc(docRef, bookingDataWithId);
      console.log("Data successfully written with ID: ", bookingId);
    } catch (error) {
      console.error("Error writing document: ", error);
    }
  },
};

export default dbApi;
