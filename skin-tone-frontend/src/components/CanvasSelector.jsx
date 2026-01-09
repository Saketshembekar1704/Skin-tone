import { useRef, useEffect, useState } from "react";
import { sendToBackend } from "../services/api";

const STEPS = ["hair", "skin", "hand"];

/* ---------- draw image without stretching ---------- */
const drawImagePreserveAspect = (ctx, img, canvas) => {
  const canvasRatio = canvas.width / canvas.height;
  const imageRatio = img.width / img.height;

  let w, h, x, y;
  if (imageRatio > canvasRatio) {
    w = canvas.width;
    h = canvas.width / imageRatio;
    x = 0;
    y = (canvas.height - h) / 2;
  } else {
    h = canvas.height;
    w = canvas.height * imageRatio;
    x = (canvas.width - w) / 2;
    y = 0;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, x, y, w, h);
};

export default function CanvasSelector({ imageData, onResult }) {
  const [currentStep, setCurrentStep] = useState("hair");
  const [isDrawing, setIsDrawing] = useState(false);

  const canvasRef = useRef(null);

  const maskCanvasRefs = {
    hair: useRef(null),
    skin: useRef(null),
    hand: useRef(null),
  };

  const [maskCounts, setMaskCounts] = useState({
    hair: 0,
    skin: 0,
    hand: 0,
  });

  /* ---------- init on image load ---------- */
  useEffect(() => {
    if (!imageData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = 400;
    canvas.height = 300;

    const img = new Image();
    img.onload = () => drawImagePreserveAspect(ctx, img, canvas);
    img.src = imageData.previewUrl;

    STEPS.forEach((s) => {
      const c = maskCanvasRefs[s].current;
      c.width = 400;
      c.height = 300;
      const mctx = c.getContext("2d");
      mctx.fillStyle = "black";
      mctx.fillRect(0, 0, 400, 300);
    });

    setMaskCounts({ hair: 0, skin: 0, hand: 0 });
    setCurrentStep("hair");
  }, [imageData]);

  /* ---------- redraw canvas from masks ---------- */
  const redrawCanvasFromMasks = () => {
    if (!imageData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const img = new Image();
    img.onload = () => {
      drawImagePreserveAspect(ctx, img, canvas);

      STEPS.forEach((s) => {
        if (maskCounts[s] === 0) return;

        const maskCtx = maskCanvasRefs[s].current.getContext("2d");
        const data = maskCtx.getImageData(0, 0, 400, 300).data;

        ctx.fillStyle = "rgba(255,0,0,0.4)";
        for (let i = 0; i < data.length; i += 4) {
          if (data[i] === 255) {
            const x = (i / 4) % 400;
            const y = Math.floor(i / 4 / 400);
            ctx.fillRect(x, y, 1, 1);
          }
        }
      });
    };

    img.src = imageData.previewUrl;
  };

  /* ---------- draw brush ---------- */
  const drawPoint = (x, y) => {
    const ctx = canvasRef.current.getContext("2d");
    const maskCtx =
      maskCanvasRefs[currentStep].current.getContext("2d");

    ctx.fillStyle = "rgba(255,0,0,0.4)";
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();

    maskCtx.fillStyle = "white";
    maskCtx.beginPath();
    maskCtx.arc(x, y, 5, 0, Math.PI * 2);
    maskCtx.fill();

    setMaskCounts((prev) => ({
      ...prev,
      [currentStep]: prev[currentStep] + 1,
    }));
  };

  /* ---------- reset any region ---------- */
  const resetRegion = (region) => {
    const c = maskCanvasRefs[region].current;
    const ctx = c.getContext("2d");

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, 400, 300);

    const newMaskCounts = {
      ...maskCounts,
      [region]: 0,
    };

    setMaskCounts(newMaskCounts);

    // Update currentStep to the earliest incomplete region
    if (newMaskCounts.hair === 0) {
      setCurrentStep("hair");
    } else if (newMaskCounts.skin === 0) {
      setCurrentStep("skin");
    } else {
      setCurrentStep("hand");
    }

    redrawCanvasFromMasks();
  };

  /* ---------- step flow ---------- */
  const goNext = () => {
    if (currentStep === "hair" && maskCounts.hair === 0) {
      alert("Select hair first");
      return;
    }
    if (currentStep === "skin" && maskCounts.skin === 0) {
      alert("Select skin first");
      return;
    }

    if (currentStep === "hair") setCurrentStep("skin");
    else if (currentStep === "skin") setCurrentStep("hand");
  };

  /* ---------- analyze ---------- */
  const analyze = async () => {
    try {
      const result = await sendToBackend(
        imageData.file,
        {
          hair: maskCanvasRefs.hair.current,
          skin: maskCanvasRefs.skin.current,
          hand: maskCanvasRefs.hand.current,
        },
        "multi"
      );
      onResult(result);
    } catch {
      alert("Backend connection failed");
    }
  };

  const canAnalyze =
    maskCounts.hair > 0 && maskCounts.skin > 0;

  /* ---------- UI ---------- */
  return (
    <div style={{ textAlign: "center", marginTop: 20 }}>
      <div style={{ fontWeight: 600, marginBottom: 10 }}>
        {currentStep === "hair" && "Step 1: Select HAIR"}
        {currentStep === "skin" && "Step 2: Select SKIN"}
        {currentStep === "hand" && "Step 3 (Optional): Select HAND"}
      </div>

      <canvas
        ref={canvasRef}
        style={{ border: "1px solid black", cursor: "crosshair" }}
        onMouseDown={(e) => {
          setIsDrawing(true);
          const r = canvasRef.current.getBoundingClientRect();
          drawPoint(e.clientX - r.left, e.clientY - r.top);
        }}
        onMouseMove={(e) => {
          if (!isDrawing) return;
          const r = canvasRef.current.getBoundingClientRect();
          drawPoint(e.clientX - r.left, e.clientY - r.top);
        }}
        onMouseUp={() => setIsDrawing(false)}
        onMouseLeave={() => setIsDrawing(false)}
      />

      {STEPS.map((s) => (
        <canvas key={s} ref={maskCanvasRefs[s]} style={{ display: "none" }} />
      ))}

      {/* primary buttons */}
      <div
        style={{
          marginTop: 20,
          display: "flex",
          gap: 12,
          justifyContent: "center",
        }}
      >
        <button onClick={goNext} disabled={currentStep === "hand"}>
          Next
        </button>
        <button onClick={analyze} disabled={!canAnalyze}>
          Analyze
        </button>
      </div>

      {/* reset buttons */}
      <div
        style={{
          marginTop: 14,
          display: "flex",
          gap: 12,
          justifyContent: "center",
        }}
      >
        <button
          disabled={maskCounts.hair === 0}
          onClick={() => resetRegion("hair")}
        >
          Reset Hair
        </button>
        <button
          disabled={maskCounts.skin === 0}
          onClick={() => resetRegion("skin")}
        >
          Reset Skin
        </button>
        <button
          disabled={maskCounts.hand === 0}
          onClick={() => resetRegion("hand")}
        >
          Reset Hand
        </button>
      </div>
    </div>
  );
}
