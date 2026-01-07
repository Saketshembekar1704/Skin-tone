import { useState } from "react";
import ImageUploader from "./components/ImageUploader";
import CanvasSelector from "./components/CanvasSelector";
import ResultPanel from "./components/ResultPanel";

function App() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);

  return (
    <div className="app-root">
      <div className="app-container">
        <h1>Skin Tone Detection</h1>

        <ImageUploader onImageLoad={setImage} />

        {image && <CanvasSelector image={image} onResult={setResult} />}
        {result && <ResultPanel result={result} />}
      </div>
    </div>
  );

}



export default App;
