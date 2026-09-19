import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { openModal, addToast } from '../store/slices/uiSlice.js';
import { workerApi } from '../api/workerApi.js';
import {
  Wrench,
  Users,
  UserPlus,
  Trash2,
  CheckCircle2,
  Shield,
  HardHat,
  RefreshCw,
  Mail,
  Phone,
  UserCheck,
  Award,
  ChevronRight,
} from 'lucide-react';
import styles from './WorkerProfilePage.module.css';

export default function WorkerProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, role } = useSelector((s) => s.auth);

  const [profile, setProfile] = useState(null);
  const [members, setMembers] = useState([]);
  const [availableWorkers, setAvailableWorkers] = useState([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  const isGroup = role === 'WORKER_GROUP';

  const loadWorkerData = async () => {
    setIsLoading(true);
    try {
      const res = await workerApi.getProfile();
      if (res?.worker_group) {
        setProfile(res.worker_group);
      }
      if (res?.members) {
        setMembers(res.members);
      }

      if (isGroup) {
        const availRes = await workerApi.getAvailableWorkers();
        if (availRes?.workers) {
          setAvailableWorkers(availRes.workers);
        }
      }
    } catch (err) {
      console.error('Failed to load worker profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    loadWorkerData();
  }, [isAuthenticated]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedWorkerId) {
      dispatch(addToast({ type: 'warning', message: 'Please select a worker to add' }));
      return;
    }
    setIsAddingMember(true);
    try {
      const res = await workerApi.addMember(selectedWorkerId);
      if (res?.members) {
        setMembers(res.members);
      }
      setSelectedWorkerId('');
      dispatch(addToast({ type: 'success', message: res?.message || 'Member added successfully!' }));
      // Refresh available list
      const availRes = await workerApi.getAvailableWorkers();
      if (availRes?.workers) setAvailableWorkers(availRes.workers);
    } catch (err) {
      dispatch(addToast({ type: 'error', message: err?.message || 'Failed to add member' }));
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleRemoveMember = async (workerId) => {
    if (!window.confirm('Remove this member from the crew group?')) return;
    setRemovingId(workerId);
    try {
      const res = await workerApi.removeMember(workerId);
      if (res?.members) {
        setMembers(res.members);
      } else {
        setMembers((prev) => prev.filter((m) => m.id !== workerId));
      }
      dispatch(addToast({ type: 'success', message: 'Member removed from group' }));
      // Refresh available list
      const availRes = await workerApi.getAvailableWorkers();
      if (availRes?.workers) setAvailableWorkers(availRes.workers);
    } catch (err) {
      dispatch(addToast({ type: 'error', message: err?.message || 'Failed to remove member' }));
    } finally {
      setRemovingId(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className={styles.loginRequired}>
        <Shield size={48} className={styles.shieldIcon} />
        <h2>Worker Sign In Required</h2>
        <p>Sign in with your Worker or Worker Group credentials to view your profile and manage crew members.</p>
        <button className="btn btn-primary btn-lg" onClick={() => dispatch(openModal('login'))}>
          Sign In
        </button>
      </div>
    );
  }

  const leaderName = profile?.leader_name || profile?.name || user?.name || 'Group Leader';
  const groupEmail = profile?.email || user?.email || 'worker@roadsense.gov';

  return (
    <div className={styles.container}>
      {/* Top Banner Card */}
      <div className={`card ${styles.profileHeader}`}>
        <div className={styles.userSection}>
          <div className={styles.avatar}>
            <HardHat size={32} />
          </div>
          <div>
            <div className={styles.nameRow}>
              <h1>{profile?.name || user?.name || 'Field Operations Crew'}</h1>
              <span className={styles.roleTag}>{role || 'WORKER_GROUP'}</span>
            </div>
            <p className={styles.email}><Mail size={13} /> {groupEmail}</p>
          </div>
        </div>

        <div className={styles.headerActions}>
          <button className="btn btn-secondary btn-sm" onClick={loadWorkerData} disabled={isLoading}>
            <RefreshCw size={14} className={isLoading ? styles.spinning : ''} /> Refresh
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/worker')}>
            <Wrench size={14} /> Open Work Orders
          </button>
        </div>
      </div>

      {/* Leadership & Status Grid */}
      <div className={styles.infoGrid}>
        <div className={`card ${styles.infoCard}`}>
          <div className={styles.infoIconWrap} style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' }}>
            <Award size={24} />
          </div>
          <div className={styles.infoContent}>
            <span className={styles.infoSubtle}>Designated Crew Leader</span>
            <h3 className={styles.infoTitle}>{leaderName}</h3>
            <p className={styles.infoDesc}>Primary point of contact for municipal road inspection &amp; bidding orders.</p>
          </div>
        </div>

        <div className={`card ${styles.infoCard}`}>
          <div className={styles.infoIconWrap} style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
            <Users size={24} />
          </div>
          <div className={styles.infoContent}>
            <span className={styles.infoSubtle}>Active Roster Size</span>
            <h3 className={styles.infoTitle}>{members.length + (isGroup ? 1 : 0)} Crew Operatives</h3>
            <p className={styles.infoDesc}>
              {isGroup ? `${members.length} registered members + 1 team leader` : 'Individual contractor account'}
            </p>
          </div>
        </div>
      </div>

      {/* Crew Members Section (For Worker Groups) */}
      {isGroup ? (
        <div className={styles.membersSection}>
          {/* Add Member Card */}
          <div className={`card ${styles.addMemberCard}`}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderIcon}>
                <UserPlus size={20} />
              </div>
              <div>
                <h3>Add Registered Member to Crew</h3>
                <p className={styles.cardHeaderSub}>
                  Select from registered crew members created by municipal administrators to add them to your unit.
                </p>
              </div>
            </div>

            <form onSubmit={handleAddMember} className={styles.addMemberForm}>
              <div className={styles.selectWrap}>
                <select
                  className={styles.select}
                  value={selectedWorkerId}
                  onChange={(e) => setSelectedWorkerId(e.target.value)}
                  disabled={isAddingMember || availableWorkers.length === 0}
                >
                  <option value="">
                    {availableWorkers.length === 0
                      ? 'No available unassigned workers found'
                      : '— Select a worker member to add —'}
                  </option>
                  {availableWorkers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.email}) {w.phone ? `· 📞 ${w.phone}` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!selectedWorkerId || isAddingMember}
              >
                <UserPlus size={16} />
                {isAddingMember ? 'Adding to Group…' : 'Add to Crew'}
              </button>
            </form>
          </div>

          {/* Members Table */}
          <div className={`card ${styles.tableCard}`}>
            <div className={styles.tableHeaderRow}>
              <div>
                <h3>Crew Members Roster</h3>
                <p className={styles.tableSub}>
                  All certified workers attached to {profile?.name || 'this worker unit'}.
                </p>
              </div>
              <span className={styles.memberCountBadge}>
                <UserCheck size={14} /> {members.length} Members
              </span>
            </div>

            {members.length === 0 ? (
              <div className={styles.emptyMembers}>
                <Users size={40} className={styles.emptyIcon} />
                <h4>No Members Added Yet</h4>
                <p>Use the form above to add registered workers to your crew.</p>
              </div>
            ) : (
              <div className={styles.tableResponsive}>
                <table className={styles.membersTable}>
                  <thead>
                    <tr>
                      <th>Worker</th>
                      <th>Email Address</th>
                      <th>Phone</th>
                      <th>Status</th>
                      <th>Joined Date</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((m) => (
                      <tr key={m.id}>
                        <td>
                          <div className={styles.memberCell}>
                            <div className={styles.memberAvatar}>
                              {m.name ? m.name.slice(0, 2).toUpperCase() : 'WM'}
                            </div>
                            <span className={styles.memberName}>{m.name}</span>
                          </div>
                        </td>
                        <td className={styles.memberEmail}>{m.email}</td>
                        <td className={styles.memberPhone}>{m.phone || '—'}</td>
                        <td>
                          <span className={styles.statusActive}>
                            <CheckCircle2 size={12} /> Active
                          </span>
                        </td>
                        <td className={styles.joinedCol}>
                          {m.joined_at ? new Date(m.joined_at).toLocaleDateString() : 'Active'}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className={`btn btn-ghost btn-sm ${styles.removeBtn}`}
                            onClick={() => handleRemoveMember(m.id)}
                            disabled={removingId === m.id}
                            title="Remove member"
                          >
                            <Trash2 size={14} />
                            {removingId === m.id ? 'Removing…' : 'Remove'}
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
      ) : (
        /* For Individual Worker Account */
        <div className={`card ${styles.singleWorkerCard}`}>
          <div className={styles.singleTop}>
            <UserCheck size={28} style={{ color: '#10b981' }} />
            <div>
              <h3>Individual Operative Profile</h3>
              <p>You are registered as an individual certified field worker.</p>
            </div>
          </div>
          <div className={styles.detailsRow}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Contractor Name</span>
              <span className={styles.detailValue}>{user?.name}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Official Email</span>
              <span className={styles.detailValue}>{user?.email}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Contact Phone</span>
              <span className={styles.detailValue}>{user?.phone || 'Not provided'}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Assigned Role</span>
              <span className={styles.detailValue}>Individual Worker (WORKER)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
