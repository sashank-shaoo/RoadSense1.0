import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { openModal } from '../../store/slices/uiSlice.js';
import { logoutSuccess } from '../../store/slices/authSlice.js';
import { authApi } from '../../api/authApi.js';
import {
  MapPin, AlertTriangle, User, LayoutDashboard, Menu, X, Star, LogOut, ChevronDown, Wrench, ShieldCheck, FileText,
} from 'lucide-react';
import { useState } from 'react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isAuthenticated, user, role } = useSelector((s) => s.auth);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await authApi.logout(role);
    dispatch(logoutSuccess());
    setProfileOpen(false);
  };

  const getRoleIcon = () => {
    if (role === 'ADMIN') return <ShieldCheck size={14} />;
    if (role === 'WORKER_GROUP') return <Wrench size={14} />;
    return <User size={14} />;
  };

  const getRoleLabel = () => {
    if (role === 'ADMIN') return 'Admin';
    if (role === 'WORKER_GROUP') return 'Worker';
    return 'Citizen';
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.inner}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <div className={styles.logoIcon}>
            <MapPin size={18} />
          </div>
          <span className={styles.logoText}>Road<span className={styles.logoAccent}>Sense</span></span>
        </Link>

        {/* Desktop Nav Links */}
        <div className={styles.navLinks}>
          <Link to="/" className={`${styles.navLink} ${isActive('/') ? styles.active : ''}`}>
            Home
          </Link>
          <Link to="/explore" className={`${styles.navLink} ${isActive('/explore') ? styles.active : ''}`}>
            <MapPin size={14} /> Explore
          </Link>
          <Link to="/reports" className={`${styles.navLink} ${isActive('/reports') ? styles.active : ''}`}>
            <FileText size={14} /> Reports
          </Link>
          <Link to="/report" className={`${styles.navLink} ${isActive('/report') ? styles.active : ''}`}>
            <AlertTriangle size={14} /> Report
          </Link>
          {role === 'WORKER_GROUP' && (
            <Link to="/worker" className={`${styles.navLink} ${isActive('/worker') ? styles.active : ''}`}>
              <Wrench size={14} /> Portal
            </Link>
          )}
          {role === 'ADMIN' && (
            <Link to="/admin" className={`${styles.navLink} ${isActive('/admin') ? styles.active : ''}`}>
              <LayoutDashboard size={14} /> Admin
            </Link>
          )}
        </div>

        {/* Right Section */}
        <div className={styles.actions}>
          {!isAuthenticated ? (
            <>
              <button className="btn btn-ghost btn-sm" onClick={() => dispatch(openModal('login'))}>
                Sign In
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => dispatch(openModal('register'))}>
                Get Started
              </button>
            </>
          ) : (
            <div className={styles.profileMenu}>
              <button className={styles.profileTrigger} onClick={() => setProfileOpen((v) => !v)}>
                <div className={styles.avatar}>{user?.name?.[0] || 'U'}</div>
                <div className={styles.profileInfo}>
                  <span className={styles.profileName}>{user?.name?.split(' ')[0]}</span>
                  <span className={styles.profileRole}>
                    {getRoleIcon()} {getRoleLabel()}
                  </span>
                </div>
                {user?.credit_points !== undefined && (
                  <span className={styles.creditPill}>
                    <Star size={11} />
                    {user.credit_points}
                  </span>
                )}
                <ChevronDown size={14} className={profileOpen ? styles.chevronOpen : ''} />
              </button>

              {profileOpen && (
                <div className={styles.dropdown}>
                  {role === 'END_USER' && (
                    <Link to="/profile" className={styles.dropdownItem} onClick={() => setProfileOpen(false)}>
                      <User size={14} /> My Profile
                    </Link>
                  )}
                  <button className={`${styles.dropdownItem} ${styles.danger}`} onClick={handleLogout}>
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mobile burger */}
          <button className={styles.burger} onClick={() => setMenuOpen((v) => !v)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          <Link to="/" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/explore" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Explore Map</Link>
          <Link to="/reports" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>All Reports</Link>
          <Link to="/report" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Report Damage</Link>
          {role === 'WORKER_GROUP' && (
            <Link to="/worker" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Worker Portal</Link>
          )}
          {role === 'ADMIN' && (
            <Link to="/admin" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Admin Console</Link>
          )}
          {!isAuthenticated ? (
            <>
              <button className="btn btn-ghost btn-sm" onClick={() => { setMenuOpen(false); dispatch(openModal('login')); }}>Sign In</button>
              <button className="btn btn-primary btn-sm" onClick={() => { setMenuOpen(false); dispatch(openModal('register')); }}>Get Started</button>
            </>
          ) : (
            <button className={`${styles.mobileLink} ${styles.danger}`} onClick={handleLogout}>
              <LogOut size={14} /> Sign Out
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
