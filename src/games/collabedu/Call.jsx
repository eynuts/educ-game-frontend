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

        // Helper to play user tracks when container exists
        const playUserTracks = (user) => {
          if (user.videoTrack) {
            const tryPlayVideo = () => {
              const container = document.getElementById(`remote-${user.uid}`);
              if (container) {
                user.videoTrack.play(container);
              } else {
                setTimeout(tryPlayVideo, 50); // wait for DOM
              }
            };
            tryPlayVideo();
          }
          if (user.audioTrack) {
            user.audioTrack.play();
          }
        };

        // Subscribe & add remote user
        const subscribeAndAddUser = async (user) => {
          await client.subscribe(user, "video");
          await client.subscribe(user, "audio");
          playUserTracks(user);
          setRemoteUsers((prev) => prev.some(u => u.uid === user.uid) ? prev : [...prev, user]);
        };

        // Subscribe to already-published remote users (late joiners)
        Object.values(client.remoteUsers).forEach(user => {
          subscribeAndAddUser(user);
        });

        // Handle new users publishing
        client.on("user-published", subscribeAndAddUser);

        // Handle users leaving/unpublishing
        client.on("user-unpublished", (user) => {
          setRemoteUsers((prev) => prev.filter(u => u.uid !== user.uid));
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
        localTracksRef.current.forEach(track => track.close());
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
            {remoteUsers.map((u) => (
              <div key={u.uid} id={`remote-${u.uid}`} className="remote-video"></div>
            ))}
          </div>
          {remoteUsers.length === 0 && <p>Waiting for others to join...</p>}
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
