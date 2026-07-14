import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Home from "./pages/Home/Home";
import Doctors from "./pages/Doctors/Doctors";
import DoctorProfile from "./pages/DoctorProfile/DoctorProfile";
import Services from "./pages/Services/Services";
import SuccessStories from "./pages/SuccessStories/SuccessStories";
import RecoveryReport from "./pages/RecoveryReport/RecoveryReport";
import WhyChooseUs from "./pages/WhyChooseUs/WhyChooseUs";
import Consult from "./pages/Consult/Consult";
import Register from "./pages/Register/Register";
import SignIn from "./pages/SignIn/SignIn";
import NotFound from "./pages/NotFound/NotFound";
import DoctorDashboardPage from "./features/doctor/pages/DashboardPage";
import PetOwnerDashboardPage from "./features/pet-owner/pages/DashboardPage";

export const router = createBrowserRouter([
  {
    element: <App />, // Layout wrapper (Navbar + <Outlet /> + Footer)
    children: [
      { path: "/", element: <Home /> },
      { path: "/doctors", element: <Doctors /> },
      { path: "/doctors/:id", element: <DoctorProfile /> },
      { path: "/services", element: <Services /> },
      { path: "/success-stories", element: <SuccessStories /> },
      { path: "/success-stories/:id", element: <RecoveryReport /> },
      { path: "/why-choose-us", element: <WhyChooseUs /> },
      { path: "/consult", element: <Consult /> },
      { path: "/register", element: <Register /> },
      { path: "/sign-in", element: <SignIn /> },
      { path: "/doctor/dashboard", element: <DoctorDashboardPage /> },
      { path: "/pet-owner/dashboard", element: <PetOwnerDashboardPage /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
