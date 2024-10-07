import { useParams, useNavigate } from "react-router-dom";
import dbApi from "@/utils/api";
import { useContext, useEffect, useState, useRef } from "react";
import { UserContext } from "@/context/userContext";

function Chat() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const user = useContext(UserContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatList, setChatList] = useState([]);
  const [isNewMessage, setIsNewMessage] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const messagesEndRef = useRef();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const initializeChat = async () => {
      try {
        if (isNewMessage) {
          await dbApi.createOrUpdateChat(user.uid, chatId, {
            sender_uid: user.uid,
            message: "",
          });
          setIsNewMessage(false);
        }
      } catch (error) {
        console.error("Error initializing chat:", error);
      }
    };

    if (user && chatId && isNewMessage) {
      initializeChat();
      setIsNewMessage(false); // 重置狀態變量
    }
  }, [chatId, user, isNewMessage]);

  useEffect(() => {
    const fetchChatList = async () => {
      try {
        const chatListData = await dbApi.getChatList(user.uid);

        // Fetch profile data for each chat
        const chatListWithProfiles = await Promise.all(
          chatListData.map(async (chat) => {
            const profile = await dbApi.getProfile(chat.with_user_id);
            return {
              ...chat,
              with_user_picture: profile.profile_picture,
              with_user_name: profile.name,
            };
          }),
        );

        setChatList(chatListWithProfiles);
      } catch (error) {
        console.error("Error fetching chat list:", error);
      }
    };

    if (user) {
      fetchChatList();
    }
  }, [user]);

  useEffect(() => {
    let unsubscribe;
    const fetchMessages = async () => {
      try {
        unsubscribe = dbApi.listenToChatMessages(user.uid, chatId, setMessages);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    if (user && chatId) {
      fetchMessages();
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [chatId, user]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === "") return; // 避免發送空訊息

    const messageData = {
      sender_uid: user.uid,
      message: newMessage,
    };

    try {
      await dbApi.createOrUpdateChat(user.uid, chatId, messageData);
      setNewMessage(""); // 清空輸入框
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !isComposing) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleChangeChat = (chatId) => {
    navigate(`/chat/${chatId}`);
  };

  const sortedChatList = chatList.sort((a, b) => {
    const dateA = new Date(
      a.last_message_time.seconds * 1000 +
        a.last_message_time.nanoseconds / 1000000,
    );
    const dateB = new Date(
      b.last_message_time.seconds * 1000 +
        b.last_message_time.nanoseconds / 1000000,
    );
    return dateB - dateA;
  });

  return (
    <div className="h-screen pb-4 pt-20 sm:mb-16 md:pt-24">
      <h2 className="mb-2 text-center text-lg font-semibold sm:text-xl">
        聊天室
      </h2>
      <div className="mx-4 flex h-full max-w-screen-lg rounded-xl pb-6 pt-2 sm:mx-6 sm:shadow-md md:mx-12 lg:mx-28 xl:mx-auto">
        <div className="overflow-y-auto border-r xs:w-1/6 md:w-1/4">
          {sortedChatList.map((chat) => (
            <div
              key={chat.id}
              className={`mb-1 flex cursor-pointer items-center justify-center py-2 pr-2 sm:mx-2 sm:px-2 md:justify-start ${chatId === chat.id ? "rounded-lg md:bg-cerulean-100" : ""}`}
              onClick={() => handleChangeChat(chat.id)}
            >
              <div className="relative">
                <img
                  src={chat.with_user_picture}
                  className="relative z-20 size-11 rounded-full bg-red-100 object-cover object-center sm:size-12 md:size-16 md:shadow-sm"
                  alt="author"
                />
                {chatId === chat.id && (
                  <div className="absolute -inset-0 z-0 size-12 rounded-full bg-cerulean-200 blur xs:-inset-1 xs:size-14 md:bg-none"></div>
                )}
              </div>
              <h3 className="ml-2 hidden text-nowrap md:flex md:flex-col">
                {chat.with_user_name}
                <p className="hidden text-sm text-neutral-500 md:flex">
                  {chat.last_message}
                </p>
              </h3>
            </div>
          ))}
        </div>

        <div className="flex flex-1 flex-col">
          <div className="h-full overflow-y-auto">
            <div className="flex flex-1 flex-col justify-end sm:p-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`ml-4 flex items-center sm:ml-0 ${message.sender_uid === user.uid ? "justify-end" : "justify-start"} py-2 md:px-2`}
                >
                  {message.sender_uid !== user.uid && (
                    <img
                      src={
                        chatList.find(
                          (chat) => chat.with_user_id === message.sender_uid,
                        )?.with_user_picture
                      }
                      className="mr-3 hidden rounded-full border-white bg-red-100 object-cover object-center sm:block sm:size-8"
                      alt="author"
                    />
                  )}
                  <p
                    className={`inline-block rounded-lg p-2 text-sm sm:text-base ${message.sender_uid === user.uid ? "bg-cerulean-200" : "bg-slate-100"}`}
                  >
                    {message.message}
                  </p>
                  <div ref={messagesEndRef} />
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center border-t pb-2 pl-3 pt-4 sm:px-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-9 flex-1 rounded-lg border caret-neon-carrot-700 focus:outline focus:outline-neon-carrot-400 sm:h-fit sm:p-2"
            />
            <button
              className="ml-2 rounded-lg bg-neon-carrot-400 px-3 py-2 text-sm text-white sm:px-4 sm:text-base"
              onClick={handleSendMessage}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd}
              onKeyDown={handleKeyDown}
            >
              發送
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;
