import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setReports } from '../store/slices/reportSlice.js';
import { reportApi } from '../api/reportApi.js';
import DamageMap from '../components/map/DamageMap.jsx';
import { getSeverityLevel } from '../utils/helpers.js';
import { Search, RefreshCw, Layers, SlidersHorizontal } from 'lucide-react';
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

  return (
    <div className={styles.exploreLayout}>
      {/* Sidebar Controls (No report cards, only filter & classification controls) */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.titleRow}>
            <h2>Road Damage Explorer</h2>
            <button 
              className="btn btn-ghost btn-sm" 
              onClick={fetchReports} 
              disabled={isLoading} 
              title="Refresh data"
            >
              <RefreshCw size={14} className={isLoading ? styles.spinning : ''} />
            </button>
          </div>
          <p className={styles.subtitle}>Filter real-time incidents directly on the interactive map</p>

          {/* Search */}
          <div className={styles.searchBox}>
            <Search size={15} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search by street, note, or ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          {/* Filters */}
          <div className={styles.filterSection}>
            <div className={styles.filterSectionHeader}>
              <SlidersHorizontal size={13} />
              <span>CLASSIFICATION & FILTERS</span>
            </div>

            <div className={styles.filterRow}>
              <div className={styles.filterGroup}>
                <label>Severity Level</label>
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

              <div className={styles.filterGroup}>
                <label>Repair Status</label>
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
        </div>

        {/* Results Counter */}
        <div className={styles.resultsCount}>
          <span className={styles.countBadge}>{filteredReports.length}</span>
          <span>{filteredReports.length === 1 ? 'incident active on map' : 'incidents active on map'}</span>
        </div>

        {/* Legend / Info Panel */}
        <div className={styles.legendBox}>
          <div className={styles.legendHeading}>
            <Layers size={13} />
            <span>MAP DOT CLASSIFICATION</span>
          </div>

          <div className={styles.legendSection}>
            <span className={styles.legendSubheading}>SEVERITY</span>
            <div className={styles.legendGrid}>
              <div className={styles.legendItem}>
                <span className={styles.dot} style={{ background: '#ef4444' }} />
                <span>Critical (8.0+)</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.dot} style={{ background: '#f97316' }} />
                <span>High (5.5 - 7.9)</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.dot} style={{ background: '#eab308' }} />
                <span>Medium (3.0 - 5.4)</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.dot} style={{ background: '#10b981' }} />
                <span>Low (&lt; 3.0)</span>
              </div>
            </div>
          </div>

          <div className={styles.legendSection}>
            <span className={styles.legendSubheading}>STATUS LABELS</span>
            <div className={styles.statusGrid}>
              <span className={styles.statusItem}>● Reported</span>
              <span className={styles.statusItem}>● In Progress</span>
              <span className={styles.statusItem}>● Resolved</span>
            </div>
          </div>

          <div className={styles.tipBox}>
            ℹ <strong>Tip:</strong> Hover over any dot on the map to inspect its Report ID, Severity, and current Status.
          </div>
        </div>
      </aside>

      {/* Map Main Canvas */}
      <main className={styles.mapContainer}>
        <DamageMap reports={filteredReports} height="100%" showPopup={false} interactive={true} />
      </main>
    </div>
  );
}
