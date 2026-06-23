import { useState } from 'react';
import DiaryEditor from './components/DiaryEditor';
import DiaryList from './components/DiaryList';
import EmotionChart from './components/EmotionChart';
import styles from './App.module.css';

// Bottom nav tabs — kept as a config array so adding a new tab is just one line
const TABS = [
  { id: 'write', label: '✍️', title: '쓰기' },
  { id: 'list', label: '📋', title: '목록' },
  { id: 'chart', label: '📊', title: '통계' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('write');

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>📓 내 감정 일기</h1>
      </header>

      <main className={styles.main}>
        {activeTab === 'write' && <DiaryEditor />}
        {activeTab === 'list' && <DiaryList />}
        {activeTab === 'chart' && <EmotionChart />}
      </main>

      <nav className={styles.nav}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.navBtn} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className={styles.navIcon}>{tab.label}</span>
            <span className={styles.navLabel}>{tab.title}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
