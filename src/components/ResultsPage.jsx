import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import styles from '../styles/ResultsPage.module.css';

const ResultsPage = () => {
  const { lectureCode } = useParams();
  const navigate = useNavigate();
  const [lecture, setLecture] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState([]);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalResponses: 0,
    satisfactionBreakdown: {},
    understandingBreakdown: {}
  });

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

  const handleLogin = (e) => {
    e.preventDefault();
    if (lecture && password === lecture.password) {
      setIsAuthenticated(true);
      setError('');
      fetchData();
    } else {
      setError('סיסמה שגויה');
    }
  };

  const fetchData = async () => {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .eq('lecture_id', lecture.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        setError(`שגיאה בטעינת הנתונים: ${error.message}`);
        return;
      }

      setFeedback(data || []);
      calculateStats(data || []);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError(`שגיאה לא צפויה: ${err.message}`);
    }
  };

  const calculateStats = (data) => {
    const stats = {
      totalResponses: data.length,
      satisfactionBreakdown: {},
      understandingBreakdown: {}
    };

    data.forEach(item => {
      stats.satisfactionBreakdown[item.satisfaction] = 
        (stats.satisfactionBreakdown[item.satisfaction] || 0) + 1;
      stats.understandingBreakdown[item.understanding] = 
        (stats.understandingBreakdown[item.understanding] || 0) + 1;
    });

    setStats(stats);
  };

  const getEmojiForSatisfaction = (satisfaction) => {
    switch(satisfaction) {
      case 'great': return '😊';
      case 'okay': return '😐';
      case 'bad': return '😕';
      default: return '❓';
    }
  };

  const getUnderstandingText = (level) => {
    switch(level) {
      case 'high': return 'הבנתי';
      case 'medium': return 'לא כ"כ';
      case 'low': return 'מעט מאוד';
      default: return level;
    }
  };

  const exportToCSV = () => {
    const BOM = '\uFEFF';
    
    const headers = ['תאריך', 'שביעות רצון', 'רמת הבנה', 'הצעות לשיפור'];
    
    const getSatisfactionText = (satisfaction) => {
      switch(satisfaction) {
        case 'great': return 'מעולה';
        case 'okay': return 'בסדר';
        case 'bad': return 'לא טוב';
        default: return satisfaction;
      }
    };

    const csvContent = BOM + [
      headers.join(','),
      ...feedback.map(item => [
        new Date(item.created_at).toLocaleDateString('he-IL'),
        getSatisfactionText(item.satisfaction),
        getUnderstandingText(item.understanding),
        `"${item.improvement.replace(/"/g, '""').replace(/\n/g, ' ')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { 
      type: 'text/csv;charset=utf-8'
    });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `משובי_הרצאה_${new Date().toLocaleDateString('he-IL')}.csv`;
    link.click();
  };

  if (!lecture) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>הרצאה לא נמצאה</div>
        <button onClick={() => navigate('/')} className={styles.backButton}>
          חזרה לדף הראשי
        </button>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={styles.loginContainer}>
        <form onSubmit={handleLogin} className={styles.loginForm}>
          <h2>צפייה בתוצאות - {lecture.title}</h2>
          {error && <div className={styles.error}>{error}</div>}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="הכנס סיסמה"
            className={styles.passwordInput}
          />
          <button type="submit" className={styles.loginButton}>
            כניסה
          </button>
          <Link to="/" className={styles.backLink}>
            חזרה לדף הראשי
          </Link>
        </form>
      </div>
    );
  }

  return (
    <div className={styles.resultsContainer}>
      <div className={styles.header}>
        <Link to="/" className={styles.backButton}>
          חזרה לדף הראשי
        </Link>
        <h1>{lecture.title} - תוצאות המשוב</h1>
        <button onClick={exportToCSV} className={styles.exportButton}>
          <span className={styles.icon}>📊</span>
          ייצוא לאקסל
        </button>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statsCard}>
          <h3>סה"כ משובים</h3>
          <div className={styles.statValue}>{stats.totalResponses}</div>
        </div>

        <div className={styles.statsCard}>
          <h3>שביעות רצון</h3>
          <div className={styles.statBreakdown}>
            {Object.entries(stats.satisfactionBreakdown).map(([key, value]) => (
              <div key={key} className={styles.statRow}>
                <span>{getEmojiForSatisfaction(key)}</span>
                <span className={styles.statLabel}>{value} תגובות</span>
                <div className={styles.statBar}>
                  <div 
                    className={styles.statBarFill} 
                    style={{width: `${(value / stats.totalResponses) * 100}%`}}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.statsCard}>
          <h3>רמת הבנה</h3>
          <div className={styles.statBreakdown}>
            {Object.entries(stats.understandingBreakdown).map(([key, value]) => (
              <div key={key} className={styles.statRow}>
                <span className={styles.statLabel}>{getUnderstandingText(key)}</span>
                <span>{value} תגובות</span>
                <div className={styles.statBar}>
                  <div 
                    className={styles.statBarFill} 
                    style={{width: `${(value / stats.totalResponses) * 100}%`}}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.feedbackSection}>
        <h2>כל המשובים</h2>
        <div className={styles.feedbackList}>
          {feedback.map((item, index) => (
            <div key={index} className={styles.feedbackItem}>
              <div className={styles.feedbackHeader}>
                <span className={styles.feedbackDate}>
                  {new Date(item.created_at).toLocaleDateString('he-IL')}
                </span>
                <span className={styles.feedbackEmoji}>
                  {getEmojiForSatisfaction(item.satisfaction)}
                </span>
              </div>
              <div className={styles.feedbackContent}>
                <p className={styles.understanding}>
                  רמת הבנה: {getUnderstandingText(item.understanding)}
                </p>
                <p className={styles.improvement}>
                  <strong>הצעות לשיפור:</strong>
                  <br />
                  {item.improvement}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;