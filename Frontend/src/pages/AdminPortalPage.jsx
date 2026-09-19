import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { adminApi } from '../api/adminApi.js';
import { reportApi } from '../api/reportApi.js';
import { addToast } from '../store/slices/uiSlice.js';
import { 
  ShieldCheck, 
  Users, 
  HardHat, 
  AlertTriangle, 
  Plus, 
  Check, 
  TrendingUp,
  Activity,
  Layers,
  Search
} from 'lucide-react';
import { formatScore } from '../utils/helpers.js';
import styles from './AdminPortalPage.module.css';

export default function AdminPortalPage() {
  const dispatch = useDispatch();
  const { user, isAuthenticated, role } = useSelector((s) => s.auth);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'crews'
  const [users, setUsers] = useState([]);
  const [workerGroups, setWorkerGroups] = useState([]);
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // New Worker Group form state
  const [workerName, setWorkerName] = useState('');
  const [workerEmail, setWorkerEmail] = useState('');
  const [workerPassword, setWorkerPassword] = useState('');
  const [isSubmittingGroup, setIsSubmittingGroup] = useState(false);

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [usersRes, groupsRes, reportsRes] = await Promise.all([
        adminApi.getUsers().catch(() => ({ users: [] })),
        adminApi.getWorkerGroups().catch(() => ({ worker_groups: [] })),
        reportApi.getAllReports().catch(() => ({ reports: [] })),
      ]);

      if (usersRes?.users) setUsers(usersRes.users);
      if (groupsRes?.worker_groups) {
        setWorkerGroups(groupsRes.worker_groups);
      } else if (groupsRes?.workerGroups) {
        setWorkerGroups(groupsRes.workerGroups);
      }
      if (reportsRes?.reports) setReports(reportsRes.reports);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleCreateWorkerGroup = async (e) => {
    e.preventDefault();
    if (!workerName.trim() || !workerEmail.trim() || !workerPassword.trim()) {
      dispatch(addToast({
        type: 'warning',
        message: 'Name, email, and password are required',
      }));
      return;
    }

    setIsSubmittingGroup(true);
    try {
      const res = await adminApi.createWorkerGroup({
        name: workerName.trim(),
        email: workerEmail.trim(),
        password: workerPassword,
      });

      const newGroup = res.worker_group || res.worker || {
        id: `wg_${Date.now()}`,
        name: workerName.trim(),
        email: workerEmail.trim(),
        role: 'WORKER_GROUP',
      };

      setWorkerGroups((prev) => [...prev, newGroup]);
      setWorkerName('');
      setWorkerEmail('');
      setWorkerPassword('');

      dispatch(addToast({
        type: 'success',
        message: `Worker account for ${workerName} created successfully!`,
      }));
    } catch (err) {
      dispatch(addToast({
        type: 'error',
        message: err.message || 'Failed to create worker account',
      }));
    } finally {
      setIsSubmittingGroup(false);
    }
  };

  // Metrics computation
  const totalReports = reports.length;
  const criticalReports = reports.filter((r) => (Number(r.damage_score) || 0) >= 8 || r.highest_severity === 'CRITICAL').length;
  const resolvedReports = reports.filter((r) => r.status === 'completed').length;
  const avgDamageScore = totalReports > 0 
    ? (reports.reduce((acc, r) => acc + (Number(r.damage_score) || 0), 0) / totalReports).toFixed(1)
    : '0.0';

  return (
    <div className={styles.container}>
      {/* Admin Title Banner */}
      <div className={`card ${styles.adminHeader}`}>
        <div className={styles.headerTitleArea}>
          <div className={styles.adminBadgeIcon}>
            <ShieldCheck size={28} />
          </div>
          <div>
            <div className={styles.titleRow}>
              <h1>Municipal Admin Operations Center</h1>
              <span className={styles.securityTag}>Security Level: High</span>
            </div>
            <p className={styles.headerSub}>
              PARAKRAM 1.0 Smart Road Infrastructure Oversight & Maintenance Telemetry
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabsNav}>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'overview' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <Activity size={16} /> Telemetry Overview
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'users' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={16} /> Citizen Accounts ({users.length})
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'crews' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('crews')}
        >
          <HardHat size={16} /> Maintenance Crews ({workerGroups.length})
        </button>
      </div>

      {/* Tab 1: Telemetry Overview */}
      {activeTab === 'overview' && (
        <div className={styles.overviewTab}>
          <div className={styles.metricsGrid}>
            <div className={`card ${styles.metricCard}`}>
              <div className={styles.metricIconWrap} style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
                <Layers size={22} />
              </div>
              <div className={styles.metricValue}>{totalReports}</div>
              <div className={styles.metricLabel}>Total Road Incidents</div>
            </div>

            <div className={`card ${styles.metricCard}`}>
              <div className={styles.metricIconWrap} style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
                <AlertTriangle size={22} />
              </div>
              <div className={styles.metricValue}>{criticalReports}</div>
              <div className={styles.metricLabel}>Critical Priority Hotspots</div>
            </div>

            <div className={`card ${styles.metricCard}`}>
              <div className={styles.metricIconWrap} style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                <Check size={22} />
              </div>
              <div className={styles.metricValue}>{resolvedReports}</div>
              <div className={styles.metricLabel}>Completed Repairs</div>
            </div>

            <div className={`card ${styles.metricCard}`}>
              <div className={styles.metricIconWrap} style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                <TrendingUp size={22} />
              </div>
              <div className={styles.metricValue}>{avgDamageScore} <span className={styles.outOf}>/ 10</span></div>
              <div className={styles.metricLabel}>Average Severity Score</div>
            </div>
          </div>

          {/* Quick Hotspot Table */}
          <div className={`card ${styles.tableCard}`}>
            <h3 className={styles.tableTitle}>High-Severity Priority Incidents</h3>
            <div className={styles.tableResponsive}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Incident ID</th>
                    <th>Defect Description</th>
                    <th>Coordinates</th>
                    <th>Damage Score</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.slice(0, 5).map((r) => (
                    <tr key={r.id}>
                      <td className={styles.monoId}>{r.id?.slice(0, 8)}...</td>
                      <td>{r.description || 'Pothole defect detected'}</td>
                      <td className={styles.monoId}>
                        {r.location?.latitude?.toFixed(4)}, {r.location?.longitude?.toFixed(4)}
                      </td>
                      <td>
                        <span className={styles.scorePill}>
                          {formatScore(r.damage_score, 1)}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${r.status === 'completed' ? 'low' : r.status === 'onGoing' ? 'medium' : 'critical'}`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Users Management */}
      {activeTab === 'users' && (
        <div className={`card ${styles.tableCard}`}>
          <div className={styles.tableHeaderRow}>
            <h3>Registered Citizen Accounts</h3>
            <span className={styles.subtleCount}>{users.length} verified citizen accounts</span>
          </div>

          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Verification</th>
                  <th>Credit Points</th>
                  <th>Citizen Rank</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const pts = u.credit_points || 0;
                  const rank = pts >= 250 ? 'Infrastructure Champion' : pts >= 100 ? 'Pavement Guardian' : 'Novice Scout';
                  return (
                    <tr key={u.id}>
                      <td className={styles.userNameCol}>
                        <div className={styles.avatarMini}>{u.name?.slice(0, 2).toUpperCase()}</div>
                        <span>{u.name}</span>
                      </td>
                      <td>{u.email}</td>
                      <td>
                        <span className={styles.verifiedTag}>
                          <Check size={12} /> Verified
                        </span>
                      </td>
                      <td className={styles.pointsNumber}>{pts} pts</td>
                      <td>
                        <span className={styles.rankPill}>{rank}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Maintenance Crews / Worker Groups */}
      {activeTab === 'crews' && (
        <div className={styles.crewsTab}>
          {/* Create New Group Form */}
          <div className={`card ${styles.createCrewCard}`}>
            <h3>Provision New Maintenance Worker / Crew</h3>
            <p className={styles.formSub}>Create a worker account with email and password so they can log in to the Worker Portal and bid on road repairs.</p>
            <form onSubmit={handleCreateWorkerGroup} className={styles.crewForm}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Team Leader Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Rudra Pratap Jena" 
                    value={workerName} 
                    onChange={(e) => setWorkerName(e.target.value)}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Worker Email</label>
                  <input 
                    type="email" 
                    placeholder="e.g. worker.rudra@roadsense.com" 
                    value={workerEmail} 
                    onChange={(e) => setWorkerEmail(e.target.value)}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Temporary Password</label>
                  <input 
                    type="password" 
                    placeholder="Min 6 characters" 
                    value={workerPassword} 
                    onChange={(e) => setWorkerPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" disabled={isSubmittingGroup}>
                <Plus size={16} /> {isSubmittingGroup ? 'Creating Worker...' : 'Create Worker Account'}
              </button>
            </form>
          </div>

          {/* Existing Crews Grid */}
          <div className={styles.crewsGrid}>
            {workerGroups.length === 0 ? (
              <div className={styles.emptyCrews}>
                <HardHat size={32} />
                <p>No maintenance workers or crews provisioned yet.</p>
              </div>
            ) : (
              workerGroups.map((group) => (
                <div key={group.id} className={`card ${styles.crewCard}`}>
                  <div className={styles.crewCardTop}>
                    <HardHat size={24} className={styles.hardHatIcon} />
                    <span className={styles.tasksActive}>
                      {group.role || 'WORKER_GROUP'}
                    </span>
                  </div>
                  <h4 className={styles.groupCode}>{group.name || group.group_code || 'Worker Crew'}</h4>
                  <p className={styles.crewLeader}>{group.email || 'No email registered'}</p>
                  <div className={styles.crewZone}>
                    <span>ID:</span> #{group.id ? group.id.slice(0, 8) : 'N/A'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
