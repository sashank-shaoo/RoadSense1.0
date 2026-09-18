import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeModal, openModal, addToast } from '../../store/slices/uiSlice.js';
import { setLoading, setAuthError, setPendingVerification } from '../../store/slices/authSlice.js';
import { authApi } from '../../api/authApi.js';
import { X, Eye, EyeOff } from 'lucide-react';
import styles from './AuthModal.module.css';

export default function RegisterModal() {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', occupation: '' });
  const [showPw, setShowPw] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(setLoading(true));
    dispatch(setAuthError(null));
    try {
      const res = await authApi.register(form);
      dispatch(setPendingVerification({ email: form.email }));
      dispatch(addToast({
        type: 'success',
        message: res.message || 'OTP sent! Check your email.',
        duration: 8000,
      }));
      dispatch(openModal('otp'));
    } catch (err) {
      dispatch(setAuthError(err.message || 'Registration failed'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="modal-overlay" onClick={() => dispatch(closeModal())}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ fontSize: '1.25rem' }}>Create Your Account</h2>
          <button className="btn btn-ghost btn-sm" onClick={() => dispatch(closeModal())}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
              <div className="input-group" style={{ paddingRight: 8 }}>
                <label className="input-label">Full Name *</label>
                <input className="input-field" name="name" required minLength={2} placeholder="Your full name"
                  value={form.name} onChange={handleChange} />
              </div>
              <div className="input-group" style={{ paddingLeft: 8 }}>
                <label className="input-label">Phone (optional)</label>
                <input className="input-field" name="phone" placeholder="+91 XXXXXXXXXX"
                  value={form.phone} onChange={handleChange} />
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">Email Address *</label>
              <input className="input-field" type="email" name="email" required placeholder="you@example.com"
                value={form.email} onChange={handleChange} />
            </div>
            <div className="input-group" style={{ position: 'relative' }}>
              <label className="input-label">Password *</label>
              <input className="input-field" type={showPw ? 'text' : 'password'} name="password" required minLength={6}
                placeholder="Min 6 characters" value={form.password} onChange={handleChange} />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPw((v) => !v)}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <div className="input-group">
              <label className="input-label">Occupation (optional)</label>
              <input className="input-field" name="occupation" placeholder="e.g. Software Engineer, Teacher..."
                value={form.occupation} onChange={handleChange} />
            </div>

            {error && <div className={styles.errorMsg}>{error}</div>}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={isLoading}>
              {isLoading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <button className={styles.linkBtn} onClick={() => dispatch(openModal('login'))}>Sign in</button>
          </p>
        </div>
      </div>
    </div>
  );
}
