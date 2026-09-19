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
        if (!Array.isArray(det.bbox) || det.bbox.length < 4) return;
        let [b0, b1, b2, b3] = det.bbox.map(Number);

        // Handle normalized coordinates (0.0 to 1.0)
        if (b0 <= 1 && b1 <= 1 && b2 <= 1 && b3 <= 1 && (b2 > 0 || b3 > 0)) {
          b0 *= img.naturalWidth;
          b1 *= img.naturalHeight;
          b2 *= img.naturalWidth;
          b3 *= img.naturalHeight;
        }

        // YOLO model returns xyxy [x1, y1, x2, y2]
        let bx, by, bw, bh;
        if (b2 > b0 && b3 > b1) {
          bx = b0;
          by = b1;
          bw = b2 - b0;
          bh = b3 - b1;
        } else {
          bx = b0;
          by = b1;
          bw = b2;
          bh = b3;
        }

        const x = bx * scaleX;
        const y = by * scaleY;
        const w = bw * scaleX;
        const h = bh * scaleY;
        const color = getColor(det.class);
        const confidence = ((Number(det.confidence) || 0) * 100).toFixed(0);

        // Box stroke and glow
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, w, h);
        ctx.shadowBlur = 0;

        // Fill top label pill
        const label = `${det.class?.replace(/_/g, ' ').toUpperCase()}  ${confidence}%`;
        ctx.font = '700 12px "JetBrains Mono", Inter, sans-serif';
        const textW = ctx.measureText(label).width + 12;
        const tagH = 22;
        ctx.fillStyle = color;
        ctx.fillRect(x, Math.max(0, y - tagH), textW, tagH);

        // Label text
        ctx.fillStyle = '#ffffff';
        ctx.fillText(label, x + 6, Math.max(15, y - 6));

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

    const syncCanvasToImage = () => {
      const canvas = canvasRef.current;
      const img = imgRef.current;
      if (canvas && img && img.offsetWidth > 0 && img.offsetHeight > 0) {
        canvas.width = img.offsetWidth;
        canvas.height = img.offsetHeight;
        canvas.style.left = `${img.offsetLeft}px`;
        canvas.style.top = `${img.offsetTop}px`;
        canvas.style.width = `${img.offsetWidth}px`;
        canvas.style.height = `${img.offsetHeight}px`;
        drawBoxes();
      }
    };

    if (img.complete) {
      syncCanvasToImage();
    } else {
      img.onload = syncCanvasToImage;
    }

    window.addEventListener('resize', syncCanvasToImage);
    return () => window.removeEventListener('resize', syncCanvasToImage);
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
          if (canvas && img && img.offsetWidth > 0 && img.offsetHeight > 0) {
            canvas.width = img.offsetWidth;
            canvas.height = img.offsetHeight;
            canvas.style.left = `${img.offsetLeft}px`;
            canvas.style.top = `${img.offsetTop}px`;
            canvas.style.width = `${img.offsetWidth}px`;
            canvas.style.height = `${img.offsetHeight}px`;
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
