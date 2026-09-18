import { useRef, useEffect } from 'react';
import styles from './BoundingBoxCanvas.module.css';

const CLASS_COLORS = {
  pothole: '#ef4444',
  alligator_crack: '#f97316',
  longitudinal_crack: '#eab308',
  transverse_crack: '#a855f7',
  surface_raveling: '#06b6d4',
  rutting: '#3b82f6',
  depression: '#ec4899',
  default: '#94a3b8',
};

function getColor(cls) {
  return CLASS_COLORS[cls?.toLowerCase()] || CLASS_COLORS.default;
}

export default function BoundingBoxCanvas({ imageUrl, detections = [], width = 640, height = 480 }) {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const drawBoxes = () => {
      const ctx = canvas.getContext('2d');
      const scaleX = canvas.width / img.naturalWidth;
      const scaleY = canvas.height / img.naturalHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      detections.forEach((det) => {
        const [bx, by, bw, bh] = det.bbox;
        const x = bx * scaleX;
        const y = by * scaleY;
        const w = bw * scaleX;
        const h = bh * scaleY;
        const color = getColor(det.class);
        const confidence = ((det.confidence || 0) * 100).toFixed(0);

        // Box shadow glow
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.strokeRect(x, y, w, h);
        ctx.shadowBlur = 0;

        // Fill top badge
        const label = `${det.class?.replace(/_/g, ' ')} ${confidence}%`;
        ctx.font = '600 11px Inter, sans-serif';
        const textW = ctx.measureText(label).width + 10;
        const tagH = 20;
        ctx.fillStyle = color;
        ctx.fillRect(x, y - tagH, textW, tagH);

        // Label text
        ctx.fillStyle = '#fff';
        ctx.fillText(label, x + 5, y - 6);

        // Corner accents
        const cs = 12;
        ctx.lineWidth = 3;
        ctx.strokeStyle = color;
        // TL
        ctx.beginPath(); ctx.moveTo(x, y + cs); ctx.lineTo(x, y); ctx.lineTo(x + cs, y); ctx.stroke();
        // TR
        ctx.beginPath(); ctx.moveTo(x + w - cs, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + cs); ctx.stroke();
        // BL
        ctx.beginPath(); ctx.moveTo(x, y + h - cs); ctx.lineTo(x, y + h); ctx.lineTo(x + cs, y + h); ctx.stroke();
        // BR
        ctx.beginPath(); ctx.moveTo(x + w - cs, y + h); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w, y + h - cs); ctx.stroke();
      });
    };

    if (img.complete) {
      drawBoxes();
    } else {
      img.onload = drawBoxes;
    }
  }, [detections, imageUrl]);

  return (
    <div className={styles.wrapper}>
      <img
        ref={imgRef}
        src={imageUrl}
        alt="Road damage"
        className={styles.image}
        crossOrigin="anonymous"
        onError={(e) => {
          // If S3 CORS blocks anonymous crossOrigin, retry without crossOrigin
          if (e.currentTarget.crossOrigin) {
            e.currentTarget.removeAttribute('crossorigin');
            e.currentTarget.src = imageUrl;
          }
        }}
        onLoad={() => {
          const canvas = canvasRef.current;
          const img = imgRef.current;
          if (canvas && img) {
            canvas.width = img.offsetWidth;
            canvas.height = img.offsetHeight;
          }
        }}
      />
      <canvas ref={canvasRef} className={styles.canvas} />
      {detections.length === 0 && (
        <div className={styles.noDetections}>No AI detections available</div>
      )}
    </div>
  );
}
