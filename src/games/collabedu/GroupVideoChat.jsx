// src/CollabEDU/GroupVideoChat.jsx
import React, { useEffect, useRef, useState } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";

const APP_ID = "YOUR_AGORA_APP_ID"; // replace with your App ID

const GroupVideoChat = ({ channelName, userId }) => {
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

            // Play local video
            cameraTrack.play(localVideoRef.current);

            // Publish local tracks
            await client.publish([microphoneTrack, cameraTrack]);
            setJoined(true);

            // Handle remote users
            client.on("user-published", async (user, mediaType) => {
                await client.subscribe(user, mediaType);
                if (mediaType === "video") {
                    const remoteVideoContainer = document.getElementById(`remote-${user.uid}`);
                    user.videoTrack.play(remoteVideoContainer);
                }
                if (mediaType === "audio") {
                    user.audioTrack.play();
                }
                setRemoteUsers((prev) => [...prev, user]);
            });

            client.on("user-unpublished", (user) => {
                setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
            });
        };

        init();

        return () => {
            // Leave channel and cleanup
            localTracks.forEach((track) => track.close());
            client.leave();
        };
    }, []);

    return (
        <div>
            <h4>Voice/Video Chat</h4>
            <div className="local-video" ref={localVideoRef}></div>

            <div className="remote-videos">
                {remoteUsers.map((user) => (
                    <div key={user.uid} id={`remote-${user.uid}`} className="remote-video"></div>
                ))}
            </div>
        </div>
    );
};

export default GroupVideoChat;
