import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Post from "./pages/Post";
import CreatePost from "./pages/CreatePost";
import Profile from "./pages/Profile";
import LearningPortfolio from "./pages/LearningPortfolio/index.jsx";
import SinglePortfolio from "./pages/LearningPortfolio/SinglePortfolio.jsx";
import Chat from "./pages/Chat";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserProvider } from "./context/userContext.jsx";
import { ViewProvider } from "./context/viewContext.jsx";
import PrivateRoute from "./components/PrivateRoute";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ViewProvider>
        <UserProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<App />}>
                <Route index element={<Home />} />
                <Route path="login" element={<Login />} />
                {/* 只有登入的才能申請課程 */}
                <Route path="post/:postId" element={<Post />} />
                <Route
                  path="create-post"
                  element={
                    <PrivateRoute>
                      <CreatePost />
                    </PrivateRoute>
                  }
                />

                {/* 當用戶瀏覽自己的個人資料頁面 */}
                <Route path="profile" element={<Profile />} />
                {/* 當用戶瀏覽其他用戶的個人資料頁面 */}
                <Route path="profile/:userId" element={<Profile />} />
                <Route path="chat/:chatId" element={<Chat />} />

                {/* 當用戶瀏覽自己的學習檔案頁面 */}
                <Route
                  path="learning-portfolio"
                  element={<LearningPortfolio />}
                />

                {/* 當用戶瀏覽特定的學習檔案詳情頁面 */}
                {/* <Route
                  path="learning-portfolio/:userId"
                  element={<LearningPortfolio />}
                /> */}
                <Route
                  path="learning-portfolio/:bookingId"
                  element={<SinglePortfolio />}
                />
              </Route>
            </Routes>
          </BrowserRouter>
        </UserProvider>
      </ViewProvider>
    </QueryClientProvider>
  </StrictMode>,
);
