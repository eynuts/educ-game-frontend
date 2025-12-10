const API_BASE = "https://educ-game.onrender.com/api/collab";

// ================================
// USER SYNC
// ================================
export const syncUser = async (user) => {
    if (!user) return;
    try {
        await fetch(`${API_BASE}/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                uid: user.uid,
                displayName: user.displayName,
                email: user.email,
            }),
        });
    } catch (err) {
        console.error("Failed to sync user:", err);
    }
};

// ================================
// GROUPS
// ================================
export const fetchGroups = async (uid) => {
    if (!uid) return [];
    try {
        const res = await fetch(`${API_BASE}/users/${uid}/groups`);
        return await res.json();
    } catch (err) {
        console.error("Error loading groups:", err);
        return [];
    }
};

export const fetchGroupData = async (groupId) => {
    if (!groupId) return { group: null, tasks: [], chat: [], files: [] };
    try {
        const groupRes = await fetch(`${API_BASE}/groups/${groupId}`);
        const group = await groupRes.json();

        const tasksRes = await fetch(`${API_BASE}/groups/${groupId}/tasks`);
        const chatRes = await fetch(`${API_BASE}/groups/${groupId}/chat`);
        const filesRes = await fetch(`${API_BASE}/groups/${groupId}/files`);

        return {
            group,
            tasks: await tasksRes.json(),
            chat: await chatRes.json(),
            files: await filesRes.json(),
        };
    } catch (err) {
        console.error("Error loading group data:", err);
        return { group: null, tasks: [], chat: [], files: [] };
    }
};

export const createGroup = async (name, leaderUid) => {
    if (!name || !leaderUid) return null;
    try {
        const res = await fetch(`${API_BASE}/groups`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, leaderUid }),
        });
        return await res.json();
    } catch (err) {
        console.error("Create group error:", err);
        return null;
    }
};

// ================================
// TASKS
// ================================
export const addTask = async (groupId, title, dueDate, assignedUid) => {
    if (!groupId || !title || !dueDate || !assignedUid) return null;
    try {
        const res = await fetch(`${API_BASE}/groups/${groupId}/tasks`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, dueDate, assignedUid }),
        });
        return await res.json();
    } catch (err) {
        console.error("Add task error:", err);
        return null;
    }
};

export const toggleTaskCompletion = async (groupId, taskId, completed) => {
    if (!groupId || !taskId) return;
    try {
        await fetch(`${API_BASE}/groups/${groupId}/tasks/${taskId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ completed: !completed }),
        });
    } catch (err) {
        console.error("Toggle task error:", err);
    }
};

// ================================
// CHAT
// ================================
export const sendMessage = async (groupId, uid, content) => {
    if (!groupId || !uid || !content) return null;
    try {
        const res = await fetch(`${API_BASE}/groups/${groupId}/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ uid, content }),
        });
        return await res.json();
    } catch (err) {
        console.error("Chat error:", err);
        return null;
    }
};

// ================================
// INVITE MEMBERS
// ================================
export const inviteUserByEmail = async (groupId, email) => {
    if (!groupId || !email) return null;
    try {
        const res = await fetch(`${API_BASE}/groups/${groupId}/invite`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });
        return await res.json();
    } catch (err) {
        console.error("Invite by email error:", err);
        return null;
    }
};

export const inviteUserByUid = async (groupId, uid) => {
    if (!groupId || !uid) return null;
    try {
        const res = await fetch(`${API_BASE}/groups/${groupId}/invite-uid`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ uid }),
        });
        return await res.json();
    } catch (err) {
        console.error("Invite by UID error:", err);
        return null;
    }
};
// ================================
// FILE UPLOAD (via backend → Cloudinary)
// ================================
export const uploadFile = async (groupId, file) => {
    if (!file || !groupId) return null;

    try {
        const formData = new FormData();
        formData.append("file", file);

        // Send to your backend, which handles Cloudinary upload
        const res = await fetch(`${API_BASE}/groups/${groupId}/files`, {
            method: "POST",
            body: formData,
        });

        const data = await res.json();

        if (data.url) {
            console.log("File uploaded successfully:", data.url);
            return data;
        } else {
            console.error("Upload failed:", data);
            return null;
        }
    } catch (err) {
        console.error("Upload error:", err);
        return null;
    }
};

// ================================
// DELETE GROUP (only leader)
// ================================
export const deleteGroup = async (groupId, uid) => {
    if (!groupId || !uid) return null;
    try {
        const res = await fetch(`${API_BASE}/groups/${groupId}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ uid }),
        });
        return await res.json();
    } catch (err) {
        console.error("Delete group error:", err);
        return null;
    }
};
