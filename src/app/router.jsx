import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Home from "../pages/Home/Home";
import Consult from "../pages/Consult/Consult";
import DoctorProfile from "../pages/DoctorProfile/DoctorProfile";
import Doctors from "../pages/Doctors/Doctors";
import RecoveryReport from "../pages/RecoveryReport/RecoveryReport";
import Services from "../pages/Services/Services";
import SuccessStories from "../pages/SuccessStories/SuccessStories";
import WhyChooseUs from "../pages/WhyChooseUs/WhyChooseUs";
import NotFound from "../pages/NotFound/NotFound";
import SignIn from "../pages/SignIn/SignIn";
import Register from "../pages/Register/Register";
import ResetPasswordPage from "../features/auth/pages/ResetPasswordPage";
import ProtectedRoute from "./ProtectedRoute";
import PetOwnerDashboard from "../features/pet-owner/pages/DashboardPage";
import DoctorDirectoryPage from "../features/pet-owner/pages/DoctorDirectoryPage";
import BookingPage from "../features/appointments/pages/BookingPage";
import DoctorDashboard from "../features/doctor/pages/DashboardPage";
import ChatPage from "../pages/shared/ChatPage";

export const router = createBrowserRouter([
  {
    element: <App />, 
    children: [
      { path: "/", element: <Home /> },
      { path: "/consult", element: <Consult /> },
      { path: "/doctor/:id", element: <DoctorProfile /> },
      { path: "/doctors", element: <Doctors /> },
      { path: "/recovery-report", element: <RecoveryReport /> },
      { path: "/services", element: <Services /> },
      { path: "/success-stories", element: <SuccessStories /> },
      { path: "/why-choose-us", element: <WhyChooseUs /> },
    ],
  },
  {
    path: "/sign-in",
    element: <SignIn />
  },
  {
    path: "/register",
    element: <Register />
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
