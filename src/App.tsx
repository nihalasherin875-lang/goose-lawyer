import React, { useState } from "react";
import { CaseReport } from "./types";
import { Masthead } from "./components/Masthead";
import { EvidenceIntake } from "./components/EvidenceIntake";
import { CaseFileDocument } from "./components/CaseFileDocument";
import { CrossExamination } from "./components/CrossExamination";
import { DeliberationOverlay } from "./components/DeliberationOverlay";
import { setSoundEnabled, isSoundEnabled, playGavel, playGooseHonk } from "./utils/audio";
import { normalizeAndCompressImage } from "./utils/image";

export default function App() {
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [fileMeta, setFileMeta] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAppealing, setIsAppealing] = useState<boolean>(false);
  const [report, setReport] = useState<CaseReport | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [isCrossExamOpen, setIsCrossExamOpen] = useState<boolean>(false);

  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) {
      playGooseHonk();
    }
  };

  const handleFileCase = async (imageDataUrl: string, metaText: string) => {
    setCurrentImage(imageDataUrl);
    setFileMeta(metaText);
    setIsLoading(true);
    setErrorMessage(null);
    setReport(null);
    setIsCrossExamOpen(false);

    try {
      // Ensure image is normalized JPEG (max 1024px) for fast and reliable transmission
      let normalizedDataUrl = imageDataUrl;
      if (!imageDataUrl.startsWith("data:image/jpeg;base64,")) {
        try {
          normalizedDataUrl = await normalizeAndCompressImage(imageDataUrl);
        } catch {
          normalizedDataUrl = imageDataUrl;
        }
      }

      const res = await fetch("/api/analyze-case", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: {
            data: normalizedDataUrl,
            mimeType: "image/jpeg",
          },
        }),
      });

      let data: Record<string, unknown> | null = null;
      try {
        data = await res.json();
      } catch {
        // Fallback for non-JSON errors
      }

      if (!res.ok || !data || data.error) {
        throw new Error(
          typeof data?.error === "string"
            ? data.error
            : `The court docket rejected this exhibit (Status ${res.status}). Clearer photographic evidence is requested.`
        );
      }

      setReport(data as unknown as CaseReport);
      playGavel();
    } catch (err: unknown) {
      console.error("Analysis error:", err);
      let msg = "The court cannot admit this exhibit into the record. Please furnish a clearer photograph.";
      if (err instanceof Error) {
        if (err.name === "TypeError" && err.message.toLowerCase().includes("fetch")) {
          msg = "Connection timed out. The server took too long or dropped the connection. Please try again with a photo.";
        } else {
          msg = err.message;
        }
      }
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppeal = async () => {
    if (!currentImage || !report || isAppealing) return;

    setIsAppealing(true);
    setErrorMessage(null);

    try {
      let normalizedDataUrl = currentImage;
      if (!currentImage.startsWith("data:image/jpeg;base64,")) {
        try {
          normalizedDataUrl = await normalizeAndCompressImage(currentImage);
        } catch {
          normalizedDataUrl = currentImage;
        }
      }

      const res = await fetch("/api/analyze-case", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: {
            data: normalizedDataUrl,
            mimeType: "image/jpeg",
          },
          isAppeal: true,
          previousCase: report,
        }),
      });

      let data: Record<string, unknown> | null = null;
      try {
        data = await res.json();
      } catch {
        // Fallback for non-JSON errors
      }

      if (!res.ok || !data || data.error) {
        throw new Error(
          typeof data?.error === "string"
            ? data.error
            : `The judges could not complete your appeal (Status ${res.status}). Please try again.`
        );
      }

      setReport(data as unknown as CaseReport);
      playGavel();
    } catch (err: unknown) {
      console.error("Appeal error:", err);
      let msg = "Could not process your appeal. Please try clicking appeal again.";
      if (err instanceof Error) {
        if (err.name === "TypeError" && err.message.toLowerCase().includes("fetch")) {
          msg = "Connection interrupted while contacting the judges. Please try again.";
        } else {
          msg = err.message;
        }
      }
      setErrorMessage(msg);
    } finally {
      setIsAppealing(false);
    }
  };

  const handleReset = () => {
    setCurrentImage(null);
    setFileMeta("");
    setReport(null);
    setErrorMessage(null);
    setIsCrossExamOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4 sm:p-6 md:p-10">
      {/* Main Case File Container */}
      <main
        id="goose-lawyer-main"
        className="w-full max-w-[980px] bg-[#EFE6D2] border border-[#1C1A15]/30 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7),0_0_0_6px_#17281D] relative"
      >
        {/* Court Masthead */}
        <Masthead soundEnabled={soundOn} onToggleSound={handleToggleSound} />

        {/* Body Container */}
        <div className="p-6 sm:p-9 md:p-11 space-y-6">
          {/* Intake Phase (when no report yet or while loading) */}
          {!report && (
            <EvidenceIntake
              onFileCase={handleFileCase}
              isLoading={isLoading}
              errorMessage={errorMessage}
              onClearError={() => setErrorMessage(null)}
            />
          )}

          {/* Deliberation In Progress */}
          {isLoading && <DeliberationOverlay isAppeal={false} />}

          {/* Appellate Deliberation In Progress */}
          {isAppealing && <DeliberationOverlay isAppeal={true} />}

          {/* Report Phase */}
          {report && currentImage && !isLoading && (
            <div className="space-y-6">
              <CaseFileDocument
                report={report}
                photoUrl={currentImage}
                onAppeal={handleAppeal}
                isAppealing={isAppealing}
                onReset={handleReset}
                onToggleCrossExam={() => setIsCrossExamOpen((prev) => !prev)}
                isCrossExamOpen={isCrossExamOpen}
              />

              {/* Collapsible / Interactive Cross-Examination Chamber */}
              {isCrossExamOpen && <CrossExamination report={report} />}
            </div>
          )}
        </div>
      </main>

      {/* Official Satirical Disclaimer Footer */}
      <footer className="w-full max-w-[980px] mt-6 text-center text-xs font-mono-legal text-[#EFE6D2]/60 space-y-1">
        <p>
          Goose Lawyer is a fun, fictional app made for laughs. No real geese are licensed to practice law!
        </p>
        <p className="text-[11px] opacity-75">
          Powered by Gemini AI Vision • Upload a face to get a funny verdict
        </p>
      </footer>
    </div>
  );
}
