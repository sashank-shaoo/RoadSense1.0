import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { openModal } from '../store/slices/uiSlice.js';
import { setActiveReport } from '../store/slices/reportSlice.js';
import { updateCreditPoints } from '../store/slices/authSlice.js';
import { authApi } from '../api/authApi.js';
import { reportApi } from '../api/reportApi.js';
import { getSeverityLevel, getSeverityColor, getSeverityLabel, getStatusLabel, formatRelativeTime, formatScore } from '../utils/helpers.js';
import { 
  Award, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Shield, 
  ChevronRight,
  TrendingUp,
  FileText
} from 'lucide-react';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, role } = useSelector((s) => s.auth);
  const [myReports, setMyReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Role guard: Workers and Admins should not be on the citizen profile page
  useEffect(() => {
    if (!isAuthenticated) return;
    if (role === 'WORKER_GROUP' || role === 'WORKER') {
      navigate('/worker/profile', { replace: true });
    } else if (role === 'ADMIN') {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;
    // Only load citizen profile data for END_USER role
    if (role !== 'END_USER' && role !== null) return;

    // Fetch user profile and their submitted reports
    const loadProfileData = async () => {
      setIsLoading(true);
      try {
        const profile = await authApi.getMe();
        if (profile?.credit_points !== undefined) {
          dispatch(updateCreditPoints(profile.credit_points));
        }

        if (user?.id) {
          const reportsRes = await reportApi.getMyReports(user.id);
          if (reportsRes?.reports) {
            setMyReports(reportsRes.reports);
          }
        }
      } catch (err) {
        console.error('Failed to load profile reports:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, [isAuthenticated, role, user?.id, dispatch]);

  if (!isAuthenticated) {
    return (
      <div className={styles.loginRequired}>
        <Shield size={48} className={styles.shieldIcon} />
        <h2>Sign In to View Profile</h2>
        <p>Log in with your citizen account to track reports, view earned credits, and check municipal badges.</p>
        <button className="btn btn-primary btn-lg" onClick={() => dispatch(openModal('login'))}>
          Sign In
        </button>
      </div>
    );
  }

  // Show nothing while redirecting non-citizen roles
  if (role && role !== 'END_USER') return null;

  const creditPoints = user?.credit_points || 0;
  
  // Calculate Citizen Rank
  let rankName = 'Novice Scout';
  let nextRank = 'Pavement Guardian';
  let rankThreshold = 100;
  let progressPct = Math.min(100, Math.round((creditPoints / 100) * 100));

  if (creditPoints >= 500) {
    rankName = 'Smart City Legend';
    nextRank = 'Max Rank Achieved';
    rankThreshold = 500;
    progressPct = 100;
  } else if (creditPoints >= 250) {
    rankName = 'Infrastructure Champion';
    nextRank = 'Smart City Legend';
    rankThreshold = 500;
    progressPct = Math.min(100, Math.round(((creditPoints - 250) / 250) * 100));
  } else if (creditPoints >= 100) {
    rankName = 'Pavement Guardian';
    nextRank = 'Infrastructure Champion';
    rankThreshold = 250;
    progressPct = Math.min(100, Math.round(((creditPoints - 100) / 150) * 100));
  }

  const handleReportClick = (report) => {
    dispatch(setActiveReport(report));
    navigate(`/reports/${report.id}`);
  };

  return (
    <div className={styles.container}>
      {/* Top Banner Card */}
      <div className={`card ${styles.profileHeader}`}>
        <div className={styles.userSection}>
          <div className={styles.avatar}>
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'CU'}
          </div>
          <div>
            <div className={styles.nameRow}>
              <h1>{user?.name || 'Citizen User'}</h1>
              <span className={styles.roleTag}>{role || 'END_USER'}</span>
            </div>
            <p className={styles.email}>{user?.email || 'citizen@roadsense.gov'}</p>
          </div>
        </div>

        {/* Credit Score Summary */}
        <div className={styles.pointsBadge}>
          <Award size={28} className={styles.awardIcon} />
          <div>
            <div className={styles.pointsValue}>{creditPoints}</div>
            <div className={styles.pointsLabel}>Citizen Credits</div>
          </div>
        </div>
      </div>

      {/* Gamification Ranks & Impact */}
      <div className={styles.ranksGrid}>
        <div className={`card ${styles.rankCard}`}>
          <div className={styles.rankTop}>
            <div>
              <span className={styles.subtle}>Current Standing</span>
              <h3 className={styles.rankTitle}>{rankName}</h3>
            </div>
            <Sparkles size={24} className={styles.sparkle} />
          </div>

          <div className={styles.progressBarWrapper}>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
            </div>
            <div className={styles.progressLabels}>
              <span>{progressPct}% towards {nextRank}</span>
              <span>{creditPoints} / {rankThreshold} pts</span>
            </div>
          </div>

          <p className={styles.rankPerk}>
            💡 <strong>Perk:</strong> Verified reports by {rankName} receive expedited municipal crew review!
          </p>
        </div>

        <div className={`card ${styles.statsCard}`}>
          <h3 className={styles.cardHeaderTitle}>Civic Impact Overview</h3>
          <div className={styles.miniStats}>
            <div className={styles.miniStatItem}>
              <span className={styles.statNumber}>{myReports.length}</span>
              <span className={styles.statText}>Reports Submitted</span>
            </div>
            <div className={styles.miniStatItem}>
              <span className={styles.statNumber}>
                {myReports.filter((r) => r.status === 'completed').length}
              </span>
              <span className={styles.statText}>Repairs Completed</span>
            </div>
            <div className={styles.miniStatItem}>
              <span className={styles.statNumber}>
                {myReports.reduce((acc, r) => acc + (r.support_count || 0), 0)}
              </span>
              <span className={styles.statText}>Community Supports</span>
            </div>
          </div>
        </div>
      </div>

      {/* User's Submitted Reports Section */}
      <div className={styles.historySection}>
        <div className={styles.sectionTitleRow}>
          <h2>My Submitted Reports</h2>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/report')}>
            <AlertTriangle size={14} /> Submit New Report
          </button>
        </div>

        {isLoading ? (
          <div className={styles.empty}>Loading your road inspection reports...</div>
        ) : myReports.length === 0 ? (
          <div className={styles.empty}>
            <FileText size={36} />
            <p>You haven't submitted any road damage reports yet.</p>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/report')}>
              Report First Incident (+50 pts)
            </button>
          </div>
        ) : (
          <div className={styles.reportsGrid}>
            {myReports.map((report) => {
              const level = getSeverityLevel(report);
              const color = getSeverityColor(level);
              return (
                <div 
                  key={report.id} 
                  className={`card card-hover ${styles.reportItem}`}
                  onClick={() => handleReportClick(report)}
                >
                  <div className={styles.reportItemTop}>
                    <span className={`badge badge-${level}`}>{getSeverityLabel(level)}</span>
                    <span className={styles.scoreText} style={{ color }}>
                      Score: {formatScore(report.damage_score, 1)}
                    </span>
                  </div>

                  <div className={styles.reportThumb}>
                    {report.media_type === 'video' || report.video_url ? (
                      <video 
                        src={report.video_url || report.media_url || report.image_url} 
                        muted 
                        preload="metadata"
                      />
                    ) : (
                      <img 
                        src={report.image_url || report.media_url || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=500&auto=format&fit=crop&q=60'} 
                        alt="Damage" 
                      />
                    )}
                  </div>

                  <h4 className={styles.reportItemTitle}>{report.description || 'Pothole defect'}</h4>

                  <div className={styles.reportLocation}>
                    <MapPin size={12} />
                    <span title={report.address || ''}>
                      {report.address ? (report.address.length > 32 ? report.address.slice(0, 32) + '...' : report.address) : (
                        report.location?.latitude 
                          ? `${report.location.latitude.toFixed(4)}, ${report.location.longitude.toFixed(4)}` 
                          : 'Location pinned'
                      )}
                    </span>
                  </div>

                  <div className={styles.reportItemBottom}>
                    <span className={styles.statusIndicator}>
                      {getStatusLabel(report.status)}
                    </span>
                    <span className={styles.reportTime}>
                      {formatRelativeTime(report.created_at)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
