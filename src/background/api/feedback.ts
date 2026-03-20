// src/background/api/feedback.ts
// 피드백 전송 API — API 서버를 통해 Discord 알림 발송

const API_SERVER_URL = process.env.API_SERVER_URL!;
const FEEDBACK_TIMEOUT_MS = 5000; // 5초 타임아웃

interface FeedbackPayload {
  videoId: string;
  type: 'wrong_lyrics' | 'sync_mismatch' | 'other';
  artist: string;
  title: string;
  details?: string;
}

interface FeedbackResponse {
  success: boolean;
  feedbackId?: string;
  error?: string;
}

/**
 * 가사 피드백 전송
 * Content script → Background → API 서버 → Discord webhook
 */
export async function sendFeedback(payload: FeedbackPayload): Promise<FeedbackResponse> {
  const response = await fetch(`${API_SERVER_URL}/api/v1/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(FEEDBACK_TIMEOUT_MS),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Feedback API error: ${response.status} ${errorBody}`);
  }

  return response.json();
}

interface GeneralFeedbackPayload {
  type: 'bug' | 'feature' | 'other';
  subType?: string;
  message: string;
  extensionVersion?: string;
  browser?: string;
  lang?: string;
}

/**
 * 일반 피드백 전송 (버그 제보 / 기능 제안 / 기타)
 * Content script → Background → API 서버 → Discord webhook
 */
export async function sendGeneralFeedback(payload: GeneralFeedbackPayload): Promise<FeedbackResponse> {
  const response = await fetch(`${API_SERVER_URL}/api/v1/feedback/general`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(FEEDBACK_TIMEOUT_MS),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`General feedback API error: ${response.status} ${errorBody}`);
  }

  return response.json();
}
