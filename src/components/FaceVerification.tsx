import { useNavigate } from 'react-router-dom';
import { useState, useRef } from 'react';

export default function FaceVerification() {
  const nav = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [msg, setMsg] = useState<string>('Awaiting verification …');
  const [busy, setBusy] = useState<boolean>(false);

  // start webcam on mount
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(s => { if (videoRef.current) videoRef.current.srcObject = s; })
      .catch(() => setMsg('Cannot access webcam'));
  }, []);

  const verify = async () => {
    if (!videoRef.current) return;
    setBusy(true);

    const canvas = document.createElement('canvas');
    canvas.width  = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d')!.drawImage(videoRef.current, 0, 0);

    const res = await fetch('/verify_api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'image=' + encodeURIComponent(canvas.toDataURL('image/jpeg', 0.8)),
    });
    const json = await res.json();
    if (json.ok) {
      nav('/exam');                 // proceed
    } else {
      setMsg(`❌ ${json.msg}`);
      setBusy(false);
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
      <video ref={videoRef} autoPlay className="rounded-lg border-4 border-blue-500" />
      <button
        onClick={verify}
        disabled={busy}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        {busy ? 'Verifying…' : 'Verify & Start Exam'}
      </button>
      <p className="mt-2 text-gray-700">{msg}</p>
    </div>
  );
}
