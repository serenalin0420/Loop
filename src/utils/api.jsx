// 定義抓資料的function
import { db, storage } from "../utils/firebaseConfig";
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
  updateDoc,
  runTransaction,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

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

  async updateProfile(userId, updatedData) {
    try {
      const userDoc = doc(db, "users", userId);
      await updateDoc(userDoc, updatedData);
      console.log("Document successfully updated!");
    } catch (error) {
      console.error("Error updating document: ", error);
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
        id: doc.id,
        name: doc.data().name,
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
  async getBookingsForUser(userId) {
    try {
      // 查詢 bookings 集合中符合條件的文件
      const bookingsQuery = query(
        collection(db, "bookings"),
        or(
          where("demander_uid", "==", userId),
          where("provider_uid", "==", userId),
        ),
      );
      const bookingsSnapshot = await getDocs(bookingsQuery);
      const bookings = [];

      // 遍歷 bookings 集合中的文件
      for (const bookingDoc of bookingsSnapshot.docs) {
        const bookingData = bookingDoc.data();
        const postRef = doc(db, "posts", bookingData.post_id);
        const postSnapshot = await getDoc(postRef);

        // 檢查 post 的 author_uid 是否等於 userId
        if (
          postSnapshot.exists() &&
          postSnapshot.data().author_uid === userId
        ) {
          bookings.push({ id: bookingDoc.id, ...bookingData });
        }
      }

      if (bookings.length > 0) {
        return bookings;
      } else {
        console.log("No matching bookings found!");
        return null;
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      throw error;
    }
  },

  async getUserBookings(userId) {
    try {
      const bookingsQuery = query(
        collection(db, "bookings"),
        or(
          where("demander_uid", "==", userId),
          where("provider_uid", "==", userId),
        ),
      );
      const bookingsSnapshot = await getDocs(bookingsQuery);
      const bookings = [];

      for (const bookingDoc of bookingsSnapshot.docs) {
        const bookingData = bookingDoc.data();
        const postRef = doc(db, "posts", bookingData.post_id);
        const postSnapshot = await getDoc(postRef);

        // 檢查 post 的 author_uid 是否等於 userId
        if (
          postSnapshot.exists() &&
          postSnapshot.data().author_uid !== userId
        ) {
          bookings.push({ id: bookingDoc.id, ...bookingData });
        }
      }

      if (bookings.length > 0) {
        return bookings;
      } else {
        console.log("No matching bookings found!");
        return null;
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      throw error;
    }
  },

  async getPostTitle(postId) {
    try {
      const postRef = doc(db, "posts", postId);
      const postSnapshot = await getDoc(postRef);

      if (postSnapshot.exists()) {
        return postSnapshot.data().title || [];
      } else {
        console.log("No such post!");
        return [];
      }
    } catch (error) {
      console.error("Error fetching post subcategories:", error);
      throw error;
    }
  },
  async updateBookingStatus(bookingId, status) {
    try {
      const bookingRef = doc(db, "bookings", bookingId);
      await updateDoc(bookingRef, { status });
      console.log("Booking status successfully updated!");
    } catch (error) {
      console.error("Error updating booking status: ", error);
      throw error;
    }
  },
  // 刪除所有 status 為 cancel 的預約
  async deleteCancelledBookings() {
    try {
      const bookingsRef = db.collection("bookings");
      const snapshot = await bookingsRef.where("status", "==", "cancel").get();

      if (snapshot.empty) {
        console.log("No matching documents.");
        return;
      }
      const batch = db.batch();
      snapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      console.log("Cancelled bookings deleted successfully.");
    } catch (error) {
      console.error("Error deleting cancelled bookings: ", error);
    }
  },

  // 更新雙方的代幣數量
  async updateUsersCoins(selectedBooking) {
    try {
      const coinsTotal = selectedBooking.coins_total;

      // 更新 demander 的 coins
      const demanderRef = doc(db, "users", selectedBooking.demander_uid);
      await runTransaction(db, async (transaction) => {
        const demanderDoc = await transaction.get(demanderRef);
        if (!demanderDoc.exists()) {
          throw new Error("Demander does not exist!");
        }

        const newDemanderCoins = demanderDoc.data().coins - coinsTotal;
        transaction.update(demanderRef, { coins: newDemanderCoins });
      });
      // 更新 provider 的 coins
      const providerRef = doc(db, "users", selectedBooking.provider_uid);
      await runTransaction(db, async (transaction) => {
        const providerDoc = await transaction.get(providerRef);
        if (!providerDoc.exists()) {
          throw new Error("Provider does not exist!");
        }

        const newProviderCoins = providerDoc.data().coins + coinsTotal;
        transaction.update(providerRef, { coins: newProviderCoins });
      });

      console.log("Booking status and user coins successfully updated!");
    } catch (error) {
      console.error("Error updating booking status and user coins: ", error);
      throw error;
    }
  },

  async uploadProfilePicture(userId, file) {
    try {
      const storageRef = ref(
        storage,
        `profile_pictures/${userId}/${file.name}`,
      );
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading profile picture: ", error);
      throw error;
    }
  },
  async updateUserProfilePicture(userId, downloadURL) {
    try {
      const userDoc = doc(db, "users", userId);
      await updateDoc(userDoc, {
        profile_picture: downloadURL,
      });
    } catch (error) {
      console.error("Error updating user profile picture: ", error);
      throw error;
    }
  },
  async updateUserSavedPosts(userId, savedPosts) {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { saved_posts: savedPosts });
      console.log("User saved posts successfully updated!");
    } catch (error) {
      console.error("Error updating user saved posts: ", error);
      throw error;
    }
  },
};

export default dbApi;
