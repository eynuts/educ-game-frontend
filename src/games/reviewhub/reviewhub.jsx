import React, { useState, useEffect } from "react";
import "./reviewhub.css";
import {
  ArrowLeftIcon,
  TrophyIcon,
  BookOpenIcon,
  PlusCircleIcon,
  UserCircleIcon,
} from "@heroicons/react/24/solid";
import QuizModal from "./QuizModal";
import AllModulesModal from "./AllModulesModal";

const ReviewHub = ({ onBack, user, logout }) => {
  const [examPreference, setExamPreference] = useState("Civil Engineering");
  const [editing, setEditing] = useState(false);
  const [currentTopic, setCurrentTopic] = useState(null);
  const [loading, setLoading] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [averageScores, setAverageScores] = useState({});
  const [showAllModules, setShowAllModules] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    topicsCompleted: 0,
    totalTopics: 0,
    questionsAnswered: 0,
  });

  const examSubjects = {
    "Civil Engineering": "Civil Engineering -",
    Nursing: "Nursing -",
    Accountancy: "Accountancy -",
    Education: "Education -",
  };

  const examTopics = {
    "Civil Engineering": [
      { id: 1, title: "Mathematics, Surveying & Transportation Engineering", description: "Engineering math, plane surveying, route surveying, transportation engineering." },
      { id: 2, title: "Hydraulics & Geotechnical Engineering", description: "Fluid mechanics, hydraulics, soil mechanics, foundations, stability." },
      { id: 3, title: "Structural Engineering & Construction Management", description: "Strength of materials, structural analysis, design, project management." },
    ],
    Nursing: [
      { id: 1, title: "Anatomy & Physiology", description: "Human body structure and function." },
      { id: 2, title: "Pharmacology", description: "Drugs and their effects." },
      { id: 3, title: "Medical-Surgical Nursing", description: "Care of patients with medical and surgical conditions." },
    ],
    Accountancy: [
      { id: 1, title: "Financial Accounting", description: "Accounting principles and financial statements." },
      { id: 2, title: "Management Accounting", description: "Costing, budgeting, and decision-making." },
    ],
    Education: [
      { id: 1, title: "Educational Psychology", description: "Learning theories and development." },
      { id: 2, title: "Curriculum Development", description: "Designing effective lesson plans." },
    ],
  };

  const fetchAverageScore = async (exam, topicId) => {
    try {
      const res = await fetch(`http://educ-game.onrender.com/api/reviewhub/average-score?exam=${encodeURIComponent(exam)}&topicId=${topicId}`);
      const data = await res.json();
      return data.average || 0;
    } catch (err) {
      console.error("Failed to fetch average score:", err);
      return 0;
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const res = await fetch(`http://educ-game.onrender.com/api/reviewhub/dashboard-stats?exam=${encodeURIComponent(examPreference)}`);
      const data = await res.json();
      setDashboardStats({
        topicsCompleted: data.topicsCompleted || 0,
        totalTopics: data.totalTopics || 0,
        questionsAnswered: data.questionsAnswered || 0,
      });
    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err);
    }
  };

  const generateQuiz = async (topic) => {
    setLoading(true);
    setCurrentTopic(topic);
    try {
      const response = await fetch("http://educ-game.onrender.com/api/reviewhub/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: `${examSubjects[examPreference] || ""} ${topic.title}`,
          count: 10,
        }),
      });
      const data = await response.json();
      setQuizData({ questions: Array.isArray(data.questions) ? data.questions : [], raw: data });
      setShowQuizModal(true);
    } catch (error) {
      console.error("QUIZ API ERROR:", error);
      setQuizData({ questions: [], error: "Failed to generate quiz. Check backend." });
      setShowQuizModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleQuizFinish = async (score, maxScore) => {
    if (!currentTopic) return;
    try {
      await fetch("http://educ-game.onrender.com/api/reviewhub/save-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exam: examPreference,
          topicId: currentTopic.id,
          score,
          maxScore,
        }),
      });
      const newAverage = await fetchAverageScore(examPreference, currentTopic.id);
      setAverageScores((prev) => ({ ...prev, [currentTopic.id]: newAverage }));
      fetchDashboardStats();
    } catch (err) {
      console.error("Failed to save score:", err);
    }
  };

  const handleSavePreference = () => {
    setEditing(false);
    fetchDashboardStats();
  };

  useEffect(() => {
    const loadAverages = async () => {
      const topics = examTopics[examPreference] || [];
      const newAverages = {};
      for (const topic of topics) {
        const avg = await fetchAverageScore(examPreference, topic.id);
        newAverages[topic.id] = avg;
      }
      setAverageScores(newAverages);
      fetchDashboardStats();
    };
    loadAverages();
  }, [examPreference]);

  // --- TOPIC DETAIL VIEW ---
  if (currentTopic) {
    return (
      <div className="modern-reviewhub-page topic-detail-view">
        <header className="modern-header">
          <button className="back-btn-modern" onClick={() => setCurrentTopic(null)}>
            <ArrowLeftIcon className="icon-sm" /> Back to Dashboard
          </button>
          <h1 className="header-title">{currentTopic.title}</h1>
        </header>
        <main className="topic-content">
          <p className="topic-description-modern">{currentTopic.description}</p>
          <button
            className={`main-action-btn ${loading ? "disabled-btn" : ""}`}
            disabled={loading}
            onClick={() => generateQuiz(currentTopic)}
          >
            {loading ? "Generating..." : "Generate Board Exam Questions"}
          </button>
        </main>
        <QuizModal
          quizData={quizData}
          visible={showQuizModal}
          onClose={() => setShowQuizModal(false)}
          onFinish={handleQuizFinish}
        />
      </div>
    );
  }

  // --- DASHBOARD ---
  return (
    <div className="modern-reviewhub-page dashboard-view">
      <header className="modern-header">
        <button className="back-btn-modern" onClick={onBack}>
          <ArrowLeftIcon className="icon-sm" /> Home
        </button>
        <h1 className="header-title">ReviewHub Dashboard</h1>
      </header>

      <main className="dashboard-layout">
        {!user ? (
          <div className="login-section-modern">
            <UserCircleIcon className="stat-icon color-blue" style={{ width: "40px", height: "40px" }} />
            <p>Please sign in to access ReviewHub.</p>
          </div>
        ) : (
          <>
            <div className="modern-profile-card">
              <div className="profile-header-modern">
                <img src={user.photoURL} alt="User Avatar" className="user-avatar-modern" />
                <h2>{user.displayName}</h2>
                <p className="user-email">{user.email}</p>
              </div>

              {editing ? (
                <div className="exam-pref-edit-modern">
                  <label>Select Board Exam:</label>
                  <select value={examPreference} onChange={(e) => setExamPreference(e.target.value)}>
                    <option value="Nursing">Nursing</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                    <option value="Accountancy">Accountancy</option>
                    <option value="Education">Education</option>
                  </select>
                  <div className="action-buttons-group">
                    <button className="save-btn" onClick={handleSavePreference}>Save</button>
                    <button className="cancel-btn" onClick={() => setEditing(false)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="exam-pref-display-modern">
                  <p className="exam-label">Target Exam:</p>
                  <p className="exam-value">{examPreference}</p>
                  <button className="edit-btn" onClick={() => setEditing(true)}>Change</button>
                </div>
              )}

              <button className="logout-btn-modern" onClick={logout}>Logout</button>
            </div>

            <section className="dashboard-main-content">
              {/* --- UPDATED STAT CARDS --- */}
              <div className="stat-cards-container updated-dashboard-cards">
                <div className="modern-stat-card stat-card-primary">
                  <BookOpenIcon className="stat-icon color-blue" />
                  <div className="stat-content">
                    <h4>Topics Completed</h4>
                    <p className="stat-number">{dashboardStats.topicsCompleted} / {dashboardStats.totalTopics}</p>
                  </div>
                </div>

                <div className="modern-stat-card stat-card-secondary">
                  <BookOpenIcon className="stat-icon color-orange" />
                  <div className="stat-content">
                    <h4>Questions Answered</h4>
                    <p className="stat-number">{dashboardStats.questionsAnswered}</p>
                  </div>
                </div>

                <div className="modern-stat-card stat-card-success">
                  <TrophyIcon className="stat-icon color-green" />
                  <div className="stat-content">
                    <h4>Average Score</h4>
                    <p className="stat-number">
                      {Math.round(
                        Object.values(averageScores).reduce((acc, val) => acc + val, 0) /
                        (Object.values(averageScores).length || 1)
                      )}%
                    </p>
                  </div>
                </div>
              </div>

              <h2 className="section-title-alt">Review Modules</h2>

              <div className="modern-topics-grid">
                {(examTopics[examPreference] || []).map((topic) => {
                  const averageScore = averageScores[topic.id] || 0;
                  return (
                    <div key={topic.id} className="topic-card-modern" onClick={() => setCurrentTopic(topic)}>
                      <div className="card-header">
                        <h4>{topic.title}</h4>
                        <span className="topic-progress-badge">{averageScore}%</span>
                      </div>
                      <p className="topic-description-modern">{topic.description}</p>
                      <div className="progress-bar-shell">
                        <div className="progress-bar-fill" style={{ width: `${averageScore}%` }}></div>
                      </div>
                    </div>
                  );
                })}

                <div className="topic-card-modern add-topic-card" onClick={() => setShowAllModules(true)}>
                  <PlusCircleIcon className="stat-icon" />
                  <p>Browse All Modules</p>
                </div>
              </div>

              <AllModulesModal
                visible={showAllModules}
                onClose={() => setShowAllModules(false)}
                topics={examTopics[examPreference] || []}
                averageScores={averageScores}
                exam={examPreference}
                onSelectTopic={(topic) => { setCurrentTopic(topic); setShowAllModules(false); }}
              />
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default ReviewHub;
