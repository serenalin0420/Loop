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
  const messagesEndRef = useRef();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
    const fetchMessages = async () => {
      try {
        const messages = await dbApi.getChatMessages(user.uid, chatId);
        setMessages(messages);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    if (user && chatId) {
      fetchMessages();
    }
  }, [chatId, user]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === "") return; // 避免發送空訊息

    const messageData = {
      sender_uid: user.uid,
      message: newMessage,
    };

    try {
      await dbApi.createOrUpdateChat(user.uid, chatId, messageData);
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender_uid: user.uid, message: newMessage, timestamp: new Date() },
      ]);
      setNewMessage(""); // 清空輸入框
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleChangeChat = (chatId) => {
    navigate(`/chat/${chatId}`);
  };

  return (
    <div className="h-screen py-24">
      <div className="mx-6 flex h-full max-w-screen-lg rounded-xl bg-white py-6 shadow-md md:mx-12 lg:mx-28 xl:mx-auto">
        <div className="w-1/4 overflow-y-auto border-r px-4">
          <h1 className="mx-4 mb-2 text-xl font-bold">聊天室</h1>
          {chatList.map((chat) => (
            <div
              key={chat.id}
              className={`flex cursor-pointer items-center px-4 py-2 ${chatId === chat.id ? "bg-gray-200" : ""}`}
              onClick={() => handleChangeChat(chat.id)}
            >
              <img
                src={chat.with_user_picture}
                className="size-16 rounded-full border-white bg-red-100 object-cover object-center"
                alt="author"
              />
              <p className="ml-2">{chat.with_user_name}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-1 flex-col">
          <div className="flex flex-1 flex-col justify-end overflow-y-auto p-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-center ${message.sender_uid === user.uid ? "justify-end" : "justify-start"} px-3 py-2`}
              >
                {message.sender_uid !== user.uid && (
                  <img
                    src={
                      chatList.find(
                        (chat) => chat.with_user_id === message.sender_uid,
                      )?.with_user_picture
                    }
                    className="mr-3 size-8 rounded-full border-white bg-red-100 object-cover object-center"
                    alt="author"
                  />
                )}
                <p className="inline-block rounded-lg bg-gray-200 p-2">
                  {message.message}
                </p>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="flex items-center border-t px-4 pb-2 pt-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 rounded-lg border p-2"
            />
            <button
              className="ml-2 rounded-lg bg-[#BFAA87] px-4 py-2 text-white"
              onClick={handleSendMessage}
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
