import React, { useState, useEffect } from "react";
import "./noteverse.css";
import { 
  FaBook, FaStar, FaUpload, FaSearch, FaThumbsUp, FaArrowRight, FaTrash, 
  FaSpinner, FaBookmark, FaRegBookmark, FaDownload, FaEllipsisV, FaBars
} from "react-icons/fa";
import Quiz from "./Quiz"; 

const BOOKMARK_KEY = "noteverse_bookmarks_v1";

// --- Post Card Component ---
const PostCard = ({ post, user, bookmarks, toggleBookmark, handleLike, handleDownload, handleDelete, handleSelectForLearning }) => {
  const [showMenu, setShowMenu] = useState(false);

  const formatDate = (iso) => {
    if (!iso) return "";
    try {
      const dt = new Date(iso);
      return dt.toLocaleDateString() + " " + dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  return (
    <div className="post-card">
      <div className="post-info">
        <h3 className="post-title">{post.title}</h3>
        <p className="post-description">{post.description}</p>
        <div className="post-meta">
          <span>{post.uploader}</span>
          <span>&middot;</span>
          <span>{post.fileName}</span>
          <span>&middot;</span>
          <span>{post.createdAt ? formatDate(post.createdAt) : "Just Now"}</span>
        </div>
      </div>
      <div className="post-actions">
        <button className="like-btn" onClick={() => handleLike(post._id)} title="Like this resource">
          <FaThumbsUp /> <span className="like-count">{(post.likes || 0)}</span>
        </button>
        <button className="bookmark-btn" onClick={() => toggleBookmark(post._id)} title="Toggle Bookmark">
          {bookmarks.includes(post._id) ? <FaBookmark className="bookmarked" /> : <FaRegBookmark />}
        </button>
        <button className="download-btn" onClick={() => handleDownload(post)} title="Download File">
          <FaDownload />
        </button>

        <div className="post-menu-container">
          <button className="menu-toggle-btn" onClick={() => setShowMenu(p => !p)} title="More Actions">
            <FaEllipsisV />
          </button>
          {showMenu && (
            <div className="post-menu">
              <button className="menu-item learn-item" onClick={() => handleSelectForLearning(post)}>
                Learn with AI <FaArrowRight />
              </button>
              {post.uploader === user.displayName && (
                <button className="menu-item delete-item" onClick={() => handleDelete(post._id)}>
                  <FaTrash /> Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Main NoteVerse Component ---
const NoteVerse = ({ user, onBack }) => {
  const [activeTab, setActiveTab] = useState("Notes");
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFileForActivity, setSelectedFileForActivity] = useState(null);
  const [activityType, setActivityType] = useState("Quiz");
  const [generatedContent, setGeneratedContent] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [sortMode, setSortMode] = useState("latest");
  const [showMyUploadsOnly, setShowMyUploadsOnly] = useState(false);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);

  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const raw = localStorage.getItem(BOOKMARK_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 6;

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchNotes = async () => {
    try {
      const res = await fetch("https://educ-game.onrender.com/api/notes");
      const data = await res.json();
      setPosts(data || []);
    } catch (err) {
      console.error("Error fetching notes:", err);
    }
  };

  useEffect(() => { fetchNotes(); }, []);
  useEffect(() => { try { localStorage.setItem(BOOKMARK_KEY, JSON.stringify(bookmarks)); } catch {} }, [bookmarks]);

  const handleUpload = async () => {
    if (!title || !description || !file) { alert("Please fill all fields and select a file."); return; }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("uploader", user.displayName);
    formData.append("file", file);

    try {
      setUploading(true);
      const res = await fetch("https://educ-game.onrender.com/api/notes", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const newNote = await res.json();
      setPosts(prev => [newNote, ...prev]);
      setTitle(""); setDescription(""); setFile(null); setCurrentPage(1);
      alert("Upload successful!");
    } catch (err) {
      console.error(err);
      alert("Upload failed! Try again.");
    } finally { setUploading(false); }
  };

  const handleLike = async (id) => {
    try {
      const res = await fetch(`https://educ-game.onrender.com/api/notes/${id}/like`, { method: "POST" });
      const updated = await res.json();
      setPosts(prev => prev.map(p => (p._id === id ? updated : p)));
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    try {
      await fetch(`https://educ-game.onrender.com/api/notes/${id}`, { method: "DELETE" });
      setPosts(prev => prev.filter(p => p._id !== id));
    } catch (err) { console.error(err); alert("Failed to delete note"); }
  };

  const handleSelectForLearning = (post) => {
    setSelectedFileForActivity(post);
    setGeneratedContent(null);
    setActiveTab("Learning");
  };

  const handleGenerate = async () => {
    if (!selectedFileForActivity) { alert("Please select a file."); return; }
    setGeneratedContent(<FaSpinner className="spin loading-icon" />);
    try {
      const res = await fetch("https://educ-game.onrender.com/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId: selectedFileForActivity._id, type: activityType }),
      });
      const data = await res.json();
      setGeneratedContent(data.content);
    } catch (err) {
      console.error(err);
      setGeneratedContent("Error generating content.");
      alert("Failed to generate content");
    }
  };

  const toggleBookmark = (id) => {
    setBookmarks(prev => prev.includes(id) ? prev.filter(x => x !== id) : [id, ...prev]);
  };

  const handleDownload = (post) => {
    if (!post.fileUrl) return alert("File URL not available.");
    window.open(post.fileUrl, "_blank"); // Open Cloudinary file in new tab
  };

  const applyFiltersAndSort = () => {
    let list = [...posts];
    if (showMyUploadsOnly) list = list.filter(p => p.uploader === user.displayName);
    if (showBookmarksOnly) list = list.filter(p => bookmarks.includes(p._id));
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(p => (p.title || "").toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q));
    }
    list.sort((a, b) => {
      if (sortMode === "latest") return a.createdAt && b.createdAt ? new Date(b.createdAt) - new Date(a.createdAt) : b._id.localeCompare(a._id);
      if (sortMode === "likes") return (b.likes || 0) - (a.likes || 0);
      return 0;
    });
    return list;
  };

  const filteredSorted = applyFiltersAndSort();
  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / PAGE_SIZE));
  useEffect(() => { if (currentPage > totalPages) setCurrentPage(1); }, [filteredSorted.length, totalPages]);
  const paginatedPosts = filteredSorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const goToPrev = () => setCurrentPage(p => Math.max(1, p - 1));
  const goToNext = () => setCurrentPage(p => Math.min(totalPages, p + 1));
  const goToPage = (n) => setCurrentPage(() => Math.min(Math.max(1, n), totalPages));

  return (
    <div className="noteverse-container">
      {/* Burger Menu */}
      <button className="burger-btn" onClick={() => setSidebarOpen(p => !p)}>
        <FaBars />
      </button>

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <button className={`sidebar-item ${activeTab === "Notes" ? "active" : ""}`} onClick={() => { setActiveTab("Notes"); setSidebarOpen(false); }}>
          <FaBook /> Notes
        </button>
        <button className={`sidebar-item ${activeTab === "Learning" ? "active" : ""}`} onClick={() => { setActiveTab("Learning"); setGeneratedContent(null); setSidebarOpen(false); }}>
          <FaStar /> Quizzes & Flashcards
        </button>
        <button className="sidebar-item" onClick={onBack}>
          ← Back to Dashboard
        </button>
      </div>

      <header className="noteverse-header">
        <h1>Welcome to NoteVerse, {user.displayName.split(" ")[0]}!</h1>
        <p>Your academic hub: upload, share, and gamify your learning.</p>
      </header>

      <div className="tab-content">
        {/* Notes tab */}
        {activeTab === "Notes" && (
          <div className="notes-tab">
            <div className="upload-sidebar">
              <div className="upload-section card-panel">
                <h4><FaUpload /> Upload New Resource</h4>
                <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows="3" />
                <label className={`file-upload-label ${file ? 'file-selected' : ''}`}>
                  <FaBook /> {file ? `Selected: ${file.name}` : "Select PDF/Document"}
                  <input type="file" onChange={(e) => setFile(e.target.files[0])} />
                </label>
                <button className="upload-btn primary-btn" onClick={handleUpload} disabled={uploading}>
                  {uploading ? <><FaSpinner className="spin" /> Uploading...</> : "Upload Resource"}
                </button>
              </div>

              <div className="filter-panel card-panel">
                <h4><FaSearch /> Filters & Settings</h4>
                <label><input type="checkbox" checked={showMyUploadsOnly} onChange={(e) => { setShowMyUploadsOnly(e.target.checked); setCurrentPage(1); }} /> My Uploads Only</label>
                <label><input type="checkbox" checked={showBookmarksOnly} onChange={(e) => { setShowBookmarksOnly(e.target.checked); setCurrentPage(1); }} /> Bookmarked Notes</label>
                <label>Sort by:
                  <select value={sortMode} onChange={(e) => { setSortMode(e.target.value); setCurrentPage(1); }}>
                    <option value="latest">Latest</option>
                    <option value="likes">Most Likes</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="feed-area">
              <div className="search-container">
                <FaSearch />
                <input type="text" placeholder="Search..." value={searchTerm} onChange={(e)=>{ setSearchTerm(e.target.value); setCurrentPage(1); }} />
              </div>

              <div className="posts-feed">
                {paginatedPosts.length === 0 ? (
                  <p>No notes/posts found.</p>
                ) : (
                  paginatedPosts.map(post => (
                    <PostCard 
                      key={post._id} post={post} user={user} bookmarks={bookmarks} toggleBookmark={toggleBookmark}
                      handleLike={handleLike} handleDownload={handleDownload} handleDelete={handleDelete}
                      handleSelectForLearning={handleSelectForLearning} 
                    />
                  ))
                )}
              </div>

              {totalPages > 1 && (
                <div className="pagination-row">
                  <button onClick={goToPrev} disabled={currentPage===1}>Previous</button>
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pageNum = i+1;
                    return <button key={pageNum} className={pageNum===currentPage?"active-page":""} onClick={()=>goToPage(pageNum)}>{pageNum}</button>;
                  })}
                  <button onClick={goToNext} disabled={currentPage===totalPages}>Next</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Learning tab */}
        {activeTab === "Learning" && (
          <Quiz 
            selectedFile={selectedFileForActivity}
            activityType={activityType}
            setActivityType={setActivityType}
            generatedContent={generatedContent}
            setGeneratedContent={setGeneratedContent}
            handleGenerate={handleGenerate}
          />
        )}
      </div>
    </div>
  );
};

export default NoteVerse;
