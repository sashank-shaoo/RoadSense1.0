import { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeModal, openModal, addToast } from '../../store/slices/uiSlice.js';
import { addReport, setSubmitting } from '../../store/slices/reportSlice.js';
import { addCreditPoints, updateCreditPoints } from '../../store/slices/authSlice.js';
import { reportApi } from '../../api/reportApi.js';
import { X, Upload, MapPin, Loader, Image, Video, CheckCircle2, Cpu, Lock } from 'lucide-react';
import styles from './CreateReportModal.module.css';

export default function CreateReportModal() {
  const dispatch = useDispatch();
  const { isSubmitting } = useSelector((s) => s.reports);
  const { isAuthenticated } = useSelector((s) => s.auth);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isVideo, setIsVideo] = useState(false);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState({ latitude: '', longitude: '' });
  const [geoLoading, setGeoLoading] = useState(false);
  const [phase, setPhase] = useState(null); // 'uploading' | 'analyzing' | 'done'
  const fileRef = useRef(null);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setIsVideo(f.type.startsWith('video/'));
    const url = URL.createObjectURL(f);
    setPreview(url);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f && (f.type.startsWith('image/') || f.type.startsWith('video/'))) {
      setFile(f);
      setIsVideo(f.type.startsWith('video/'));
      setPreview(URL.createObjectURL(f));
    }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ latitude: pos.coords.latitude.toFixed(6), longitude: pos.coords.longitude.toFixed(6) });
        setGeoLoading(false);
      },
      () => {
        // Fallback demo coords (Bhubaneswar)
        setLocation({ latitude: '20.2961', longitude: '85.8245' });
        setGeoLoading(false);
        dispatch(addToast({ type: 'info', message: 'Location unavailable, using default coords' }));
      },
      { timeout: 5000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      dispatch(addToast({ type: 'warning', message: 'Please sign in to submit a report' }));
      dispatch(openModal('login'));
      return;
    }
    if (!file) {
      dispatch(addToast({ type: 'warning', message: 'Please select an image or video file' }));
      return;
    }
    if (!location.latitude || !location.longitude) {
      dispatch(addToast({ type: 'warning', message: 'Please provide GPS location' }));
      return;
    }

    dispatch(setSubmitting(true));
    setPhase('uploading');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('latitude', location.latitude);
      formData.append('longitude', location.longitude);
      if (description) formData.append('description', description);

      setPhase('analyzing');
      const res = await reportApi.createReport(formData);

      if (res.duplicate) {
        dispatch(addToast({ type: 'warning', message: 'A report already exists within 20m. Tap Support to upvote it!', duration: 6000 }));
        dispatch(closeModal());
      } else {
        setPhase('done');
        const reportData = res.report || {};
        const normalized = {
          ...reportData,
          location: {
            latitude: Number(reportData.latitude ?? location.latitude),
            longitude: Number(reportData.longitude ?? location.longitude),
          },
          image_url: reportData.media_url || reportData.image_url,
          video_url: reportData.media_type === 'video' ? (reportData.media_url || reportData.video_url) : null,
        };

        dispatch(addReport(normalized));
        if (reportData.credit_points) {
          dispatch(updateCreditPoints(reportData.credit_points));
        } else {
          dispatch(addCreditPoints(50));
        }
        dispatch(addToast({ type: 'success', message: '🎉 Report submitted! +50 credit points earned!', duration: 6000 }));
        setTimeout(() => dispatch(closeModal()), 1200);
      }
    } catch (err) {
      dispatch(addToast({ type: 'error', message: err.message || 'Failed to submit report' }));
      setPhase(null);
    } finally {
      dispatch(setSubmitting(false));
    }
  };

  return (
    <div className="modal-overlay" onClick={() => dispatch(closeModal())}>
      <div className="modal-content" style={{ maxWidth: 580 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ fontSize: '1.2rem' }}>Report Road Damage</h2>
          <button className="btn btn-ghost btn-sm" onClick={() => dispatch(closeModal())}><X size={18} /></button>
        </div>
        <div className="modal-body">
          {!isAuthenticated ? (
            <div style={{ textAlign: 'center', padding: '24px 12px' }}>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.12)',
                color: '#ef4444',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}>
                <Lock size={26} />
              </div>
              <h3 style={{ marginBottom: 8, fontSize: '1.2rem' }}>Sign In Required</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: '0.925rem', maxWidth: 360, margin: '0 auto 24px' }}>
                Please sign in to your RoadSense account before reporting road damage. Every verified report earns you 50 credit points!
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button className="btn btn-primary" onClick={() => dispatch(openModal('login'))}>
                  Sign In
                </button>
                <button className="btn btn-secondary" onClick={() => dispatch(openModal('register'))}>
                  Create Account
                </button>
              </div>
            </div>
          ) : phase === 'done' ? (
            <div className={styles.successView}>
              <CheckCircle2 size={48} className={styles.successIcon} />
              <h3>Report Submitted!</h3>
              <p>+50 credit points added to your account</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Media Drop Zone */}
              <div
                className={`${styles.dropZone} ${preview ? styles.hasPreview : ''}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
              >
                {preview ? (
                  isVideo ? (
                    <video src={preview} controls style={{ maxHeight: 220, maxWidth: '100%', borderRadius: 8 }} />
                  ) : (
                    <img src={preview} alt="Preview" className={styles.preview} />
                  )
                ) : (
                  <div className={styles.dropPlaceholder}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                      <Image size={28} />
                      <Video size={28} />
                    </div>
                    <p>Drag & drop or <strong>click</strong> to upload image or video</p>
                    <span>JPEG, PNG, WebP, MP4, WebM — max 100 MB</span>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/*,video/*" onChange={handleFileChange} hidden />
              </div>

              {/* Location */}
              <div className={styles.locationRow}>
                <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="input-label">Latitude</label>
                  <input className="input-field" type="number" step="any" placeholder="20.2961"
                    value={location.latitude} onChange={(e) => setLocation((l) => ({ ...l, latitude: e.target.value }))} required />
                </div>
                <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="input-label">Longitude</label>
                  <input className="input-field" type="number" step="any" placeholder="85.8245"
                    value={location.longitude} onChange={(e) => setLocation((l) => ({ ...l, longitude: e.target.value }))} required />
                </div>
                <button type="button" className={styles.geoBtn} onClick={detectLocation} disabled={geoLoading}>
                  {geoLoading ? <Loader size={16} className={styles.spin} /> : <MapPin size={16} />}
                  {geoLoading ? 'Detecting…' : 'Auto-detect'}
                </button>
              </div>

              {/* Description */}
              <div className="input-group" style={{ marginTop: 14 }}>
                <label className="input-label">Description (optional)</label>
                <textarea className="input-field" rows={3} placeholder="Describe the road damage (severity, hazard level, nearby landmarks…)"
                  value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>

              {/* Processing phase indicator */}
              {phase && (
                <div className={styles.phaseIndicator}>
                  {phase === 'uploading' && <><Loader size={14} className={styles.spin} /> Uploading to AWS S3…</>}
                  {phase === 'analyzing' && <><Cpu size={14} /> AI Model analyzing damage on EC2…</>}
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 16 }} disabled={isSubmitting}>
                {isSubmitting ? (
                  <><Loader size={16} className={styles.spin} /> {phase === 'analyzing' ? 'AI Processing…' : 'Uploading…'}</>
                ) : (
                  <><Upload size={16} /> Submit Report</>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
