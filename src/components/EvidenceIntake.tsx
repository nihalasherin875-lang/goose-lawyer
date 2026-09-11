import React, { useRef, useState, useEffect } from "react";
import { Upload, Camera, Sparkles, X, RefreshCw, AlertCircle, Loader2 } from "lucide-react";
import { SAMPLE_EXHIBITS, SampleExhibit } from "../sampleExhibits";
import { playGavel } from "../utils/audio";
import { normalizeAndCompressImage } from "../utils/image";

interface EvidenceIntakeProps {
  onFileCase: (imageDataUrl: string, fileMetaText: string) => void;
  isLoading: boolean;
  errorMessage: string | null;
  onClearError: () => void;
}

export const EvidenceIntake: React.FC<EvidenceIntakeProps> = ({
  onFileCase,
  isLoading,
  errorMessage,
  onClearError,
}) => {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [fileMeta, setFileMeta] = useState<string>("");
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop camera on unmount or when camera turns off
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const handleFileChange = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid photographic exhibit (JPEG, PNG, WEBP).");
      return;
    }
    onClearError();
    setIsProcessing(true);
    try {
      const normalized = await normalizeAndCompressImage(file);
      setSelectedImage(normalized);
      const sizeKb = Math.round(file.size / 1024);
      setFileMeta(`${file.name} (${sizeKb} KB — Docket Ready)`);
    } catch (err) {
      console.error("Normalization error, falling back to direct reader:", err);
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setFileMeta(file.name);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSelectSample = async (sample: SampleExhibit) => {
    onClearError();
    setIsProcessing(true);
    try {
      // Rasterize SVG preset into high-clarity JPEG for Gemini Vision
      const normalized = await normalizeAndCompressImage(sample.dataUrl);
      setSelectedImage(normalized);
      setFileMeta(`${sample.title} — Verified Court Preset`);
    } catch (err) {
      console.error("Failed to rasterize preset exhibit:", err);
      setSelectedImage(sample.dataUrl);
      setFileMeta(`${sample.title} — Official Court Preset`);
    } finally {
      setIsProcessing(false);
    }
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 640 }, facingMode: "user" },
      });
      streamRef.current = stream;
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraError("Camera unavailable. The court requires manual file submission.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const takeSnapshot = async () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const rawDataUrl = canvas.toDataURL("image/jpeg", 0.9);
      stopCamera();
      onClearError();
      setIsProcessing(true);
      try {
        const normalized = await normalizeAndCompressImage(rawDataUrl);
        setSelectedImage(normalized);
        setFileMeta(`Mugshot Snapshot — ${new Date().toLocaleTimeString()}`);
      } catch {
        setSelectedImage(rawDataUrl);
        setFileMeta(`Mugshot Snapshot — ${new Date().toLocaleTimeString()}`);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setFileMeta("");
    onClearError();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = () => {
    if (!selectedImage) return;
    playGavel();
    onFileCase(selectedImage, fileMeta);
  };

  return (
    <div className="space-y-6">
      {/* Intake Instructions */}
      <div className="border-l-2 border-[#D9A441] pl-3.5 py-0.5">
        <p className="font-serif-heading italic text-[15px] sm:text-[16px] text-[#4a4636] leading-relaxed m-0">
          Upload a photo of any face. Our funny goose lawyer will study the facial expression, vibe, and smile to give you a silly legal verdict!
        </p>
      </div>

      {/* Error Notice */}
      {errorMessage && (
        <div className="bg-[#A5321F]/10 border-2 border-[#A5321F] p-4 text-[#A5321F] flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm font-mono-legal leading-relaxed flex-1">
            <b className="uppercase tracking-wide block mb-1">Notice:</b>
            {errorMessage}
          </div>
          <button
            onClick={onClearError}
            className="text-[#A5321F] hover:opacity-75 p-1"
            title="Dismiss notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Camera Modal / Viewfinder */}
      {isCameraActive && (
        <div className="border-2 border-[#1C1A15] bg-[#1C1A15] p-4 text-[#EFE6D2] relative space-y-3">
          <div className="flex items-center justify-between text-xs font-mono-legal text-[#D9A441] border-b border-white/20 pb-2">
            <span>CAMERA VIEW — LOOK AT THE LENS</span>
            <button
              onClick={stopCamera}
              className="hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <X className="w-4 h-4" /> Cancel
            </button>
          </div>
          <div className="relative aspect-video max-h-[340px] mx-auto overflow-hidden bg-black flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform -scale-x-100"
              onLoadedMetadata={() => videoRef.current?.play()}
            />
            <div className="absolute inset-0 border border-white/20 pointer-events-none grid grid-cols-3 grid-rows-3" />
          </div>
          <div className="flex justify-center gap-3 pt-1">
            <button
              onClick={takeSnapshot}
              className="bg-[#A5321F] hover:bg-[#8a2818] text-[#EFE6D2] font-mono-legal font-bold px-6 py-2.5 text-sm uppercase tracking-wide cursor-pointer transition-colors shadow"
            >
              Take Photo
            </button>
          </div>
        </div>
      )}

      {cameraError && (
        <div className="text-xs font-mono-legal text-[#A5321F] bg-[#A5321F]/10 p-2.5 border border-[#A5321F]/40">
          {cameraError}
        </div>
      )}

      {/* Main Upload / Preview Box */}
      {!selectedImage ? (
        <div>
          <span className="text-xs text-[#26402F] font-bold block mb-2 font-mono-legal tracking-wider">
            STEP 1: CHOOSE A PHOTO
          </span>
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed py-8 px-6 text-center cursor-pointer transition-all ${
              isDragOver
                ? "border-[#26402F] bg-white/70 scale-[0.99]"
                : "border-[#1C1A15]/25 bg-white/35 hover:bg-white/60 hover:border-[#26402F]"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileChange(e.target.files[0]);
                }
              }}
            />
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-12 h-12 rounded-full bg-[#E3D7B8] border border-[#1C1A15]/20 flex items-center justify-center text-[#26402F]">
                <Upload className="w-6 h-6" />
              </div>
              <div className="font-mono-legal font-bold text-sm sm:text-base text-[#1C1A15]">
                Click to upload a photo
              </div>
              <div className="font-mono-legal text-xs text-[#6b6553]">
                or drag and drop your picture here (JPG, PNG, WebP)
              </div>

              <div className="mt-3 pt-3 border-t border-[#1C1A15]/15 flex items-center gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    startCamera();
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-mono-legal font-bold bg-[#26402F] hover:bg-[#17281D] text-[#EFE6D2] px-3.5 py-1.5 transition-colors cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 text-[#D9A441]" />
                  <span>Take a Selfie with Camera</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sample Exhibits Section for Rapid Testing */}
          <div className="mt-6 pt-5 border-t border-[#1C1A15]/15">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-mono-legal font-bold text-[#6b6553] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#D9A441]" />
                Or Pick an Example Photo (Try Now):
              </span>
              <span className="text-[11px] font-mono-legal text-[#6b6553]">
                Click any face to see how it works
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {SAMPLE_EXHIBITS.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => handleSelectSample(sample)}
                  className="group border border-[#1C1A15]/20 bg-white/40 hover:bg-white/90 p-2 text-left transition-all hover:border-[#26402F] hover:shadow-sm cursor-pointer"
                >
                  <div className="aspect-square w-full bg-[#D8CEB7] border border-[#1C1A15]/20 overflow-hidden mb-2 relative">
                    <img
                      src={sample.dataUrl}
                      alt={sample.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="font-mono-legal font-bold text-xs text-[#1C1A15] truncate">
                    {sample.title.split(":")[0]}
                  </div>
                  <div className="font-mono-legal text-[11px] text-[#6b6553] line-clamp-1">
                    {sample.title.split(":")[1] || sample.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Selected Image Preview Box */
        <div className="border-2 border-[#1C1A15] bg-white/45 p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1C1A15]/20 pb-2">
            <span className="text-xs font-mono-legal font-bold text-[#26402F] uppercase tracking-wider">
              PHOTO READY TO JUDGE
            </span>
            <button
              onClick={handleReset}
              className="text-xs font-mono-legal text-[#A5321F] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              Change Photo
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div className="relative group">
              <img
                src={selectedImage}
                alt="Selected evidence"
                className="w-28 h-28 sm:w-32 sm:h-32 object-cover border-2 border-[#1C1A15] shadow-sm filter contrast-[1.02] sepia-[0.1]"
              />
              <div className="absolute -top-1 -right-1 bg-[#1C1A15] text-[#EFE6D2] text-[10px] font-mono-legal font-bold px-1.5 py-0.5">
                PHOTO
              </div>
            </div>

            <div className="space-y-1.5 text-center sm:text-left flex-1 font-mono-legal">
              <div className="text-xs text-[#6b6553]">
                <b>Status:</b> Ready for Goose Lawyer to judge!
              </div>
              <div className="text-sm font-bold text-[#1C1A15] break-all">
                {fileMeta}
              </div>
              <p className="text-xs text-[#4a4636] italic pt-1">
                &ldquo;The goose lawyer will look closely at your smile, eyes, and overall vibe.&rdquo;
              </p>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading || isProcessing}
            className="w-full bg-[#A5321F] hover:bg-[#8a2818] active:translate-y-0.5 disabled:bg-[#b8ab8c] text-[#EFE6D2] font-mono-legal font-bold text-sm sm:text-base py-3.5 px-6 uppercase tracking-wider transition-all cursor-pointer shadow-md disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Preparing Photo...</span>
              </>
            ) : (
              <>
                <span>Judge My Face Now!</span>
                <span className="text-lg">⚖️</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
