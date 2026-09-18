import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { setReports } from '../store/slices/reportSlice.js';
import { openModal } from '../store/slices/uiSlice.js';
import { reportApi } from '../api/reportApi.js';
import DamageMap from '../components/map/DamageMap.jsx';
import { getSeverityLevel, getSeverityColor, getSeverityLabel, getStatusLabel, formatRelativeTime, formatScore } from '../utils/helpers.js';
import { MapPin, AlertTriangle, ThumbsUp, Zap, ChevronRight, ShieldCheck, Cpu, BarChart2 } from 'lucide-react';
import styles from './HomePage.module.css';

const STATS = [
  { label: 'Reports Filed', value: '2,840+', icon: AlertTriangle, color: '#ef4444' },
  { label: 'Roads Repaired', value: '1,120+', icon: ShieldCheck, color: '#10b981' },
  { label: 'AI Detections', value: '6,200+', icon: Cpu, color: '#06b6d4' },
  { label: 'Credits Awarded', value: '48,000+', icon: Zap, color: '#f59e0b' },
];

export default function HomePage() {
  const dispatch = useDispatch();
  const { reports } = useSelector((s) => s.reports);
  const { isAuthenticated } = useSelector((s) => s.auth);
  const isDemoMode = useSelector((s) => s.ui.isDemoMode);
  const heroRef = useRef(null);

  useEffect(() => {
    reportApi.getAllReports().then((res) => {
      if (res.reports) dispatch(setReports(res.reports));
    }).catch(() => {});
  }, [dispatch, isDemoMode]);

  const recentReports = reports.slice(0, 5);

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero} ref={heroRef}>
        <div className={styles.heroGradient} />
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <Zap size={12} />
            PARAKRAM 1.0 Hackathon · Smart City Initiative
          </div>
          <h1 className={styles.heroTitle}>
            AI-Powered<br />
            <span className={styles.heroAccent}>Road Intelligence</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Detect, report, and track road damage with YOLOv8 AI. Earn rewards for protecting your city's infrastructure.
          </p>
          <div className={styles.heroCta}>
            {!isAuthenticated ? (
              <>
                <button className="btn btn-primary btn-lg" onClick={() => dispatch(openModal('register'))}>
                  <AlertTriangle size={18} /> Start Reporting
                </button>
                <Link to="/explore" className="btn btn-secondary btn-lg">
                  <MapPin size={18} /> Explore Map
                </Link>
              </>
            ) : (
              <>
                <button className="btn btn-primary btn-lg" onClick={() => dispatch(openModal('createReport'))}>
                  <AlertTriangle size={18} /> Report Damage
                </button>
                <Link to="/explore" className="btn btn-secondary btn-lg">
                  <MapPin size={18} /> Live Map
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Hero Map */}
        <div className={styles.heroMapWrapper}>
          <DamageMap reports={reports} height="420px" showPopup={true} />
          <div className={styles.mapLegend}>
            {[['critical', '#ef4444'], ['high', '#f97316'], ['medium', '#eab308'], ['low', '#10b981']].map(([l, c]) => (
              <span key={l} className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: c }} />
                {l.charAt(0).toUpperCase() + l.slice(1)}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className={styles.stats}>
        <div className={styles.container}>
          <div className={styles.statsGrid}>
            {STATS.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className={`card ${styles.statCard}`}>
                  <div className={styles.statIcon} style={{ background: `${stat.color}22`, color: stat.color }}>
                    <Icon size={22} />
                  </div>
                  <div className={styles.statVal}>{stat.value}</div>
                  <div className={styles.statLabel}>{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      <section className={styles.activity}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>Recent Damage Reports</h2>
            <Link to="/explore" className="btn btn-ghost btn-sm">
              View all <ChevronRight size={14} />
            </Link>
          </div>
          <div className={styles.reportList}>
            {recentReports.length === 0 ? (
              <div className={styles.empty}>No reports yet. Be the first to report!</div>
            ) : (
              recentReports.map((report) => {
                const level = getSeverityLevel(report);
                const color = getSeverityColor(level);
                return (
                  <div key={report.id} className={`card card-hover ${styles.reportCard}`}
                    onClick={() => { dispatch({ type: 'reports/setActiveReport', payload: report }); dispatch(openModal('reportDetail')); }}>
                    <div className={styles.reportCardLeft}>
                      <div className={styles.reportDot} style={{ background: color, boxShadow: `0 0 8px ${color}88` }} />
                      <div>
                        <div className={styles.reportTitle}>{report.description || report.original_filename}</div>
                        <div className={styles.reportMeta}>
                          <span><MapPin size={11} /> {report.location?.latitude?.toFixed(3)}, {report.location?.longitude?.toFixed(3)}</span>
                          <span>{formatRelativeTime(report.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.reportCardRight}>
                      <span className={`badge badge-${level}`}>{getSeverityLabel(level)}</span>
                      <span className={styles.supports}><ThumbsUp size={11} /> {report.support_count || 0}</span>
                      <span className={styles.score} style={{ color }}>{formatScore(report.damage_score, 1)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className={styles.features}>
        <div className={styles.container}>
          <div className={styles.sectionHeader} style={{ marginBottom: 40 }}>
            <h2>How RoadSense Works</h2>
          </div>
          <div className={styles.featureGrid}>
            {[
              {
                icon: AlertTriangle,
                color: '#f97316',
                title: 'Capture & Submit',
                desc: 'Take a photo of road damage. Auto-detect your GPS location. Submit in under 30 seconds.',
              },
              {
                icon: Cpu,
                color: '#06b6d4',
                title: 'YOLOv8 AI Analysis',
                desc: 'Our custom-trained road damage model classifies potholes, cracks, ruts, and scores severity instantly.',
              },
              {
                icon: BarChart2,
                color: '#8b5cf6',
                title: 'Priority Routing',
                desc: 'AI damage scores and community upvotes intelligently route work orders to field crews.',
              },
              {
                icon: Zap,
                color: '#f59e0b',
                title: 'Earn Credits',
                desc: 'Earn 50 pts per report and 10 pts per community support. Climb the Pavement Guardian ranks.',
              },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className={`card ${styles.featureCard}`}>
                  <div className={styles.featureIcon} style={{ background: `${f.color}1a`, color: f.color }}>
                    <Icon size={26} />
                  </div>
                  <h3 className={styles.featureTitle}>{f.title}</h3>
                  <p className={styles.featureDesc}>{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
