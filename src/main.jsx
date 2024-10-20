import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from "./App.jsx";
import PrivateRoute from "./components/PrivateRoute";
import { UserProvider } from "./context/userContext.jsx";
import { ViewProvider } from "./context/viewContext.jsx";
import "./index.css";
import Chat from "./pages/Chat";
import CreatePost from "./pages/CreatePost";
import Home from "./pages/Home";
import LearningPortfolio from "./pages/LearningPortfolio";
import SinglePortfolio from "./pages/LearningPortfolio/SinglePortfolio.jsx";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Post from "./pages/Post";
import Profile from "./pages/Profile";

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
                <Route path="post/:postId" element={<Post />} />
                <Route
                  path="create-post"
                  element={
                    <PrivateRoute>
                      <CreatePost />
                    </PrivateRoute>
                  }
                />
                <Route path="profile/:userId" element={<Profile />} />
                <Route
                  path="profile"
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="chat/:chatId"
                  element={
                    <PrivateRoute>
                      <Chat />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="chat"
                  element={
                    <PrivateRoute>
                      <Chat />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="learning-portfolio/:userId"
                  element={<LearningPortfolio />}
                />
                <Route
                  path="learning-portfolio/:userId/:bookingId"
                  element={<SinglePortfolio />}
                />

                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </UserProvider>
      </ViewProvider>
    </QueryClientProvider>
  </StrictMode>,
);
