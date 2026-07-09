import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Home from "../pages/Home/Home";
import AboutUs from "../pages/AboutUs/AboutUs";
import ContactUs from "../pages/ContactUs/ContactUs";
import GetInvolved from "../pages/GetInvolved/GetInvolved";
import CommunityStories from "../pages/CommunityStories/CommunityStories";
import CommunityStoryDetail from "../pages/CommunityStories/CommunityStoryDetail";
import CampaignsAdvocacy from "../pages/CampaignsAdvocacy/CampaignsAdvocacy";
import CampaignDetail from "../pages/CampaignsAdvocacy/CampaignDetail";
import OurWork from "../pages/OurWork/OurWork";
import NotFound from "../pages/NotFound/NotFound";
import LoginPage from "../features/auth/pages/LoginPage";
import SignupPage from "../features/auth/pages/SignupPage";
import ResetPasswordPage from "../features/auth/pages/ResetPasswordPage";
import ProtectedRoute from "./ProtectedRoute";
import PetOwnerDashboard from "../features/pet-owner/pages/DashboardPage";
import DoctorDirectoryPage from "../features/pet-owner/pages/DoctorDirectoryPage";
import BookingPage from "../features/appointments/pages/BookingPage";
import DoctorDashboard from "../features/doctor/pages/DashboardPage";
import ChatPage from "../pages/shared/ChatPage";

export const router = createBrowserRouter([
  {
    element: <App />, // Navbar + <Outlet /> + Footer
    children: [
      { path: "/", element: <Home /> },
      { path: "/about-us", element: <AboutUs /> },
      { path: "/contact-us", element: <ContactUs /> },
      { path: "/get-involved", element: <GetInvolved /> },
      { path: "/community-stories", element: <CommunityStories /> },
      { path: "/community-stories/:slug", element: <CommunityStoryDetail /> },
      { path: "/campaigns-advocacy", element: <CampaignsAdvocacy /> },
      { path: "/campaigns-advocacy/:slug", element: <CampaignDetail /> },
      { path: "/our-work", element: <OurWork /> },
    ],
  },
  {
    path: "/login",
    element: <LoginPage />
  },
  {
    path: "/signup",
    element: <SignupPage />
  },
  {
    path: "/reset-password",
    element: <ResetPasswordPage />
  },
  {
    element: <ProtectedRoute allowedRole="petOwner" />,
    children: [
      { path: "/pet-owner/dashboard", element: <PetOwnerDashboard /> },
      { path: "/pet-owner/doctors", element: <DoctorDirectoryPage /> },
      { path: "/pet-owner/book/:id", element: <BookingPage /> },
      { path: "/pet-owner/chat/:appointmentId", element: <ChatPage /> }
    ]
  },
  {
    element: <ProtectedRoute allowedRole="doctor" />,
    children: [
      { path: "/doctor/dashboard", element: <DoctorDashboard /> },
      { path: "/doctor/chat/:appointmentId", element: <ChatPage /> }
    ]
  },
  { path: "*", element: <NotFound /> }
]);
