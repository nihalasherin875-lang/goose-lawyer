/**
 * Built-in sample exhibits for quick evaluation of Goose Lawyer
 */

export interface SampleExhibit {
  id: string;
  title: string;
  description: string;
  dataUrl: string;
}

// Crisp SVG-based portrait exhibits with clear expressions for vision testing
function createSvgDataUrl(svgContent: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent.trim())}`;
}

export const SAMPLE_EXHIBITS: SampleExhibit[] = [
  {
    id: "smug-suspect",
    title: "1. The Smug Smirk",
    description: "Half-smile and raised eyebrow with lots of confidence.",
    dataUrl: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">
        <rect width="300" height="300" fill="#E8DEC4"/>
        <circle cx="150" cy="140" r="85" fill="#E0A97B"/>
        <!-- Hair -->
        <path d="M75 110 Q140 50 225 100 Q205 70 150 70 Q95 70 75 110 Z" fill="#2C221E"/>
        <!-- Eyebrows: left raised high, right flat -->
        <path d="M95 115 Q115 100 135 118" stroke="#1C1A15" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M165 110 Q185 85 208 95" stroke="#1C1A15" stroke-width="4.5" fill="none" stroke-linecap="round"/>
        <!-- Eyes: squinty sly gaze -->
        <ellipse cx="115" cy="132" rx="10" ry="7" fill="#1C1A15"/>
        <ellipse cx="185" cy="128" rx="9" ry="6" fill="#1C1A15"/>
        <circle cx="113" cy="130" r="2.5" fill="#FFFFFF"/>
        <circle cx="183" cy="126" r="2.5" fill="#FFFFFF"/>
        <!-- Nose -->
        <path d="M150 135 L144 165 L156 165" stroke="#8C5C38" stroke-width="3" fill="none" stroke-linecap="round"/>
        <!-- Distinct smug half-smile -->
        <path d="M118 186 Q150 188 188 172" stroke="#1C1A15" stroke-width="4" fill="none" stroke-linecap="round"/>
        <circle cx="190" cy="170" r="2.5" fill="#8C5C38"/>
        <!-- Suit Collar -->
        <path d="M85 240 L150 215 L215 240 L215 300 L85 300 Z" fill="#1B263B"/>
        <path d="M135 220 L150 250 L165 220 Z" fill="#FFFFFF"/>
        <!-- Evidence Label -->
        <rect x="20" y="260" width="120" height="24" fill="#1C1A15" rx="3"/>
        <text x="80" y="276" fill="#EFE6D2" font-family="monospace" font-size="11" text-anchor="middle" font-weight="bold">SAMPLE #1</text>
      </svg>
    `),
  },
  {
    id: "side-eye",
    title: "2. The Side-Eye Look",
    description: "Looking sideways with doubt and closed lips.",
    dataUrl: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">
        <rect width="300" height="300" fill="#D8CEB7"/>
        <circle cx="150" cy="140" r="85" fill="#D19C73"/>
        <!-- Curly hair -->
        <path d="M65 130 Q70 60 150 60 Q230 60 235 130 C220 150 210 90 150 85 C90 90 80 150 65 130 Z" fill="#4A3525"/>
        <!-- Eyebrows furrowed in doubt -->
        <path d="M98 122 Q120 115 138 124" stroke="#1C1A15" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M162 124 Q180 115 202 122" stroke="#1C1A15" stroke-width="4" fill="none" stroke-linecap="round"/>
        <!-- Side-eye pupils looking far left -->
        <ellipse cx="118" cy="138" rx="12" ry="8" fill="#FFFFFF" stroke="#1C1A15" stroke-width="1.5"/>
        <ellipse cx="182" cy="138" rx="12" ry="8" fill="#FFFFFF" stroke="#1C1A15" stroke-width="1.5"/>
        <circle cx="110" cy="138" r="5" fill="#1C1A15"/>
        <circle cx="174" cy="138" r="5" fill="#1C1A15"/>
        <!-- Nose -->
        <path d="M150 140 L146 168 L154 168" stroke="#7A4E2B" stroke-width="3" fill="none" stroke-linecap="round"/>
        <!-- Pursed dubious lips -->
        <line x1="125" y1="188" x2="175" y2="186" stroke="#1C1A15" stroke-width="4" stroke-linecap="round"/>
        <!-- Sweater -->
        <path d="M75 240 Q150 220 225 240 L225 300 L75 300 Z" fill="#2E4032"/>
        <rect x="20" y="260" width="120" height="24" fill="#1C1A15" rx="3"/>
        <text x="80" y="276" fill="#EFE6D2" font-family="monospace" font-size="11" text-anchor="middle" font-weight="bold">SAMPLE #2</text>
      </svg>
    `),
  },
  {
    id: "unbothered",
    title: "3. The Big Happy Smile",
    description: "Wide genuine grin and calm, happy eyes.",
    dataUrl: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">
        <rect width="300" height="300" fill="#DFD6BE"/>
        <circle cx="150" cy="140" r="85" fill="#F0C3A0"/>
        <!-- Sleek Hair -->
        <path d="M65 140 Q80 50 150 50 Q220 50 235 140 Q210 80 150 80 Q90 80 65 140 Z" fill="#181818"/>
        <!-- Gentle, smiling brows -->
        <path d="M100 115 Q120 108 138 116" stroke="#1C1A15" stroke-width="3.5" fill="none" stroke-linecap="round"/>
        <path d="M162 116 Q180 108 200 115" stroke="#1C1A15" stroke-width="3.5" fill="none" stroke-linecap="round"/>
        <!-- Happy crescent-shaped smiling eyes -->
        <path d="M105 134 Q118 126 130 134" stroke="#1C1A15" stroke-width="3.5" fill="none" stroke-linecap="round"/>
        <path d="M170 134 Q182 126 195 134" stroke="#1C1A15" stroke-width="3.5" fill="none" stroke-linecap="round"/>
        <!-- Nose -->
        <path d="M150 135 L146 160 L154 160" stroke="#B07E58" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <!-- Wide beaming grin -->
        <path d="M115 178 Q150 215 185 178 Z" fill="#FFFFFF" stroke="#1C1A15" stroke-width="3.5"/>
        <path d="M120 180 Q150 182 180 180" stroke="#1C1A15" stroke-width="2"/>
        <!-- Bright yellow collared shirt -->
        <path d="M70 240 Q150 210 230 240 L230 300 L70 300 Z" fill="#D9A441"/>
        <rect x="20" y="260" width="120" height="24" fill="#1C1A15" rx="3"/>
        <text x="80" y="276" fill="#EFE6D2" font-family="monospace" font-size="11" text-anchor="middle" font-weight="bold">SAMPLE #3</text>
      </svg>
    `),
  },
  {
    id: "stoic-monologue",
    title: "4. The Serious Poker Face",
    description: "Completely straight face with zero emotion and intense stare.",
    dataUrl: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">
        <rect width="300" height="300" fill="#CEBA9B"/>
        <circle cx="150" cy="140" r="85" fill="#C59B79"/>
        <!-- Fedora / Shadowed hair -->
        <path d="M50 100 Q150 80 250 100 L230 75 Q150 60 70 75 Z" fill="#202020"/>
        <rect x="90" y="45" width="120" height="40" rx="6" fill="#2A2A2A"/>
        <!-- Heavy intense brow line -->
        <path d="M96 122 L140 125" stroke="#1C1A15" stroke-width="5" stroke-linecap="round"/>
        <path d="M160 125 L204 122" stroke="#1C1A15" stroke-width="5" stroke-linecap="round"/>
        <!-- Piercing forward stare -->
        <circle cx="118" cy="136" r="7" fill="#1C1A15"/>
        <circle cx="182" cy="136" r="7" fill="#1C1A15"/>
        <circle cx="116" cy="134" r="2" fill="#FFFFFF"/>
        <circle cx="180" cy="134" r="2" fill="#FFFFFF"/>
        <!-- Shadowed nose -->
        <path d="M150 125 L142 168 L158 168" stroke="#63432A" stroke-width="4" fill="none" stroke-linecap="round"/>
        <!-- Tight flat lip -->
        <line x1="120" y1="188" x2="180" y2="188" stroke="#1C1A15" stroke-width="4.5" stroke-linecap="round"/>
        <!-- Trenchcoat -->
        <path d="M70 240 L150 215 L230 240 L230 300 L70 300 Z" fill="#433A33"/>
        <rect x="20" y="260" width="120" height="24" fill="#1C1A15" rx="3"/>
        <text x="80" y="276" fill="#EFE6D2" font-family="monospace" font-size="11" text-anchor="middle" font-weight="bold">SAMPLE #4</text>
      </svg>
    `),
  },
];
