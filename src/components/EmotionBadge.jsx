import styles from './EmotionBadge.module.css';

const EMOTION_CONFIG = {
  행복: { emoji: '😊', color: '#FFD93D' },
  슬픔: { emoji: '😢', color: '#74C0FC' },
  분노: { emoji: '😠', color: '#FF6B6B' },
  불안: { emoji: '😰', color: '#CC5DE8' },
  평온: { emoji: '😌', color: '#69DB7C' },
  스트레스: { emoji: '😤', color: '#FF922B' },
  설렘: { emoji: '🤩', color: '#F783AC' },
};

export default function EmotionBadge({ emotion, score, size = 'md' }) {
  const config = EMOTION_CONFIG[emotion] || { emoji: '😶', color: '#aaa' };

  return (
    <span
      className={`${styles.badge} ${styles[size]}`}
      style={{ background: config.color + '25', color: config.color, borderColor: config.color + '60' }}
    >
      {config.emoji} {emotion}
      {score !== undefined && <span className={styles.score}> {score}%</span>}
    </span>
  );
}

export { EMOTION_CONFIG };
