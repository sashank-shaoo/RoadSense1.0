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
  UserCog,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  Gavel,
} from 'lucide-react';
import { formatScore } from '../utils/helpers.js';
import styles from './AdminPortalPage.module.css';

export default function AdminPortalPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);

  const [activeTab, setActiveTab]   = useState('overview'); // 'overview' | 'users' | 'crews' | 'workers'
  const [users,     setUsers]       = useState([]);
  const [workerGroups, setWorkerGroups] = useState([]);
  const [workers,   setWorkers]     = useState([]);   // individual WORKER accounts
  const [reports,   setReports]     = useState([]);
  const [isLoading, setIsLoading]   = useState(false);

  // Worker Group create form
  const [workerName,     setWorkerName]     = useState('');
  const [workerEmail,    setWorkerEmail]    = useState('');
  const [workerPassword, setWorkerPassword] = useState('');
  const [isSubmittingGroup, setIsSubmittingGroup] = useState(false);

  // Individual worker create form
  const [wName,    setWName]    = useState('');
  const [wEmail,   setWEmail]   = useState('');
  const [wPass,    setWPass]    = useState('');
  const [wPhone,   setWPhone]   = useState('');
  const [isSubmittingWorker, setIsSubmittingWorker] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [usersRes, groupsRes, workersRes, reportsRes] = await Promise.all([
        adminApi.getUsers().catch(() => ({ users: [] })),
        adminApi.getWorkerGroups().catch(() => ({ worker_groups: [] })),
        adminApi.getWorkers().catch(() => ({ workers: [] })),
        reportApi.getAllReports().catch(() => ({ reports: [] })),
      ]);

      if (usersRes?.users)          setUsers(usersRes.users);
      if (groupsRes?.worker_groups) setWorkerGroups(groupsRes.worker_groups);
      else if (groupsRes?.workerGroups) setWorkerGroups(groupsRes.workerGroups);
      if (workersRes?.workers)      setWorkers(workersRes.workers);
      if (reportsRes?.reports)      setReports(reportsRes.reports);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadAdminData(); }, []);

  /* ── Create Worker Group ─────────────────────────────────────── */
  const handleCreateWorkerGroup = async (e) => {
    e.preventDefault();
    if (!workerName.trim() || !workerEmail.trim() || !workerPassword.trim()) {
      dispatch(addToast({ type: 'warning', message: 'Name, email, and password are required' }));
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
      setWorkerName(''); setWorkerEmail(''); setWorkerPassword('');
      dispatch(addToast({ type: 'success', message: `Worker group "${workerName}" created!` }));
    } catch (err) {
      dispatch(addToast({ type: 'error', message: err.message || 'Failed to create worker group' }));
    } finally {
      setIsSubmittingGroup(false);
    }
  };

  /* ── Create Individual Worker ────────────────────────────────── */
  const handleCreateWorker = async (e) => {
    e.preventDefault();
    if (!wName.trim() || !wEmail.trim() || !wPass.trim()) {
      dispatch(addToast({ type: 'warning', message: 'Name, email, and password are required' }));
      return;
    }
    setIsSubmittingWorker(true);
    try {
      const res = await adminApi.createWorker({
        name: wName.trim(),
        email: wEmail.trim(),
        password: wPass,
        phone: wPhone.trim() || undefined,
      });
      const newWorker = res.worker || { id: `w_${Date.now()}`, name: wName, email: wEmail, is_active: true, role: 'WORKER' };
      setWorkers((prev) => [...prev, newWorker]);
      setWName(''); setWEmail(''); setWPass(''); setWPhone('');
      dispatch(addToast({ type: 'success', message: `Crew member "${wName}" created!` }));
    } catch (err) {
      dispatch(addToast({ type: 'error', message: err.message || 'Failed to create crew member' }));
    } finally {
      setIsSubmittingWorker(false);
    }
  };

  /* ── Toggle Worker Active/Inactive ──────────────────────────── */
  const handleToggleWorker = async (workerId, currentActive) => {
    setTogglingId(workerId);
    try {
      await adminApi.toggleWorkerActive(workerId, !currentActive);
      setWorkers((prev) =>
        prev.map((w) => w.id === workerId ? { ...w, is_active: !currentActive } : w)
      );
      dispatch(addToast({
        type: 'success',
        message: `Worker ${!currentActive ? 'activated' : 'deactivated'} successfully`,
      }));
    } catch (err) {
      dispatch(addToast({ type: 'error', message: err.message || 'Failed to toggle worker status' }));
    } finally {
      setTogglingId(null);
    }
  };

  /* ── Metrics ─────────────────────────────────────────────────── */
  const totalReports    = reports.length;
  const criticalReports = reports.filter((r) => (Number(r.damage_score) || 0) >= 8 || r.highest_severity === 'CRITICAL').length;
  const resolvedReports = reports.filter((r) => ['completed', 'COMPLETED', 'VERIFICATION'].includes(r.status)).length;
  const biddingReports  = reports.filter((r) => r.status === 'BIDDING').length;
  const avgDamageScore  = totalReports > 0
    ? (reports.reduce((acc, r) => acc + (Number(r.damage_score) || 0), 0) / totalReports).toFixed(1)
    : '0.0';

  return (
    <div className={styles.container}>

      {/* ── Title Banner ──────────────────────────────────────── */}
      <div className={`card ${styles.adminHeader}`}>
        <div className={styles.headerTitleArea}>
          <div className={styles.adminBadgeIcon}><ShieldCheck size={28} /></div>
          <div>
            <div className={styles.titleRow}>
              <h1>Municipal Admin Operations Center</h1>
              <span className={styles.securityTag}>Security Level: High</span>
            </div>
            <p className={styles.headerSub}>
              PARAKRAM 1.0 Smart Road Infrastructure Oversight &amp; Maintenance Telemetry
            </p>
          </div>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={loadAdminData} disabled={isLoading}>
          <RefreshCw size={14} className={isLoading ? styles.spinning : ''} /> Refresh
        </button>
      </div>

      {/* ── Tabs ──────────────────────────────────────────────── */}
      <div className={styles.tabsNav}>
        {[
          { key: 'overview', icon: <Activity size={16} />, label: 'Telemetry Overview' },
          { key: 'users',    icon: <Users size={16} />,    label: `Citizen Accounts (${users.length})` },
          { key: 'crews',    icon: <HardHat size={16} />,  label: `Worker Groups (${workerGroups.length})` },
          { key: 'workers',  icon: <UserCog size={16} />,  label: `Crew Members (${workers.length})` },
        ].map(({ key, icon, label }) => (
          <button
            key={key}
            className={`${styles.tabBtn} ${activeTab === key ? styles.activeTab : ''}`}
            onClick={() => setActiveTab(key)}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {/* ── TAB 1: Overview ───────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className={styles.overviewTab}>
          <div className={styles.metricsGrid}>
            <div className={`card ${styles.metricCard}`}>
              <div className={styles.metricIconWrap} style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa' }}>
                <Layers size={22} />
              </div>
              <div className={styles.metricValue}>{totalReports}</div>
              <div className={styles.metricLabel}>Total Road Incidents</div>
            </div>
            <div className={`card ${styles.metricCard}`}>
              <div className={styles.metricIconWrap} style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171' }}>
                <AlertTriangle size={22} />
              </div>
              <div className={styles.metricValue}>{criticalReports}</div>
              <div className={styles.metricLabel}>Critical Priority</div>
            </div>
            <div className={`card ${styles.metricCard}`}>
              <div className={styles.metricIconWrap} style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24' }}>
                <Gavel size={22} />
              </div>
              <div className={styles.metricValue}>{biddingReports}</div>
              <div className={styles.metricLabel}>Open for Bidding</div>
            </div>
            <div className={`card ${styles.metricCard}`}>
              <div className={styles.metricIconWrap} style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399' }}>
                <Check size={22} />
              </div>
              <div className={styles.metricValue}>{resolvedReports}</div>
              <div className={styles.metricLabel}>Completed Repairs</div>
            </div>
            <div className={`card ${styles.metricCard}`}>
              <div className={styles.metricIconWrap} style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24' }}>
                <TrendingUp size={22} />
              </div>
              <div className={styles.metricValue}>{avgDamageScore} <span className={styles.outOf}>/ 10</span></div>
              <div className={styles.metricLabel}>Avg. Severity Score</div>
            </div>
          </div>

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
                      <td className={styles.monoId}>{r.id?.slice(0, 8)}…</td>
                      <td>{r.description || 'Pothole defect'}</td>
                      <td className={styles.monoId}>
                        {r.location?.latitude?.toFixed(4)}, {r.location?.longitude?.toFixed(4)}
                      </td>
                      <td>
                        <span className={styles.scorePill}>{formatScore(r.damage_score, 1)}</span>
                      </td>
                      <td>
                        <span className={`badge badge-${['completed','COMPLETED','VERIFICATION'].includes(r.status) ? 'low' : r.status === 'onGoing' || r.status === 'IN_PROGRESS' ? 'medium' : 'critical'}`}>
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

      {/* ── TAB 2: Users ──────────────────────────────────────── */}
      {activeTab === 'users' && (
        <div className={`card ${styles.tableCard}`}>
          <div className={styles.tableHeaderRow}>
            <h3>Registered Citizen Accounts</h3>
            <span className={styles.subtleCount}>{users.length} verified accounts</span>
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
                  const pts  = u.credit_points || 0;
                  const rank = pts >= 250 ? 'Infrastructure Champion' : pts >= 100 ? 'Pavement Guardian' : 'Novice Scout';
                  return (
                    <tr key={u.id}>
                      <td className={styles.userNameCol}>
                        <div className={styles.avatarMini}>{u.name?.slice(0, 2).toUpperCase()}</div>
                        <span>{u.name}</span>
                      </td>
                      <td>{u.email}</td>
                      <td><span className={styles.verifiedTag}><Check size={12} /> Verified</span></td>
                      <td className={styles.pointsNumber}>{pts} pts</td>
                      <td><span className={styles.rankPill}>{rank}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 3: Worker Groups ───────────────────────────────── */}
      {activeTab === 'crews' && (
        <div className={styles.crewsTab}>
          <div className={`card ${styles.createCrewCard}`}>
            <h3>Provision New Worker Group Account</h3>
            <p className={styles.formSub}>
              Create a WORKER_GROUP account so the crew can log in and bid on road repairs as a unit.
            </p>
            <form onSubmit={handleCreateWorkerGroup} className={styles.crewForm}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Team Leader Name</label>
                  <input type="text" placeholder="e.g. Rudra Pratap Jena" value={workerName}
                    onChange={(e) => setWorkerName(e.target.value)} required />
                </div>
                <div className={styles.formGroup}>
                  <label>Worker Group Email</label>
                  <input type="email" placeholder="e.g. group.alpha@roadsense.com" value={workerEmail}
                    onChange={(e) => setWorkerEmail(e.target.value)} required />
                </div>
                <div className={styles.formGroup}>
                  <label>Temporary Password</label>
                  <input type="password" placeholder="Min 6 characters" value={workerPassword}
                    onChange={(e) => setWorkerPassword(e.target.value)} required minLength={6} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={isSubmittingGroup}>
                <Plus size={16} />
                {isSubmittingGroup ? 'Creating Group…' : 'Create Worker Group'}
              </button>
            </form>
          </div>

          <div className={styles.crewsGrid}>
            {workerGroups.length === 0 ? (
              <div className={styles.emptyCrews}>
                <HardHat size={32} />
                <p>No worker groups provisioned yet.</p>
              </div>
            ) : (
              workerGroups.map((group) => (
                <div key={group.id} className={`card ${styles.crewCard}`}>
                  <div className={styles.crewCardTop}>
                    <HardHat size={24} className={styles.hardHatIcon} />
                    <span className={styles.tasksActive}>{group.role || 'WORKER_GROUP'}</span>
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

      {/* ── TAB 4: Crew Members (Individual Workers) ──────────── */}
      {activeTab === 'workers' && (
        <div className={styles.crewsTab}>

          {/* Create Form */}
          <div className={`card ${styles.createCrewCard}`}>
            <h3>Add New Crew Member</h3>
            <p className={styles.formSub}>
              Create an individual worker (WORKER role) who can independently bid on and complete repairs.
            </p>
            <form onSubmit={handleCreateWorker} className={styles.crewForm}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Full Name</label>
                  <input type="text" placeholder="e.g. Arjun Mishra" value={wName}
                    onChange={(e) => setWName(e.target.value)} required />
                </div>
                <div className={styles.formGroup}>
                  <label>Worker Email</label>
                  <input type="email" placeholder="e.g. arjun@roadsense.com" value={wEmail}
                    onChange={(e) => setWEmail(e.target.value)} required />
                </div>
                <div className={styles.formGroup}>
                  <label>Temporary Password</label>
                  <input type="password" placeholder="Min 6 characters" value={wPass}
                    onChange={(e) => setWPass(e.target.value)} required minLength={6} />
                </div>
                <div className={styles.formGroup}>
                  <label>Phone (optional)</label>
                  <input type="tel" placeholder="+91 98765 43210" value={wPhone}
                    onChange={(e) => setWPhone(e.target.value)} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={isSubmittingWorker}>
                <Plus size={16} />
                {isSubmittingWorker ? 'Adding Member…' : 'Add Crew Member'}
              </button>
            </form>
          </div>

          {/* Workers Table */}
          <div className={`card ${styles.tableCard}`} style={{ marginTop: 0 }}>
            <div className={styles.tableHeaderRow}>
              <h3>All Crew Members</h3>
              <span className={styles.subtleCount}>{workers.length} registered workers</span>
            </div>
            {workers.length === 0 ? (
              <div className={styles.emptyCrews}>
                <UserCog size={32} />
                <p>No crew members added yet.</p>
              </div>
            ) : (
              <div className={styles.tableResponsive}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workers.map((w) => (
                      <tr key={w.id}>
                        <td className={styles.userNameCol}>
                          <div className={styles.avatarMini} style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                            {w.name?.slice(0, 2).toUpperCase()}
                          </div>
                          <span>{w.name}</span>
                        </td>
                        <td>{w.email}</td>
                        <td>{w.phone || '—'}</td>
                        <td>
                          {w.is_active !== false ? (
                            <span className={styles.verifiedTag}><Check size={12} /> Active</span>
                          ) : (
                            <span className={styles.inactiveTag}>Inactive</span>
                          )}
                        </td>
                        <td>
                          <button
                            className={`btn btn-ghost btn-sm ${styles.toggleBtn}`}
                            disabled={togglingId === w.id}
                            onClick={() => handleToggleWorker(w.id, w.is_active !== false)}
                          >
                            {w.is_active !== false
                              ? <><ToggleRight size={14} /> Deactivate</>
                              : <><ToggleLeft size={14} /> Activate</>
                            }
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
