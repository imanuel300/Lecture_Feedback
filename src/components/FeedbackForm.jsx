import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import EmojiRating from './EmojiRating';
import SuccessMessage from './SuccessMessage';
import styles from '../styles/FeedbackForm.module.css';

const FeedbackForm = () => {
  const [feedback, setFeedback] = useState({
    satisfaction: '',
    understanding: '',
    improvement: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      console.log('Submitting feedback:', feedback);
      
      const { data, error } = await supabase
        .from('feedback')
        .insert([feedback]);
        
      if (error) {
        console.error('Supabase error:', error);
        setError('חלה שגיאה בשליחת המשוב. אנא נסו שוב.');
        return;
      }
      
      console.log('Feedback submitted successfully:', data);
      setShowSuccess(true);
      setFeedback({ satisfaction: '', understanding: '', improvement: '' });
      
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error:', error);
      setError('חלה שגיאה בשליחת המשוב. אנא נסו שוב.');
    }
  };

  return (
    <div className={styles.container}>
      <Link to="/results" className={styles.resultsLink}>
        צפייה בתוצאות
      </Link>
      
      <h1 className={styles.title}>איך הייתה ההרצאה?</h1>
      
      {error && <div className={styles.error}>{error}</div>}
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <EmojiRating 
          value={feedback.satisfaction}
          onChange={(value) => {
            console.log('Emoji selected:', value);
            setFeedback({...feedback, satisfaction: value});
          }}
        />

        <div className={styles.fieldGroup}>
          <label>כמה הבנת מההרצאה?</label>
          <select 
            value={feedback.understanding}
            onChange={(e) => setFeedback({...feedback, understanding: e.target.value})}
            required
          >
            <option value="">בחר/י תשובה</option>
            <option value="high">הבנתי</option>
            <option value="medium">לא כ"כ</option>
            <option value="low">מעט מאוד</option>
          </select>
        </div>

        <div className={styles.fieldGroup}>
          <label>מה לשפר בפעם הבאה?</label>
          <textarea
            value={feedback.improvement}
            onChange={(e) => setFeedback({...feedback, improvement: e.target.value})}
            required
          />
        </div>

        <button type="submit" className={styles.submitButton}>
          שליחת משוב
        </button>
      </form>

      {showSuccess && <SuccessMessage />}
    </div>
  );
};

export default FeedbackForm; 