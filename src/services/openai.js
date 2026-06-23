import OpenAI from 'openai';

const EMOTIONS = ['행복', '슬픔', '분노', '불안', '평온', '스트레스', '설렘'];

// Prompt needs to be strict about JSON-only output.
// Tried without the "다른 말은 하지 마" instruction once and it kept adding "물론이죠!" at the start.
const EMOTION_PROMPT = `
다음 일기 내용을 읽고 감정을 분석해줘.
반드시 아래 JSON 형식으로만 응답해. 다른 말은 하지 마.

감정 목록: ${EMOTIONS.join(', ')}

응답 형식:
{
  "emotion": "감정 중 하나",
  "score": 0~100 사이 강도,
  "summary": "한 줄 감정 요약 (20자 이내)"
}
`;

export async function analyzeEmotion(diaryText) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey || apiKey === '여기에_OpenAI_API_키_입력') {
    return getMockEmotion(diaryText);
  }

  // dangerouslyAllowBrowser: API key is exposed client-side, but this is a personal local app
  // so not a big deal. If this ever goes public, move the call to a backend.
  const client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

  // gpt-4o-mini is cheap and fast — more than enough for simple emotion classification
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: EMOTION_PROMPT },
      { role: 'user', content: diaryText },
    ],
    temperature: 0.3,
    max_tokens: 100,
  });

  const content = response.choices[0].message.content.trim();
  return JSON.parse(content);
}

// Fallback for when there's no API key — keyword matching, not perfect but good enough for dev
function getMockEmotion(text) {
  const mockMap = [
    { keywords: ['행복', '좋아', '기뻐', '신나', '웃'], emotion: '행복', score: 85 },
    { keywords: ['슬퍼', '울었', '힘들', '그리워', '보고싶'], emotion: '슬픔', score: 70 },
    { keywords: ['화나', '짜증', '열받', '싫어', '분노'], emotion: '분노', score: 75 },
    { keywords: ['걱정', '불안', '두려', '무서', '떨려'], emotion: '불안', score: 65 },
    { keywords: ['설레', '기대', '두근', '떨려서 좋'], emotion: '설렘', score: 80 },
    { keywords: ['피곤', '힘들', '스트레스', '바빠', '지쳐'], emotion: '스트레스', score: 72 },
  ];

  for (const { keywords, emotion, score } of mockMap) {
    if (keywords.some((k) => text.includes(k))) {
      return { emotion, score, summary: `${emotion}한 하루였군요` };
    }
  }

  // Default when nothing matches
  return { emotion: '평온', score: 60, summary: '잔잔한 하루였군요' };
}
