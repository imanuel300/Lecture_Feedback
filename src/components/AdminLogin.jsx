import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/AdminLogin.module.css';

const AdminLogin = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === import.meta.env.VITE_ADMIN_PASSWORD) {
      navigate('/admin/lectures');
    } else {
      setError('סיסמה שגויה');
    }
  };

  return (
    <div className={styles.loginContainer}>
      <form onSubmit={handleSubmit} className={styles.loginForm}>
        <h2>כניסת מנהל</h2>
        {error && <div className={styles.error}>{error}</div>}
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="הכנס סיסמת מנהל"
          className={styles.passwordInput}
        />
        <button type="submit" className={styles.loginButton}>
          כניסה
        </button>
      </form>
    </div>
  );
};

export default AdminLogin; 