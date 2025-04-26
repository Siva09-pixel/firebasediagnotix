import React, { useRef, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { startCall, joinCall, endCall } from "./webrtcService";
import "./VideoConsult.css";

const VideoConsult = () => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const navigate = useNavigate();
  const { callId } = useParams(); // Unique call ID

  useEffect(() => {
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
      }
    };

    startVideo();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleStartCall = async () => {
    await startCall(callId, localStream, (remoteStream) => {
      remoteVideoRef.current.srcObject = remoteStream;
    });
  };

  const handleJoinCall = async () => {
    await joinCall(callId, localStream, (remoteStream) => {
      remoteVideoRef.current.srcObject = remoteStream;
    });
  };

  const handleEndCall = async () => {
    await endCall(callId);
    navigate("/");
  };

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks()[0].enabled = isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="video-container">
      <div className="video-wrapper">
        <video ref={localVideoRef} autoPlay playsInline className="video-feed"></video>
        <video ref={remoteVideoRef} autoPlay playsInline className="video-feed remote"></video>
      </div>

      <div className="controls">
        <button className="control-btn" onClick={handleStartCall}>Start Call</button>
        <button className="control-btn" onClick={handleJoinCall}>Join Call</button>
        <button className="control-btn mute-btn" onClick={toggleMute}>
          {isMuted ? "Unmute" : "Mute"}
        </button>
        <button className="control-btn end-call-btn" onClick={handleEndCall}>End Call</button>
      </div>
    </div>
  );
};

export default VideoConsult;
