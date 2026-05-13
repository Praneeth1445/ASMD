import { useCallback, useState } from "react";
import { Upload, FolderOpen, Image } from "lucide-react";

const ImageUploader = ({ onFilesSelected, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previews, setPreviews] = useState([]);

  const handleFiles = useCallback(
    (files) => {
      const imageFiles = Array.from(files).filter((f) =>
        f.type.startsWith("image/")
      );
      if (imageFiles.length === 0) return;

      const newPreviews = imageFiles.map((f) => ({
        name: f.name,
        url: URL.createObjectURL(f),
      }));
      setPreviews((prev) => [...prev, ...newPreviews]);
      onFilesSelected(imageFiles);
    },
    [onFilesSelected]
  );

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      if (!disabled) handleFiles(e.dataTransfer.files);
    },
    [disabled, handleFiles]
  );

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-all duration-200 ${disabled
          ? "opacity-50 cursor-not-allowed border-muted"
          : isDragging
            ? "border-primary bg-primary/5 scale-[1.01]"
            : "border-border hover:border-primary/50 hover:bg-muted/50 cursor-pointer"
          }`}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          disabled={disabled}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Upload className="w-7 h-7 text-primary" />
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">
              Drop exam sheets here or click to upload
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Supports JPG, PNG, JPEG • Multiple files or folders
            </p>
          </div>
          <div className="flex gap-3 mt-2">
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 cursor-pointer transition-opacity">
              <Image className="w-4 h-4" />
              Select Images
              <input
                type="file"
                multiple
                accept="image/*"
                disabled={disabled}
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
                className="hidden"
              />
            </label>
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:opacity-90 cursor-pointer transition-opacity">
              <FolderOpen className="w-4 h-4" />
              Select Folder
              <input
                type="file"
                webkitdirectory=""
                directory=""
                multiple
                accept="image/*"
                disabled={disabled}
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {previews.length > 0 && (
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">
            {previews.length} image(s) selected
          </p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {previews.slice(0, 10).map((p, i) => (
              <img
                key={i}
                src={p.url}
                alt={p.name}
                className="h-16 w-24 object-cover rounded-lg border border-border flex-shrink-0"
              />
            ))}
            {previews.length > 10 && (
              <div className="h-16 w-24 rounded-lg border border-border flex items-center justify-center bg-muted text-sm text-muted-foreground flex-shrink-0">
                +{previews.length - 10} more
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
