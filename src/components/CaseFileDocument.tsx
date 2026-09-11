import React, { useState, useEffect, useRef } from "react";
import { CaseReport } from "../types";
import {
  Scale,
  Copy,
  Check,
  RotateCcw,
  MessageSquare,
  Printer,
  ChevronDown,
  ChevronUp,
  FileText,
} from "lucide-react";
import { playStamp, playTypewriterClack } from "../utils/audio";

interface CaseFileDocumentProps {
  report: CaseReport;
  photoUrl: string;
  onAppeal: () => void;
  isAppealing: boolean;
  onReset: () => void;
  onToggleCrossExam: () => void;
  isCrossExamOpen: boolean;
}

export const CaseFileDocument: React.FC<CaseFileDocumentProps> = ({
  report,
  photoUrl,
  onAppeal,
  isAppealing,
  onReset,
  onToggleCrossExam,
  isCrossExamOpen,
}) => {
  const [copied, setCopied] = useState(false);
  const [animatedSuspicion, setAnimatedSuspicion] = useState(0);
  const [streamedEvidence, setStreamedEvidence] = useState("");
  const [isEvidenceTyping, setIsEvidenceTyping] = useState(true);
  const [stampLanded, setStampLanded] = useState(false);

  // Typewriter effect for evidence
  useEffect(() => {
    setStreamedEvidence("");
    setIsEvidenceTyping(true);
    setStampLanded(false);
    setAnimatedSuspicion(0);

    const fullEvidence = report.evidence;
    let charIndex = 0;
    const typingSpeed = Math.max(16, Math.min(38, Math.floor(1800 / (fullEvidence.length || 1))));

    const interval = setInterval(() => {
      if (charIndex <= fullEvidence.length) {
        setStreamedEvidence(fullEvidence.slice(0, charIndex));
        if (charIndex % 3 === 0) {
          playTypewriterClack();
        }
        charIndex++;
      } else {
        clearInterval(interval);
        setIsEvidenceTyping(false);
      }
    }, typingSpeed);

    return () => clearInterval(interval);
  }, [report.evidence, report.case_number]);

  // Suspicion percentage animation
  useEffect(() => {
    let start = 0;
    const target = report.suspicion_percent;
    const duration = 1200;
    const startTime = performance.now();

    const animateNumber = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.round(start + (target - start) * easeProgress);
      setAnimatedSuspicion(currentVal);

      if (progress < 1) {
        requestAnimationFrame(animateNumber);
      } else {
        // Drop the rubber stamp right after suspicion reaches top!
        setTimeout(() => {
          setStampLanded(true);
          playStamp();
        }, 150);
      }
    };

    const animFrame = requestAnimationFrame(animateNumber);
    return () => cancelAnimationFrame(animFrame);
  }, [report.suspicion_percent, report.case_number]);

  const handleCopy = () => {
    const text = `GOOSE LAWYER — OFFICIAL REPORT
------------------------------------------------
Case Number: ${report.case_number}
Court: The Goose Court
Date: ${report.date_filed}
${report.appeal_count ? `Appeal Round: #${report.appeal_count}\n` : ""}
DETECTED VIBE:
${report.vibe}

WHAT YOU ARE ACCUSED OF:
${report.charge}

THE EVIDENCE (WHY YOU'RE IN TROUBLE):
"${report.evidence}"

HOW SUSPICIOUS YOU LOOK:
${report.suspicion_percent}%

FINAL VERDICT:
${report.verdict} [STAMP: ${report.stamp}]

NOTE FROM COURT:
${report.court_observations}

YOUR GOOSE LAWYER:
${report.lawyer_name}
------------------------------------------------
(100% fun fictional report made by Goose Lawyer)`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  // Stamp styling based on verdict text
  const isAcquitted =
    report.stamp.includes("CLEARED") ||
    report.stamp.includes("ACQUIT") ||
    report.verdict.toLowerCase().includes("not guilty") ||
    report.verdict.toLowerCase().includes("innocent");

  const stampColorClass = isAcquitted
    ? "border-[#26402F] text-[#26402F]"
    : "border-[#A5321F] text-[#A5321F]";

  return (
    <article
      id="case-docket-record"
      className="bg-[#EFE6D2] border border-[#1C1A15]/25 p-5 sm:p-8 md:p-10 shadow-xl relative transition-all"
    >
      {/* Top Gold Double Rule & Case Header */}
      <div className="border-b-[3px] border-double border-[#D9A441] pb-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 text-xs font-mono-legal text-[#6b6553]">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#1C1A15] tracking-wider">
              CASE NO. {report.case_number}
            </span>
            {report.appeal_count ? (
              <span className="bg-[#A5321F] text-[#EFE6D2] text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider">
                APPEAL #{report.appeal_count}
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-3">
            <span>DATE: {report.date_filed}</span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline">GOOSE COURT</span>
          </div>
        </div>
      </div>

      {/* Main Document Content */}
      <div className="relative">
        {/* Attached Photo Exhibit (Top Right Float on larger screens) */}
        <div className="sm:float-right mb-4 sm:mb-3 sm:ml-6 flex flex-col items-center">
          <div className="relative p-1.5 bg-white border border-[#1C1A15]/40 shadow-md transform rotate-1 hover:rotate-0 transition-transform">
            <img
              src={photoUrl}
              alt="Subject of inquiry"
              className="w-28 h-28 sm:w-36 sm:h-36 object-cover filter sepia-[0.15] contrast-[1.05]"
            />
            {/* Vintage photo tape / corner tabs */}
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-[#E3D7B8]/90 border border-[#1C1A15]/20 text-[9px] font-mono-legal px-2 py-0.5 shadow-xs text-[#1C1A15]">
              YOUR PHOTO
            </div>
          </div>
          <span className="text-[10px] font-mono-legal text-[#6b6553] mt-1 tracking-wider uppercase">
            The Suspect&apos;s Face
          </span>
        </div>

        {/* Title */}
        <h2 className="font-serif-heading font-black text-2xl sm:text-3xl text-[#26402F] tracking-tight m-0 mb-5">
          Goose Lawyer Case Report
        </h2>

        {/* Field: Detected Vibe */}
        <div className="mb-4">
          <span className="block text-[11px] font-mono-legal font-bold text-[#A5321F] uppercase tracking-wider mb-1">
            THE DETECTED VIBE:
          </span>
          <div className="text-base sm:text-lg font-mono-legal text-[#1C1A15] bg-white/40 border-l-3 border-[#26402F] px-3 py-1.5 font-bold">
            {report.vibe}
          </div>
        </div>

        {/* Field: Formal Charge */}
        <div className="mb-5">
          <span className="block text-[11px] font-mono-legal font-bold text-[#A5321F] uppercase tracking-wider mb-1">
            WHAT YOU ARE ACCUSED OF:
          </span>
          <div className="text-sm sm:text-base font-mono-legal font-bold text-[#1C1A15] leading-relaxed">
            {report.charge}
          </div>
        </div>

        {/* Field: Evidence Submitted (With Typewriter Reveal) */}
        <div className="mb-5">
          <span className="block text-[11px] font-mono-legal font-bold text-[#A5321F] uppercase tracking-wider mb-1">
            THE EVIDENCE (WHY YOU&apos;RE IN TROUBLE):
          </span>
          <blockquote className="m-0 text-sm sm:text-base font-serif-heading italic text-[#1C1A15] leading-relaxed bg-[#E3D7B8]/40 border-l-2 border-[#D9A441] pl-3.5 py-2">
            &ldquo;{streamedEvidence}
            {isEvidenceTyping && (
              <span className="inline-block w-2 h-4 bg-[#A5321F] ml-1 animate-pulse align-middle" />
            )}
            &rdquo;
          </blockquote>
        </div>

        {/* Field: Suspicion Level with Animated Meter */}
        <div className="mb-6 clear-both sm:clear-none">
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-[11px] font-mono-legal font-bold text-[#A5321F] uppercase tracking-wider">
              HOW SUSPICIOUS YOU LOOK:
            </span>
            <span className="text-xs font-mono-legal font-bold text-[#1C1A15]">
              {animatedSuspicion}% SUSPICIOUS
            </span>
          </div>

          <div className="h-3.5 bg-[#E3D7B8] border border-[#1C1A15]/30 overflow-hidden shadow-inner p-0.5">
            <div
              className="h-full transition-all duration-300 ease-out"
              style={{
                width: `${animatedSuspicion}%`,
                background: "linear-gradient(90deg, #D9A441 0%, #C85A17 50%, #A5321F 100%)",
              }}
            />
          </div>

          <div className="flex justify-between text-[10px] font-mono-legal text-[#6b6553] mt-1">
            <span>0% (Totally Innocent)</span>
            <span>50% (A Bit Suspicious)</span>
            <span>100% (Extremely Guilty)</span>
          </div>
        </div>

        {/* Verdict Box with Stamped Seal */}
        <div className="border-2 border-[#1C1A15] bg-white/60 p-5 sm:p-6 relative my-6 shadow-sm">
          {/* Official Rubber Stamp */}
          <div
            className={`stamp-seal absolute top-2 sm:top-3 right-3 sm:right-6 border-[3.5px] px-3.5 py-1 text-sm sm:text-base font-serif-heading font-black tracking-widest uppercase transform rotate-[-7deg] transition-all duration-300 pointer-events-none select-none ${stampColorClass} ${
              stampLanded
                ? "scale-100 opacity-95"
                : "scale-150 opacity-0"
            }`}
            style={{
              textShadow: "1px 1px 0px rgba(0,0,0,0.06)",
              boxShadow: "0 0 0 2px rgba(28,26,21,0.05)",
            }}
          >
            {report.stamp}
          </div>

          <span className="block text-[11px] font-mono-legal font-bold text-[#26402F] uppercase tracking-wider mb-1">
            THE FINAL VERDICT:
          </span>
          <div className="font-serif-heading font-bold text-lg sm:text-2xl text-[#1C1A15] pr-20 sm:pr-28 leading-snug">
            {report.verdict}
          </div>
          <div className="text-xs font-mono-legal text-[#6b6553] mt-2 italic border-t border-[#1C1A15]/10 pt-2">
            Note from Court: {report.court_observations}
          </div>
        </div>

        {/* Signature & Seal Block */}
        <div className="border-t border-[#1C1A15]/20 pt-4 mt-6 flex items-end justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono-legal text-[#6b6553] uppercase tracking-wider block">
              Your Presiding Goose Lawyer:
            </span>
            <div className="font-serif-heading italic font-bold text-xl sm:text-2xl text-[#1C1A15] tracking-tight">
              {report.lawyer_name}
            </div>
            <div className="text-[10px] font-mono-legal text-[#6b6553]">
              Licensed Goose Lawyer • Expert in Breadcrumbs and Law
            </div>
          </div>

          <div
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-[#D9A441] bg-[#D9A441]/15 flex flex-col items-center justify-center text-[#26402F] shadow-inner select-none"
            title="Official Goose Court Stamp"
          >
            <span className="text-xl sm:text-2xl leading-none">🪿</span>
            <span className="text-[8px] font-mono-legal font-bold tracking-widest text-[#1C1A15]">
              STAMPED
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons Toolbar */}
      <div className="mt-8 pt-5 border-t-2 border-dashed border-[#1C1A15]/20 flex flex-wrap gap-2.5 sm:gap-3">
        {/* Request Appeal (Contradictory Re-evaluation) */}
        <button
          onClick={onAppeal}
          disabled={isAppealing}
          className="flex-1 min-w-[170px] bg-[#A5321F] hover:bg-[#8a2818] disabled:bg-[#b8ab8c] text-[#EFE6D2] font-mono-legal font-bold text-xs sm:text-sm py-3 px-4 uppercase tracking-wider transition-all cursor-pointer shadow flex items-center justify-center gap-2"
          title="Ask the appeals court to give you a completely different verdict"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isAppealing ? "animate-spin" : ""}`} />
          <span>{isAppealing ? "Asking New Judges..." : "Ask for an Appeal (Change Verdict)"}</span>
        </button>

        {/* Cross-Examine Counsel */}
        <button
          onClick={onToggleCrossExam}
          className={`flex-1 min-w-[160px] font-mono-legal font-bold text-xs sm:text-sm py-3 px-4 uppercase tracking-wider transition-all cursor-pointer border flex items-center justify-center gap-2 ${
            isCrossExamOpen
              ? "bg-[#26402F] text-[#EFE6D2] border-[#26402F]"
              : "bg-white/60 hover:bg-white text-[#1C1A15] border-[#1C1A15] hover:border-[#26402F]"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 text-[#D9A441]" />
          <span>Argue with the Goose</span>
          {isCrossExamOpen ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Copy Text */}
        <button
          onClick={handleCopy}
          className="bg-transparent hover:bg-[#1C1A15] text-[#1C1A15] hover:text-[#EFE6D2] font-mono-legal font-bold text-xs sm:text-sm py-3 px-3.5 border border-[#1C1A15] transition-all cursor-pointer flex items-center justify-center gap-1.5"
          title="Copy report to clipboard"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{copied ? "Report Copied" : "Copy Report"}</span>
        </button>

        {/* Print / Save */}
        <button
          onClick={handlePrint}
          className="bg-transparent hover:bg-[#1C1A15] text-[#1C1A15] hover:text-[#EFE6D2] font-mono-legal font-bold text-xs sm:text-sm py-3 px-3 border border-[#1C1A15] transition-all cursor-pointer hidden md:flex items-center justify-center"
          title="Print official case file"
        >
          <Printer className="w-3.5 h-3.5" />
        </button>

        {/* File New Evidence */}
        <button
          onClick={onReset}
          className="bg-transparent hover:bg-[#1C1A15] text-[#1C1A15] hover:text-[#EFE6D2] font-mono-legal font-bold text-xs sm:text-sm py-3 px-3 border border-[#1C1A15] transition-all cursor-pointer flex items-center justify-center"
          title="Try another photo"
        >
          <FileText className="w-3.5 h-3.5 mr-1" />
          <span>Try Another Photo</span>
        </button>
      </div>
    </article>
  );
};
