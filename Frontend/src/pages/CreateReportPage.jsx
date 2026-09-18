import { useState, useRef, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { addToast, openModal } from '../store/slices/uiSlice.js';
import { addReport, setSubmitting } from '../store/slices/reportSlice.js';
import { addCreditPoints, updateCreditPoints } from '../store/slices/authSlice.js';
import { reportApi } from '../api/reportApi.js';
import { 
  Upload, 
  MapPin, 
  Loader, 
  Image as ImageIcon, 
  Video, 
  CheckCircle2, 
  Cpu, 
  Lock, 
  ArrowLeft,
  Navigation,
  Crosshair,
  Check,
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';
import styles from './CreateReportPage.module.css';

// Fix leaflet marker icon paths
delete L.Icon.Default.prototype._getIconUrl;
const pinIcon = new L.DivIcon({
  className: 'custom-pin-icon',
  html: `<div style="
    background: #E8C547;
    width: 32px;
    height: 32px;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    border: 3px solid #111110;
    box-shadow: 3px 3px 0px #111110;
    display: flex;
    align-items: center;
    justify-content: center;
  ">
    <div style="width: 10px; height: 10px; background: #111110; border-radius: 50%;"></div>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const DEFAULT_CENTER = [20.2961, 85.8245]; // Bhubaneswar

// Map helper to handle dragging/clicking pin
function LocationPicker({ position, onPositionChange, isConfirmed }) {
  const map = useMap();

  useMapEvents({
    click(e) {
      if (!isConfirmed) {
        onPositionChange([e.latlng.lat, e.latlng.lng]);
      }
    },
  });

  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom() < 15 ? 16 : map.getZoom(), { duration: 0.8 });
    }
  }, [position, map]);

  const markerEventHandlers = useMemo(
    () => ({
      dragend(e) {
        const marker = e.target;
        if (marker != null) {
          const latLng = marker.getLatLng();
          onPositionChange([latLng.lat, latLng.lng]);
        }
      },
    }),
    [onPositionChange]
  );

  return position ? (
    <Marker
      position={position}
      draggable={!isConfirmed}
      eventHandlers={markerEventHandlers}
      icon={pinIcon}
    />
  ) : null;
}

export default function CreateReportPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isSubmitting } = useSelector((s) => s.reports);
  const { isAuthenticated } = useSelector((s) => s.auth);

  // Form State
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isVideo, setIsVideo] = useState(false);
  const [description, setDescription] = useState('');
  
  // Coordinate & Map Adjustment State
  const [position, setPosition] = useState(DEFAULT_CENTER);
  const [isCoordsConfirmed, setIsCoordsConfirmed] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [addressPreview, setAddressPreview] = useState('Bhubaneswar Urban Region');
  
  // Submission Lifecycle
  const [phase, setPhase] = useState(null); // 'uploading' | 'analyzing' | 'done'
  const fileRef = useRef(null);

  // Try auto-detecting user's actual location once on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition([pos.coords.latitude, pos.coords.longitude]);
        },
        () => {
          // fallback to default
        },
        { timeout: 4000 }
      );
    }
  }, []);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setIsVideo(f.type.startsWith('video/'));
    setPreview(URL.createObjectURL(f));
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

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      dispatch(addToast({ type: 'warning', message: 'Geolocation is not supported by your browser' }));
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
        setIsCoordsConfirmed(false);
        setGeoLoading(false);
        dispatch(addToast({ type: 'success', message: 'GPS coordinates detected! You can drag the pin to fine-tune.' }));
      },
      () => {
        setGeoLoading(false);
        dispatch(addToast({ type: 'info', message: 'Could not access GPS. Please place the pin manually on the map.' }));
      },
      { timeout: 8000 }
    );
  };

  const handleConfirmCoords = () => {
    setIsCoordsConfirmed(true);
    dispatch(addToast({ 
      type: 'success', 
      message: `✓ Location locked: ${position[0].toFixed(5)}, ${position[1].toFixed(5)}` 
    }));
  };

  const handleUnlockCoords = () => {
    setIsCoordsConfirmed(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      dispatch(addToast({ type: 'warning', message: 'Please sign in to submit a report' }));
      dispatch(openModal('login'));
      return;
    }
    if (!file) {
      dispatch(addToast({ type: 'warning', message: 'Please upload an image or video of the road damage' }));
      return;
    }
    if (!isCoordsConfirmed) {
      dispatch(addToast({ type: 'warning', message: 'Please click "Confirm & Lock Location" on the map before submitting' }));
      return;
    }

    dispatch(setSubmitting(true));
    setPhase('uploading');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('latitude', position[0].toString());
      formData.append('longitude', position[1].toString());
      if (description) formData.append('description', description);

      setPhase('analyzing');
      const res = await reportApi.createReport(formData);

      if (res.duplicate) {
        dispatch(addToast({ 
          type: 'warning', 
          message: 'A report already exists within 20m. Redirecting to explore...', 
          duration: 6000 
        }));
        navigate('/explore');
      } else {
        setPhase('done');
        const reportData = res.report || {};
        const normalized = {
          ...reportData,
          location: {
            latitude: Number(reportData.latitude ?? position[0]),
            longitude: Number(reportData.longitude ?? position[1]),
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

        dispatch(addToast({ 
          type: 'success', 
          message: '🎉 Incident logged successfully! +50 credit points awarded.', 
          duration: 6000 
        }));

        setTimeout(() => {
          navigate('/reports');
        }, 1500);
      }
    } catch (err) {
      dispatch(addToast({ type: 'error', message: err.message || 'Failed to submit report' }));
      setPhase(null);
    } finally {
      dispatch(setSubmitting(false));
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Navigation Breadcrumb / Back button */}
        <div className={styles.topBar}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
          <div className={styles.docRef}>FORM RS-REF // NEW ROAD INCIDENT DISPATCH</div>
        </div>

        {/* Page Title */}
        <header className={styles.header}>
          <div className={styles.headerBadge}>
            <Sparkles size={13} />
            <span>CITIZEN ROAD MONITORING INITIATIVE</span>
          </div>
          <h1 className={styles.title}>Submit Road Damage Report</h1>
          <p className={styles.subtitle}>
            Upload a high-resolution photo or video and fine-tune the geographic pin on the map preview. YOLOv11 will analyze pavement cracks, potholes, and generate instant severity telemetry.
          </p>
        </header>

        {!isAuthenticated ? (
          <div className={styles.authLockCard}>
            <div className={styles.lockIconBox}>
              <Lock size={32} />
            </div>
            <h2>Authentication Required</h2>
            <p>
              You must sign in to dispatch an incident report into the civic queue and collect credit tokens.
            </p>
            <div className={styles.authBtnGroup}>
              <button className="btn btn-primary" onClick={() => dispatch(openModal('login'))}>
                Sign In
              </button>
              <button className="btn btn-secondary" onClick={() => dispatch(openModal('register'))}>
                Create Citizen Account
              </button>
            </div>
          </div>
        ) : phase === 'done' ? (
          <div className={styles.successCard}>
            <CheckCircle2 size={56} className={styles.successIcon} />
            <h2>Report Successfully Dispatched</h2>
            <p>Your road incident report has been registered into the municipal maintenance database. +50 credit tokens have been awarded to your account.</p>
            <div className={styles.successActions}>
              <button className="btn btn-primary" onClick={() => navigate('/reports')}>
                View In Incident Registry
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('/explore')}>
                Inspect On Live Map
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.formGrid}>
            {/* Left Column: Media Upload & Details */}
            <div className={styles.leftCol}>
              <div className={styles.cardBox}>
                <div className={styles.cardBoxHeader}>
                  <span className={styles.stepTag}>01</span>
                  <h3>MEDIA EVIDENCE</h3>
                </div>

                {/* Media Drop Zone */}
                <div
                  className={`${styles.dropZone} ${preview ? styles.hasPreview : ''}`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileRef.current?.click()}
                >
                  {preview ? (
                    isVideo ? (
                      <video src={preview} controls className={styles.previewVideo} />
                    ) : (
                      <div className={styles.previewWrapper}>
                        <img src={preview} alt="Damage Evidence" className={styles.previewImg} />
                        <div className={styles.previewOverlay}>
                          <span>Click or drag to change media</span>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className={styles.dropPlaceholder}>
                      <div className={styles.iconPair}>
                        <ImageIcon size={30} />
                        <Video size={30} />
                      </div>
                      <p className={styles.dropText}>
                        Drag & drop evidence file or <strong>browse local disk</strong>
                      </p>
                      <span className={styles.dropSubtext}>
                        High quality JPEG, PNG, MP4, WebM (Max 100MB)
                      </span>
                    </div>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    hidden
                  />
                </div>

                {/* Optional Description */}
                <div className={styles.fieldBlock}>
                  <label className={styles.label}>
                    DESCRIPTION & HAZARD OBSERVATION (OPTIONAL)
                  </label>
                  <textarea
                    className={styles.textarea}
                    rows={4}
                    placeholder="E.g., Deep pothole on left traffic lane after rainfall, approx 15cm depth near bus terminal..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>

              {/* Submit Card & Telemetry */}
              <div className={styles.submitBlock}>
                {phase && (
                  <div className={styles.phaseNotice}>
                    {phase === 'uploading' && (
                      <>
                        <Loader size={16} className={styles.spin} />
                        <span>Encrypting & streaming media payload...</span>
                      </>
                    )}
                    {phase === 'analyzing' && (
                      <>
                        <Cpu size={16} />
                        <span>YOLOv11 neural inference scoring damage severity...</span>
                      </>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={isSubmitting || !file || !isCoordsConfirmed}
                  style={{ width: '100%' }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader size={18} className={styles.spin} />
                      <span>{phase === 'analyzing' ? 'Running AI Telemetry...' : 'Uploading Report...'}</span>
                    </>
                  ) : (
                    <>
                      <Upload size={18} />
                      <span>Submit Damage Report (+50 Pts)</span>
                    </>
                  )}
                </button>

                {!isCoordsConfirmed && file && (
                  <div className={styles.confirmWarning}>
                    <Info size={14} />
                    <span>Please adjust the pin on the map preview and click <strong>"Confirm & Lock Location"</strong> before submitting.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Interactive Map Preview to Adjust Coordinates */}
            <div className={styles.rightCol}>
              <div className={styles.cardBox}>
                <div className={styles.cardBoxHeader}>
                  <span className={styles.stepTag}>02</span>
                  <div className={styles.stepTitleGroup}>
                    <h3>GEOGRAPHIC POSITION PREVIEW</h3>
                    <p>Click or drag the yellow pin on the map to pinpoint the exact defect location.</p>
                  </div>
                </div>

                {/* Map Action Toolbar */}
                <div className={styles.mapToolbar}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleDetectGPS}
                    disabled={geoLoading || isCoordsConfirmed}
                  >
                    {geoLoading ? <Loader size={14} className={styles.spin} /> : <Navigation size={14} />}
                    <span>{geoLoading ? 'Detecting GPS...' : 'Auto-Detect GPS'}</span>
                  </button>

                  {!isCoordsConfirmed ? (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={handleConfirmCoords}
                    >
                      <Check size={14} />
                      <span>Confirm & Lock Location</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={handleUnlockCoords}
                    >
                      <RotateCcw size={14} />
                      <span>Unlock to Re-adjust</span>
                    </button>
                  )}
                </div>

                {/* Interactive Leaflet Map for Adjusting Pin */}
                <div className={styles.mapContainerWrapper}>
                  <MapContainer
                    center={position}
                    zoom={15}
                    className={styles.leafletMap}
                    zoomControl={true}
                    attributionControl={false}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <LocationPicker
                      position={position}
                      onPositionChange={setPosition}
                      isConfirmed={isCoordsConfirmed}
                    />
                  </MapContainer>

                  {isCoordsConfirmed && (
                    <div className={styles.lockedBadge}>
                      <Check size={14} />
                      <span>COORDINATES LOCKED</span>
                    </div>
                  )}
                </div>

                {/* Coordinate Readout Strip */}
                <div className={styles.coordStrip}>
                  <div className={styles.coordItem}>
                    <span className={styles.coordLabel}>LATITUDE</span>
                    <span className={styles.coordValue}>{position[0].toFixed(6)}</span>
                  </div>
                  <div className={styles.coordItem}>
                    <span className={styles.coordLabel}>LONGITUDE</span>
                    <span className={styles.coordValue}>{position[1].toFixed(6)}</span>
                  </div>
                  <div className={styles.coordStatus}>
                    <span className={isCoordsConfirmed ? styles.statusConfirmed : styles.statusPending}>
                      ● {isCoordsConfirmed ? 'LOCKED FOR DISPATCH' : 'DRAG PIN TO ADJUST'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
