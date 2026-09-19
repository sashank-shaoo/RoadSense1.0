import { useSelector, useDispatch } from 'react-redux';
import { closeModal } from '../../store/slices/uiSlice.js';
import { clearActiveReport, updateReportSupportCount } from '../../store/slices/reportSlice.js';
import { addCreditPoints } from '../../store/slices/authSlice.js';
import { addToast } from '../../store/slices/uiSlice.js';
import { reportApi } from '../../api/reportApi.js';
import BoundingBoxCanvas from './BoundingBoxCanvas.jsx';
import { X, MapPin, ThumbsUp, Clock, Cpu, AlertTriangle, BarChart2, CheckCircle2, Loader } from 'lucide-react';
import { getSeverityLevel, getSeverityColor, getSeverityLabel, getStatusLabel, getStatusColor, formatRelativeTime, formatScore } from '../../utils/helpers.js';
import { useState } from 'react';
import styles from './ReportDetailModal.module.css';

export default function ReportDetailModal() {
  const dispatch = useDispatch();
  const report = useSelector((s) => s.reports.activeReport);
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const [supporting, setSupporting] = useState(false);
  const [supported, setSupported] = useState(false);

  if (!report) return null;

  // Safe parse raw_ai_response
  let parsedAi = null;
  if (typeof report.raw_ai_response === 'string') {
    try {
      parsedAi = JSON.parse(report.raw_ai_response);
    } catch (e) {
      console.warn('Could not parse raw_ai_response JSON', e);
    }
  } else if (typeof report.raw_ai_response === 'object' && report.raw_ai_response !== null) {
    parsedAi = report.raw_ai_response;
  }

  const level = getSeverityLevel(report);
  const color = getSeverityColor(level);
  const detections = parsedAi?.detections || report.detections || [];
  const modelVersion = parsedAi?.model_version || report.model_version || 'RoadSense-YOLO-best.pt';
  const detectionCount = report.detection_count ?? parsedAi?.count ?? detections.length;

  const handleClose = () => {
    dispatch(closeModal());
    dispatch(clearActiveReport());
  };

  const handleSupport = async () => {
    if (!isAuthenticated) {
      dispatch(addToast({ type: 'warning', message: 'Please sign in to support this report' }));
      return;
    }
    if (supported) return;
    setSupporting(true);
    try {
      const res = await reportApi.supportReport(report.id);
      if (res.already_supported) {
        dispatch(addToast({ type: 'info', message: 'You already supported this report' }));
      } else {
        setSupported(true);
        dispatch(updateReportSupportCount({ reportId: report.id, supportCount: res.support_count }));
        dispatch(addCreditPoints(10));
        dispatch(addToast({ type: 'success', message: '+10 credit points earned for supporting!' }));
      }
    } catch (err) {
      dispatch(addToast({ type: 'error', message: err.message || 'Failed to support report' }));
    } finally {
      setSupporting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className={`modal-content ${styles.detailModal}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className={styles.headerLeft}>
            <span className={`badge badge-${level}`} style={{ marginRight: 8 }}>
              ● {getSeverityLabel(level)}
            </span>
            <span className={styles.reportId}>#{report.id?.slice(0, 8)}</span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={handleClose}><X size={18} /></button>
        </div>

        <div className="modal-body" style={{ padding: 0 }}>
          {/* AI Media / Bounding Box View */}
          <div className={styles.imageSection}>
            {report.media_type === 'video' || report.video_url ? (
              <div className={styles.videoWrapper}>
                <video
                  src={report.video_url || report.media_url || report.image_url}
                  controls
                  playsInline
                  className={styles.videoPlayer}
                />
              </div>
            ) : (
              <BoundingBoxCanvas
                imageUrl={report.image_url || report.media_url}
                detections={detections}
              />
            )}
            <div className={styles.aiOverlay}>
              <span className={styles.aiBadge}><Cpu size={11} /> AI Analyzed</span>
              <span className={styles.modelVersion}>{modelVersion}</span>
            </div>
          </div>

          <div style={{ padding: '20px 24px' }}>
            {/* Metrics Row */}
            <div className={styles.metricsRow}>
              <div className={styles.metric}>
                <span className={styles.metricVal} style={{ color }}>
                  {formatScore(report.damage_score, 2)}
                </span>
                <span className={styles.metricLabel}>Damage Score</span>
              </div>
              <div className={styles.metric}>
                <span className={styles.metricVal}>{detectionCount}</span>
                <span className={styles.metricLabel}>Detections</span>
              </div>
              <div className={styles.metric}>
                <span className={styles.metricVal}>{report.support_count || 0}</span>
                <span className={styles.metricLabel}>Supporters</span>
              </div>
              <div className={styles.metric}>
                <span className={styles.metricVal} style={{ color: getStatusColor(report.status) }}>
                  {getStatusLabel(report.status)}
                </span>
                <span className={styles.metricLabel}>Status</span>
              </div>
            </div>

            {/* Description */}
            {report.description && (
              <div className={styles.description}>{report.description}</div>
            )}

            {/* Detections List */}
            {detections.length > 0 && (
              <div className={styles.detectionsList}>
                <h4 className={styles.sectionTitle}><AlertTriangle size={14} /> AI Detections</h4>
                {detections.map((det, i) => (
                  <div key={i} className={styles.detectionItem}>
                    <span className={styles.detClass}>{det.class?.replace(/_/g, ' ')}</span>
                    <div className={styles.confBar}>
                      <div
                        className={styles.confFill}
                        style={{ width: `${(det.confidence * 100).toFixed(0)}%`, background: color }}
                      />
                    </div>
                    <span className={styles.confLabel}>{(det.confidence * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            )}

            {/* Meta info */}
            <div className={styles.metaRow}>
              <span className={styles.metaItem}><MapPin size={13} /> {report.location?.latitude?.toFixed(4)}, {report.location?.longitude?.toFixed(4)}</span>
              <span className={styles.metaItem}><Clock size={13} /> {formatRelativeTime(report.created_at)}</span>
            </div>

            {/* Support button */}
            <button
              className={`btn ${supported ? 'btn-secondary' : 'btn-primary'} ${styles.supportBtn}`}
              onClick={handleSupport}
              disabled={supporting || supported}
            >
              {supporting ? <Loader size={15} className={styles.spin} /> : supported ? <CheckCircle2 size={15} /> : <ThumbsUp size={15} />}
              {supported ? 'Supported! (+10 pts)' : supporting ? 'Supporting…' : `Support Report`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
