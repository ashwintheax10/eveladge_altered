const VERIFY_BASE = import.meta.env.VITE_VERIFY_API || '/verify-api';

export const startVerification = async (image: string) => {
  const res = await fetch(`${VERIFY_BASE}/start`, {
    method: 'POST',
    body: JSON.stringify({ image }),
    headers: { 'Content-Type': 'application/json' },
  });
  return res.json();
};
