'use client';

import { useState } from 'react';
import { todaySentences } from '@/constants/sentences';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import useFeedback from '@/hooks/useFeedback';
import { Sentence, Feedback } from '@/types';

export default function Home() {
  const [currentSentence, setCurrentSentence] = useState<Sentence>(todaySentences[0]);
  const { recordingState, startRecording, stopRecording } = useSpeechRecognition();
  const { feedback, isLoading, error, getFeedback } = useFeedback();

  const handleNextSentence = () => {
    const currentIndex = todaySentences.findIndex(s => s.id === currentSentence.id);
    const nextIndex = (currentIndex + 1) % todaySentences.length;
    setCurrentSentence(todaySentences[nextIndex]);
  };

  const handleGetFeedback = async () => {
    if (!recordingState.audioBlob) {
      alert('먼저 음성을 녹음해주세요.');
      return;
    }

    try {
      await getFeedback(currentSentence.text, recordingState.audioBlob);
    } catch (error) {
      console.error('Error getting feedback:', error);
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">매일 영어 말하기 연습</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">오늘의 문장</h2>
          <p className="text-lg mb-2">{currentSentence.text}</p>
          <p className="text-gray-600 mb-4">{currentSentence.translation}</p>
          
          <div className="space-y-4">
            <div className="flex gap-4">
              <button
                onClick={recordingState.isRecording ? stopRecording : startRecording}
                className={`flex-1 py-2 px-4 rounded-md ${
                  recordingState.isRecording
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-blue-500 hover:bg-blue-600'
                } text-white transition-colors`}
              >
                {recordingState.isRecording ? '녹음 중지' : '녹음 시작'}
              </button>

              {recordingState.audioUrl && (
                <button
                  onClick={() => {
                    const audio = document.querySelector('audio');
                    if (audio) {
                      audio.currentTime = 0;
                      audio.play();
                    }
                  }}
                  className="flex-1 py-2 px-4 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors"
                >
                  녹음 듣기
                </button>
              )}
            </div>

            {recordingState.audioUrl && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-700">녹음된 음성</h3>
                </div>
                <audio
                  src={recordingState.audioUrl}
                  controls
                  className="w-full rounded-lg shadow-sm"
                  controlsList="nodownload"
                />
              </div>
            )}

            <button
              onClick={handleGetFeedback}
              disabled={isLoading || !recordingState.audioBlob}
              className="w-full py-2 px-4 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors disabled:bg-gray-400"
            >
              {isLoading ? '피드백 받는 중...' : '피드백 받기'}
            </button>

            {feedback && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <h3 className="font-semibold mb-4 text-lg">피드백</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">발음</h4>
                    <p className="text-gray-600">{feedback.pronunciation}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">유창성</h4>
                    <p className="text-gray-600">{feedback.fluency}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">종합 평가</h4>
                    <p className="text-gray-600">{feedback.overall}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">개선점</h4>
                    <p className="text-gray-600">{feedback.suggestions}</p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-md">
                {error}
              </div>
            )}

            <button
              onClick={handleNextSentence}
              className="w-full py-2 px-4 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors"
            >
              다음 문장
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
