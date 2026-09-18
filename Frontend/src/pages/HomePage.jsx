import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { setReports } from '../store/slices/reportSlice.js';
import { openModal } from '../store/slices/uiSlice.js';
import { reportApi } from '../api/reportApi.js';
import DamageMap from '../components/map/DamageMap.jsx';
import { MapPin, AlertTriangle, Zap, ShieldCheck, Cpu, BarChart2 } from 'lucide-react';
import styles from './HomePage.module.css';

const STATS = [
  { label: 'Reports Filed', value: '2,840+', icon: AlertTriangle, color: '#D93025', bg: 'rgba(217,48,37,0.08)' },
  { label: 'Roads Repaired', value: '1,120+', icon: ShieldCheck, color: '#1E7A4A', bg: 'rgba(30,122,74,0.08)' },
  { label: 'AI Detections', value: '6,200+', icon: Cpu, color: '#1A5C9E', bg: 'rgba(26,92,158,0.08)' },
  { label: 'Credits Awarded', value: '48,000+', icon: Zap, color: '#C9A92C', bg: 'rgba(201,169,44,0.12)' },
];

export default function HomePage() {
  const dispatch = useDispatch();
  const { reports } = useSelector((s) => s.reports);
  const { isAuthenticated } = useSelector((s) => s.auth);
  const heroRef = useRef(null);

  useEffect(() => {
    reportApi.getAllReports().then((res) => {
      if (res.reports) dispatch(setReports(res.reports));
    }).catch(() => {});
  }, [dispatch]);

  const recentReports = reports.slice(0, 5);

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero} ref={heroRef}>
        <div className={styles.heroGradient} />
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <ShieldCheck size={14} />
            Official Public Infrastructure Monitoring Portal.
          </div>
          <h1 className={styles.heroTitle}>
            AI-Powered<br />
            <span className={styles.heroAccent}>Road Intelligence</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Detect, report, and track road damage with YOLOv11n AI. Earn rewards for protecting your city's infrastructure.
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
          <DamageMap reports={reports} height="420px" showPopup={false} interactive={false} />
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
                color: '#E8620A',
                bg: 'rgba(232,98,10,0.08)',
                step: '01 — Capture',
                title: 'Capture & Submit',
                desc: 'Take a photo of road damage. Auto-detect your GPS location. Submit in under 30 seconds.',
              },
              {
                icon: Cpu,
                color: '#1A5C9E',
                bg: 'rgba(26,92,158,0.08)',
                step: '02 — Analyze',
                title: 'YOLOv11 AI Analysis',
                desc: 'Our custom-trained road damage model classifies potholes, cracks, ruts, and scores severity instantly.',
              },
              {
                icon: BarChart2,
                color: '#6B40B8',
                bg: 'rgba(107,64,184,0.08)',
                step: '03 — Route',
                title: 'Priority Routing',
                desc: 'AI damage scores and community upvotes intelligently route work orders to field crews.',
              },
              {
                icon: Zap,
                color: '#C9A92C',
                bg: 'rgba(201,169,44,0.12)',
                step: '04 — Reward',
                title: 'Earn Credits',
                desc: 'Earn 50 pts per report and 10 pts per community support. Climb the Pavement Guardian ranks.',
              },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className={styles.featureCard} data-step={f.step}>
                  <div className={styles.featureIcon} style={{ background: f.bg, color: f.color, borderColor: f.color }}>
                    <Icon size={24} />
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
