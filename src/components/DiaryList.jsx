import { useState, useEffect } from 'react';
import { loadEntries, deleteEntry } from '../utils/storage';
import EmotionBadge from './EmotionBadge';
import styles from './DiaryList.module.css';

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });
}

export default function DiaryList() {
  const [entries, setEntries] = useState([]);
  // accordion: stores the date string of the currently open card (null = all closed)
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    setEntries(loadEntries());
  }, []);

  function handleDelete(date) {
    if (!window.confirm('이 일기를 삭제할까요?')) return;
    setEntries(deleteEntry(date));
    // TODO: show a toast notification instead of just silently removing
  }

  if (entries.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyIcon}>📭</p>
        <p>아직 작성한 일기가 없어요</p>
        <p className={styles.emptyHint}>첫 일기를 써보세요!</p>
      </div>
    );
  }

  // TODO: add search/filter by emotion or keyword — getting harder to find old entries
  return (
    <div className={styles.container}>
      <p className={styles.total}>총 {entries.length}개의 일기</p>
      <div className={styles.list}>
        {entries.map((entry) => (
          <div
            key={entry.date}
            className={`${styles.card} ${expanded === entry.date ? styles.cardOpen : ''}`}
          >
            <div className={styles.cardHeader} onClick={() => setExpanded(expanded === entry.date ? null : entry.date)}>
              <div className={styles.cardMeta}>
                <span className={styles.cardDate}>{formatDate(entry.date)}</span>
                {entry.emotion && (
                  <EmotionBadge emotion={entry.emotion.emotion} size="sm" />
                )}
              </div>
              <span className={styles.arrow}>{expanded === entry.date ? '▲' : '▼'}</span>
            </div>

            {expanded === entry.date && (
              <div className={styles.cardBody}>
                <p className={styles.cardText}>{entry.text}</p>
                {entry.emotion && (
                  <div className={styles.cardEmotion}>
                    <EmotionBadge emotion={entry.emotion.emotion} score={entry.emotion.score} size="md" />
                    <p className={styles.cardSummary}>{entry.emotion.summary}</p>
                  </div>
                )}
                <button className={styles.deleteBtn} onClick={() => handleDelete(entry.date)}>
                  🗑️ 삭제
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
