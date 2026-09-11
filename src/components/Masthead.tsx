import React from "react";
import { Volume2, VolumeX, Scale, Sparkles } from "lucide-react";
import { playGooseHonk } from "../utils/audio";

interface MastheadProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Masthead: React.FC<MastheadProps> = ({
  soundEnabled,
  onToggleSound,
}) => {
  return (
    <header className="bg-[#26402F] text-[#EFE6D2] px-6 sm:px-10 py-7 border-b-[3px] border-double border-[#D9A441] relative shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={playGooseHonk}
            title="Click to make the goose honk!"
            className="text-4xl sm:text-5xl leading-none inline-block transform -scale-x-100 hover:scale-110 active:rotate-12 transition-transform cursor-pointer select-none"
            aria-label="Goose Mascot"
          >
            🪿
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif-heading font-black text-3xl sm:text-4xl tracking-tight text-[#EFE6D2] m-0">
                Goose Lawyer
              </h1>
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-mono-legal uppercase tracking-wider bg-[#17281D] text-[#D9A441] px-2.5 py-0.5 rounded border border-[#D9A441]/40">
                <Scale className="w-3 h-3" />
                AI Court
              </span>
            </div>
            <p className="font-mono-legal text-xs sm:text-sm text-[#EFE6D2]/80 mt-1 tracking-wide">
              The funny goose court that judges your facial expression
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-center">
          <button
            onClick={onToggleSound}
            className="flex items-center gap-1.5 text-xs font-mono-legal bg-[#17281D]/70 hover:bg-[#17281D] text-[#EFE6D2] px-3 py-1.5 border border-[#D9A441]/30 transition-colors"
            title={soundEnabled ? "Turn sound off" : "Turn sound on"}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#D9A441]" />
                <span className="hidden sm:inline">Sound On</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-[#EFE6D2]/50" />
                <span className="hidden sm:inline text-[#EFE6D2]/60">Sound Off</span>
              </>
            )}
          </button>

          <div className="hidden lg:flex items-center gap-1 text-[11px] font-mono-legal text-[#D9A441] bg-[#17281D] px-2.5 py-1.5 border border-[#D9A441]/30">
            <Sparkles className="w-3 h-3" />
            <span>Powered by AI Vision</span>
          </div>
        </div>
      </div>
    </header>
  );
};
