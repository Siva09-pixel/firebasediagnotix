import { db } from "../firebase"; 
import { collection, doc, setDoc, onSnapshot, deleteDoc, addDoc } from "firebase/firestore";

let peerConnection;
const servers = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

const pendingICECandidates = [];

// 🟢 Create Offer (Doctor Side)
export const startCall = async (callId, localStream, onTrackCallback) => {
  peerConnection = new RTCPeerConnection(servers);

  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });

  peerConnection.ontrack = (event) => {
    if (onTrackCallback) onTrackCallback(event.streams[0]);
  };

  peerConnection.onicecandidate = async (event) => {
    if (event.candidate) {
      await addDoc(collection(db, `calls/${callId}/candidates`), event.candidate.toJSON());
    }
  };

  // Create Offer
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);

  await setDoc(doc(db, "calls", callId), { offer });
};

// 🔵 Accept Call (Patient Side)
export const joinCall = async (callId, localStream, onTrackCallback) => {
  peerConnection = new RTCPeerConnection(servers);

  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });

  peerConnection.ontrack = (event) => {
    if (onTrackCallback) onTrackCallback(event.streams[0]);
  };

  peerConnection.onicecandidate = async (event) => {
    if (event.candidate) {
      await addDoc(collection(db, `calls/${callId}/candidates`), event.candidate.toJSON());
    }
  };

  // Buffer ICE candidates if remote description is not set
  let remoteDescSet = false;

  // Listen for Offer
  const callDoc = doc(db, "calls", callId);
  onSnapshot(callDoc, async (snapshot) => {
    const data = snapshot.data();
    if (data?.offer && !peerConnection.remoteDescription) {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));

      remoteDescSet = true;
      
      // Process buffered ICE candidates
      pendingICECandidates.forEach(async (candidate) => {
        await peerConnection.addIceCandidate(candidate);
      });
      pendingICECandidates.length = 0;

      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      await setDoc(callDoc, { answer }, { merge: true });
    }
  });

  // Listen for ICE Candidates
  onSnapshot(collection(db, `calls/${callId}/candidates`), (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        const candidate = new RTCIceCandidate(change.doc.data());
        if (remoteDescSet) {
          peerConnection.addIceCandidate(candidate);
        } else {
          pendingICECandidates.push(candidate);
        }
      }
    });
  });
};

// ❌ End Call
export const endCall = async (callId) => {
  if (peerConnection) {
    peerConnection.close();
  }
  await deleteDoc(doc(db, "calls", callId));
};
