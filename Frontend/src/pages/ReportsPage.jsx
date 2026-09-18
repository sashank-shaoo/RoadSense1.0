import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { setReports, setActiveReport } from '../store/slices/reportSlice.js';
import { openModal } from '../store/slices/uiSlice.js';
import { reportApi } from '../api/reportApi.js';
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
  Search, 
  RefreshCw, 
  Filter, 
  MapPin, 
  ThumbsUp, 
  AlertTriangle, 
  Clock, 
  ArrowUpDown, 
  FileText, 
  ExternalLink,
  SlidersHorizontal,
  Plus
} from 'lucide-react';
import styles from './ReportsPage.module.css';

export default function ReportsPage() {
  const dispatch = useDispatch();
  const { reports } = useSelector((s) => s.reports);
  const { isAuthenticated } = useSelector((s) => s.auth);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, score_high, score_low, supports
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
    let list = reports.filter((r) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || 
        r.description?.toLowerCase().includes(q) ||
        r.address?.toLowerCase().includes(q) ||
        r.id?.toLowerCase().includes(q) ||
        r.highest_severity?.toLowerCase().includes(q);

      const level = getSeverityLevel(r);
      const matchesSeverity = selectedSeverity === 'all' || level === selectedSeverity;
      const matchesStatus = selectedStatus === 'all' || r.status === selectedStatus;

      return matchesSearch && matchesSeverity && matchesStatus;
    });

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      }
      if (sortBy === 'oldest') {
        return new Date(a.created_at || 0) - new Date(b.created_at || 0);
      }
      if (sortBy === 'score_high') {
        return (Number(b.damage_score) || 0) - (Number(a.damage_score) || 0);
      }
      if (sortBy === 'score_low') {
        return (Number(a.damage_score) || 0) - (Number(b.damage_score) || 0);
      }
      if (sortBy === 'supports') {
        return (Number(b.support_count) || 0) - (Number(a.support_count) || 0);
      }
      return 0;
    });

    return list;
  }, [reports, searchQuery, selectedSeverity, selectedStatus, sortBy]);

  const handleOpenDetail = (report) => {
    dispatch(setActiveReport(report));
    dispatch(openModal('reportDetail'));
  };

  // Quick stats computed from current filtered items
  const statsSummary = useMemo(() => {
    const total = filteredReports.length;
    const critical = filteredReports.filter(r => getSeverityLevel(r) === 'critical').length;
    const inProgress = filteredReports.filter(r => r.status === 'onGoing').length;
    const resolved = filteredReports.filter(r => r.status === 'completed').length;
    return { total, critical, inProgress, resolved };
  }, [filteredReports]);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Page Top Header */}
        <header className={styles.header}>
          <div className={styles.headerText}>
            <div className={styles.badgeLabel}>
              <FileText size={13} />
              <span>INCIDENT REGISTRY & INTELLIGENCE ARCHIVE</span>
            </div>
            <h1 className={styles.title}>Road Damage Reports</h1>
            <p className={styles.subtitle}>
              Verified public infrastructure incidents classified with AI damage scores and repair lifecycle states.
            </p>
          </div>

          <div className={styles.headerActions}>
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={fetchReports} 
              disabled={isLoading}
            >
              <RefreshCw size={14} className={isLoading ? styles.spinning : ''} />
              <span>Refresh</span>
            </button>
            {isAuthenticated && (
              <Link 
                to="/report"
                className="btn btn-primary btn-sm" 
              >
                <Plus size={15} />
                <span>Submit Incident</span>
              </Link>
            )}
          </div>
        </header>

        {/* Metric Ribbon (Swiss Typographic Overview) */}
        <div className={styles.metricRibbon}>
          <div className={styles.metricItem}>
            <span className={styles.metricLabel}>TOTAL INCIDENTS</span>
            <span className={styles.metricValue}>{statsSummary.total}</span>
          </div>
          <div className={styles.metricItem}>
            <span className={styles.metricLabel}>CRITICAL SEVERITY</span>
            <span className={`${styles.metricValue} ${styles.valCritical}`}>{statsSummary.critical}</span>
          </div>
          <div className={styles.metricItem}>
            <span className={styles.metricLabel}>IN PROGRESS</span>
            <span className={`${styles.metricValue} ${styles.valWarning}`}>{statsSummary.inProgress}</span>
          </div>
          <div className={styles.metricItem}>
            <span className={styles.metricLabel}>RESOLVED</span>
            <span className={`${styles.metricValue} ${styles.valSuccess}`}>{statsSummary.resolved}</span>
          </div>
        </div>

        {/* Classification & Control Bar */}
        <div className={styles.controlBar}>
          {/* Search Box */}
          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search by ID, street name, description..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          {/* Filters Row */}
          <div className={styles.filtersWrapper}>
            <div className={styles.filterBlock}>
              <label>SEVERITY</label>
              <select 
                value={selectedSeverity} 
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className={styles.select}
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical (8.0+)</option>
                <option value="high">High (5.5 - 7.9)</option>
                <option value="medium">Medium (3.0 - 5.4)</option>
                <option value="low">Low (&lt; 3.0)</option>
              </select>
            </div>

            <div className={styles.filterBlock}>
              <label>STATUS</label>
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

            <div className={styles.filterBlock}>
              <label>SORT BY</label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className={styles.select}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="score_high">Severity Score (High-Low)</option>
                <option value="score_low">Severity Score (Low-High)</option>
                <option value="supports">Most Supported</option>
              </select>
            </div>
          </div>
        </div>

        {/* Incident List */}
        <div className={styles.listContainer}>
          <div className={styles.listHeaderBar}>
            <div className={styles.colId}>INCIDENT / ID</div>
            <div className={styles.colDesc}>DESCRIPTION & LOCATION</div>
            <div className={styles.colSeverity}>SEVERITY</div>
            <div className={styles.colScore}>AI SCORE</div>
            <div className={styles.colStatus}>STATUS</div>
            <div className={styles.colAction}>ACTION</div>
          </div>

          {filteredReports.length === 0 ? (
            <div className={styles.emptyState}>
              <AlertTriangle size={36} />
              <h3>No matching damage reports found</h3>
              <p>Try adjusting your search keywords or clearing active classification filters.</p>
              {(selectedSeverity !== 'all' || selectedStatus !== 'all' || searchQuery) && (
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => { setSelectedSeverity('all'); setSelectedStatus('all'); setSearchQuery(''); }}
                >
                  Reset All Filters
                </button>
              )}
            </div>
          ) : (
            filteredReports.map((report) => {
              const level = getSeverityLevel(report);
              const color = getSeverityColor(level);
              const statusColor = getStatusColor(report.status);
              const statusLabel = getStatusLabel(report.status);
              const reportIdShort = report.id ? (report.id.length > 10 ? `#${report.id.slice(0, 8)}` : `#${report.id}`) : '#N/A';

              return (
                <div 
                  key={report.id} 
                  className={styles.reportRow}
                  onClick={() => handleOpenDetail(report)}
                >
                  {/* ID & Media Thumbnail */}
                  <div className={styles.colId}>
                    <div className={styles.thumbWrapper}>
                      {(report.image_url || report.media_url || report.video_url) ? (
                        report.media_type === 'video' || report.video_url ? (
                          <video 
                            src={report.video_url || report.media_url} 
                            muted 
                            preload="metadata" 
                            className={styles.rowThumb}
                          />
                        ) : (
                          <img 
                            src={report.image_url || report.media_url} 
                            alt={report.description || 'Road surface'} 
                            className={styles.rowThumb}
                          />
                        )
                      ) : (
                        <div className={styles.noThumb}>NO MEDIA</div>
                      )}
                    </div>
                    <span className={styles.reportIdText}>{reportIdShort}</span>
                  </div>

                  {/* Description & Location */}
                  <div className={styles.colDesc}>
                    <h4 className={styles.reportTitle}>
                      {report.description || report.original_filename || 'Road damage detected'}
                    </h4>
                    <div className={styles.reportMeta}>
                      <span className={styles.metaItem}>
                        <MapPin size={12} />
                        {report.address || (report.location ? `${report.location.latitude?.toFixed(4)}, ${report.location.longitude?.toFixed(4)}` : 'Coordinates logged')}
                      </span>
                      <span className={styles.metaItem}>
                        <Clock size={12} />
                        {formatRelativeTime(report.created_at)}
                      </span>
                      <span className={styles.metaItem}>
                        <ThumbsUp size={12} />
                        {report.support_count || 0} supports
                      </span>
                    </div>
                  </div>

                  {/* Severity Badge */}
                  <div className={styles.colSeverity}>
                    <span className={`badge badge-${level}`}>
                      {getSeverityLabel(level)}
                    </span>
                  </div>

                  {/* AI Damage Score */}
                  <div className={styles.colScore}>
                    <span className={styles.scoreVal} style={{ color }}>
                      {formatScore(report.damage_score, 1)}
                    </span>
                  </div>

                  {/* Lifecycle Status */}
                  <div className={styles.colStatus}>
                    <span className={styles.statusPill} style={{ borderColor: statusColor, color: statusColor }}>
                      ● {statusLabel}
                    </span>
                  </div>

                  {/* Action Button */}
                  <div className={styles.colAction}>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDetail(report);
                      }}
                    >
                      <span>Inspect</span>
                      <ExternalLink size={12} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
