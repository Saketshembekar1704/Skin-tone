import { useRef, useEffect, useState } from "react";
import { sendToBackend } from "../services/api";

export default function CanvasSelector({ image, onResult }) {
  const maskCanvasRef = useRef(null);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mask, setMask] = useState([]);

  useEffect(() => {
  if (!image || !canvasRef.current || !maskCanvasRef.current) return;

  // Main canvas
  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");

  canvas.width = 400;
  canvas.height = 300;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  const maskCanvas = maskCanvasRef.current;
  const maskCtx = maskCanvas.getContext("2d");

  maskCanvas.width = 400;
  maskCanvas.height = 300;

  maskCtx.fillStyle = "black";
  maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
}, [image]);


  const drawPoint = (x, y) => {
  if (!canvasRef.current || !maskCanvasRef.current) return;

  const ctx = canvasRef.current.getContext("2d");
  ctx.fillStyle = "rgba(255, 0, 0, 0.4)";
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, 2 * Math.PI);
  ctx.fill();

  const maskCtx = maskCanvasRef.current.getContext("2d");
  maskCtx.fillStyle = "white";
  maskCtx.beginPath();
  maskCtx.arc(x, y, 5, 0, 2 * Math.PI);
  maskCtx.fill();

  setMask((prev) => [...prev, { x, y }]);
};

  const analyze = async () => {
    console.log("Analyze clicked");

    try {
      const result = await sendToBackend(image, mask);
      console.log("Backend result:", result);
      onResult(result);
    } catch (err) {
      console.error("Analyze failed:", err);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px",
        marginTop: "20px",
      }}
    >
      <canvas
       ref={canvasRef}
       style={{ border: "1px solid black", cursor: "crosshair" }}
       onMouseDown={(e) => {
       setIsDrawing(true);
       const rect = canvasRef.current.getBoundingClientRect();
       drawPoint(e.clientX - rect.left, e.clientY - rect.top);
      }}
      onMouseMove={(e) => {
      if (!isDrawing) return;
      const rect = canvasRef.current.getBoundingClientRect();
       drawPoint(
        e.clientX - rect.left,
        e.clientY - rect.top
       );
     }}
    onMouseUp={() => setIsDrawing(false)}
    onMouseLeave={() => setIsDrawing(false)}
/>
     <canvas
      ref={maskCanvasRef}
      width={400}
      height={300}
      style={{ display: "none" }}
/>


      <button
        type="button"
        onClick={analyze}
        style={{
          padding: "8px 20px",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        Analyze
      </button>

      <button
        type="button"
        onClick={() => {
        const dataUrl = maskCanvasRef.current.toDataURL();
        window.open(dataUrl);
    }}
>
  Preview Mask
</button>


    </div>
  );
}
