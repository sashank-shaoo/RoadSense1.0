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
  Trophy,
  ArrowDown,
  X,
  AlertCircle,
} from 'lucide-react';
import styles from './WorkerPortalPage.module.css';

/* ─── status constants ─────────────────────────────────────── */
const BIDDING_STATUSES = ['BIDDING', 'notStarted']; // treat unassigned as biddable too
const ACTIVE_STATUSES  = ['ASSIGNED', 'IN_PROGRESS', 'onGoing'];
const DONE_STATUSES    = ['COMPLETED', 'completed', 'VERIFICATION'];

/**
 * CountdownBadge — live ticking countdown badge for 12-hour bidding window.
 */
function CountdownBadge({ endsAt, startedAt }) {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!endsAt) {
      setTimeLeft(null);
      return;
    }

    const calc = () => {
      const diff = new Date(endsAt).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ expired: true, text: 'Auction Closed' });
        return;
      }
      const totalSec = Math.floor(diff / 1000);
      const h = Math.floor(totalSec / 3600);
      const m = Math.floor((totalSec % 3600) / 60);
      const s = totalSec % 60;
      const pad = (n) => String(n).padStart(2, '0');
      setTimeLeft({
        expired: false,
        urgent: diff < 2 * 3600 * 1000,
        critical: diff < 30 * 60 * 1000,
        text: `${pad(h)}:${pad(m)}:${pad(s)} left`,
      });
    };

    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  if (!startedAt || !endsAt) {
    return (
      <span className={styles.countdownIdle} title="12-hour bidding window begins when the first bid is submitted">
        <Clock size={12} /> 12h auction on 1st bid
      </span>
    );
  }

  if (timeLeft?.expired) {
    return (
      <span className={styles.countdownExpired}>
        <Clock size={12} /> Bidding Closed
      </span>
    );
  }

  return (
    <span
      className={`${styles.countdownActive} ${
        timeLeft?.critical
          ? styles.countdownCritical
          : timeLeft?.urgent
          ? styles.countdownUrgent
          : ''
      }`}
      title="Time remaining to submit competitive lower bids"
    >
      <Clock size={12} className={timeLeft?.critical ? styles.blinking : ''} />
      <span>{timeLeft?.text}</span>
    </span>
  );
}

export default function WorkerPortalPage() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { user }  = useSelector((s) => s.auth);

  const [reports,           setReports]           = useState([]);
  const [activeTab,         setActiveTab]         = useState('bidding'); // 'bidding' | 'mywork' | 'done'
  const [isLoading,         setIsLoading]         = useState(false);
  const [biddingId,         setBiddingId]         = useState(null);  // reportId currently being bid on
  const [updatingId,        setUpdatingId]        = useState(null);  // reportId being status-updated
  const [myBids,            setMyBids]            = useState({});    // { [reportId]: bid }
  const [bidDrawerReportId, setBidDrawerReportId] = useState(null);  // reportId with open bidding form
  const [bidAmountInput,    setBidAmountInput]    = useState('');
  const [bidError,          setBidError]          = useState('');

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

  /* ─── open / close bid drawer ────────────────────────────────── */
  const openBidDrawer = (report) => {
    setBidDrawerReportId(report.id);
    setBidError('');
    setBidAmountInput('');
  };

  const closeBidDrawer = () => {
    setBidDrawerReportId(null);
    setBidError('');
    setBidAmountInput('');
  };

  /* ─── submit bid on a report ─────────────────────────────────── */
  const handlePlaceBid = async (report) => {
    const amount = Number(bidAmountInput);
    if (!bidAmountInput || isNaN(amount) || amount <= 0) {
      setBidError('Please enter a valid positive quote amount in ₹');
      return;
    }

    if (report.lowest_bid && amount >= Number(report.lowest_bid)) {
      setBidError(`Your bid must be lower than the current lowest bid of ₹${Number(report.lowest_bid).toLocaleString('en-IN')}`);
      return;
    }

    setBiddingId(report.id);
    setBidError('');
    try {
      const res = await reportApi.placeBid(report.id, amount);
      setMyBids((prev) => ({ ...prev, [report.id]: res?.data }));
      dispatch(addToast({
        type: 'success',
        message: `Bid placed for ₹${amount.toLocaleString('en-IN')}! You currently hold the lowest bid.`,
      }));
      closeBidDrawer();
      await loadReports();
    } catch (err) {
      const msg = err?.message || 'Failed to place bid';
      setBidError(msg);
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
              const level          = getSeverityLevel(report);
              const color          = getSeverityColor(level);
              const isBusy         = biddingId === report.id || updatingId === report.id;
              const isDrawerOpen   = bidDrawerReportId === report.id;
              const isUserLeading  = report.lowest_bidder_id === user?.id;

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
                      {BIDDING_STATUSES.includes(report.status) && (
                        <CountdownBadge
                          endsAt={report.bidding_ends_at}
                          startedAt={report.bidding_started_at}
                        />
                      )}
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

                      {/* ── Auction & Pricing Banner for Bidding ── */}
                      {BIDDING_STATUSES.includes(report.status) && (
                        <div className={styles.auctionBanner}>
                          <div className={styles.auctionRow}>
                            <div className={styles.auctionLeft}>
                              <span className={styles.auctionLabel}>Current Lowest Bid:</span>
                              {report.lowest_bid ? (
                                <>
                                  <span className={styles.auctionPrice}>
                                    ₹{Number(report.lowest_bid).toLocaleString('en-IN')}
                                  </span>
                                  <span className={styles.bidCountTag}>
                                    {report.bid_count || 1} bid{(report.bid_count || 1) > 1 ? 's' : ''}
                                  </span>
                                </>
                              ) : (
                                <span className={styles.auctionPriceUnset}>
                                  No bids yet · Starting quote opens auction
                                </span>
                              )}
                            </div>

                            <div>
                              {report.lowest_bidder_id ? (
                                isUserLeading ? (
                                  <span className={`${styles.leadingBidderTag} ${styles.leadingUserTag}`}>
                                    <Trophy size={12} /> You hold lowest bid!
                                  </span>
                                ) : (
                                  <span className={styles.leadingBidderTag}>
                                    <Users size={12} /> Leading: {report.lowest_bidder_name || 'Competing Worker'}
                                  </span>
                                )
                              ) : (
                                <span className={styles.leadingBidderTag} style={{ opacity: 0.8 }}>
                                  <Gavel size={12} /> First bidder sets initial ceiling
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ── Assigned Worker Banner ── */}
                      {(report.assigned_worker_id || report.assigned_worker_name) && (
                        <div style={{ marginTop: '6px' }}>
                          <span className={styles.assignedWorkerTag}>
                            <Shield size={12} /> Assigned Worker: {report.assigned_worker_name || 'Assigned Worker'}
                            {report.assigned_worker_id === user?.id ? ' (You)' : ''}
                          </span>
                        </div>
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

                          {isDrawerOpen ? (
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={closeBidDrawer}
                            >
                              <X size={12} /> Cancel
                            </button>
                          ) : isUserLeading ? (
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                              <span className={styles.bidPlacedTag}>
                                <Trophy size={12} /> Winning Bid (₹{Number(report.lowest_bid).toLocaleString('en-IN')})
                              </span>
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => openBidDrawer(report)}
                                title="Submit a lower bid to secure your lead"
                              >
                                <ArrowDown size={12} /> Lower Bid
                              </button>
                            </div>
                          ) : (
                            <button
                              className={`btn btn-primary btn-sm ${styles.bidBtn}`}
                              disabled={isBusy}
                              onClick={() => openBidDrawer(report)}
                            >
                              <Gavel size={12} />
                              {report.lowest_bid ? 'Place Lower Bid' : 'Start Bidding'}
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

                  {/* ── Interactive Bid Drawer (when open for this card) ── */}
                  {isDrawerOpen && (
                    <div className={styles.bidDrawer}>
                      <div className={styles.bidDrawerHeader}>
                        <span><Gavel size={13} style={{ verticalAlign: 'middle', marginRight: 5 }} /> Submit Reverse Auction Bid</span>
                        <span className={styles.bidRulesText}>
                          {report.lowest_bid ? (
                            <>Must be lower than <strong>₹{Number(report.lowest_bid).toLocaleString('en-IN')}</strong></>
                          ) : (
                            <>You set the initial ceiling price (12-hour timer begins)</>
                          )}
                        </span>
                      </div>

                      <div className={styles.bidInputGroup}>
                        <div className={styles.bidInputWrapper}>
                          <span className={styles.bidCurrencySymbol}>₹</span>
                          <input
                            type="number"
                            className={styles.bidInputField}
                            placeholder={report.lowest_bid ? `e.g. ${Math.max(10, Math.floor(Number(report.lowest_bid) - 100))}` : 'Enter quote in ₹ (e.g. 5000)'}
                            value={bidAmountInput}
                            onChange={(e) => {
                              setBidAmountInput(e.target.value);
                              setBidError('');
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handlePlaceBid(report);
                              }
                            }}
                            autoFocus
                          />
                        </div>

                        {/* Quick Decrement Suggestion Pills if lowest bid exists */}
                        {report.lowest_bid && (
                          <div className={styles.quickPillRow}>
                            <span className={styles.quickPillLabel}>Quick beat:</span>
                            {[100, 250, 500].map((drop) => {
                              const suggested = Math.max(10, Math.floor(Number(report.lowest_bid) - drop));
                              if (suggested <= 0 || suggested >= Number(report.lowest_bid)) return null;
                              return (
                                <button
                                  key={drop}
                                  type="button"
                                  className={styles.quickPillBtn}
                                  onClick={() => {
                                    setBidAmountInput(String(suggested));
                                    setBidError('');
                                  }}
                                >
                                  -₹{drop} (₹{suggested.toLocaleString('en-IN')})
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {bidError && (
                        <div className={styles.bidErrorText}>
                          <AlertCircle size={13} /> {bidError}
                        </div>
                      )}

                      <div className={styles.bidDrawerActions}>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={closeBidDrawer}
                          disabled={biddingId === report.id}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className={`btn btn-primary btn-sm ${styles.bidBtn}`}
                          disabled={biddingId === report.id || !bidAmountInput}
                          onClick={() => handlePlaceBid(report)}
                        >
                          <CheckCircle2 size={13} />
                          {biddingId === report.id
                            ? 'Submitting Bid…'
                            : `Confirm Bid ${bidAmountInput ? `(₹${Number(bidAmountInput).toLocaleString('en-IN')})` : ''}`}
                        </button>
                      </div>
                    </div>
                  )}
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
