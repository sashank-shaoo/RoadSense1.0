import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveReport } from '../../store/slices/reportSlice.js';
import { openModal } from '../../store/slices/uiSlice.js';
import { getSeverityLevel, getSeverityColor, getStatusLabel, formatRelativeTime, formatScore } from '../../utils/helpers.js';
import { MapPin, AlertTriangle, ThumbsUp, Clock } from 'lucide-react';
import styles from './DamageMap.module.css';
import 'leaflet/dist/leaflet.css';

// Fix default markers in React-Leaflet
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: null,
  iconUrl: null,
  shadowUrl: null,
});

const BHUBANESWAR_CENTER = [20.2961, 85.8245];

function SetViewOnReports({ reports }) {
  const map = useMap();
  useEffect(() => {
    if (reports && reports.length > 0) {
      const bounds = reports
        .map((r) => [Number(r.location?.latitude ?? r.latitude), Number(r.location?.longitude ?? r.longitude)])
        .filter(([lat, lng]) => !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0);
      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      }
    }
  }, [reports, map]);
  return null;
}

export default function DamageMap({ reports = [], height = '100%', showPopup = true }) {
  const dispatch = useDispatch();

  const handleMarkerClick = (report) => {
    if (showPopup) {
      dispatch(setActiveReport(report));
      dispatch(openModal('reportDetail'));
    }
  };

  return (
    <div className={styles.mapWrapper} style={{ height }}>
      <MapContainer
        center={BHUBANESWAR_CENTER}
        zoom={12}
        className={styles.map}
        zoomControl={true}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {reports.map((report) => {
          const level = getSeverityLevel(report);
          const color = getSeverityColor(level);
          const lat = Number(report.location?.latitude ?? report.latitude);
          const lng = Number(report.location?.longitude ?? report.longitude);

          if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) return null;

          return (
            <CircleMarker
              key={report.id}
              center={[lat, lng]}
              radius={level === 'critical' ? 14 : level === 'high' ? 11 : 9}
              pathOptions={{
                fillColor: color,
                fillOpacity: 0.85,
                color: color,
                weight: 2,
                opacity: 1,
              }}
              eventHandlers={{
                click: () => handleMarkerClick(report),
              }}
            >
              <Popup className={styles.popup}>
                <div className={styles.popupContent}>
                  <div className={styles.popupHeader}>
                    <span className={styles.popupSeverity} style={{ color }}>
                      ● {level.toUpperCase()}
                    </span>
                    <span className={styles.popupScore}>
                      Score: {formatScore(report.damage_score, 1)}
                    </span>
                  </div>
                  <p className={styles.popupDesc}>{report.description || report.original_filename}</p>
                  <div className={styles.popupMeta}>
                    <span><AlertTriangle size={11} /> {report.detection_count || 0} detections</span>
                    <span><ThumbsUp size={11} /> {report.support_count || 0}</span>
                    <span><Clock size={11} /> {formatRelativeTime(report.created_at)}</span>
                  </div>
                  <div className={styles.popupStatus} style={{ color: getStatusLabel(report.status) === 'Completed' ? '#10b981' : '#94a3b8' }}>
                    {getStatusLabel(report.status)}
                  </div>
                  {showPopup && (
                    <button
                      className={styles.popupBtn}
                      onClick={() => handleMarkerClick(report)}
                    >
                      View Details →
                    </button>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {reports.length > 1 && <SetViewOnReports reports={reports} />}
      </MapContainer>
    </div>
  );
}
