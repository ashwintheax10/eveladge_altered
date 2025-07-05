// CamPreview.tsx – super‑simple MJPEG viewer
import React from 'react';

interface Props {
  url: string;               // e.g.  "http://localhost:6000/video_feed"
  w?:  number;               // width  (defaults 320)
  h?:  number;               // height (keeps aspect if omitted)
}

const CamPreview: React.FC<Props> = ({ url, w = 320, h }) => (
  <div style={{border:'2px solid #555', borderRadius:8, width:w}}>
    <img
      src={url}
      alt="live proctor feed"
      style={{ width:'100%', height:h??'auto', display:'block' }}
      crossOrigin="anonymous"         // avoid CORS taint for canvas if ever needed
    />
  </div>
);

export default CamPreview;
