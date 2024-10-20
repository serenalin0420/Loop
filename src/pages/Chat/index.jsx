import { UserContext } from "@/context/userContext";
import dbApi from "@/utils/api";
import { debounce } from "lodash";
import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import tamtam1 from "../../assets/tamtam1.png";

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
    messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
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
            message: [],
          });
          setIsNewMessage(false);
        }
      } catch (error) {
        console.error("Error initializing chat:", error);
      }
    };

    if (user && chatId && isNewMessage) {
      initializeChat();
      setIsNewMessage(false);
    }
  }, [chatId, user, isNewMessage]);

  useEffect(() => {
    const fetchChatList = async () => {
      try {
        const chatListData = await dbApi.getChatList(user.uid);
        const profile = await dbApi.getProfile(chatId);
        setChatList((prevChatList) => {
          const isChatAlreadyAdded = prevChatList.some(
            (chat) => chat.id === chatId,
          );

          if (isChatAlreadyAdded) {
            return prevChatList;
          }

          return [
            ...prevChatList,
            {
              id: chatId,
              with_user_id: chatId,
              with_user_picture: profile.profile_picture,
              with_user_name: profile.name,
              last_message: "",
              last_message_time: new Date(),
            },
          ];
        });

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
  }, [user, chatId]);

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
    if (newMessage.trim() === "") return;

    const messageData = {
      sender_uid: user.uid,
      message: newMessage,
    };

    try {
      await dbApi.createOrUpdateChat(user.uid, chatId, messageData);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const debouncedSendMessage = debounce(handleSendMessage, 180);

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !isComposing) {
      e.preventDefault();
      debouncedSendMessage();
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
      {chatId ? (
        <div className="mx-4 flex h-full max-w-screen-lg rounded-xl pb-6 pt-2 sm:mx-6 sm:shadow-md md:mx-12 lg:mx-28 xl:mx-auto">
          <div className="overflow-y-auto border-r xs:w-1/6 md:w-1/4">
            <h4 className="my-3 text-center font-semibold sm:text-lg">
              聯絡人
            </h4>
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
                    <div className="absolute -inset-0 z-0 size-11 rounded-full bg-cerulean-200 blur-sm xs:-inset-1 xs:size-14 md:hidden md:bg-none"></div>
                  )}
                </div>
                <h3 className="ml-2 hidden text-nowrap text-sm md:flex md:flex-col lg:text-lg">
                  {chat.with_user_name}
                  <p className="hidden text-xs text-neutral-500 md:flex lg:text-sm">
                    {chat.last_message}
                  </p>
                </h3>
              </div>
            ))}
          </div>

          <div className="flex flex-1 flex-col">
            <div
              className="h-full max-h-full overflow-y-auto"
              ref={messagesEndRef}
            >
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
                className="h-9 flex-1 rounded-lg border p-2 caret-neon-carrot-700 focus:outline focus:outline-neon-carrot-400 sm:h-fit"
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
      ) : (
        <div className="mx-4 flex h-full max-w-screen-lg rounded-xl pb-6 pt-2 sm:mx-6 sm:shadow-md md:mx-12 lg:mx-28 xl:mx-auto">
          <div className="flex flex-col items-center border-r xs:w-1/6 md:w-1/4">
            <h4 className="my-3 text-center font-semibold sm:text-lg">
              聯絡人
            </h4>
            <h5 className="mt-32 rounded-full text-sm text-indian-khaki-800 md:bg-indian-khaki-100 md:px-5 md:py-3 md:shadow-md md:shadow-indian-khaki-300">
              沒有新訊息
            </h5>
          </div>
          <div className="relative flex flex-1 items-center justify-center">
            <img src={tamtam1} className="h-44 -rotate-3 sm:h-52" />
            <span className="absolute top-20 mb-52 rounded-full bg-indian-khaki-100 px-5 py-3 text-indian-khaki-800 shadow-md shadow-indian-khaki-300 sm:relative sm:top-0">
              尚未選擇聊天室
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat;
