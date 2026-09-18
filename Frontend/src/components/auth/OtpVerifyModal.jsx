import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeModal, addToast } from '../../store/slices/uiSlice.js';
import { loginSuccess, setLoading, setAuthError } from '../../store/slices/authSlice.js';
import { authApi } from '../../api/authApi.js';
import { X, Mail, RefreshCw } from 'lucide-react';
import styles from './AuthModal.module.css';

export default function OtpVerifyModal() {
  const dispatch = useDispatch();
  const { isLoading, error, pendingVerification } = useSelector((s) => s.auth);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendCooldown > 0) {
      const t = setTimeout(() => setResendCooldown((v) => v - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendCooldown]);

  const handleChange = (idx, val) => {
    const digit = val.replace(/\D/, '');
    const newOtp = [...otp];
    newOtp[idx] = digit;
    setOtp(newOtp);
    if (digit && idx < 5) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text.length === 6) {
      setOtp(text.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) return;
    dispatch(setLoading(true));
    dispatch(setAuthError(null));
    try {
      const res = await authApi.verifyEmail({ email: pendingVerification?.email, otp: code });
      dispatch(loginSuccess({ user: res.user, token: res.token, role: 'END_USER' }));
      dispatch(addToast({ type: 'success', message: 'Email verified! Welcome to RoadSense.' }));
      dispatch(closeModal());
    } catch (err) {
      dispatch(setAuthError(err.message || 'Invalid OTP'));
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleResend = async () => {
    try {
      await authApi.resendOtp({ email: pendingVerification?.email });
      dispatch(addToast({ type: 'info', message: 'Verification code resent!' }));
      setResendCooldown(60);
    } catch (err) {
      dispatch(addToast({ type: 'error', message: err.message || 'Failed to resend' }));
    }
  };

  return (
    <div className="modal-overlay" onClick={() => dispatch(closeModal())}>
      <div className="modal-content" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ fontSize: '1.2rem' }}>Verify Your Email</h2>
          <button className="btn btn-ghost btn-sm" onClick={() => dispatch(closeModal())}><X size={18} /></button>
        </div>
        <div className="modal-body" style={{ textAlign: 'center' }}>
          <div className={styles.otpIcon}>
            <Mail size={28} />
          </div>
          <p style={{ marginBottom: 6, color: 'var(--text-secondary)' }}>
            We sent a 6-digit code to
          </p>
          <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 24 }}>
            {pendingVerification?.email}
          </p>

          <form onSubmit={handleSubmit}>
            <div className={styles.otpInputs} onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  className={styles.otpInput}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                />
              ))}
            </div>

            {error && <div className={styles.errorMsg} style={{ marginBottom: 12 }}>{error}</div>}

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isLoading || otp.join('').length < 6}>
              {isLoading ? 'Verifying…' : 'Verify Email'}
            </button>
          </form>

          <button className={styles.resendBtn} onClick={handleResend} disabled={resendCooldown > 0}>
            <RefreshCw size={13} />
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
          </button>
        </div>
      </div>
    </div>
  );
}
