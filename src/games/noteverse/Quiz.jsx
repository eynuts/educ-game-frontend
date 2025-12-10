import React, { useState } from "react";
import { 
  FaStar, FaQuestionCircle, FaBook, FaSpinner, 
  FaCheck, FaTimes, FaTrophy 
} from "react-icons/fa";
import Flashcard from "./Flashcard"; // Import Flashcard component
import "./Quiz.css";

const Quiz = ({ selectedFile, activityType, setActivityType }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);

  // ⭐ RESULT MODAL STATE
  const [showResultModal, setShowResultModal] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  // ⭐ FLASHCARD MODAL STATE
  const [showFlashcards, setShowFlashcards] = useState(false);

  // ⭐ Reset quiz state
  const handleBackToStart = () => {
    setShowResultModal(false);
    setQuiz(null);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedOption(null);
  };

  const handleGenerate = async () => {
    if (!selectedFile) return;

    setIsGenerating(true);
    setQuiz(null);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedOption(null);
    setShowResultModal(false);
    setShowFlashcards(false);

    try {
      const res = await fetch("https://educ-game.onrender.com/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId: selectedFile._id, type: activityType }),
      });

      const data = await res.json();

      if (data.content && data.content.length > 0) {
        if (activityType === "Flashcards") {
          // Normalize flashcards for display
          const normalizedFlashcards = data.content.map(item => ({
            question: item.term || "",
            answer: item.definition || ""
          }));
          setQuiz(normalizedFlashcards);
          setShowFlashcards(true);
        } else {
          // Quiz data stays the same
          setQuiz(data.content);
        }
      } else {
        alert("The AI could not generate content from this text. Please try a different file.");
      }
    } catch (err) {
      console.error("Error generating content:", err);
      alert("Failed to generate content");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswer = (option) => {
    if (selectedOption) return;
    setSelectedOption(option);

    if (!quiz || !quiz[currentQuestionIndex]) return;

    const isCorrect = option === quiz[currentQuestionIndex].correct_answer;
    if (isCorrect) setScore(prev => prev + 1);

    setTimeout(() => {
      if (currentQuestionIndex < quiz.length - 1) {
        setCurrentQuestionIndex(i => i + 1);
        setSelectedOption(null);
      } else {
        // ⭐ SHOW RESULT MODAL
        const final = score + (isCorrect ? 1 : 0);
        setFinalScore(final);
        setShowResultModal(true);

        // Reset quiz (but keep modal open)
        setQuiz(null);
        setCurrentQuestionIndex(0);
        setScore(0);
        setSelectedOption(null);
      }
    }, 1200);
  };

  const currentQuestion = quiz && quiz[currentQuestionIndex];

  return (
    <div className="learning-tab learning-tab-grid">

      {/* ⭐ FLASHCARD MODAL */}
      {showFlashcards && quiz && (
        <Flashcard flashcards={quiz} onClose={() => setShowFlashcards(false)} />
      )}

      {/* ⭐ RESULT MODAL */}
      {showResultModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <FaTrophy size={40} color="#f1c40f" />
            <h2>Quiz Completed!</h2>
            <p style={{ fontSize: "1.2rem", marginTop: "10px" }}>
              Final Score: <strong>{finalScore}</strong> / {5}
            </p>
            <button className="modal-back-btn" onClick={handleBackToStart}>
              Back
            </button>
          </div>
        </div>
      )}

      {/* LEFT PANEL */}
      <div className="learning-selector-panel card-panel">
        <h2><FaStar className="star-icon" /> Start Smart Learning</h2>

        <div className="file-selection-area section-separator">
          <h4>1. Select Source Material:</h4>
          <div className={`selection-display ${!selectedFile ? "placeholder-box" : ""}`}>
            {selectedFile ? (
              <p className="selected-file-name">
                <strong>Source:</strong> {selectedFile.title} ({selectedFile.fileName})
              </p>
            ) : (
              <p className="placeholder-text">
                No file selected. Go to <strong>Notes</strong> and click the "Learn with AI" button.
              </p>
            )}
          </div>
        </div>

        <div className="activity-generator-area section-separator">
          <h4>2. Choose Activity Type:</h4>
          <div className="radio-group">
            <label className={`radio-label ${activityType === "Quiz" ? "selected" : ""}`}>
              <input
                type="radio"
                value="Quiz"
                checked={activityType === "Quiz"}
                onChange={(e) => setActivityType(e.target.value)}
              />
              <FaQuestionCircle /> Quiz
            </label>

            <label className={`radio-label ${activityType === "Flashcards" ? "selected" : ""}`}>
              <input
                type="radio"
                value="Flashcards"
                checked={activityType === "Flashcards"}
                onChange={(e) => setActivityType(e.target.value)}
              />
              <FaBook /> Flashcards
            </label>
          </div>

          <button
            className="generate-btn primary-btn"
            onClick={handleGenerate}
            disabled={!selectedFile || isGenerating}
          >
            {isGenerating ? (
              <>
                <FaSpinner className="spin" /> Generating...
              </>
            ) : (
              `Generate ${activityType}`
            )}
          </button>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="generated-content-display card-panel">
        {isGenerating ? (
          <div className="loading-state" style={{ textAlign: "center", padding: "40px" }}>
            <FaSpinner className="spin" size={30} />
            <p>Creating your {activityType.toLowerCase()}...</p>
          </div>
        ) : activityType === "Quiz" && quiz && currentQuestion ? (
          <div>
            {/* Header */}
            <div className="quiz-header" style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
              <h4 className="generated-title">
                Question {currentQuestionIndex + 1} / {quiz.length}
              </h4>
              <div className="live-score" style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <FaTrophy color="#f1c40f" />
                <span>Score: {score}</span>
              </div>
            </div>

            {/* Question */}
            <p style={{ marginBottom: "20px", fontWeight: "600", fontSize: "1.1rem" }}>
              {currentQuestion.question}
            </p>

            {/* Options */}
            <div className="quiz-options">
              {currentQuestion.options.map((opt, i) => {
                let className = "primary-btn quiz-option-btn";
                if (selectedOption) {
                  if (opt === currentQuestion.correct_answer) className += " correct";
                  else if (opt === selectedOption) className += " wrong";
                  else className += " faded";
                }

                return (
                  <button key={i} className={className} onClick={() => handleAnswer(opt)}>
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* Feedback */}
            {selectedOption && (
              <div className="feedback-indicator" style={{ marginTop: "20px", textAlign: "center", fontWeight: "bold" }}>
                {selectedOption === currentQuestion.correct_answer ? (
                  <>
                    <FaCheck /> Correct!
                  </>
                ) : (
                  <>
                    <FaTimes /> Incorrect. Answer: {currentQuestion.correct_answer}
                  </>
                )}
              </div>
            )}
          </div>
        ) : activityType === "Quiz" ? (
          <p className="placeholder-text">Click “Generate Quiz” to start.</p>
        ) : null /* Flashcards are handled by Flashcard modal */}
      </div>
    </div>
  );
};

export default Quiz;
