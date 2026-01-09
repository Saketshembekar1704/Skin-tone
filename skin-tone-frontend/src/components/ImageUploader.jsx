import { useRef } from "react";

export default function ImageUploader({ onImageLoad }) {
  const inputRef = useRef(null);

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    onImageLoad({
      file, // for backend
      previewUrl: URL.createObjectURL(file), // for canvas
    });
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        style={{ display: "none" }}
        onChange={handleChange}
      />

      <button type="button" onClick={() => inputRef.current.click()}
        style={{margin: "20px"}}
        >
        Upload Image
      </button>
    </>
  );
}
