import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import { setActiveReport } from '../../store/slices/reportSlice.js';
import { openModal } from '../../store/slices/uiSlice.js';
import { getSeverityLevel, getSeverityColor, getSeverityLabel, getStatusLabel, getStatusColor } from '../../utils/helpers.js';
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

export default function DamageMap({ reports = [], height = '100%', showPopup = false, interactive = true }) {
  const dispatch = useDispatch();

  const handleMarkerClick = (report) => {
    if (interactive) {
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
        zoomControl={interactive}
        dragging={interactive}
        scrollWheelZoom={interactive}
        doubleClickZoom={interactive}
        touchZoom={interactive}
        boxZoom={interactive}
        keyboard={interactive}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {reports.map((report) => {
          const level = getSeverityLevel(report);
          const color = getSeverityColor(level);
          const lat = Number(report.location?.latitude ?? report.latitude);
          const lng = Number(report.location?.longitude ?? report.longitude);

          if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) return null;

          const reportIdShort = report.id ? (report.id.length > 10 ? `#${report.id.slice(0, 8)}` : `#${report.id}`) : '#N/A';
          const statusLabel = getStatusLabel(report.status);
          const statusColor = getStatusColor(report.status);

          return (
            <CircleMarker
              key={report.id}
              center={[lat, lng]}
              radius={level === 'critical' ? 12 : level === 'high' ? 10 : 8}
              pathOptions={{
                fillColor: color,
                fillOpacity: 0.9,
                color: '#111110',
                weight: 2,
                opacity: 1,
              }}
              eventHandlers={{
                click: () => handleMarkerClick(report),
              }}
            >
              <Tooltip direction="top" offset={[0, -8]} opacity={1} className={styles.hoverTooltip}>
                <div className={styles.tooltipCard}>
                  <div className={styles.tooltipHeader}>
                    <span className={styles.tooltipId}>{reportIdShort}</span>
                    <span className={styles.tooltipSeverity} style={{ borderColor: color, color }}>
                      {getSeverityLabel(level)}
                    </span>
                  </div>
                  <div className={styles.tooltipRow}>
                    <span className={styles.tooltipLabel}>STATUS</span>
                    <span className={styles.tooltipStatus} style={{ color: statusColor }}>
                      ● {statusLabel}
                    </span>
                  </div>
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}

        {reports.length > 1 && <SetViewOnReports reports={reports} />}
      </MapContainer>
    </div>
  );
}
