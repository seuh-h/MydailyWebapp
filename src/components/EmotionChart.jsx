import { useState, useMemo } from 'react';
// recharts was easiest to set up in React — d3 is more powerful but way more code
// Note: ResponsiveContainer is required, otherwise the chart width gets stuck at a fixed value
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { getEntriesByMonth } from '../utils/storage';
import { EMOTION_CONFIG } from './EmotionBadge';
import styles from './EmotionChart.module.css';

// Show the past 6 months in the dropdown
function getMonthOptions() {
  const options = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    options.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
  }
  return options;
}

export default function EmotionChart() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [chartType, setChartType] = useState('bar');

  const monthOptions = getMonthOptions();

  const entries = useMemo(() => getEntriesByMonth(year, month), [year, month]);

  const emotionCounts = useMemo(() => {
    const counts = {};
    for (const entry of entries) {
      if (entry.emotion?.emotion) {
        const em = entry.emotion.emotion;
        counts[em] = (counts[em] || 0) + 1;
      }
    }
    // Sort descending so the most frequent emotion shows first in the chart
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value, color: EMOTION_CONFIG[name]?.color || '#aaa' }))
      .sort((a, b) => b.value - a.value);
    // TODO: add average score per emotion — would be more meaningful than just count
  }, [entries]);

  const mostFrequent = emotionCounts[0];

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <select
          className={styles.select}
          value={`${year}-${month}`}
          onChange={(e) => {
            const [y, m] = e.target.value.split('-').map(Number);
            setYear(y); setMonth(m);
          }}
        >
          {monthOptions.map(({ year: y, month: m }) => (
            <option key={`${y}-${m}`} value={`${y}-${m}`}>
              {y}년 {m}월
            </option>
          ))}
        </select>

        <div className={styles.typeToggle}>
          <button className={chartType === 'bar' ? styles.activeType : ''} onClick={() => setChartType('bar')}>막대</button>
          <button className={chartType === 'pie' ? styles.activeType : ''} onClick={() => setChartType('pie')}>원형</button>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyIcon}>📊</p>
          <p>이 달에 작성한 일기가 없어요</p>
        </div>
      ) : (
        <>
          <div className={styles.summaryCard}>
            <p className={styles.summaryLabel}>이번 달 일기 <strong>{entries.length}개</strong></p>
            {mostFrequent && (
              <p className={styles.summaryEmotion}>
                가장 많은 감정: {EMOTION_CONFIG[mostFrequent.name]?.emoji} <strong>{mostFrequent.name}</strong> ({mostFrequent.value}회)
              </p>
            )}
          </div>

          <div className={styles.chartCard}>
            {chartType === 'bar' ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={emotionCounts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v) => [`${v}회`, '횟수']} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {emotionCounts.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={emotionCounts}
                    cx="50%"
                    cy="45%"
                    outerRadius={90}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {emotionCounts.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className={styles.emotionGrid}>
            {emotionCounts.map((item) => (
              <div key={item.name} className={styles.emotionItem} style={{ borderColor: item.color + '50' }}>
                <span style={{ color: item.color }}>{EMOTION_CONFIG[item.name]?.emoji} {item.name}</span>
                <strong style={{ color: item.color }}>{item.value}회</strong>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
