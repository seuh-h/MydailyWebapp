import { useState, useEffect } from 'react';
import { analyzeEmotion } from '../services/ai';
import { saveEntry, getEntryByDate } from '../utils/storage';
import EmotionBadge from './EmotionBadge';
import styles from './DiaryEditor.module.css';

function getTodayDate() {
  // toISOString gives UTC, but that's fine since we only need the date string (YYYY-MM-DD)
  return new Date().toISOString().split('T')[0];
}

function formatDisplayDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });
}

export default function DiaryEditor() {
  const [date, setDate] = useState(getTodayDate());
  const [text, setText] = useState('');
  const [emotion, setEmotion] = useState(null);
  // status drives all the UI states — cleaner than separate isLoading/isSaved booleans
  const [status, setStatus] = useState('idle'); // idle | analyzing | saved | error

  // When the selected date changes, load that day's entry if it exists
  useEffect(() => {
    const existing = getEntryByDate(date);
    if (existing) {
      setText(existing.text);
      setEmotion(existing.emotion);
      setStatus('saved');
    } else {
      setText('');
      setEmotion(null);
      setStatus('idle');
    }
  }, [date]);

  async function handleSave() {
    if (!text.trim()) return;

    setStatus('analyzing');
    setEmotion(null);

    try {
      const result = await analyzeEmotion(text.trim());
      const entry = {
        date,
        text: text.trim(),
        emotion: result,
        createdAt: new Date().toISOString(),
      };
      saveEntry(entry);
      setEmotion(result);
      setStatus('saved');
    } catch (err) {
      console.error('감정 분석 오류:', err);
      setStatus('error');
    }
  }

  const charCount = text.length;
  const isToday = date === getTodayDate();
  // TODO: add a word count or estimated read time someday

  return (
    <div className={styles.container}>
      <div className={styles.dateRow}>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={styles.dateInput}
          max={getTodayDate()}
        />
        {isToday && <span className={styles.todayBadge}>오늘</span>}
      </div>

      <p className={styles.displayDate}>{formatDisplayDate(date)}</p>

      <div className={styles.editorCard}>
        <textarea
          className={styles.textarea}
          placeholder="오늘 하루는 어땠나요? 자유롭게 적어보세요 ✏️"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          disabled={status === 'analyzing'}
        />
        <div className={styles.editorFooter}>
          <span className={styles.charCount}>{charCount}자</span>
        </div>
      </div>

      {emotion && status === 'saved' && (
        <div className={styles.resultCard}>
          <p className={styles.resultLabel}>오늘의 감정</p>
          <EmotionBadge emotion={emotion.emotion} score={emotion.score} size="lg" />
          <p className={styles.summary}>{emotion.summary}</p>
        </div>
      )}

      {status === 'error' && (
        <p className={styles.errorMsg}>분석 중 오류가 발생했어요. 브라우저 F12 → Console 탭에서 오류 내용을 확인해주세요.</p>
      )}

      <button
        className={styles.saveBtn}
        onClick={handleSave}
        disabled={!text.trim() || status === 'analyzing'}
      >
        {status === 'analyzing' ? '🧠 감정 분석 중...' : status === 'saved' ? '✅ 다시 저장' : '💾 저장하기'}
      </button>
    </div>
  );
}
