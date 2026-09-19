import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addToast } from '../store/slices/uiSlice.js';
import { setActiveReport } from '../store/slices/reportSlice.js';
import { reportApi } from '../api/reportApi.js';
import DamageMap from '../components/map/DamageMap.jsx';
import {
  getSeverityLevel,
  getSeverityColor,
  getSeverityLabel,
  getStatusLabel,
  formatRelativeTime,
  formatScore,
} from '../utils/helpers.js';
import {
  Wrench,
  MapPin,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  Layers,
  Gavel,
  PlayCircle,
  Eye,
  Activity,
  TrendingUp,
  Users,
  Shield,
  ChevronRight,
} from 'lucide-react';
import styles from './WorkerPortalPage.module.css';

/* ─── status constants ─────────────────────────────────────── */
const BIDDING_STATUSES = ['BIDDING', 'notStarted']; // treat unassigned as biddable too
const ACTIVE_STATUSES  = ['ASSIGNED', 'IN_PROGRESS', 'onGoing'];
const DONE_STATUSES    = ['COMPLETED', 'completed', 'VERIFICATION'];

export default function WorkerPortalPage() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { user }  = useSelector((s) => s.auth);

  const [reports,      setReports]      = useState([]);
  const [activeTab,    setActiveTab]    = useState('bidding'); // 'bidding' | 'mywork' | 'done'
  const [isLoading,    setIsLoading]    = useState(false);
  const [biddingId,    setBiddingId]    = useState(null);  // reportId currently being bid on
  const [updatingId,   setUpdatingId]   = useState(null);  // reportId being status-updated
  const [myBids,       setMyBids]       = useState({});    // { [reportId]: bid }

  /* ─── load all reports ─────────────────────────────────────── */
  const loadReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await reportApi.getAllReports();
      if (res?.reports) setReports(res.reports);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadReports(); }, [loadReports]);

  /* ─── derived lists ─────────────────────────────────────────── */
  const biddingReports = reports.filter((r) => BIDDING_STATUSES.includes(r.status));
  const myWorkReports  = reports.filter(
    (r) => ACTIVE_STATUSES.includes(r.status) && r.assigned_worker_id === user?.id
  );
  const doneReports    = reports.filter((r) => DONE_STATUSES.includes(r.status));

  const activeList =
    activeTab === 'bidding' ? biddingReports :
    activeTab === 'mywork'  ? myWorkReports  :
    doneReports;

  /* ─── bid on a report ───────────────────────────────────────── */
  const handlePlaceBid = async (reportId) => {
    setBiddingId(reportId);
    try {
      const res = await reportApi.placeBid(reportId);
      setMyBids((prev) => ({ ...prev, [reportId]: res?.data }));
      dispatch(addToast({ type: 'success', message: 'Bid placed! You will be notified if assigned.' }));
    } catch (err) {
      const msg = err?.message || 'Failed to place bid';
      dispatch(addToast({ type: 'error', message: msg }));
    } finally {
      setBiddingId(null);
    }
  };

  /* ─── update work status ────────────────────────────────────── */
  const handleUpdateStatus = async (reportId, newStatus) => {
    setUpdatingId(reportId);
    try {
      await reportApi.updateWorkStatus(reportId, newStatus);
      setReports((prev) =>
        prev.map((r) => r.id === reportId ? { ...r, status: newStatus } : r)
      );
      dispatch(addToast({
        type: 'success',
        message: `Status updated to: ${getStatusLabel(newStatus)}`,
      }));
    } catch (err) {
      dispatch(addToast({ type: 'error', message: err?.message || 'Failed to update status' }));
    } finally {
      setUpdatingId(null);
    }
  };

  /* ─── tab counts ────────────────────────────────────────────── */
  const counts = {
    bidding: biddingReports.length,
    mywork:  myWorkReports.length,
    done:    doneReports.length,
  };

  /* ─── stats banner ──────────────────────────────────────────── */
  const stats = [
    { label: 'Open for Bidding', value: counts.bidding, icon: <Gavel size={18} />, color: '#f59e0b' },
    { label: 'My Active Jobs',   value: counts.mywork,  icon: <Activity size={18} />, color: '#06b6d4' },
    { label: 'Completed',        value: counts.done,    icon: <CheckCircle2 size={18} />, color: '#10b981' },
    { label: 'Total Reports',    value: reports.length, icon: <Layers size={18} />, color: '#818cf8' },
  ];

  return (
    <div className={styles.container}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className={`card ${styles.headerCard}`}>
        <div className={styles.headerLeft}>
          <div className={styles.crewIcon}><Wrench size={26} /></div>
          <div>
            <div className={styles.crewRow}>
              <h1>Municipal Work Orders &amp; Repair Queue</h1>
              <span className={styles.crewBadge}>
                {user?.name || 'Worker'} · {user?.role || 'WORKER'}
              </span>
            </div>
            <p className={styles.crewSub}>
              Bid on road damage reports, track assigned jobs, and update repair progress in real-time.
            </p>
          </div>
        </div>
        <div className={styles.headerRight} style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/worker/profile')}>
            <Users size={14} /> Manage Crew Roster
          </button>
          <button className="btn btn-secondary btn-sm" onClick={loadReports} disabled={isLoading}>
            <RefreshCw size={14} className={isLoading ? styles.spinning : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* ── Stats Row ──────────────────────────────────────────── */}
      <div className={styles.statsRow}>
        {stats.map((s) => (
          <div key={s.label} className={`card ${styles.statCard}`}>
            <div className={styles.statIcon} style={{ color: s.color, background: `${s.color}18` }}>
              {s.icon}
            </div>
            <div className={styles.statValue}>{s.value}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Tab Nav ───────────────────────────────────────────── */}
      <div className={styles.filterTabs}>
        <button
          className={`${styles.tab} ${activeTab === 'bidding' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('bidding')}
        >
          <Gavel size={14} /> Open Bids ({counts.bidding})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'mywork' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('mywork')}
        >
          <PlayCircle size={14} /> My Active Work ({counts.mywork})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'done' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('done')}
        >
          <CheckCircle2 size={14} /> Completed ({counts.done})
        </button>
      </div>

      {/* ── Content Grid ─────────────────────────────────────── */}
      <div className={styles.contentGrid}>

        {/* Left: Order Cards */}
        <div className={styles.ordersList}>
          {isLoading && activeList.length === 0 ? (
            <div className={styles.empty}>
              <RefreshCw size={28} className={styles.spinning} />
              <p>Loading work orders…</p>
            </div>
          ) : activeList.length === 0 ? (
            <div className={styles.empty}>
              <CheckCircle2 size={36} color="#10b981" />
              <p>
                {activeTab === 'bidding'
                  ? 'No reports open for bidding right now.'
                  : activeTab === 'mywork'
                  ? 'You have no active assignments yet. Place a bid!'
                  : 'No completed reports to show.'}
              </p>
            </div>
          ) : (
            activeList.map((report) => {
              const level  = getSeverityLevel(report);
              const color  = getSeverityColor(level);
              const isBusy = biddingId === report.id || updatingId === report.id;
              const hasBid = Boolean(myBids[report.id]);

              return (
                <div key={report.id} className={`card ${styles.orderCard}`}>

                  {/* Top row */}
                  <div className={styles.orderTop}>
                    <div className={styles.orderTopLeft}>
                      <span className={`badge badge-${level}`}>{getSeverityLabel(level)}</span>
                      <span className={styles.scoreText} style={{ color }}>
                        Score: {formatScore(report.damage_score, 1)}
                      </span>
                      <span className={styles.statusPill} data-status={report.status}>
                        {getStatusLabel(report.status)}
                      </span>
                    </div>
                    <span className={styles.timeTag}>{formatRelativeTime(report.created_at)}</span>
                  </div>

                  {/* Body */}
                  <div className={styles.orderBody}>
                    {/* thumbnail */}
                    <div
                      className={styles.orderImageThumb}
                      onClick={() => {
                        dispatch(setActiveReport(report));
                        navigate(`/reports/${report.id}`);
                      }}
                    >
                      {report.media_type === 'video' ? (
                        <video src={report.video_url || report.media_url} muted preload="metadata" />
                      ) : (
                        <img
                          src={report.image_url || report.media_url || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=400&auto=format&fit=crop&q=60'}
                          alt="Road damage"
                        />
                      )}
                      <span className={styles.inspectHint}><Eye size={10} /> View AI Canvas</span>
                    </div>

                    {/* info */}
                    <div className={styles.orderInfo}>
                      <h4 className={styles.orderTitle}>
                        {report.description || 'Road damage defect detected'}
                      </h4>
                      <p className={styles.orderAddress}>
                        <MapPin size={12} />
                        {report.address ||
                          `GPS: ${report.location?.latitude?.toFixed(4)}, ${report.location?.longitude?.toFixed(4)}`}
                      </p>
                      <div className={styles.detectionsSummary}>
                        {report.detections?.slice(0, 3).map((d, i) => (
                          <span key={i} className={styles.defectTag}>
                            {d.class_name || d.class} ({Math.round((d.confidence || 0) * 100)}%)
                          </span>
                        )) || (
                          <span className={styles.defectTag}>{report.detection_count || 0} defect(s) detected</span>
                        )}
                      </div>
                      {report.assigned_worker_id && (
                        <p className={styles.assignedNote}>
                          <Shield size={11} /> Assigned to worker
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className={styles.orderActions}>
                    <div className={styles.currentStatusWrapper}>
                      <span className={styles.statusLabelSmall}>Status:</span>
                      <strong>{getStatusLabel(report.status)}</strong>
                    </div>

                    <div className={styles.statusButtons}>
                      {/* ── BIDDING tab actions ── */}
                      {activeTab === 'bidding' && (
                        <>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => { dispatch(setActiveReport(report)); navigate(`/reports/${report.id}`); }}
                          >
                            <Eye size={12} /> Inspect
                          </button>
                          {hasBid ? (
                            <span className={styles.bidPlacedTag}>
                              <CheckCircle2 size={12} /> Bid Placed
                            </span>
                          ) : (
                            <button
                              className={`btn btn-primary btn-sm ${styles.bidBtn}`}
                              disabled={isBusy}
                              onClick={() => handlePlaceBid(report.id)}
                            >
                              <Gavel size={12} />
                              {biddingId === report.id ? 'Placing…' : 'Place Bid'}
                            </button>
                          )}
                        </>
                      )}

                      {/* ── MY WORK tab actions ── */}
                      {activeTab === 'mywork' && (
                        <>
                          {(report.status === 'ASSIGNED' || report.status === 'notStarted') && (
                            <button
                              className="btn btn-secondary btn-sm"
                              disabled={isBusy}
                              onClick={() => handleUpdateStatus(report.id, 'IN_PROGRESS')}
                            >
                              <Clock size={12} />
                              {updatingId === report.id ? 'Updating…' : 'Begin Work'}
                            </button>
                          )}
                          {(report.status === 'IN_PROGRESS' || report.status === 'onGoing') && (
                            <button
                              className="btn btn-primary btn-sm"
                              disabled={isBusy}
                              onClick={() => handleUpdateStatus(report.id, 'COMPLETED')}
                            >
                              <CheckCircle2 size={12} />
                              {updatingId === report.id ? 'Updating…' : 'Mark Complete'}
                            </button>
                          )}
                        </>
                      )}

                      {/* ── DONE tab: view only ── */}
                      {activeTab === 'done' && (
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => { dispatch(setActiveReport(report)); navigate(`/reports/${report.id}`); }}
                        >
                          <ChevronRight size={12} /> View Report
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Tactical Map */}
        <div className={styles.mapSide}>
          <div className={`card ${styles.mapCard}`}>
            <div className={styles.mapHeader}>
              <Layers size={16} />
              <span>Tactical Operations Map</span>
              <span className={styles.mapCount}>{activeList.length} sites</span>
            </div>
            <div className={styles.mapWrap}>
              <DamageMap reports={activeList} height="100%" showPopup={true} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
