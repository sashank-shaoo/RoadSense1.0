import { useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from './components/common/Navbar.jsx';
import Toast from './components/common/Toast.jsx';

// Modals
import LoginModal from './components/auth/LoginModal.jsx';
import RegisterModal from './components/auth/RegisterModal.jsx';
import OtpVerifyModal from './components/auth/OtpVerifyModal.jsx';
import CreateReportModal from './components/reports/CreateReportModal.jsx';
import ReportDetailModal from './components/reports/ReportDetailModal.jsx';

// Pages
import HomePage from './pages/HomePage.jsx';
import ExplorePage from './pages/ExplorePage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import CreateReportPage from './pages/CreateReportPage.jsx';
import InspectReportPage from './pages/InspectReportPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import WorkerPortalPage from './pages/WorkerPortalPage.jsx';
import WorkerProfilePage from './pages/WorkerProfilePage.jsx';
import AdminPortalPage from './pages/AdminPortalPage.jsx';

/**
 * RoleGuard — watches auth state and redirects workers/admins
 * away from pages they shouldn't see on first load (e.g. from a persisted session),
 * and ensures any logout redirects to the home page every time.
 */
function RoleGuard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, role } = useSelector((s) => s.auth);
  const prevAuthRef = useRef(isAuthenticated);

  // Whenever a user logs out, redirect to home page every time
  useEffect(() => {
    if (prevAuthRef.current && !isAuthenticated) {
      navigate('/', { replace: true });
    }
    prevAuthRef.current = isAuthenticated;
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!isAuthenticated || !role) return;

    const path = location.pathname;

    // Workers/Admins should not land on /report (citizen submit form)
    if ((role === 'WORKER_GROUP' || role === 'WORKER' || role === 'ADMIN') && path === '/report') {
      navigate('/', { replace: true });
    }

    // Workers/Admins should not land on /profile (citizen profile)
    if ((role === 'WORKER_GROUP' || role === 'WORKER') && path === '/profile') {
      navigate('/worker/profile', { replace: true });
    }
    if (role === 'ADMIN' && path === '/profile') {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, role, location.pathname, navigate]);

  return null;
}

export default function App() {
  const { activeModal } = useSelector((s) => s.ui);

  return (
    <div className="app-shell">
      {/* Global Navbar */}
      <Navbar />

      {/* Role-based route guard (handles persisted sessions) */}
      <RoleGuard />

      {/* Route Views */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/reports/:id" element={<InspectReportPage />} />
          <Route path="/report" element={<CreateReportPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/worker" element={<WorkerPortalPage />} />
          <Route path="/worker/profile" element={<WorkerProfilePage />} />
          <Route path="/admin" element={<AdminPortalPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>

      {/* Toast Notifications */}
      <Toast />

      {/* Global Modals */}
      {activeModal === 'login' && <LoginModal />}
      {activeModal === 'register' && <RegisterModal />}
      {activeModal === 'otp' && <OtpVerifyModal />}
      {activeModal === 'createReport' && <CreateReportModal />}
      {activeModal === 'reportDetail' && <ReportDetailModal />}
    </div>
  );
}

