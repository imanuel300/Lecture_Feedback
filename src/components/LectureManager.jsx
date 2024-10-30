import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import styles from '../styles/LectureManager.module.css';

const LectureManager = () => {
  const [lectures, setLectures] = useState([]);
  const [newLecture, setNewLecture] = useState({
    title: '',
    description: '',
    code: '',
    password: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLectures();
  }, []);

  const fetchLectures = async () => {
    const { data, error } = await supabase
      .from('lectures')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setError('שגיאה בטעינת ההרצאות');
      return;
    }

    setLectures(data || []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { data, error } = await supabase
      .from('lectures')
      .insert([newLecture]);

    if (error) {
      setError('שגיאה ביצירת הרצאה חדשה');
      return;
    }

    setNewLecture({ title: '', description: '', code: '', password: '' });
    fetchLectures();
  };

  const copyToClipboard = (code) => {
    const url = `${window.location.origin}/feedback/${code}`;
    navigator.clipboard.writeText(url).then(() => {
      alert('הקישור הועתק בהצלחה!');
    });
  };

  return (
    <div className={styles.container}>
      <h1>ניהול הרצאות</h1>

      <form onSubmit={handleSubmit} className={styles.form}>
        <h2>הרצאה חדשה</h2>
        <div className={styles.formGroup}>
          <input
            type="text"
            value={newLecture.title}
            onChange={(e) => setNewLecture({...newLecture, title: e.target.value})}
            placeholder="שם ההרצאה"
            required
          />
          <input
            type="text"
            value={newLecture.description}
            onChange={(e) => setNewLecture({...newLecture, description: e.target.value})}
            placeholder="תיאור קצר"
          />
          <input
            type="text"
            value={newLecture.code}
            onChange={(e) => setNewLecture({...newLecture, code: e.target.value})}
            placeholder="קוד ייחודי להרצאה"
            required
          />
          <input
            type="password"
            value={newLecture.password}
            onChange={(e) => setNewLecture({...newLecture, password: e.target.value})}
            placeholder="סיסמה לצפייה בתוצאות"
            required
          />
          <button type="submit">צור הרצאה</button>
        </div>
      </form>

      <div className={styles.lecturesList}>
        <h2>הרצאות קיימות</h2>
        {lectures.map(lecture => (
          <div key={lecture.id} className={styles.lectureCard}>
            <h3>{lecture.title}</h3>
            <p>{lecture.description}</p>
            <div className={styles.links}>
              <button 
                onClick={() => copyToClipboard(lecture.code)} 
                className={styles.copyLink}
              >
                העתק קישור למשוב
              </button>
              <Link to={`/results/${lecture.code}`}>
                צפייה בתוצאות
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LectureManager; 