import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import LandingPage from "./pages/landingPage";
import CreateAccountPage from "./pages/createAccount";
import LatestPage from "./pages/latestPage";
import TrendingPage from "./pages/trendingPage";
import MyProfile from "./pages/myProfile";
import SettingsPage from "./pages/settingsPage";
import ProtectedRoute from "./components/protectedRoute";
import Sidebar from "./components/sideBar";
import "./App.css";
import UserProfile from "./pages/userProfile";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function App() {
  if (!googleClientId) {
    console.error(
      "VITE_GOOGLE_CLIENT_ID is not set in the environment variables"
    );
    return (
      <div className="text-red-500 p-4">
        Error: Google Client ID is not configured
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <Router>
        <div className="bg-xenial-dark min-h-screen text-white">
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LandingPage />
                </PublicRoute>
              }
            />
            <Route
              path="/createaccount"
              element={
                <PublicRoute>
                  <CreateAccountPage />
                </PublicRoute>
              }
            />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <div className="flex">
                    <Sidebar />
                    <div className="flex-grow ml-44">
                      <Routes>
                        <Route
                          path="/"
                          element={<Navigate to="/latest" replace />}
                        />
                        <Route path="/latest" element={<LatestPage />} />
                        <Route path="/trending" element={<TrendingPage />} />
                        <Route path="/profile" element={<MyProfile />} />
                        <Route
                          path="/user/:username"
                          element={<UserProfile />}
                        />

                        <Route path="/settings" element={<SettingsPage />} />
                        <Route
                          path="*"
                          element={<Navigate to="/latest" replace />}
                        />
                      </Routes>
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
}

function PublicRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? <Navigate to="/latest" replace /> : children;
}

export default App;
