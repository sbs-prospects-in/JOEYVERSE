import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "./App";
import Home from "./pages/Home/Home";
import Doctors from "./pages/Doctors/Doctors";
import DoctorProfile from "./pages/DoctorProfile/DoctorProfile";
import Services from "./pages/Services/Services";
import SuccessStories from "./pages/SuccessStories/SuccessStories";
import RecoveryReport from "./pages/RecoveryReport/RecoveryReport";
import WhyChooseUs from "./pages/WhyChooseUs/WhyChooseUs";
import Register from "./pages/Register/Register";
import SignIn from "./pages/SignIn/SignIn";
import NotFound from "./pages/NotFound/NotFound";
import DoctorDashboardPage from "./features/doctor/pages/DashboardPage";
import PetOwnerDashboardPage from "./features/pet-owner/pages/DashboardPage";
import AdminDashboardPage from "./features/admin/pages/DashboardPage";
import DoctorProfilePage from "./features/doctor/pages/ProfilePage";
import PetOwnerProfilePage from "./features/pet-owner/pages/ProfilePage";
import AdminSetup from "./pages/AdminSetup/AdminSetup";
import ChatPage from "./pages/shared/ChatPage";
import Blogs from "./pages/Blogs/Blogs";
import BlogPost from "./pages/Blogs/BlogPost";
import FAQs from "./pages/FAQs/FAQs";
import PrivacyPolicy from "./pages/PrivacyPolicy/PrivacyPolicy";
import TermsOfUse from "./pages/TermsOfUse/TermsOfUse";
import { useAuthStore } from "./features/auth/store/authStore";

// Inline protected route component
function ProtectedRoute({ children, allowedRole }) {
  const { user, role, isLoading } = useAuthStore();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }

  if (allowedRole && role !== allowedRole) {
    if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (role === 'petOwner') return <Navigate to="/pet-owner/dashboard" replace />;
    if (role === 'doctor') return <Navigate to="/doctor/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
}

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
      { path: "/register", element: <Register /> },
      { path: "/sign-in", element: <SignIn /> },
      { path: "/blogs", element: <Blogs /> },
      { path: "/blogs/:id", element: <BlogPost /> },
      { path: "/faqs", element: <FAQs /> },
      { 
        path: "/doctor/dashboard", 
        element: (
          <ProtectedRoute allowedRole="doctor">
            <DoctorDashboardPage />
          </ProtectedRoute>
        )
      },
      { 
        path: "/pet-owner/dashboard", 
        element: (
          <ProtectedRoute allowedRole="petOwner">
            <PetOwnerDashboardPage />
          </ProtectedRoute>
        )
      },
      { 
        path: "/pet-owner/profile", 
        element: (
          <ProtectedRoute allowedRole="petOwner">
            <PetOwnerProfilePage />
          </ProtectedRoute>
        )
      },
      { 
        path: "/doctor/profile", 
        element: (
          <ProtectedRoute allowedRole="doctor">
            <DoctorProfilePage />
          </ProtectedRoute>
        )
      },
      { 
        path: "/pet-owner/chat/:id", 
        element: (
          <ProtectedRoute allowedRole="petOwner">
            <ChatPage />
          </ProtectedRoute>
        )
      },
      { 
        path: "/doctor/chat/:id", 
        element: (
          <ProtectedRoute allowedRole="doctor">
            <ChatPage />
          </ProtectedRoute>
        )
      },
      { 
        path: "/doctor/chat/:id", 
        element: (
          <ProtectedRoute allowedRole="doctor">
            <ChatPage />
          </ProtectedRoute>
        )
      },
      {
        path: "/admin/dashboard",
        element: (
          <ProtectedRoute allowedRole="admin">
            <AdminDashboardPage />
          </ProtectedRoute>
        )
      },
      { path: "/admin-setup", element: <AdminSetup /> },
      { path: "/privacy-policy", element: <PrivacyPolicy /> },
      { path: "/terms-of-use", element: <TermsOfUse /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
