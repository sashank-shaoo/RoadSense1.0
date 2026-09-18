import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeToast } from '../../store/slices/uiSlice.js';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import styles from './Toast.module.css';

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

function ToastItem({ toast }) {
  const dispatch = useDispatch();
  const Icon = ICONS[toast.type] || Info;

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(removeToast(toast.id));
    }, toast.duration);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, dispatch]);

  return (
    <div className={`${styles.toast} ${styles[toast.type]}`}>
      <Icon size={18} className={styles.icon} />
      <span className={styles.message}>{toast.message}</span>
      <button className={styles.close} onClick={() => dispatch(removeToast(toast.id))}>
        <X size={14} />
      </button>
    </div>
  );
}

export default function Toast() {
  const toasts = useSelector((s) => s.ui.toasts);
  return (
    <div className={styles.container}>
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}
