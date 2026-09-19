import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { openModal, addToast } from '../store/slices/uiSlice.js';
import { setActiveReport } from '../store/slices/reportSlice.js';
import { reportApi } from '../api/reportApi.js';
import DamageMap from '../components/map/DamageMap.jsx';
import { getSeverityLevel, getSeverityColor, getSeverityLabel, getStatusLabel, formatRelativeTime, formatScore } from '../utils/helpers.js';
import { 
  Wrench, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  RefreshCw, 
  Filter,
  Shield,
  Layers
} from 'lucide-react';
import styles from './WorkerPortalPage.module.css';

export default function WorkerPortalPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, role } = useSelector((s) => s.auth);
  const [reports, setReports] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const loadAssignments = async () => {
    setIsLoading(true);
    try {
      const res = await reportApi.getAllReports();
      if (res?.reports) {
        setReports(res.reports);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const handleUpdateStatus = async (reportId, newStatus) => {
    setUpdatingId(reportId);
    try {
      await reportApi.updateReportStatus(reportId, newStatus);
      setReports((prev) => 
        prev.map((r) => r.id === reportId ? { ...r, status: newStatus } : r)
      );
      dispatch(addToast({ 
        type: 'success', 
        message: `Task status updated to ${getStatusLabel(newStatus)}` 
      }));
    } catch (err) {
      dispatch(addToast({ 
        type: 'error', 
        message: 'Failed to update work order status' 
      }));
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredReports = reports.filter((r) => {
    if (filterStatus === 'all') return true;
    return r.status === filterStatus;
  });

  const counts = {
    all: reports.length,
    notStarted: reports.filter((r) => r.status === 'notStarted').length,
    onGoing: reports.filter((r) => r.status === 'onGoing').length,
    completed: reports.filter((r) => r.status === 'completed').length,
  };

  return (
    <div className={styles.container}>
      {/* Header Banner */}
      <div className={`card ${styles.headerCard}`}>
        <div className={styles.headerLeft}>
          <div className={styles.crewIcon}>
            <Wrench size={26} />
          </div>
          <div>
            <div className={styles.crewRow}>
              <h1>Municipal Work Orders & Repair Queue</h1>
              <span className={styles.crewBadge}>Crew Unit: Alpha-01</span>
            </div>
            <p className={styles.crewSub}>
              Prioritize repairs by AI damage score and community reports. Update crew status in real time.
            </p>
          </div>
        </div>

        <div className={styles.headerRight}>
          <button className="btn btn-secondary btn-sm" onClick={loadAssignments} disabled={isLoading}>
            <RefreshCw size={14} className={isLoading ? styles.spinning : ''} /> Refresh Queue
          </button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className={styles.filterTabs}>
        <button 
          className={`${styles.tab} ${filterStatus === 'all' ? styles.activeTab : ''}`}
          onClick={() => setFilterStatus('all')}
        >
          All Tasks ({counts.all})
        </button>
        <button 
          className={`${styles.tab} ${filterStatus === 'notStarted' ? styles.activeTab : ''}`}
          onClick={() => setFilterStatus('notStarted')}
        >
          <AlertTriangle size={14} color="#ef4444" /> Pending ({counts.notStarted})
        </button>
        <button 
          className={`${styles.tab} ${filterStatus === 'onGoing' ? styles.activeTab : ''}`}
          onClick={() => setFilterStatus('onGoing')}
        >
          <Clock size={14} color="#f59e0b" /> In Progress ({counts.onGoing})
        </button>
        <button 
          className={`${styles.tab} ${filterStatus === 'completed' ? styles.activeTab : ''}`}
          onClick={() => setFilterStatus('completed')}
        >
          <CheckCircle2 size={14} color="#10b981" /> Completed ({counts.completed})
        </button>
      </div>

      {/* Main Grid: Work Orders List & Mini Map */}
      <div className={styles.contentGrid}>
        <div className={styles.ordersList}>
          {filteredReports.length === 0 ? (
            <div className={styles.empty}>
              <CheckCircle2 size={36} color="#10b981" />
              <p>No work orders currently match this filter.</p>
            </div>
          ) : (
            filteredReports.map((report) => {
              const level = getSeverityLevel(report);
              const color = getSeverityColor(level);
              return (
                <div key={report.id} className={`card ${styles.orderCard}`}>
                  <div className={styles.orderTop}>
                    <div className={styles.orderTopLeft}>
                      <span className={`badge badge-${level}`}>{getSeverityLabel(level)}</span>
                      <span className={styles.scoreText} style={{ color }}>
                        Damage Score: {formatScore(report.damage_score, 1)}
                      </span>
                    </div>
                    <span className={styles.timeTag}>{formatRelativeTime(report.created_at)}</span>
                  </div>

                  <div className={styles.orderBody}>
                    <div className={styles.orderImageThumb} onClick={() => {
                      dispatch(setActiveReport(report));
                      navigate(`/reports/${report.id}`);
                    }}>
                      {report.media_type === 'video' || report.video_url ? (
                        <video 
                          src={report.video_url || report.media_url || report.image_url} 
                          muted 
                          preload="metadata"
                        />
                      ) : (
                        <img 
                          src={report.image_url || report.media_url || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=500&auto=format&fit=crop&q=60'} 
                          alt="Road damage" 
                        />
                      )}
                      <span className={styles.inspectHint}>Inspect AI Canvas</span>
                    </div>

                    <div className={styles.orderInfo}>
                      <h4 className={styles.orderTitle}>{report.description || 'Pothole defect detected'}</h4>
                      <p className={styles.orderAddress}>
                        <MapPin size={12} />
                        {report.address || `GPS: ${report.location?.latitude?.toFixed(4)}, ${report.location?.longitude?.toFixed(4)}`}
                      </p>

                      <div className={styles.detectionsSummary}>
                        {report.detections?.length > 0 ? (
                          report.detections.slice(0, 3).map((d, i) => (
                            <span key={i} className={styles.defectTag}>
                              {d.class_name} ({Math.round(d.confidence * 100)}%)
                            </span>
                          ))
                        ) : (
                          <span className={styles.defectTag}>Pothole defect</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Bar for Status Updating */}
                  <div className={styles.orderActions}>
                    <div className={styles.currentStatusWrapper}>
                      <span className={styles.statusLabelSmall}>Status:</span>
                      <strong>{getStatusLabel(report.status)}</strong>
                    </div>

                    <div className={styles.statusButtons}>
                      {report.status !== 'notStarted' && (
                        <button 
                          className="btn btn-ghost btn-sm"
                          disabled={updatingId === report.id}
                          onClick={() => handleUpdateStatus(report.id, 'notStarted')}
                        >
                          Mark Pending
                        </button>
                      )}
                      {report.status !== 'onGoing' && (
                        <button 
                          className="btn btn-secondary btn-sm"
                          disabled={updatingId === report.id}
                          onClick={() => handleUpdateStatus(report.id, 'onGoing')}
                        >
                          <Clock size={12} /> Begin Work
                        </button>
                      )}
                      {report.status !== 'completed' && (
                        <button 
                          className="btn btn-primary btn-sm"
                          disabled={updatingId === report.id}
                          onClick={() => handleUpdateStatus(report.id, 'completed')}
                        >
                          <CheckCircle2 size={12} /> Mark Fixed
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Tactical Map preview */}
        <div className={styles.mapSide}>
          <div className={`card ${styles.mapCard}`}>
            <div className={styles.mapHeader}>
              <Layers size={16} />
              <span>Tactical Operations Map</span>
            </div>
            <div className={styles.mapWrap}>
              <DamageMap reports={filteredReports} height="100%" showPopup={true} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
