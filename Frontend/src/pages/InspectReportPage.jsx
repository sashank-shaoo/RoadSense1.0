import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { MapContainer, TileLayer, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { reportApi } from '../api/reportApi.js';
import { updateReportSupportCount } from '../store/slices/reportSlice.js';
import { addCreditPoints } from '../store/slices/authSlice.js';
import { addToast, openModal } from '../store/slices/uiSlice.js';
import BoundingBoxCanvas from '../components/reports/BoundingBoxCanvas.jsx';
import { 
  getSeverityLevel, 
  getSeverityColor, 
  getSeverityLabel, 
  getStatusLabel, 
  getStatusColor, 
  formatRelativeTime, 
  formatScore 
} from '../utils/helpers.js';
import { 
  ArrowLeft, 
  MapPin, 
  ThumbsUp, 
  Clock, 
  Cpu, 
  AlertTriangle, 
  CheckCircle2, 
  Loader, 
  ShieldCheck, 
  FileText,
  Navigation,
  ExternalLink,
  Layers,
  Sparkles,
  User,
  Share2
} from 'lucide-react';
import styles from './InspectReportPage.module.css';

// Leaflet map center helper
function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && !isNaN(center[0]) && !isNaN(center[1])) {
      map.setView(center, 15);
    }
  }, [center, map]);
  return null;
}

export default function InspectReportPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { reports } = useSelector((s) => s.reports);
  const { isAuthenticated } = useSelector((s) => s.auth);

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [supporting, setSupporting] = useState(false);
  const [supported, setSupported] = useState(false);

  // Load report data
  useEffect(() => {
    const cached = reports.find((r) => r.id === id);
    if (cached) {
      setReport(cached);
      setLoading(false);
    } else {
      setLoading(true);
      reportApi.getReportById(id)
        .then((res) => {
          if (res.report) {
            setReport(res.report);
          }
        })
        .catch((err) => {
          console.error(err);
          dispatch(addToast({ type: 'error', message: 'Could not load report details' }));
        })
        .finally(() => setLoading(false));
    }
  }, [id, reports, dispatch]);

  const handleSupport = async () => {
    if (!isAuthenticated) {
      dispatch(addToast({ type: 'warning', message: 'Please sign in to support this report' }));
      dispatch(openModal('login'));
      return;
    }
    if (supported || !report) return;
    setSupporting(true);
    try {
      const res = await reportApi.supportReport(report.id);
      if (res.already_supported) {
        dispatch(addToast({ type: 'info', message: 'You already supported this report' }));
      } else {
        setSupported(true);
        const newCount = res.support_count ?? ((report.support_count || 0) + 1);
        setReport((prev) => ({ ...prev, support_count: newCount }));
        dispatch(updateReportSupportCount({ reportId: report.id, supportCount: newCount }));
        dispatch(addCreditPoints(10));
        dispatch(addToast({ type: 'success', message: '🎉 +10 credit points earned for supporting!' }));
      }
    } catch (err) {
      dispatch(addToast({ type: 'error', message: err.message || 'Failed to support report' }));
    } finally {
      setSupporting(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    dispatch(addToast({ type: 'info', message: '✓ Report URL copied to clipboard' }));
  };

  if (loading) {
    return (
      <div className={styles.loadingPage}>
        <Loader size={36} className={styles.spin} />
        <p>Retrieving neural telemetry and incident telemetry...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className={styles.container}>
        <div className={styles.notFoundCard}>
          <AlertTriangle size={48} className={styles.warnIcon} />
          <h2>Report Not Found</h2>
          <p>The road incident report with ID <code>{id}</code> does not exist or has been removed.</p>
          <button className="btn btn-primary" onClick={() => navigate('/reports')}>
            Return to All Reports
          </button>
        </div>
      </div>
    );
  }

  const level = getSeverityLevel(report);
  const color = getSeverityColor(level);
  const statusColor = getStatusColor(report.status);
  const statusLabel = getStatusLabel(report.status);
  const detections = report.raw_ai_response?.detections || report.detections || [];
  
  const lat = Number(report.location?.latitude ?? report.latitude ?? 20.2961);
  const lng = Number(report.location?.longitude ?? report.longitude ?? 85.8245);
  const mapCenter = [lat, lng];

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Top Navigation & Breadcrumbs */}
        <div className={styles.topBar}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
          <div className={styles.topActions}>
            <button className="btn btn-secondary btn-sm" onClick={handleCopyLink} title="Share incident link">
              <Share2 size={14} />
              <span>Share</span>
            </button>
            <div className={styles.docCode}>
              REGISTRY // #{report.id?.slice(0, 8)}
            </div>
          </div>
        </div>

        {/* Header Ribbon */}
        <header className={styles.header}>
          <div className={styles.headerMain}>
            <div className={styles.tagStrip}>
              <span className={`badge badge-${level}`}>
                ● {getSeverityLabel(level)} SEVERITY
              </span>
              <span className={styles.statusBadge} style={{ borderColor: statusColor, color: statusColor }}>
                ● {statusLabel}
              </span>
              <span className={styles.monoId}>ID: {report.id}</span>
            </div>
            <h1 className={styles.title}>
              {report.description || report.original_filename || 'Road Pavement Defect'}
            </h1>
            <div className={styles.headerMeta}>
              <span><MapPin size={14} /> {report.address || `${lat.toFixed(5)}, ${lng.toFixed(5)}`}</span>
              <span><Clock size={14} /> Logged {formatRelativeTime(report.created_at)}</span>
              <span><ThumbsUp size={14} /> {report.support_count || 0} Civic Endorsements</span>
            </div>
          </div>

          <div className={styles.headerSide}>
            <div className={styles.scoreHeroBox} style={{ borderColor: color }}>
              <span className={styles.scoreHeroLabel}>AI DAMAGE SCORE</span>
              <span className={styles.scoreHeroValue} style={{ color }}>
                {formatScore(report.damage_score, 2)}
              </span>
              <span className={styles.scoreHeroScale}>SCALE 0.0 - 10.0</span>
            </div>
          </div>
        </header>

        {/* Main Content Layout */}
        <div className={styles.contentGrid}>
          {/* Left Column: Visual AI Media & Detections */}
          <div className={styles.leftColumn}>
            {/* Visual Media Canvas Box */}
            <div className={styles.panelBox}>
              <div className={styles.panelHeader}>
                <div className={styles.panelTitle}>
                  <Cpu size={16} />
                  <span>NEURAL COMPUTER VISION INFERENCE</span>
                </div>
                <div className={styles.modelTag}>
                  {report.raw_ai_response?.model_version || 'YOLOv11n-RDD-v1'}
                </div>
              </div>

              <div className={styles.mediaContainer}>
                {report.media_type === 'video' || report.video_url ? (
                  <video
                    src={report.video_url || report.media_url || report.image_url}
                    controls
                    playsInline
                    className={styles.videoPlayer}
                  />
                ) : (
                  <BoundingBoxCanvas
                    imageUrl={report.image_url || report.media_url}
                    detections={detections}
                  />
                )}
              </div>

              <div className={styles.mediaFooter}>
                <div className={styles.mediaNote}>
                  <span>ℹ Bounding boxes highlight neural defects classified at camera capture.</span>
                </div>
                {report.media_type === 'video' && (
                  <span className={styles.mediaTypeBadge}>▶ High-FPS Video Telemetry</span>
                )}
              </div>
            </div>

            {/* AI Detections Breakdown */}
            <div className={styles.panelBox}>
              <div className={styles.panelHeader}>
                <div className={styles.panelTitle}>
                  <AlertTriangle size={16} />
                  <span>CLASSIFIED DEFECT BREAKDOWN ({detections.length})</span>
                </div>
              </div>

              {detections.length === 0 ? (
                <div className={styles.emptyDetections}>
                  No discrete bounding boxes classified by the model for this media.
                </div>
              ) : (
                <div className={styles.detectionsTable}>
                  <div className={styles.detHeaderRow}>
                    <span>DEFECT CLASS</span>
                    <span>CONFIDENCE METRIC</span>
                    <span>SEVERITY WEIGHT</span>
                  </div>
                  {detections.map((det, idx) => {
                    const conf = ((det.confidence || 0) * 100).toFixed(1);
                    return (
                      <div key={idx} className={styles.detRow}>
                        <div className={styles.detNameCol}>
                          <span className={styles.detDot} style={{ background: color }} />
                          <span className={styles.detName}>
                            {det.class?.replace(/_/g, ' ') || det.class_name || 'Road defect'}
                          </span>
                        </div>
                        <div className={styles.detConfCol}>
                          <div className={styles.confBarBg}>
                            <div 
                              className={styles.confBarFill} 
                              style={{ width: `${conf}%`, background: color }}
                            />
                          </div>
                          <span className={styles.confText}>{conf}%</span>
                        </div>
                        <div className={styles.detWeightCol}>
                          <span className={styles.weightTag}>{det.severity_weight || 'PRIMARY'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Geographic Location, Status, & Actions */}
          <div className={styles.rightColumn}>
            {/* Civic Action & Support Panel */}
            <div className={styles.panelBox}>
              <div className={styles.panelHeader}>
                <div className={styles.panelTitle}>
                  <Sparkles size={16} />
                  <span>CIVIC ACTION & PRIORITY ENDORSEMENT</span>
                </div>
              </div>

              <div className={styles.supportContent}>
                <p className={styles.supportDesc}>
                  Community endorsements increase this defect's priority queue position for municipal road maintenance squads.
                </p>

                <div className={styles.supportMetricsStrip}>
                  <div className={styles.supportMetricItem}>
                    <span className={styles.supportMetricLabel}>CURRENT SUPPORTERS</span>
                    <span className={styles.supportMetricValue}>{report.support_count || 0}</span>
                  </div>
                  <div className={styles.supportMetricItem}>
                    <span className={styles.supportMetricLabel}>POINTS AWARDED</span>
                    <span className={styles.supportMetricValue}>+10 PTS</span>
                  </div>
                </div>

                <button
                  className={`btn ${supported ? 'btn-secondary' : 'btn-primary'} btn-lg`}
                  onClick={handleSupport}
                  disabled={supporting || supported}
                  style={{ width: '100%' }}
                >
                  {supporting ? (
                    <>
                      <Loader size={18} className={styles.spin} />
                      <span>Transmitting Endorsement...</span>
                    </>
                  ) : supported ? (
                    <>
                      <CheckCircle2 size={18} />
                      <span>Endorsement Registered (+10 Pts)</span>
                    </>
                  ) : (
                    <>
                      <ThumbsUp size={18} />
                      <span>Support This Report</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Geographic Map Pin Panel */}
            <div className={styles.panelBox}>
              <div className={styles.panelHeader}>
                <div className={styles.panelTitle}>
                  <Navigation size={16} />
                  <span>GEOGRAPHIC DEFECT LOCATION</span>
                </div>
              </div>

              <div className={styles.mapWrap}>
                <MapContainer
                  center={mapCenter}
                  zoom={15}
                  className={styles.miniMap}
                  zoomControl={false}
                  attributionControl={false}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap'
                  />
                  <CircleMarker
                    center={mapCenter}
                    radius={14}
                    pathOptions={{
                      fillColor: color,
                      fillOpacity: 0.9,
                      color: '#111110',
                      weight: 3,
                    }}
                  />
                  <RecenterMap center={mapCenter} />
                </MapContainer>
              </div>

              <div className={styles.geoReadout}>
                <div className={styles.geoItem}>
                  <span className={styles.geoLabel}>LATITUDE</span>
                  <span className={styles.geoVal}>{lat.toFixed(6)}</span>
                </div>
                <div className={styles.geoItem}>
                  <span className={styles.geoLabel}>LONGITUDE</span>
                  <span className={styles.geoVal}>{lng.toFixed(6)}</span>
                </div>
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.extMapLink}
                >
                  <span>Google Maps</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>

            {/* Infrastructure Dispatch Details */}
            <div className={styles.panelBox}>
              <div className={styles.panelHeader}>
                <div className={styles.panelTitle}>
                  <FileText size={16} />
                  <span>DISPATCH TELEMETRY</span>
                </div>
              </div>

              <div className={styles.specsList}>
                <div className={styles.specRow}>
                  <span className={styles.specLabel}>REPAIR LIFECYCLE</span>
                  <span className={styles.specVal} style={{ color: statusColor, fontWeight: 700 }}>
                    ● {statusLabel}
                  </span>
                </div>
                <div className={styles.specRow}>
                  <span className={styles.specLabel}>MUNICIPAL JURISDICTION</span>
                  <span className={styles.specVal}>{report.zone || 'Zone 01 — Urban Central'}</span>
                </div>
                <div className={styles.specRow}>
                  <span className={styles.specLabel}>FILE REFERENCE</span>
                  <span className={styles.specValMono}>{report.original_filename || report.s3_object_key || 'media_capture'}</span>
                </div>
                <div className={styles.specRow}>
                  <span className={styles.specLabel}>TIME RECORDED</span>
                  <span className={styles.specVal}>
                    {report.created_at ? new Date(report.created_at).toLocaleString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
