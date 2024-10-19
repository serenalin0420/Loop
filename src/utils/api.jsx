import {
  addDoc,
  and,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  or,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "../utils/firebaseConfig";

const dbApi = {
  async updateUserDocument(user, isRegistering, username) {
    const userDocRef = doc(db, "users", user.uid);
    if (isRegistering) {
      await setDoc(userDocRef, {
        bg_image:
          "https://images.pexels.com/photos/1227511/pexels-photo-1227511.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        uid: user.uid,
        email: user.email,
        name: username,
        coins: 10,
        profile_picture:
          "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj5OuPYNMNMB968AvAIEUDprCeMPpidHb3RfNY45kxV_dipXngeswnCCZhwaR4S9Wz8Uaa_QwA_Zy4tnw7nan1CVFfM6OS0SZ51D4Rj79RD__oIFMxjRDAYsdgschVM5zJgdjG9SkpKdEIm/s644/animal_hamster.png",
        bio: "歡迎加入Loop平台! 趕快介紹一下自己吧~",
        skills: [],
        saved_posts: [],
        review_rating: 0,
      });
    }
  },
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
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  },

  async getLearningPortfolio(userId) {
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
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  },
  async cancelBookingTimes(postId, selectedTimes) {
    try {
      const postRef = doc(db, "posts", postId);
      const postSnapshot = await getDoc(postRef);
      if (postSnapshot.exists()) {
        const postData = postSnapshot.data();

        const timeRangeRegex = /(\d+):\d{2}/;

        const updatedTimes = Object.keys(postData.datetime).reduce(
          (acc, date) => {
            const timesForDate = postData.datetime[date];

            const updatedTimesForDate = Object.keys(timesForDate).reduce(
              (timeAcc, time) => {
                selectedTimes.forEach((selectedTime) => {
                  const match = selectedTime.match(timeRangeRegex);
                  if (match) {
                    const selectedHour = match[1];

                    if (time === selectedHour) {
                      timeAcc[time] = true;
                    } else {
                      timeAcc[time] = timesForDate[time];
                    }
                  }
                });
                return timeAcc;
              },
              {},
            );
            acc[date] = updatedTimesForDate;
            return acc;
          },
          {},
        );

        await setDoc(postRef, { datetime: updatedTimes }, { merge: true });
      } else {
        console.error("No such booking found!");
      }
    } catch (error) {
      console.error("Error updating booking times: ", error);
    }
  },

  async createBooking(bookingData, notifyBooking) {
    try {
      const docRef = await addDoc(collection(db, "bookings"), {});
      const bookingId = docRef.id;

      const bookingDataWithId = {
        ...bookingData,
        booking_id: bookingId,
        created_time: serverTimestamp(),
      };

      await setDoc(docRef, bookingDataWithId);

      const { from, postAuthorUid } = notifyBooking;
      const notifyBookingData = {
        ...notifyBooking,
        from: from,
        message: "預約了你的課程！ 趕快到個人頁面上查看～",
        booking_id: bookingId,
        created_time: serverTimestamp(),
        read: false,
        type: "booking_apply",
      };
      await setDoc(
        doc(db, "users", postAuthorUid, "notifications", bookingId),
        notifyBookingData,
      );
    } catch (error) {
      console.error("Error writing document: ", error);
    }
  },
  async getBookingsForUser(userId) {
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
    } catch (error) {
      console.error("Error updating booking status: ", error);
      throw error;
    }
  },
  async updateUsersCoins(selectedBooking) {
    try {
      const coinsTotal = selectedBooking.coins_total;

      const demanderRef = doc(db, "users", selectedBooking.demander_uid);
      await runTransaction(db, async (transaction) => {
        const demanderDoc = await transaction.get(demanderRef);
        if (!demanderDoc.exists()) {
          throw new Error("Demander does not exist!");
        }

        const currentDemanderCoins = demanderDoc.data().coins;
        const newDemanderCoins = currentDemanderCoins - coinsTotal;

        if (newDemanderCoins < 0) {
          throw new Error("Insufficient coins to complete the transaction!");
        }

        transaction.update(demanderRef, { coins: newDemanderCoins });
      });

      const providerRef = doc(db, "users", selectedBooking.provider_uid);
      await runTransaction(db, async (transaction) => {
        const providerDoc = await transaction.get(providerRef);
        if (!providerDoc.exists()) {
          throw new Error("Provider does not exist!");
        }

        const newProviderCoins = providerDoc.data().coins + coinsTotal;
        transaction.update(providerRef, { coins: newProviderCoins });
      });
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
    } catch (error) {
      console.error("Error updating user saved posts: ", error);
      throw error;
    }
  },

  async notifyUsersOnBookingConfirm(selectedBooking, postTitle) {
    try {
      const { applicant_uid, demander_uid, provider_uid, selected_times } =
        selectedBooking;

      const fromUserId =
        applicant_uid === demander_uid ? provider_uid : demander_uid;

      const fromUserDoc = await getDoc(doc(db, "users", fromUserId));
      const fromUserName = fromUserDoc.exists()
        ? fromUserDoc.data().name
        : "Unknown";

      const applicantNotificationRef = collection(
        db,
        "users",
        applicant_uid,
        "notifications",
      );
      await addDoc(applicantNotificationRef, {
        type: "booking_confirm",
        message: "恭喜媒合成功～！ 已確認了你的申請",
        booking_id: selectedBooking.booking_id,
        from: fromUserId,
        fromName: fromUserName,
        created_time: serverTimestamp(),
        read: false,
      });

      const notificationPromises = selected_times.map((time, index) => {
        const notificationData = {
          type: "course_endtime",
          time: time,
          message: "恭喜你完成一堂充實的課程！ 別忘了填寫學習歷程表喔",
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
    } catch (error) {
      console.error("Error adding notifications: ", error);
      throw error;
    }
  },
  listenToNotifications: (userId, callback) => {
    const notificationsRef = collection(db, "users", userId, "notifications");
    const q = query(
      notificationsRef,
      or(
        where("type", "==", "booking_confirm"),
        and(where("type", "==", "booking_apply")),
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

    const batch = writeBatch(db);

    snapshot.forEach((doc) => {
      const notification = doc.data();
      const timeString = notification.time;
      const endTimeString = timeString.split(" - ")[1];

      const [datePart] = timeString.split(" ");
      const [month, day] = datePart.split("/").map(Number);

      const [endHour, endMinute] = endTimeString.split(":").map(Number);
      const endTime = new Date(
        now.getFullYear(),
        month - 1,
        day,
        endHour,
        endMinute,
      );

      const timeDiff = (now - endTime) / 60000;

      if (timeDiff >= 0 && timeDiff <= 2) {
        newNotifications.push({
          id: doc.id,
          ...notification,
        });
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
