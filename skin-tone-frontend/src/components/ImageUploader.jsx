export default function ImageUploader({ onImageLoad }) {
  const inputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => onImageLoad(img);
    img.src = URL.createObjectURL(file);
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/png, image/jpeg"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      <button
        type="button"
        className="primary-btn"
        onClick={() => inputRef.current.click()}
      >
        Upload Image
      </button>
    </>
  );
}
