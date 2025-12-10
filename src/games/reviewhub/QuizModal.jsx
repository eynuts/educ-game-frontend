import React, { useState, useEffect } from "react";
import "./QuizModal.css";

const QuizModal = ({ quizData, visible, onClose, onFinish, exam, topicId }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const questions = Array.isArray(quizData?.questions) ? quizData.questions : [];
  const question = questions[currentIndex];

  // Reset state whenever quizData changes
  useEffect(() => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setFinished(false);
  }, [quizData]);

  // Handle when the quiz is finished
  useEffect(() => {
    const saveResult = async () => {
      if (finished && onFinish) {
        // Call parent callback for UI update
        onFinish(score, questions.length);

        // Save to backend
        if (exam && topicId) {
          try {
            await fetch("https://educ-game.onrender.com/api/reviewhub/save-score", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                exam,
                topicId,
                score,
                maxScore: questions.length,
              }),
            });
          } catch (err) {
            console.error("Failed to save quiz result:", err);
          }
        }
      }
    };

    saveResult();
  }, [finished, score, questions.length, onFinish, exam, topicId]);

  if (!visible) return null;

  if (!question) {
    return (
      <div className="quiz-modal-overlay">
        <div className="quiz-modal">
          <h2>No questions available.</h2>
          <button className="close-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  const handleSelect = (choice) => setSelectedAnswer(choice);

  const handleNext = () => {
    if (!selectedAnswer) return;

    if (selectedAnswer === question.answer) setScore((prev) => prev + 1);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
    } else {
      setFinished(true);
    }
  };

  return (
    <div className="quiz-modal-overlay">
      <div className="quiz-modal">
        {!finished ? (
          <>
            <h2>
              Question {currentIndex + 1} / {questions.length}
            </h2>
            <p className="quiz-question-text">{question.question}</p>

            <div className="quiz-options">
              {Object.entries(question.choices || {}).map(([key, value]) => (
                <button
                  key={key}
                  className={`quiz-option-btn ${selectedAnswer === key ? "selected" : ""}`}
                  onClick={() => handleSelect(key)}
                >
                  {key}: {value}
                </button>
              ))}
            </div>

            <button
              className={`next-btn ${!selectedAnswer ? "disabled-btn" : ""}`}
              disabled={!selectedAnswer}
              onClick={handleNext}
            >
              {currentIndex + 1 === questions.length ? "Finish Quiz" : "Next"}
            </button>

            <button className="close-btn" onClick={onClose}>Exit</button>
          </>
        ) : (
          <>
            <h2>Quiz Completed!</h2>
            <p className="score-text">
              You scored <strong>{score}</strong> / {questions.length}
            </p>
            <button className="close-btn" onClick={onClose}>Close</button>
          </>
        )}
      </div>
    </div>
  );
};

export default QuizModal;
