import React, { useState, useEffect } from "react";
import { Scale, Sparkles } from "lucide-react";

interface DeliberationOverlayProps {
  isAppeal?: boolean;
}

const NORMAL_STEPS = [
  "Looking closely at your smile, eyes, and eyebrow angle with AI...",
  "Checking the silly goose rulebook...",
  "Talking with the jury of 12 geese...",
  "Calculating how suspicious your face looks...",
  "Writing down your funny legal verdict...",
];

const APPEAL_STEPS = [
  "Calling the senior goose judges together...",
  "Looking at your photo again for tiny details...",
  "Finding a silly excuse to change your verdict...",
  "Writing an opposite ruling...",
  "Printing your final appeal papers...",
];

export const DeliberationOverlay: React.FC<DeliberationOverlayProps> = ({ isAppeal }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const steps = isAppeal ? APPEAL_STEPS : NORMAL_STEPS;

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % steps.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="py-12 px-6 text-center space-y-6 bg-white/40 border-2 border-dashed border-[#26402F]/40 my-6">
      <div className="relative inline-block">
        <div className="text-6xl animate-bounce select-none transform -scale-x-100">
          🪿
        </div>
        <div className="absolute -bottom-1 -right-2 bg-[#26402F] text-[#EFE6D2] rounded-full p-1.5 shadow">
          <Scale className="w-4 h-4 text-[#D9A441] animate-spin" />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-serif-heading font-black text-xl sm:text-2xl text-[#26402F] m-0">
          {isAppeal
            ? "The Goose Appeals Court is Deciding Your Case"
            : "The Goose Lawyer is Studying Your Face"}
        </h3>
        <p className="font-mono-legal text-xs sm:text-sm text-[#A5321F] font-bold tracking-wide flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#D9A441]" />
          <span>{steps[stepIndex]}</span>
        </p>
      </div>

      <div className="w-48 mx-auto h-1.5 bg-[#E3D7B8] overflow-hidden rounded-full">
        <div className="h-full bg-[#26402F] w-1/3 animate-pulse rounded-full" />
      </div>

      <p className="font-mono-legal text-[11px] text-[#6b6553] max-w-sm mx-auto italic">
        Please hold on while the goose checks your photo, expression, and vibe!
      </p>
    </div>
  );
};
