import React from "react";
import { useParams } from "react-router-dom";

const VideoCall = () => {
  const { appointmentId } = useParams();

  const startVideoCall = () => {
    alert(`Starting video call for appointment ${appointmentId}`);
    // Integrate WebRTC or your video call logic here
  };

  return (
    <div>
      <h2>Video Call for Appointment: {appointmentId}</h2>
      <button onClick={startVideoCall}>Start Video Call</button>
    </div>
  );
};

export default VideoCall;
