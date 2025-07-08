// src/components/VerifyApp.tsx
import React, { useEffect, useRef, useState } from 'react';

interface Props {
  onClose: () => void;          // parent callback – called only after success
}

export default function VerifyApp({ onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [message,   setMessage]   = useState('📷 Initialising camera…');
  const [verifying, setVerifying] = useState(false);

  /* ─── start webcam on mount ─── */
  useEffect(() => {
    let stream: MediaStream;

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setMessage('Camera ready – click Verify');
      } catch (err) {
        console.error('Webcam error:', err);
        setMessage('❌ Cannot access webcam');
      }
    })();

    return () => streamRef.current?.getTracks().forEach(t => t.stop());
  }, []);

  // Helper to stop webcam
  const stopWebcam = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  };

  /* ─── send snapshot to backend ─── */
  const verify = async () => {
    if (!videoRef.current) return;
    setVerifying(true);

    const canvas = document.createElement('canvas');
    canvas.width  = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d')!.drawImage(videoRef.current, 0, 0);

    const dataURL = canvas.toDataURL('image/jpeg', 0.8);

    try {
      const res = await fetch('/verify/verify_api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'image=' + encodeURIComponent(dataURL),
      });
      const result = await res.json();

      if (result.ok) {
        setMessage(`✅ Verified as ${result.person} (score ${result.score.toFixed(3)})`);
        setTimeout(() => {
          stopWebcam();
          onClose();
        }, 300);           // auto‑close after 0.3 s
      } else {
        setMessage(`❌ ${result.msg} – try again`);
      }
    } catch (err) {
      console.error(err);
      setMessage('❌ Server error during verification');
    } finally {
      setVerifying(false);
    }
  };

  const handleStartExam = async () => {
    await fetch(`${MONITOR_BASE}/reset`, { method: "POST" });
    nav("/exam", { state: { verified: true } });
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

      <br /><br />

      <button
        onClick={verify}
        disabled={verifying}
        style={{ padding: '.6rem 1.2rem', fontSize: '1.1rem' }}
      >
        {verifying ? 'Verifying…' : 'Verify'}
      </button>

      <p style={{ marginTop: '1rem', fontSize: '1.1rem' }}>{message}</p>
    </div>
  );
}
