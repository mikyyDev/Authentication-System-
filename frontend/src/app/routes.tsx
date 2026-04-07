import { createBrowserRouter } from "react-router";
import { SplashScreen } from "./pages/SplashScreen";
import { RegisterScreen } from "./pages/RegisterScreen";
import { LoginScreen } from "./pages/LoginScreen";
import { EmailVerificationScreen } from "./pages/EmailVerificationScreen";
import { ProfileScreen } from "./pages/ProfileScreen";
import { SettingsScreen } from "./pages/SettingsScreen";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: SplashScreen,
  },
  {
    path: "/register",
    Component: RegisterScreen,
  },
  {
    path: "/login",
    Component: LoginScreen,
  },
  {
    path: "/verify-email",
    Component: EmailVerificationScreen,
  },
  {
    path: "/me",
    Component: ProfileScreen,
  },
  {
    path: "/settings",
    Component: SettingsScreen,
  },
]);
