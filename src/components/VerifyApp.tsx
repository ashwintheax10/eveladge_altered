// src/components/VerifyApp.tsx
import React, { useEffect, useRef, useState } from 'react';

interface Props {
  onClose: () => void;          // parent callback to hide the modal
}

export default function VerifyApp({ onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [message,   setMessage]   = useState('Not checked');
  const [verifying, setVerifying] = useState(false);

  /* ─── Start webcam when the component mounts ─── */
  useEffect(() => {
    let stream: MediaStream;

    const startWebcam = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error('Webcam error:', err);
        setMessage('Could not access webcam.');
      }
    };

    startWebcam();

    // Stop the camera when component unmounts
    return () => stream?.getTracks().forEach(t => t.stop());
  }, []);

  /* ─── Snapshot → POST /verify_api ─── */
  const verify = async () => {
    if (!videoRef.current) return;
    setVerifying(true);

    // capture current frame
    const canvas = document.createElement('canvas');
    canvas.width  = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d')!.drawImage(videoRef.current, 0, 0);

    const dataURL = canvas.toDataURL('image/jpeg', 0.8);

    try {
      const res = await fetch('/verify_api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'image=' + encodeURIComponent(dataURL),
      });
      const result = await res.json();

      if (result.ok) {
        setMessage(`✅ Verified as ${result.person} (score ${result.score.toFixed(3)})`);
        setTimeout(onClose, 1000);   // auto‑close after 1 second
      } else {
        setMessage(
          `❌ ${result.msg} (closest ${result.closest ?? 'N/A'}, score ${result.score?.toFixed(3)})`
        );
      }
    } catch (err) {
      console.error(err);
      setMessage('Server error during verification');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div
      style={{
        background: '#111',
        color: '#eee',
        textAlign: 'center',
        padding: '2rem',
        borderRadius: '8px',
      }}
    >
      <h2>Identity Verification</h2>

      <video
        ref={videoRef}
        width="480"
        autoPlay
        playsInline
        style={{ border: '3px solid #444', borderRadius: '4px' }}
      />

      <br />
      <br />

      <button
        onClick={verify}
        disabled={verifying}
        style={{ padding: '.6rem 1.2rem', fontSize: '1.1rem' }}
      >
        {verifying ? 'Verifying…' : 'Verify'}
      </button>

      <p style={{ marginTop: '1rem', fontSize: '1.1rem' }}>{message}</p>

      <button
        onClick={onClose}
        style={{
          marginTop: '0.5rem',
          background: 'none',
          color: '#ccc',
          textDecoration: 'underline',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        Close
      </button>
    </div>
  );
}
