import { useRef, useState } from "react";

export default function ImageUploader({ onImageLoad }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleFileLoad = (file) => {
    if (!file || !file.type.match('image.*')) return;

    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    onImageLoad({
      file,
      previewUrl,
    });
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    handleFileLoad(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    handleFileLoad(file);
  };

  return (
    <div className="upload-section">
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        style={{ display: "none" }}
        onChange={handleChange}
      />

      {!preview ? (
        <div
          className={`upload-dropzone ${isDragging ? 'dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current.click()}
        >
          <div className="upload-icon">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <h3>Upload Your Photo</h3>
          <p className="upload-hint">
            Drag & drop or click to select
          </p>
          <p className="upload-formats">
            Supports: JPG, PNG, WEBP
          </p>
        </div>
      ) : (
        <div className="upload-preview">
          <img src={preview} alt="Preview" className="preview-image" />
          <button
            type="button"
            className="btn-secondary change-image-btn"
            onClick={() => {
              setPreview(null);
              inputRef.current.click();
            }}
          >
            Change Image
          </button>
        </div>
      )}
    </div>
  );
}
