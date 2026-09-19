import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeModal, openModal, addToast } from '../../store/slices/uiSlice.js';
import { loginSuccess, setLoading, setAuthError, setPendingVerification } from '../../store/slices/authSlice.js';
import { authApi } from '../../api/authApi.js';
import { X, LogIn, Wrench, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import styles from './AuthModal.module.css';

const ROLES = [
  { id: 'citizen', label: 'Citizen', icon: LogIn, desc: 'Report road damage, earn credits' },
  { id: 'worker', label: 'Field Worker', icon: Wrench, desc: 'Track assigned repairs' },
  { id: 'admin', label: 'Admin', icon: ShieldCheck, desc: 'Manage system & resources' },
];

export default function LoginModal() {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((s) => s.auth);
  const [role, setRole] = useState('citizen');
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);

  useEffect(() => { dispatch(setAuthError(null)); }, [role, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(setLoading(true));
    dispatch(setAuthError(null));
    try {
      let res;
      if (role === 'citizen') {
        res = await authApi.loginUser(form);
        dispatch(loginSuccess({ user: res.user, token: res.token, role: 'END_USER' }));
      } else if (role === 'worker') {
        try {
          res = await authApi.loginWorker(form);
          dispatch(loginSuccess({ user: res.worker_group, token: res.token, role: 'WORKER_GROUP' }));
        } catch (workerErr) {
          // If not in worker_groups, try users login (for individual WORKER accounts created by Admin)
          try {
            res = await authApi.loginUser(form);
            if (res.user?.role === 'WORKER') {
              dispatch(loginSuccess({ user: res.user, token: res.token, role: 'WORKER' }));
            } else {
              throw workerErr;
            }
          } catch {
            throw workerErr;
          }
        }
      } else {
        res = await authApi.loginAdmin(form);
        dispatch(loginSuccess({ user: res.admin, token: res.token, role: 'ADMIN' }));
      }
      dispatch(addToast({ type: 'success', message: `Welcome back, ${res.user?.name || res.worker_group?.name || res.admin?.name}!` }));
      dispatch(closeModal());
    } catch (err) {
      if (err.data?.verification_required || err.message?.toLowerCase().includes('verify your email')) {
        dispatch(setPendingVerification({ email: form.email }));
        dispatch(addToast({ type: 'warning', message: 'Please verify your email before logging in.', duration: 6000 }));
        dispatch(openModal('otp'));
        return;
      }
      dispatch(setAuthError(err.message || 'Login failed'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="modal-overlay" onClick={() => dispatch(closeModal())}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ fontSize: '1.25rem' }}>Sign In to RoadSense</h2>
          <button className="btn btn-ghost btn-sm" onClick={() => dispatch(closeModal())}><X size={18} /></button>
        </div>
        <div className="modal-body">
          {/* Role Selector */}
          <div className={styles.rolePicker}>
            {ROLES.map((r) => {
              const Icon = r.icon;
              return (
                <button
                  key={r.id}
                  className={`${styles.roleBtn} ${role === r.id ? styles.roleActive : ''}`}
                  onClick={() => setRole(r.id)}
                  type="button"
                >
                  <Icon size={16} />
                  <div>
                    <div className={styles.roleLabel}>{r.label}</div>
                    <div className={styles.roleDesc}>{r.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <input className="input-field" type="email" required placeholder="you@example.com"
                value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="input-group" style={{ position: 'relative' }}>
              <label className="input-label">Password</label>
              <input className="input-field" type={showPw ? 'text' : 'password'} required placeholder="••••••••"
                value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPw((v) => !v)}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {error && <div className={styles.errorMsg}>{error}</div>}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={isLoading}>
              {isLoading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            New here?{' '}
            <button className={styles.linkBtn} onClick={() => dispatch(openModal('register'))}>Create an account</button>
          </p>
        </div>
      </div>
    </div>
  );
}
