import React from 'react';
import styles from '../styles/EmojiRating.module.css';

const EmojiRating = ({ value, onChange }) => {
  const emojis = [
    { value: 'great', emoji: '😊', label: 'מעולה' },
    { value: 'okay', emoji: '😐', label: 'בסדר' },
    { value: 'bad', emoji: '😕', label: 'לא טוב' }
  ];

  return (
    <div className={styles.ratingContainer}>
      <h2 className={styles.ratingTitle}>איך הייתה ההרצאה?</h2>
      <div className={styles.emojiContainer}>
        {emojis.map((item) => (
          <button
            key={item.value}
            type="button"
            className={`${styles.emojiButton} ${value === item.value ? styles.selected : ''}`}
            onClick={() => onChange(item.value)}
          >
            <span className={styles.emoji}>{item.emoji}</span>
            <span className={styles.label}>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmojiRating; 