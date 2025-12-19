// src/CollabEDU/Call.jsx
import React, { useEffect, useRef, useState } from "react";
import './call.css';
import AgoraRTC from "agora-rtc-sdk-ng";

const APP_ID = "f2f2f7e7fefd44afbe8cf95fc36246c0";

const Call = ({ channelName, userId, onClose }) => {
  const [joined, setJoined] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const localVideoRef = useRef();
  const [client] = useState(AgoraRTC.createClient({ mode: "rtc", codec: "vp8" }));
  const localTracksRef = useRef([]);

  useEffect(() => {
    const init = async () => {
      try {
        // Join channel
        await client.join(APP_ID, channelName, null, userId);

        // Create local tracks
        const [microphoneTrack, cameraTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
        localTracksRef.current = [microphoneTrack, cameraTrack];

        // Play local video
        cameraTrack.play(localVideoRef.current);

        // Publish local tracks
        await client.publish(localTracksRef.current);
        setJoined(true);

        // Subscribe to already-published remote users
        for (const uid in client.remoteUsers) {
          const user = client.remoteUsers[uid];
          await client.subscribe(user, "video");
          await client.subscribe(user, "audio");

          if (user.videoTrack) {
            const container = document.getElementById(`remote-${user.uid}`);
            if (container) user.videoTrack.play(container);
          }
          if (user.audioTrack) {
            user.audioTrack.play();
          }

          setRemoteUsers((prev) => [...prev, user]);
        }

        // Handle remote users publishing tracks later
        client.on("user-published", async (user, mediaType) => {
          await client.subscribe(user, mediaType);

          if (mediaType === "video") {
            // Wait until container exists
            const interval = setInterval(() => {
              const container = document.getElementById(`remote-${user.uid}`);
              if (container) {
                user.videoTrack.play(container);
                clearInterval(interval);
              }
            }, 50);
          }

          if (mediaType === "audio") {
            user.audioTrack.play();
          }

          setRemoteUsers((prev) => prev.some(u => u.uid === user.uid) ? prev : [...prev, user]);
        });

        client.on("user-unpublished", (user) => {
          setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
        });
      } catch (err) {
        console.error("Agora init failed:", err);
        alert("Failed to join the call.");
      }
    };

    init();

    // Cleanup on unmount
    return async () => {
      try {
        localTracksRef.current.forEach((track) => track.close());
        await client.leave();
        setRemoteUsers([]);
      } catch (err) {
        console.error("Error leaving call:", err);
      }
    };
  }, [channelName, client, userId]);

  return (
    <div className="call-modal-overlay">
      <div className="call-modal-popup">
        <button className="close-btn" onClick={onClose}>×</button>
        <h3>Group Call</h3>

        {/* Local video */}
        <div className="local-video-container">
          <h5>Your Video</h5>
          <div className="local-video" ref={localVideoRef}></div>
        </div>

        {/* Remote videos */}
        <div className="remote-videos-container">
          <h5>Participants</h5>
          <div className="remote-videos">
            {remoteUsers.length === 0 && <p>No one else in the call</p>}
            {remoteUsers.map((u) => (
              <div key={u.uid} id={`remote-${u.uid}`} className="remote-video"></div>
            ))}
          </div>
        </div>

        {/* Leave button */}
        {joined && (
          <button className="leave-call-btn" onClick={onClose}>
            Leave Call
          </button>
        )}
      </div>
    </div>
  );
};

export default Call;
