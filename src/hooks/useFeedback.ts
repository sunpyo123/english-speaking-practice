'use client';

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

      if (!transcription.text) {
        throw new Error('음성을 텍스트로 변환하는데 실패했습니다.');
      }

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

      const content = completion.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('피드백을 생성하는데 실패했습니다.');
      }

      try {
        const feedbackData = JSON.parse(content) as Feedback;
        
        // 필수 필드가 모두 있는지 확인
        if (!feedbackData.pronunciation || !feedbackData.fluency || 
            !feedbackData.overall || !feedbackData.suggestions) {
          throw new Error('피드백 데이터가 올바른 형식이 아닙니다.');
        }

        setFeedback(feedbackData);
      } catch (parseError) {
        console.error('Error parsing feedback:', parseError);
        throw new Error('피드백 데이터를 처리하는데 실패했습니다.');
      }
    } catch (err) {
      console.error('Error getting feedback:', err);
      setError(err instanceof Error ? err.message : '피드백을 받는 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return { feedback, isLoading, error, getFeedback };
};

export default useFeedback; 