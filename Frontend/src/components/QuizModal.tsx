'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { useGameSounds } from '@/hooks/useGameSounds';

export function QuizModal() {
  const {
    showQuiz,
    currentQuestion,
    setShowQuiz,
    setQuizAnswer,
    updateScore,
    completeStage,
    currentStage,
    setGameOver,
    score,
    sessionCoins
  } = useGameStore();
  const { playSound } = useGameSounds();
  
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    if (showQuiz && currentQuestion) {
      setTimeLeft(currentQuestion.timeLimit);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  }, [showQuiz, currentQuestion]);

  useEffect(() => {
    if (!showQuiz || !currentQuestion) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showQuiz, currentQuestion]);

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmit = () => {
    if (!currentQuestion || selectedAnswer === null) return;

    const correct = selectedAnswer === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);

    // Play SFX for result
    playSound(correct ? 'answerCorrect' : 'answerWrong');

    if (correct) {
      updateScore(currentQuestion.points);
      setQuizAnswer(currentQuestion.id, selectedAnswer);
    }

    // Auto-close after showing result
    setTimeout(() => {
      if (correct) {
        // Correct answer - trigger stage completion game over modal (user will choose to save)
        setGameOver('completed', score + currentQuestion.points, sessionCoins);
      } else {
        // Wrong answer - trigger game over
        setGameOver('question', score, sessionCoins);
      }
      setShowQuiz(false);
    }, 2000);
  };

  if (!showQuiz || !currentQuestion) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 md:p-8 max-w-2xl w-full mx-2 sm:mx-4 border-4 border-black shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-black">🧠 Knowledge Wall</h2>
          <div className="flex items-center space-x-1 sm:space-x-2 bg-red-100 p-1.5 sm:p-2 rounded border-2 border-red-500">
            <Clock className="w-4 h-4 sm:w-6 sm:h-6 text-red-600" />
            <span className="text-base sm:text-xl font-bold text-red-600">{timeLeft}s</span>
          </div>
        </div>

        {/* Question */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <h3 className="text-base sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6 text-black bg-blue-50 p-3 sm:p-4 rounded border-2 border-blue-300">{currentQuestion.question}</h3>
          
          {/* Answer Options */}
          <div className="space-y-2 sm:space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={showResult}
                className={`w-full p-2.5 sm:p-3 md:p-4 text-left rounded-lg border-3 transition-all text-sm sm:text-base md:text-lg font-semibold ${
                  selectedAnswer === index
                    ? 'border-blue-500 bg-blue-100 text-blue-900'
                    : 'border-gray-400 hover:border-gray-600 bg-gray-50 text-black hover:bg-gray-100'
                } ${
                  showResult
                    ? index === currentQuestion.correctAnswer
                      ? 'border-green-500 bg-green-100 text-green-900'
                      : selectedAnswer === index
                      ? 'border-red-500 bg-red-100 text-red-900'
                      : 'border-gray-300 bg-gray-100 text-gray-600'
                    : ''
                }`}
              >
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedAnswer === index
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  } ${
                    showResult && index === currentQuestion.correctAnswer
                      ? 'border-green-500 bg-green-500'
                      : ''
                  }`}>
                    {selectedAnswer === index && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <span className="text-sm sm:text-base md:text-lg font-medium text-black">{option}</span>
                  {showResult && index === currentQuestion.correctAnswer && (
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 ml-auto" />
                  )}
                  {showResult && selectedAnswer === index && index !== currentQuestion.correctAnswer && (
                    <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 ml-auto" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Result */}
        {showResult && (
          <div className={`p-3 sm:p-4 rounded-lg mb-3 sm:mb-4 ${
            isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center space-x-2">
              {isCorrect ? (
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
              )}
              <span className={`text-sm sm:text-base font-semibold ${
                isCorrect ? 'text-green-800' : 'text-red-800'
              }`}>
                {isCorrect ? 'Correct! Well done!' : 'Incorrect. Try again!'}
              </span>
            </div>
            {isCorrect && (
              <p className="text-green-700 mt-2 text-sm sm:text-base">
                You earned {currentQuestion.points} points!
              </p>
            )}
          </div>
        )}

        {/* Submit Button */}
        {!showResult && (
          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={selectedAnswer === null}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg transition-colors text-sm sm:text-base"
            >
              Submit Answer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
