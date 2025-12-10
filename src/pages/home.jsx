// At the top, keep all your imports exactly the same
import React, { useState, useEffect } from "react";
import "../styles/Home.css";
import { FaStar, FaBrain, FaUsers, FaCog, FaBell, FaBars } from "react-icons/fa";
import logo from "../assets/logo.png";

import { auth, loginWithGoogle, logout } from "../firebase";
import NoteVerse from "../games/noteverse/noteverse"; 
import ReviewHub from "../games/reviewhub/reviewhub"; 
import CollabEDU from "../games/collabedu/collabedu"; // <-- NEW IMPORT

// Keep ToolCard exactly as-is
const ToolCard = ({ title, subtitle, buttonText, buttonClass, onAction, icon, iconClass = '' }) => (
  <div className="tool-card">
    <div className={`card-icon ${iconClass}`}>{icon}</div>
    <h3 className="card-title">{title}</h3>
    <p className="card-subtitle">{subtitle}</p>
    <button className={`card-button ${buttonClass}`} onClick={onAction}>
      {buttonText}
    </button>
  </div>
);

const Home = () => {
  const [user, setUser] = useState(null);
  const [currentGame, setCurrentGame] = useState(null); // <-- tracks which game to show

  // Keep auth logic exactly as-is
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  // Launch functions
  const launchNoteVerse = () => {
    if (!user) {
      alert("Please sign in first!");
      return;
    }
    setCurrentGame("NoteVerse");
  };

  const launchReviewHub = () => {
    if (!user) {
      alert("Please sign in first!");
      return;
    }
    setCurrentGame("ReviewHub");
  };

  const launchCollabEDU = () => {
    if (!user) {
      alert("Please sign in first!");
      return;
    }
    setCurrentGame("CollabEDU");
  };

  // Render selected screen
  if (currentGame === "NoteVerse") {
    return <NoteVerse user={user} onBack={() => setCurrentGame(null)} />;
  }

  if (currentGame === "ReviewHub") {
    return <ReviewHub user={user} onBack={() => setCurrentGame(null)} />;
  }

  if (currentGame === "CollabEDU") {
    return <CollabEDU user={user} onBack={() => setCurrentGame(null)} />;
  }

  // Home screen
  return (
    <div className="home-container">
      {/* Navigation Bar */}
      <header className="navbar">
        <div className="navbar-inner">
          <div className="logo">
            <img src={logo} alt="Uni-Prep Logo" className="logo-img" />
            <span className="logo-text">Uni-Prep</span>
          </div>

          <div className="nav-icons">
            {!user && (
              <button className="google-login-btn" onClick={loginWithGoogle}>
                Sign in with Google
              </button>
            )}

            {user && (
              <>
                <img src={user.photoURL} alt="User" className="user-avatar" />
                <span className="user-name">{user.displayName}</span>
                <button className="logout-btn" onClick={logout}>
                  Logout
                </button>
              </>
            )}

            <span className="icon"><FaCog /></span>
            <span className="icon"><FaBell /></span>
            <span className="icon"><FaBars /></span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <h1 className="welcome-message">
          {user ? `Hi ${user.displayName.split(" ")[0]}! Let's get to work.` : "Welcome! Please sign in."}
        </h1>
        <p className="instruction-text">Select a tool to begin your academic session.</p>

        <div className="tools-grid">
          <ToolCard
            title="NoteVerse"
            subtitle="Gamified Study & Lecture Notes Exchange"
            buttonText="Launch NoteVerse"
            buttonClass="btn-noteverse"
            onAction={launchNoteVerse}
            icon={<FaStar />}
            iconClass="image-background-icon card-icon-noteverse"
          />

          <ToolCard
            title="ReviewHub"
            subtitle="Board Exam Preparation & Progress Tracker"
            buttonText="Start ReviewHub"
            buttonClass="btn-reviewhub"
            onAction={launchReviewHub}
            icon={<FaBrain />}
            iconClass="image-background-icon card-icon-reviewhub"
          />

          <ToolCard
            title="CollabEDU"
            subtitle="Academic Group Project Management"
            buttonText="Open CollabEDU"
            buttonClass="btn-collabedu"
            onAction={launchCollabEDU}
            icon={<FaUsers />}
            iconClass="image-background-icon card-icon-collabedu"
          />
        </div>
      </main>
    </div>
  );
};

export default Home;
