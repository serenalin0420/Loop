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
  onSnapshot,
  and,
  writeBatch,
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

      const filteredPostData = Object.fromEntries(
        Object.entries(postDataWithId).filter(
          ([_, value]) => value !== undefined,
        ),
      );

      await setDoc(docRef, filteredPostData);
      // console.log("Data successfully written with ID: ", postId);
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
    console.log(userId);
    if (!userId) {
      throw new Error("Invalid userId: userId is undefined or null");
    }
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

  async getBooking(bookingId) {
    try {
      const bookingRef = doc(db, "bookings", bookingId);
      const bookingSnapshot = await getDoc(bookingRef);

      if (bookingSnapshot.exists()) {
        return bookingSnapshot.data();
      } else {
        console.log("No such booking!");
        return null;
      }
    } catch (error) {
      console.error("Error fetching booking:", error);
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

  async notifyUsersOnBookingConfirm(selectedBooking, postTitle) {
    try {
      const { applicant_uid, demander_uid, provider_uid, selected_times } =
        selectedBooking;

      // 找到不是 applicant_uid 的使用者 ID
      const fromUserId =
        applicant_uid === demander_uid ? provider_uid : demander_uid;

      const fromUserDoc = await getDoc(doc(db, "users", fromUserId));
      const fromUserName = fromUserDoc.exists()
        ? fromUserDoc.data().name
        : "Unknown";

      // 新增 applicant_uid 的通知
      const applicantNotificationRef = collection(
        db,
        "users",
        applicant_uid,
        "notifications",
      );
      await addDoc(applicantNotificationRef, {
        type: "booking_confirm",
        message: "恭喜媒合成功~！ 已確認了你的申請",
        booking_id: selectedBooking.booking_id,
        from: fromUserId,
        fromName: fromUserName,
        created_time: serverTimestamp(),
        read: false,
      });

      // 新增 demander_uid 和 provider_uid 的通知
      const notificationPromises = selected_times.map((time, index) => {
        const notificationData = {
          type: "course_endtime",
          time: time,
          message: "恭喜你完成一堂充實的課程！ 別忘了填寫學習計畫表喔",
          created_time: serverTimestamp(),
          read: false,
          post_title: postTitle,
          sequence_number: index + 1,
          booking_id: selectedBooking.booking_id,
          provider_uid: selectedBooking.provider_uid,
          demander_uid: selectedBooking.demander_uid,
          post_id: selectedBooking.post_id,
        };

        const demanderNotificationRef = collection(
          db,
          "users",
          demander_uid,
          "notifications",
        );
        const providerNotificationRef = collection(
          db,
          "users",
          provider_uid,
          "notifications",
        );

        return Promise.all([
          addDoc(demanderNotificationRef, notificationData),
          addDoc(providerNotificationRef, notificationData),
        ]);
      });

      await Promise.all(notificationPromises);

      console.log("Notifications successfully added!");
    } catch (error) {
      console.error("Error adding notifications: ", error);
      throw error;
    }
  },

  // booking_confirm監聽使用者的通知
  listenToNotifications: (userId, callback) => {
    const notificationsRef = collection(db, "users", userId, "notifications");
    const q = query(
      notificationsRef,
      or(
        where("type", "==", "booking_confirm"),
        and(where("type", "==", "course_endtime"), where("read", "==", true)),
      ),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newNotifications = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(newNotifications);
    });

    return unsubscribe;
  },

  checkCourseEndtimeNotifications: async (userId) => {
    const notificationsRef = collection(db, "users", userId, "notifications");
    const q = query(
      notificationsRef,
      where("type", "==", "course_endtime"),
      where("read", "==", false),
    );

    const snapshot = await getDocs(q);
    const now = new Date();
    const newNotifications = [];

    const batch = writeBatch(db); // 使用批處理來更新多個文檔

    snapshot.forEach((doc) => {
      const notification = doc.data();
      const timeString = notification.time; // "9/28 (六) 16:00 - 16:50"
      const endTimeString = timeString.split(" - ")[1]; // "16:50"

      // 獲取當前日期
      const [datePart] = timeString.split(" ");
      const [month, day] = datePart.split("/").map(Number);

      // 構建結束時間的 Date 對象
      const [endHour, endMinute] = endTimeString.split(":").map(Number);
      const endTime = new Date(
        now.getFullYear(),
        month - 1,
        day,
        endHour,
        endMinute,
      );

      const timeDiff = (now - endTime) / 60000; // 差異時間以分鐘計算

      if (timeDiff >= 0 && timeDiff <= 2) {
        newNotifications.push({
          id: doc.id,
          ...notification,
        });

        // 將通知的 read 欄位設置為 true
        const notificationRef = doc.ref;
        batch.update(notificationRef, { read: true });
      }
    });

    await batch.commit();

    return newNotifications;
  },

  async markNotificationsAsRead(userId, notifications) {
    try {
      const unreadNotifications = notifications.filter((n) => !n.read);
      const batch = writeBatch(db);
      unreadNotifications.forEach((notification) => {
        const notificationRef = doc(
          db,
          "users",
          userId,
          "notifications",
          notification.id,
        );
        batch.update(notificationRef, { read: true });
      });

      await batch.commit();
      console.log("Notifications marked as read in the database.");
    } catch (error) {
      console.error("Error marking notifications as read: ", error);
    }
  },

  async saveLearningPortfolioToDatabase(portfolioData, userId) {
    if (!portfolioData.notification || !portfolioData.notification.booking_id) {
      throw new Error(
        "Invalid portfolioData: missing notification or booking_id",
      );
    }
    const learningPortfolioRef = doc(
      db,
      "learning_portfolio",
      portfolioData.notification.booking_id,
    );

    try {
      const docSnapshot = await getDoc(learningPortfolioRef);

      if (docSnapshot.exists()) {
        const existingData = docSnapshot.data();
        const feedbackArray = existingData.feedback || [];
        const courseIndex = feedbackArray.findIndex(
          (item) => item.course === portfolioData.notification.sequence_number,
        );

        if (courseIndex !== -1) {
          // 更新現有的 feedback 條目
          if (userId === portfolioData.notification.demander_uid) {
            feedbackArray[courseIndex].demander_feedback =
              portfolioData.feedback;
            feedbackArray[courseIndex].demander_suggestions =
              portfolioData.suggestions;
            feedbackArray[courseIndex].demander_rating = portfolioData.rating;
          } else if (userId === portfolioData.notification.provider_uid) {
            feedbackArray[courseIndex].provider_feedback =
              portfolioData.feedback;
            feedbackArray[courseIndex].provider_suggestions =
              portfolioData.suggestions;
            feedbackArray[courseIndex].provider_rating = portfolioData.rating;
          }
        } else {
          // 添加新的 feedback 條目
          const newFeedback = {
            course: portfolioData.notification.sequence_number,
            ...(userId === portfolioData.notification.demander_uid
              ? {
                  time: portfolioData.notification.time,
                  demander_feedback: portfolioData.feedback,
                  demander_suggestions: portfolioData.suggestions,
                  demander_rating: portfolioData.rating,
                }
              : {
                  time: portfolioData.notification.time,
                  provider_feedback: portfolioData.feedback,
                  provider_suggestions: portfolioData.suggestions,
                  provider_rating: portfolioData.rating,
                }),
          };
          feedbackArray.push(newFeedback);
        }
        await updateDoc(learningPortfolioRef, { feedback: feedbackArray });
      } else {
        // 如果文件不存在，創建一個新的文件
        await setDoc(learningPortfolioRef, {
          post_title: portfolioData.notification.post_title,
          booking_id: portfolioData.notification.booking_id,
          demander_uid: portfolioData.notification.demander_uid,
          provider_uid: portfolioData.notification.provider_uid,
          feedback: [
            {
              course: portfolioData.notification.sequence_number,
              ...(userId === portfolioData.notification.demander_uid
                ? {
                    time: portfolioData.notification.time,
                    demander_feedback: portfolioData.feedback,
                    demander_suggestions: portfolioData.suggestions,
                    demander_rating: portfolioData.rating,
                  }
                : {
                    time: portfolioData.notification.time,
                    provider_feedback: portfolioData.feedback,
                    provider_suggestions: portfolioData.suggestions,
                    provider_rating: portfolioData.rating,
                  }),
            },
          ],
        });
      }
    } catch (error) {
      console.error("Error updating/creating feedback:", error);
    }
  },

  async hasUserFilledLearningPortfolio(userId, bookingId, courseNumber) {
    try {
      const learningPortfolioRef = doc(db, "learning_portfolio", bookingId);
      const docSnapshot = await getDoc(learningPortfolioRef);

      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        const feedbackArray = data.feedback || [];

        if (data.demander_uid === userId) {
          return feedbackArray.some((item) => {
            return item.course === courseNumber && item.demander_feedback;
          });
        } else if (data.provider_uid === userId) {
          return feedbackArray.some((item) => {
            return item.course === courseNumber && item.provider_feedback;
          });
        } else {
          return false;
        }
      } else {
        return false;
      }
    } catch (error) {
      console.error("Error checking learning portfolio:", error);
      throw error;
    }
  },

  // chats
  async createOrUpdateChat(userId, otherUserId, messageData) {
    try {
      const userChatRef = doc(db, "users", userId, "chats", otherUserId);
      const otherUserChatRef = doc(db, "users", otherUserId, "chats", userId);

      const userChatSnapshot = await getDoc(userChatRef);
      const otherUserChatSnapshot = await getDoc(otherUserChatRef);

      const timestamp = new Date();

      const chatData = {
        with_user_id: otherUserId,
        last_message: messageData.message,
        last_message_time: timestamp,
        messages: [
          {
            sender_uid: messageData.sender_uid,
            message: messageData.message,
            timestamp: timestamp,
          },
        ],
      };
      if (!userChatSnapshot.exists()) {
        await setDoc(userChatRef, chatData);
      } else {
        const userChatData = userChatSnapshot.data();
        await updateDoc(userChatRef, {
          last_message: messageData.message,
          last_message_time: timestamp,
          messages: [...userChatData.messages, { ...chatData.messages[0] }],
        });
      }

      if (!otherUserChatSnapshot.exists()) {
        await setDoc(otherUserChatRef, {
          ...chatData,
          with_user_id: userId,
        });
      } else {
        const otherUserChatData = otherUserChatSnapshot.data();
        await updateDoc(otherUserChatRef, {
          last_message: messageData.message,
          last_message_time: timestamp,
          messages: [
            ...otherUserChatData.messages,
            { ...chatData.messages[0] },
          ],
        });
      }
      console.log("Chat successfully created or updated!");
    } catch (error) {
      console.error("Error creating or updating chat: ", error);
      throw error;
    }
  },

  async getChatList(userId) {
    try {
      const userChatsRef = collection(db, "users", userId, "chats");
      const userChatsSnapshot = await getDocs(userChatsRef);

      const chatList = userChatsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return chatList;
    } catch (error) {
      console.error("Error fetching chat list: ", error);
      throw error;
    }
  },

  listenToChatMessages: (userId, otherUserId, callback) => {
    const chatRef = doc(db, "users", userId, "chats", otherUserId);
    return onSnapshot(chatRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        callback(docSnapshot.data().messages || []);
      } else {
        callback([]);
      }
    });
  },
};

export default dbApi;
