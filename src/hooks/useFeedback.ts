import { useState } from 'react';
import OpenAI from 'openai';
import { Feedback } from '@/types';

export const useFeedback = () => {
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getFeedback = async (targetText: string, audioBlob: Blob) => {
    try {
      setIsLoading(true);
      setError(null);

      const openai = new OpenAI({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true,
      });

      // 1. 음성을 텍스트로 변환
      const audioFile = new File([audioBlob], 'audio.webm', { type: 'audio/webm' });
      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
      });

      // 2. 피드백 생성
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an English pronunciation and speaking coach. 
            Provide detailed feedback on the user's pronunciation and expression.
            Focus on:
            1. Pronunciation accuracy
            2. Intonation and rhythm
            3. Word stress
            4. Natural expression
            5. Specific words or phrases that need improvement
            Format your response in Korean.`
          },
          {
            role: 'user',
            content: `Target sentence: "${targetText}"
            User's pronunciation: "${transcription.text}"
            
            Please provide detailed feedback on:
            1. Pronunciation (발음)
            2. Fluency (유창성)
            3. Overall assessment (종합 평가)
            4. Specific improvement suggestions (구체적인 개선점)
            
            Format the response as a JSON object with these keys:
            {
              "pronunciation": "발음 평가",
              "fluency": "유창성 평가",
              "overall": "종합 평가",
              "suggestions": "구체적인 개선점"
            }`
          }
        ],
        response_format: { type: "json_object" }
      });

      const feedbackData = JSON.parse(completion.choices[0].message.content);
      setFeedback(feedbackData);
    } catch (err) {
      console.error('Error getting feedback:', err);
      setError('피드백을 받는 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return { feedback, isLoading, error, getFeedback };
}; 