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
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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

    canvas.width = 600;
    canvas.height = 450;

    const img = new Image();
    img.onload = () => drawImagePreserveAspect(ctx, img, canvas);
    img.src = imageData.previewUrl;

    STEPS.forEach((s) => {
      const c = maskCanvasRefs[s].current;
      c.width = 600;
      c.height = 450;
      const mctx = c.getContext("2d");
      mctx.fillStyle = "black";
      mctx.fillRect(0, 0, 600, 450);
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
        const data = maskCtx.getImageData(0, 0, 600, 450).data;

        ctx.fillStyle = "rgba(251, 146, 60, 0.4)"; // Orange overlay
        for (let i = 0; i < data.length; i += 4) {
          if (data[i] === 255) {
            const x = (i / 4) % 600;
            const y = Math.floor(i / 4 / 600);
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

    ctx.fillStyle = "rgba(251, 146, 60, 0.5)"; // Orange overlay
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fill();

    maskCtx.fillStyle = "white";
    maskCtx.beginPath();
    maskCtx.arc(x, y, 8, 0, Math.PI * 2);
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
    ctx.fillRect(0, 0, 600, 450);

    const newMaskCounts = {
      ...maskCounts,
      [region]: 0,
    };

    setMaskCounts(newMaskCounts);

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
    setIsAnalyzing(true);
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
    } finally {
      setIsAnalyzing(false);
    }
  };

  const canAnalyze = maskCounts.hair > 0 && maskCounts.skin > 0;

  const getStepLabel = (step) => {
    const labels = {
      hair: "Hair",
      skin: "Skin",
      hand: "Hand (Optional)"
    };
    return labels[step];
  };

  /* ---------- UI ---------- */
  return (
    <div className="canvas-container">
      {/* Step Indicators */}
      <div className="step-indicators">
        {STEPS.map((step, index) => (
          <div
            key={step}
            className={`step-indicator ${currentStep === step ? 'active' : ''} ${maskCounts[step] > 0 ? 'completed' : ''}`}
          >
            <div className="step-number">{index + 1}</div>
            <div className="step-label">{getStepLabel(step)}</div>
          </div>
        ))}
      </div>

      {/* Current Step Instruction */}
      <div className="step-instruction">
        <h3>
          {currentStep === "hair" && "🎨 Select your hair region"}
          {currentStep === "skin" && "✨ Select your skin region"}
          {currentStep === "hand" && "👋 Select your hand region (optional)"}
        </h3>
        <p>Click and drag on the image to mark the region</p>
      </div>

      {/* Canvas */}
      <div className="canvas-wrapper">
        <canvas
          ref={canvasRef}
          className="main-canvas"
          onMouseDown={(e) => {
            setIsDrawing(true);
            const r = canvasRef.current.getBoundingClientRect();
            const scaleX = canvasRef.current.width / r.width;
            const scaleY = canvasRef.current.height / r.height;
            drawPoint(
              (e.clientX - r.left) * scaleX,
              (e.clientY - r.top) * scaleY
            );
          }}
          onMouseMove={(e) => {
            if (!isDrawing) return;
            const r = canvasRef.current.getBoundingClientRect();
            const scaleX = canvasRef.current.width / r.width;
            const scaleY = canvasRef.current.height / r.height;
            drawPoint(
              (e.clientX - r.left) * scaleX,
              (e.clientY - r.top) * scaleY
            );
          }}
          onMouseUp={() => setIsDrawing(false)}
          onMouseLeave={() => setIsDrawing(false)}
        />
      </div>

      {STEPS.map((s) => (
        <canvas key={s} ref={maskCanvasRefs[s]} style={{ display: "none" }} />
      ))}

      {/* Action Buttons */}
      <div className="canvas-actions">
        <div className="primary-actions">
          <button
            className="btn-secondary"
            onClick={goNext}
            disabled={currentStep === "hand"}
          >
            Next Step →
          </button>
          <button
            className="btn-primary"
            onClick={analyze}
            disabled={!canAnalyze || isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <span className="spinner"></span>
                Analyzing...
              </>
            ) : (
              "✨ Analyze Colors"
            )}
          </button>
        </div>

        {/* Reset Buttons */}
        <div className="reset-actions">
          <button
            className="btn-reset"
            disabled={maskCounts.hair === 0}
            onClick={() => resetRegion("hair")}
          >
            Reset Hair
          </button>
          <button
            className="btn-reset"
            disabled={maskCounts.skin === 0}
            onClick={() => resetRegion("skin")}
          >
            Reset Skin
          </button>
          <button
            className="btn-reset"
            disabled={maskCounts.hand === 0}
            onClick={() => resetRegion("hand")}
          >
            Reset Hand
          </button>
        </div>
      </div>
    </div>
  );
}
