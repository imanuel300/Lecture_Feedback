import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
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
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [clientToken, setClientToken] = useState('');

  const fetchLecture = async () => {
    try {
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
    } catch (err) {
      console.error('Error fetching lecture:', err);
      setError('שגיאה בטעינת ההרצאה');
    }
  };

  useEffect(() => {
    let token = localStorage.getItem('clientToken');
    if (!token) {
      token = uuidv4();
      localStorage.setItem('clientToken', token);
    }
    setClientToken(token);

    fetchLecture();
  }, [lectureCode]);

  const checkPreviousSubmission = async () => {
    const submittedLectures = JSON.parse(localStorage.getItem('submittedLectures') || '[]');
    if (submittedLectures.includes(lectureCode)) {
      setHasSubmitted(true);
      return;
    }

    const { data, error } = await supabase
      .from('feedback')
      .select('id')
      .eq('lecture_id', lecture?.id)
      .eq('client_token', clientToken)
      .limit(1);

    if (data && data.length > 0) {
      setHasSubmitted(true);
      localStorage.setItem('submittedLectures', JSON.stringify([...submittedLectures, lectureCode]));
    }
  };

  const getBrowserInfo = () => {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();
      
      const { data, error } = await supabase
        .from('feedback')
        .insert([{
          ...feedback,
          lecture_id: lecture.id,
          ip_address: ipData.ip,
          client_token: clientToken,
          browser_info: JSON.stringify(getBrowserInfo())
        }]);
        
      if (error) {
        console.error('Supabase error:', error);
        setError('חלה שגיאה בשליחת המשוב. אנא נסו שוב.');
        return;
      }
      
      const submittedLectures = JSON.parse(localStorage.getItem('submittedLectures') || '[]');
      submittedLectures.push(lectureCode);
      localStorage.setItem('submittedLectures', JSON.stringify(submittedLectures));
      
      setShowSuccess(true);
      setHasSubmitted(true);
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

  if (hasSubmitted) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>{lecture?.title}</h1>
        <div className={styles.submittedMessage}>
          <h2>תודה על המשוב!</h2>
          <p>כבר שלחת משוב להרצאה זו.</p>
          <button 
            onClick={() => {
              const submittedLectures = JSON.parse(localStorage.getItem('submittedLectures') || '[]');
              const filteredLectures = submittedLectures.filter(code => code !== lectureCode);
              localStorage.setItem('submittedLectures', JSON.stringify(filteredLectures));
              setHasSubmitted(false);
            }}
            className={styles.resetButton}
          >
            שלח משוב נוסף
          </button>
        </div>
      </div>
    );
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