const EMOTIONS = ['행복', '슬픔', '분노', '불안', '평온', '스트레스', '설렘'];

const PROMPT = `다음 일기 내용을 읽고 감정을 분석해줘.
반드시 아래 JSON 형식으로만 응답해. 다른 말은 절대 하지 마.

감정 목록: ${EMOTIONS.join(', ')}

응답 형식:
{
  "emotion": "감정 중 하나",
  "score": 0~100 사이 강도 숫자,
  "summary": "한 줄 감정 요약 (20자 이내)"
}

일기 내용:`;

export async function analyzeEmotion(diaryText) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey || apiKey === '여기에_Gemini_API_키_입력') {
    return getMockEmotion(diaryText);
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: PROMPT + '\n' + diaryText }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 150 },
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API 오류 ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const text = data.candidates[0].content.parts[0].text.trim();
  const json = text.replace(/```json|```/g, '').trim();
  return JSON.parse(json);
}

function getMockEmotion(text) {
  const mockMap = [
    { keywords: ['행복', '좋아', '기뻐', '신나', '웃', '최고', '즐거', '재밌'], emotion: '행복', score: 85 },
    { keywords: ['슬퍼', '울었', '힘들', '그리워', '보고싶', '외로', '쓸쓸'], emotion: '슬픔', score: 70 },
    { keywords: ['화나', '짜증', '열받', '싫어', '분노', '황당', '어이없'], emotion: '분노', score: 75 },
    { keywords: ['걱정', '불안', '두려', '무서', '떨려', '초조', '긴장'], emotion: '불안', score: 65 },
    { keywords: ['설레', '기대', '두근'], emotion: '설렘', score: 80 },
    { keywords: ['피곤', '스트레스', '바빠', '지쳐', '버거'], emotion: '스트레스', score: 72 },
  ];

  for (const { keywords, emotion, score } of mockMap) {
    if (keywords.some((k) => text.includes(k))) {
      return { emotion, score, summary: `${emotion}한 하루였군요` };
    }
  }

  const positiveWords = ['좋', '잘', '됐', '완료', '성공', '맛있', '재미'];
  const negativeWords = ['못', '안', '별로', '아쉽', '실망', '후회'];
  const posCount = positiveWords.filter((w) => text.includes(w)).length;
  const negCount = negativeWords.filter((w) => text.includes(w)).length;

  if (posCount > negCount) return { emotion: '행복', score: 65, summary: '좋은 하루였군요' };
  if (negCount > posCount) return { emotion: '슬픔', score: 55, summary: '힘든 하루였군요' };

  return { emotion: '평온', score: 58, summary: '무난한 하루였군요' };
}
