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
  const [localTracks, setLocalTracks] = useState([]);

  useEffect(() => {
    const init = async () => {
      // Join channel
      await client.join(APP_ID, channelName, null, userId);

      // Create local tracks
      const [microphoneTrack, cameraTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
      setLocalTracks([microphoneTrack, cameraTrack]);

      // Wait until video ref exists
      const waitForRef = () =>
        new Promise((resolve) => {
          const interval = setInterval(() => {
            if (localVideoRef.current) {
              clearInterval(interval);
              resolve();
            }
          }, 50);
        });
      await waitForRef();

      cameraTrack.play(localVideoRef.current);
      await client.publish([microphoneTrack, cameraTrack]);
      setJoined(true);

      // Handle remote users
      client.on("user-published", async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        if (mediaType === "video") {
          const container = document.getElementById(`remote-${user.uid}`);
          user.videoTrack.play(container);
        }
        if (mediaType === "audio") user.audioTrack.play();
        setRemoteUsers((prev) => [...prev, user]);
      });

      client.on("user-unpublished", (user) => {
        setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
      });
    };

    init();

    return () => {
      localTracks.forEach((t) => t.close());
      client.leave();
    };
  }, []);

  return (
    <div className="call-modal-overlay">
      <div className="call-modal-popup">
        <button className="close-btn" onClick={onClose}>×</button>
        <h3>Group Call</h3>

        <div className="local-video-container">
          <h5>Your Video</h5>
          <div className="local-video" ref={localVideoRef}></div>
        </div>

        <div className="remote-videos-container">
          <h5>Participants</h5>
          <div className="remote-videos">
            {remoteUsers.length === 0 && <p>No one else in the call</p>}
            {remoteUsers.map((u) => (
              <div key={u.uid} id={`remote-${u.uid}`} className="remote-video"></div>
            ))}
          </div>
        </div>

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
