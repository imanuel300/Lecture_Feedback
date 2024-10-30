import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import EmojiRating from './EmojiRating';
import SuccessMessage from './SuccessMessage';
import styles from '../styles/FeedbackForm.module.css';

const FeedbackForm = () => {
  const { lectureCode } = useParams();
  const navigate = useNavigate();
  const [lecture, setLecture] = useState(null);
  const [feedback, setFeedback] = useState({
    satisfaction: '',
    understanding: '',
    improvement: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLecture();
  }, [lectureCode]);

  const fetchLecture = async () => {
    const { data, error } = await supabase
      .from('lectures')
      .select('*')
      .eq('code', lectureCode)
      .single();

    if (error || !data) {
      setError('הרצאה לא נמצאה');
      return;
    }

    setLecture(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const { data, error } = await supabase
        .from('feedback')
        .insert([{
          ...feedback,
          lecture_id: lecture.id
        }]);
        
      if (error) {
        console.error('Supabase error:', error);
        setError('חלה שגיאה בשליחת המשוב. אנא נסו שוב.');
        return;
      }
      
      setShowSuccess(true);
      setFeedback({ satisfaction: '', understanding: '', improvement: '' });
      
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error:', error);
      setError('חלה שגיאה בשליחת המשוב. אנא נסו שוב.');
    }
  };

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error}</div>
        <button onClick={() => navigate('/')} className={styles.backButton}>
          חזרה לדף הראשי
        </button>
      </div>
    );
  }

  if (!lecture) {
    return <div className={styles.container}>טוען...</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{lecture.title}</h1>
      {lecture.description && (
        <p className={styles.description}>{lecture.description}</p>
      )}
      
      {error && <div className={styles.error}>{error}</div>}
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <EmojiRating 
          value={feedback.satisfaction}
          onChange={(value) => setFeedback({...feedback, satisfaction: value})}
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