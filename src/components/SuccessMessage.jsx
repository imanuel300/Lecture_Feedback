import React from 'react';
import styles from '../styles/SuccessMessage.module.css';

const SuccessMessage = () => {
  return (
    <div className={styles.successMessage}>
      <span className={styles.icon}>✅</span>
      <p>תודה! המשוב נשלח בהצלחה</p>
    </div>
  );
};

export default SuccessMessage; 