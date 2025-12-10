// src/CollabEDU/CollabEDU.jsx
import React, { useState, useEffect, useRef } from "react";
import "./collabedu.css";
import GroupVideoChat from "./GroupVideoChat"; // use standalone Agora video component
import {
  syncUser,
  fetchGroups,
  fetchGroupData,
  createGroup,
  addTask,
  toggleTaskCompletion,
  sendMessage,
  inviteUserByEmail,
  inviteUserByUid,
  uploadFile,
  deleteGroup,
} from "./collabApi";
import Call from "./Call"; 

const CollabEDU = ({ user, onBack }) => {
  const [groups, setGroups] = useState([]);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [tasks, setTasks] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]); // uploaded files state
  const [newMessage, setNewMessage] = useState("");
  const [file, setFile] = useState(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteUid, setInviteUid] = useState("");
  const [isInvitePanelOpen, setIsInvitePanelOpen] = useState(false);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false); // call modal state
  const chatEndRef = useRef(null);

  // Auto-scroll chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  // Sync user & fetch groups
  useEffect(() => {
    if (user) {
      syncUser(user).then(() => fetchGroups(user.uid).then(setGroups));
    }
  }, [user]);

  // Fetch group data including tasks, chat, files
  useEffect(() => {
    if (currentGroup?._id) {
      fetchGroupData(currentGroup._id).then(({ group, tasks, chat, files }) => {
        setCurrentGroup(group);
        setTasks(tasks);
        setChatMessages(chat);
        setUploadedFiles(files || []);
      });
    }
  }, [currentGroup?._id]);

  // --- Handlers ---
  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    const newGroup = await createGroup(newGroupName, user.uid);
    if (newGroup) {
      setGroups((prev) => [...prev, newGroup]);
      setNewGroupName("");
    }
  };

  const handleAddTask = async () => {
    const title = prompt("Task title:");
    const dueDate = prompt("Due date (YYYY-MM-DD):");
    if (!title || !dueDate) return;
    const newTask = await addTask(currentGroup._id, title, dueDate, user.uid);
    if (newTask) setTasks((prev) => [...prev, newTask]);
  };

  const handleToggleTask = async (taskId, completed) => {
    await toggleTaskCompletion(currentGroup._id, taskId, completed);
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, completed: !completed } : t))
    );
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    const msg = await sendMessage(currentGroup._id, user.uid, newMessage);
    if (msg) {
      setChatMessages((prev) => [...prev, msg]);
      setNewMessage("");
    }
  };

  const handleInviteEmail = async () => {
    if (!inviteEmail.trim()) return;
    const data = await inviteUserByEmail(currentGroup._id, inviteEmail);
    if (data?.success && data.group) {
      setInviteEmail("");
      setIsInvitePanelOpen(false);
      setCurrentGroup(data.group);
      const groupData = await fetchGroupData(data.group._id);
      setTasks(groupData.tasks);
      setChatMessages(groupData.chat);
      setUploadedFiles(groupData.files || []);
    }
  };

  const handleInviteUid = async () => {
    if (!inviteUid.trim()) return;
    const data = await inviteUserByUid(currentGroup._id, inviteUid);
    if (data?.success && data.group) {
      setInviteUid("");
      setIsInvitePanelOpen(false);
      setCurrentGroup(data.group);
      const groupData = await fetchGroupData(data.group._id);
      setTasks(groupData.tasks);
      setChatMessages(groupData.chat);
      setUploadedFiles(groupData.files || []);
    }
  };

  const handleFileUpload = async () => {
    if (!file) return console.warn("Select a file first!");
    const uploaded = await uploadFile(currentGroup._id, file);
    if (uploaded?.url) {
      setUploadedFiles((prev) => [
        ...prev,
        {
          name: uploaded.originalName || uploaded.fileName,
          url: uploaded.url
        }
      ]);
      
    }
    setFile(null);
  };


  const handleDeleteGroup = async () => {
    if (!window.confirm("Are you sure you want to delete this group? This cannot be undone.")) return;
    const data = await deleteGroup(currentGroup._id, user.uid);
    if (data?.success) {
      setGroups((prev) => prev.filter((g) => g._id !== currentGroup._id));
      setCurrentGroup(null);
    } else {
      alert(data?.error || "Failed to delete group.");
    }
  };

  if (!user) return <p>Please log in to continue.</p>;
if (!currentGroup) {
  return (
    <div className="collabedu-page">
      <button className="back-btn" onClick={onBack}>⬅ Back Home</button>

      <div className="groups-container">
        {/* Two-Column Grid */}
        <div className="main-grid">

          {/* ===== LEFT COLUMN: PROFILE CARD ===== */}
          <div className="collabedu-left-sidebar">
            <div className="profile-card">
              
              {/* Profile Avatar/Initial */}
              {user.photoURL ? (
                <img className="user-avatar" alt="User Avatar" src={user.photoURL} />
              ) : (
                <div className="user-initial-avatar">
                  {user.displayName ? user.displayName[0].toUpperCase() : 'G'}
                </div>
              )}

              <div className="user-details">
                <h2 className="user-name">{user.displayName || 'John Doe'}</h2>
                <p className="user-email">{user.email || 'john.doe@email.com'}</p>
                <p className="user-uid">UID: {user.uid || '1234567890'}</p>
              </div>
            </div>
          </div>

          {/* ===== RIGHT COLUMN: CREATE GROUP + GROUP LIST ===== */}
          <div className="right-panel">
            {/* CREATE GROUP SECTION */}
            <div className="create-group-controls">
              <input
                  type="text"
                  placeholder="New group name"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  onKeyPress={(e) => {
                      if (e.key === 'Enter') handleCreateGroup();
                  }}
              />
              <button onClick={handleCreateGroup}>Create</button>
        </div>

            {/* GROUP LIST TITLE */}
            <h2 className="group-list-title">Group List</h2>

            {/* GROUP LIST */}
            <div className="groups-list">
              {groups.length === 0 ? (
                <p className="empty-state">No groups yet. Create one to get started!</p>
              ) : (
                groups.map((g) => (
                  <div
                    key={g._id}
                    className="group-card-screenshot"
                    onClick={() => setCurrentGroup(g)}
                  >
                    <div className="group-card-content">
                      <span className="group-members-icon">👥</span>
                      <div className="group-details-text">
                        <h3 className="group-card-name">{g.name}</h3>
                        <p className="group-card-count">({g.members?.length || 0} members)</p>
                      </div>
                      <span className="group-card-menu">...</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}


  return (
    <div className="collabedu-page">
      <button className="back-btn" onClick={() => setCurrentGroup(null)}>⬅ Back to Groups</button>
      <h2 className="group-name-header">{currentGroup.name}</h2>
      <div className="group-dashboard-layout">
        {/* LEFT PANEL */}
          <div className="group-left-panel">
            <h4>Members</h4>
            <div className="member-list">
              {currentGroup.members?.map((member) => (
                <div key={member.uid} className="member-item">
                  <img
                    src={member.photoURL || "/default-avatar.png"}
                    alt={member.displayName || "User Avatar"}
                    className="member-avatar"
                  />
                  <span className="member-name">
                    {member.displayName || "Unknown User"}{" "}
                    {member.uid === user.uid && " (You)"}
                  </span>
                </div>
              ))}
            </div>
            <div className="invite-section">
              <button onClick={() => setIsInvitePanelOpen(true)}>+ Invite Members</button>
              {/* Delete Group button moved here */}
              {currentGroup.leaderUid === user.uid && (
                <button 
                  className="delete-group-btn"
                  onClick={handleDeleteGroup}
                  style={{ marginTop: "10px", backgroundColor: "#ff4d4f", color: "#fff" }}
                >
                  🗑 Delete Group
                </button>
              )}
            </div>
          </div>


        {/* MIDDLE PANEL */}
        <div className="group-middle-panel">
          {currentGroup.leaderUid === user.uid && (
            <div style={{ marginBottom: "10px" }}>
            </div>
          )}
          <div className="tasks-section">
            <h3>Tasks <button onClick={handleAddTask}>+ Add Task</button></h3>
            {tasks.length === 0 ? (
              <p>No tasks yet.</p>
            ) : (
              tasks.map((t) => (
                <div key={t._id} className={`task-card ${t.completed ? "completed" : ""}`}>
                  <h4>{t.title}</h4>
                  <p>Due: {t.dueDate}</p>
                  <p>Assigned: {t.assignedUid === user.uid ? "You" : "Member"}</p>
                  <button 
                    className="task-action-btn" // <-- ADD THIS CLASS
                    onClick={() => handleToggleTask(t._id, t.completed)}
                  >
                    {t.completed ? "Mark Incomplete" : "Mark Complete"}
                  </button>
                </div>
              ))
            )}
          </div>

          {/* FILE UPLOAD SECTION */}
          <div className="file-upload-section">
            <h4>File Upload</h4>
            <div className="file-upload-controls">
              <label htmlFor="file-upload-input">{file ? file.name : "Choose File"}</label>
              <input
                id="file-upload-input"
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
              />
              <button onClick={handleFileUpload}>Upload File</button>
            </div>
            {uploadedFiles.length > 0 && (
              <div className="uploaded-files-list">
                <h5>Uploaded Files:</h5>
                <ul>
                  {uploadedFiles.map((f, i) => (
                    <li key={i}>
                    <a href={f.url} target="_blank" rel="noopener noreferrer">
                      {f.originalName || f.fileName}
                    </a>
                  </li>
                  
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL - CHAT */}
        <div className="group-right-panel">
          <div className="chat-section">
            <h3>
              Group Chat
              <button
                onClick={() => setIsCallModalOpen(true)}
                style={{ marginLeft: "10px", cursor: "pointer" }}
                title="Start Call"
              >
                📞
              </button>
            </h3>
            <div className="chat-box">
              <div className="chat-messages">
                {chatMessages.map((m) => (
                  <div
                    key={m._id}
                    className={`chat-message ${m.uid === user.uid ? "message-self" : "message-other"}`}
                  >
                    <strong>{m.userName || "Unknown User"}</strong> {m.content}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <div className="chat-input-area">
                <input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                />
                {/* START: Updated Button to use the sharp black right pointer icon */}
                <button onClick={handleSendMessage}>&#9658;</button>
                {/* END: Updated Button */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invite Panel */}
      {isInvitePanelOpen && (
        <div className="invite-modal-overlay">
          <div className="invite-panel-popup">
            <button className="close-btn" onClick={() => setIsInvitePanelOpen(false)}>×</button>
            <div className="invite-content-wrapper">
              <h4>Invite Members</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <h5>By Email</h5>
                <input
                  type="email"
                  placeholder="Enter member email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
                <button onClick={handleInviteEmail}>Send Email Invite</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <h5>By User ID (UID)</h5>
                <input
                  type="text"
                  placeholder="Enter member UID"
                  value={inviteUid}
                  onChange={(e) => setInviteUid(e.target.value)}
                />
                <button onClick={handleInviteUid}>Add by UID</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Call Modal */}
      {isCallModalOpen && (
        <Call
          channelName={currentGroup._id}
          userId={user.uid}
          onClose={() => setIsCallModalOpen(false)}
        />
      )}
    </div>
  );
};

export default CollabEDU;