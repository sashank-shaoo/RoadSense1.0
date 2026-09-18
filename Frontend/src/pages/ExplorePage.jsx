import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setReports, setActiveReport } from '../store/slices/reportSlice.js';
import { openModal } from '../store/slices/uiSlice.js';
import { reportApi } from '../api/reportApi.js';
import DamageMap from '../components/map/DamageMap.jsx';
import { getSeverityLevel, getSeverityColor, getSeverityLabel, getStatusLabel, formatRelativeTime, formatScore } from '../utils/helpers.js';
import { Filter, Search, MapPin, ThumbsUp, AlertCircle, RefreshCw } from 'lucide-react';
import styles from './ExplorePage.module.css';

export default function ExplorePage() {
  const dispatch = useDispatch();
  const { reports } = useSelector((s) => s.reports);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const res = await reportApi.getAllReports();
      if (res.reports) dispatch(setReports(res.reports));
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchesSearch = searchQuery === '' || 
        r.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.id?.toLowerCase().includes(searchQuery.toLowerCase());

      const level = getSeverityLevel(r);
      const matchesSeverity = selectedSeverity === 'all' || level === selectedSeverity;
      const matchesStatus = selectedStatus === 'all' || r.status === selectedStatus;

      return matchesSearch && matchesSeverity && matchesStatus;
    });
  }, [reports, searchQuery, selectedSeverity, selectedStatus]);

  const handleSelectReport = (report) => {
    dispatch(setActiveReport(report));
    dispatch(openModal('reportDetail'));
  };

  return (
    <div className={styles.exploreLayout}>
      {/* Sidebar Controls & List */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.titleRow}>
            <h2>Road Damage Explorer</h2>
            <button className="btn btn-ghost btn-sm" onClick={fetchReports} disabled={isLoading} title="Refresh data">
              <RefreshCw size={14} className={isLoading ? styles.spinning : ''} />
            </button>
          </div>
          <p className={styles.subtitle}>Browse real-time road defects analyzed by AI</p>

          {/* Search */}
          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search by street, note, or ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          {/* Filters */}
          <div className={styles.filtersRow}>
            <div className={styles.filterGroup}>
              <label>Severity</label>
              <select 
                value={selectedSeverity} 
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className={styles.select}
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical (8.0+)</option>
                <option value="high">High (5.0 - 7.9)</option>
                <option value="medium">Medium (2.5 - 4.9)</option>
                <option value="low">Low (&lt; 2.5)</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Status</label>
              <select 
                value={selectedStatus} 
                onChange={(e) => setSelectedStatus(e.target.value)}
                className={styles.select}
              >
                <option value="all">All Statuses</option>
                <option value="notStarted">Reported</option>
                <option value="onGoing">In Progress</option>
                <option value="completed">Resolved</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className={styles.resultsCount}>
          <span>{filteredReports.length} {filteredReports.length === 1 ? 'incident' : 'incidents'} found</span>
        </div>

        {/* Reports List */}
        <div className={styles.list}>
          {filteredReports.length === 0 ? (
            <div className={styles.emptyState}>
              <AlertCircle size={32} />
              <p>No damage reports match the selected filters.</p>
            </div>
          ) : (
            filteredReports.map((report) => {
              const level = getSeverityLevel(report);
              const color = getSeverityColor(level);
              return (
                <div 
                  key={report.id} 
                  className={`card card-hover ${styles.itemCard}`}
                  onClick={() => handleSelectReport(report)}
                >
                  <div className={styles.cardHeader}>
                    <span className={`badge badge-${level}`}>{getSeverityLabel(level)}</span>
                    <span className={styles.scoreVal} style={{ color }}>
                      Score: {formatScore(report.damage_score, 1)}
                    </span>
                  </div>

                  {/* Media Thumbnail */}
                  {(report.image_url || report.media_url || report.video_url) && (
                    <div className={styles.itemThumb}>
                      {report.media_type === 'video' || report.video_url ? (
                        <video
                          src={report.video_url || report.media_url}
                          muted
                          preload="metadata"
                        />
                      ) : (
                        <img
                          src={report.image_url || report.media_url}
                          alt={report.description || 'Road damage'}
                        />
                      )}
                      {report.media_type === 'video' && (
                        <span className={styles.videoTag}>▶ Video</span>
                      )}
                    </div>
                  )}

                  <h4 className={styles.itemTitle}>{report.description || 'Road surface damage detected'}</h4>
                  
                  <div className={styles.itemLocation}>
                    <MapPin size={12} />
                    <span>
                      {report.address || `${report.location?.latitude?.toFixed(4)}, ${report.location?.longitude?.toFixed(4)}`}
                    </span>
                  </div>

                  <div className={styles.cardFooter}>
                    <span className={styles.statusPill}>{getStatusLabel(report.status)}</span>
                    <div className={styles.footerRight}>
                      <span className={styles.supportCount}>
                        <ThumbsUp size={12} /> {report.support_count || 0}
                      </span>
                      <span className={styles.timeAgo}>
                        {formatRelativeTime(report.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* Map Main Canvas */}
      <main className={styles.mapContainer}>
        <DamageMap reports={filteredReports} height="100%" showPopup={true} />
      </main>
    </div>
  );
}
