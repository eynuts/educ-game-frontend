import React from "react";
import "./AllModulesModal.css";

const AllModulesModal = ({ visible, onClose, topics, averageScores, onSelectTopic }) => {
  if (!visible) return null;

  return (
    <div className="all-modules-modal-overlay">
      <div className="all-modules-modal">
        <h2>All Modules</h2>
        <button className="close-btn" onClick={onClose}>
          Close
        </button>
        <div className="all-modules-grid">
          {topics.map((topic) => {
            const averageScore = averageScores[topic.id] || 0;
            return (
              <div
                key={topic.id}
                className="topic-card-modern"
                onClick={() => onSelectTopic(topic)}
              >
                <div className="card-header">
                  <h4>{topic.title}</h4>
                  <span className="topic-progress-badge">{averageScore}%</span>
                </div>
                <p>{topic.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AllModulesModal;
