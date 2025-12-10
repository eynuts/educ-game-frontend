import React, { useState, useEffect } from "react";
import { FaTimes, FaChevronLeft, FaChevronRight, FaSyncAlt } from "react-icons/fa";
import "./Flashcard.css";

const Flashcard = ({ flashcards, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Reset flip state when card changes
  useEffect(() => {
    setIsFlipped(false);
  }, [currentIndex]);

  if (!flashcards || flashcards.length === 0) return null;

  const nextCard = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const currentCard = flashcards[currentIndex];
  const totalCards = flashcards.length;

  return (
    <div className="modal-overlay">
      <div className="modal-box flashcard-modal">
        {/* Header/Title and Close Button */}
        <div className="flashcard-header">
          <h2 className="flashcard-title">Flashcard Review</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close Flashcards">
            <FaTimes />
          </button>
        </div>

        {/* The Flashcard Container (Click to Flip) */}
        <div
          className={`flashcard-container ${isFlipped ? "flipped" : ""}`}
          onClick={() => setIsFlipped(!isFlipped)}
          role="button"
          tabIndex="0"
          aria-live="polite"
        >
          {/* Card Box with 3D Flip Effect */}
          <div className="flashcard-box">
            {/* FRONT: Question */}
            <div className="flashcard-face flashcard-front">
              <div className="face-label">Question</div>
              <p>{currentCard.question || "No question content"}</p>
              <div className="flip-indicator">
                <FaSyncAlt /> Tap to reveal answer
              </div>
            </div>

            {/* BACK: Answer / Correct Answer */}
            <div className="flashcard-face flashcard-back">
              <div className="face-label">Answer</div>
              <p>{currentCard.answer || currentCard.correct_answer || "No answer content"}</p>
            </div>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flashcard-controls">
          <button onClick={prevCard} disabled={currentIndex === 0} aria-label="Previous Card">
            <FaChevronLeft />
          </button>

          <span className="card-counter">
            Card <strong>{currentIndex + 1}</strong> of <strong>{totalCards}</strong>
          </span>

          <button onClick={nextCard} disabled={currentIndex === totalCards - 1} aria-label="Next Card">
            <FaChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;