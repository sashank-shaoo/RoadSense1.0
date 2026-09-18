import { useDispatch, useSelector } from 'react-redux';
import { toggleDemoMode } from '../../store/slices/uiSlice.js';
import { Zap, Wifi, WifiOff } from 'lucide-react';
import styles from './DemoBanner.module.css';

export default function DemoBanner() {
  const dispatch = useDispatch();
  const isDemoMode = useSelector((s) => s.ui.isDemoMode);

  return (
    <div className={`${styles.banner} ${isDemoMode ? styles.demo : styles.live}`}>
      <div className={styles.inner}>
        <div className={styles.left}>
          {isDemoMode ? <WifiOff size={14} /> : <Wifi size={14} />}
          <span>
            {isDemoMode
              ? 'Interactive Demo Mode — rich simulated data, no backend required'
              : 'Live Backend Mode — connected to http://localhost:3001'}
          </span>
        </div>
        <button className={styles.toggle} onClick={() => dispatch(toggleDemoMode())}>
          <Zap size={12} />
          Switch to {isDemoMode ? 'Live Backend' : 'Demo Mode'}
        </button>
      </div>
    </div>
  );
}
