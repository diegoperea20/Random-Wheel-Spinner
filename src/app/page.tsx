"use client";

import Footer from "@/components/footer";
import { useState, useCallback, useEffect } from "react";

interface WheelItem {
  id: string;
  text: string;
  color: string;
}

const PASTEL_COLORS = [
  "#FFB3BA", "#FFDFBA", "#FFFFBA", "#BAFFC9", "#BAE1FF", "#E2BAFF",
  "#F0F0F0", "#FFD1DC", "#C9C9FF", "#B5EAD7", "#FFDAC1", "#E2F0CB",
];

const WHEEL_SIZE = 520;
const CENTER = WHEEL_SIZE / 2;
const RADIUS = CENTER - 2;

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState<WheelItem[]>([
    { id: "1",  text: "1",  color: PASTEL_COLORS[0]  },
    { id: "2",  text: "2",  color: PASTEL_COLORS[1]  },
    { id: "3",  text: "3",  color: PASTEL_COLORS[2]  },
    { id: "4",  text: "4",  color: PASTEL_COLORS[3]  },
    { id: "5",  text: "5",  color: PASTEL_COLORS[4]  },
    { id: "6",  text: "6",  color: PASTEL_COLORS[5]  },
    { id: "7",  text: "7",  color: PASTEL_COLORS[6]  },
    { id: "8",  text: "8",  color: PASTEL_COLORS[7]  },
    { id: "9",  text: "9",  color: PASTEL_COLORS[8]  },
    { id: "10", text: "10", color: PASTEL_COLORS[9]  },
    { id: "11", text: "11", color: PASTEL_COLORS[10] },
    { id: "12", text: "12", color: PASTEL_COLORS[11] },
  ]);
  const [rotation, setRotation]   = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner]         = useState<string | null>(null);
  const [showWinner, setShowWinner] = useState(false);
  const [inputText, setInputText]   = useState("");
  const [isEditing, setIsEditing]   = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const getColorForIndex = (index: number) =>
    PASTEL_COLORS[index % PASTEL_COLORS.length];

  const spin = useCallback(() => {
    if (isSpinning || items.length === 0) return;
    setIsSpinning(true);
    setShowWinner(false);
    setWinner(null);

    const segmentAngle = 360 / items.length;
    const randArr = new Uint32Array(2);
    crypto.getRandomValues(randArr);
    const rand1 = randArr[0] / 0xffffffff;
    const rand2 = randArr[1] / 0xffffffff;

    const targetIndex  = Math.floor(rand2 * items.length);
    const segMid       = targetIndex * segmentAngle + segmentAngle / 2;
    const R_needed     = ((90 - segMid) % 360 + 360) % 360;
    const currentMod   = ((rotation % 360) + 360) % 360;
    const advance      = (R_needed - currentMod + 360) % 360 || 360;
    const extraSpins   = Math.floor(5 + rand1 * 5);
    const newRotation  = rotation + advance + extraSpins * 360;

    setRotation(newRotation);

    setTimeout(() => {
      setWinner(items[targetIndex]?.text || null);
      setShowWinner(true);
      setIsSpinning(false);
    }, 4000);
  }, [isSpinning, items, rotation]);

  const addItem = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    setItems([
      ...items,
      { id: Date.now().toString(), text: trimmed, color: getColorForIndex(items.length) },
    ]);
    setInputText("");
  };

  const removeItem = (id: string) =>
    setItems(items.filter((item) => item.id !== id));

  const updateItem = (id: string, newText: string) =>
    setItems(items.map((item) => (item.id === id ? { ...item, text: newText } : item)));

  const resetWheel = () => {
    setRotation(0);
    setWinner(null);
    setShowWinner(false);
    setIsSpinning(false);
  };

  const clearAll = () => {
    setItems([]);
    resetWheel();
  };

  const renderWheel = () => {
    if (!mounted) return null;

    if (items.length === 0) {
      return <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="#334155" />;
    }

    const segmentAngle = 360 / items.length;

    return items.map((item, index) => {
      const startDeg = index * segmentAngle;
      const endDeg   = startDeg + segmentAngle;
      const midDeg   = startDeg + segmentAngle / 2;

      const toRad = (d: number) => ((d - 90) * Math.PI) / 180;
      const x1 = CENTER + RADIUS * Math.cos(toRad(startDeg));
      const y1 = CENTER + RADIUS * Math.sin(toRad(startDeg));
      const x2 = CENTER + RADIUS * Math.cos(toRad(endDeg));
      const y2 = CENTER + RADIUS * Math.sin(toRad(endDeg));
      const largeArc = segmentAngle > 180 ? 1 : 0;

      const pathD =
        items.length === 1
          ? `M ${CENTER},${CENTER} m -${RADIUS},0 a ${RADIUS},${RADIUS} 0 1,0 ${RADIUS * 2},0 a ${RADIUS},${RADIUS} 0 1,0 -${RADIUS * 2},0`
          : `M ${CENTER},${CENTER} L ${x1},${y1} A ${RADIUS},${RADIUS} 0 ${largeArc},1 ${x2},${y2} Z`;

      const textRadius = RADIUS * 0.62;
      const textRad    = toRad(midDeg);
      const tx         = CENTER + textRadius * Math.cos(textRad);
      const ty         = CENTER + textRadius * Math.sin(textRad);
      const svgAngle   = midDeg - 90;

      const maxLen    = 14;
      const lenFactor = Math.min(1, maxLen / Math.max(item.text.length, 1));
      const segFactor = Math.min(1, 10 / Math.max(items.length, 1));
      const fontSize  = Math.max(8, Math.round(17 * lenFactor * segFactor));
      const clipId    = `clip-${item.id}`;

      return (
        <g key={item.id}>
          <path d={pathD} fill={item.color} stroke="#1e293b" strokeWidth="1" />
          <clipPath id={clipId}>
            <path d={pathD} />
          </clipPath>
          <text
            x={tx}
            y={ty}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={fontSize}
            fontWeight="700"
            fill="#1e293b"
            clipPath={`url(#${clipId})`}
            style={{ textShadow: "0 1px 2px rgba(255,255,255,0.5)" }}
            transform={`rotate(${svgAngle}, ${tx}, ${ty})`}
          >
            {item.text.length > 12 ? (
              <>
                <tspan x={tx} dy="-0.6em">{item.text.slice(0, Math.ceil(item.text.length / 2))}</tspan>
                <tspan x={tx} dy="1.2em">{item.text.slice(Math.ceil(item.text.length / 2))}</tspan>
              </>
            ) : (
              item.text
            )}
          </text>
        </g>
      );
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center py-8 px-4">

      {/* Title */}
      <h1 className="text-3xl sm:text-4xl font-extrabold mb-8 text-center bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
        Random Wheel
      </h1>

      {/* ── Main layout ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col xl:flex-row items-center xl:items-start justify-center gap-8 w-full max-w-6xl">

        {/* ── Wheel ────────────────────────────────────────────────────────── */}
        <div className="relative flex items-center justify-center flex-shrink-0">

          {/* Pointer */}
          <div className="absolute right-[-14px] top-1/2 -translate-y-1/2 z-10 pointer-events-none">
            <svg width="28" height="28" viewBox="0 0 24 24">
              <g transform="translate(24,0) scale(-1,1)">
                <polygon
                  points="24,12 0,4 0,20"
                  fill="red"
                  filter="drop-shadow(0 1px 3px rgba(0,0,0,0.6))"
                />
              </g>
            </svg>
          </div>

          {/* Wheel wrapper — 500 px on mobile, up to 520 px on xl+ */}
          <div className="w-[min(500px,90vw)] xl:w-[520px] aspect-square">
            <div
              className="rounded-full shadow-2xl border-4 border-slate-700 overflow-hidden w-full h-full"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning
                  ? "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)"
                  : "transform 0.3s ease-out",
              }}
            >
              <svg
                width="100%"
                height="100%"
                viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`}
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  <filter id="inner-shadow">
                    <feDropShadow dx="0" dy="0" stdDeviation="2" floodOpacity="0.3" />
                  </filter>
                </defs>
                {renderWheel()}
                {/* Centre hub */}
                <circle cx={CENTER} cy={CENTER} r={34} fill="#1e293b" stroke="#475569" strokeWidth="2" />
                <text x={CENTER} y={CENTER} textAnchor="middle" dominantBaseline="middle" fontSize="24" fill="white">
                  ★
                </text>
              </svg>
            </div>
          </div>
        </div>

        {/* ── Controls ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4 w-full max-w-sm xl:max-w-xs xl:mt-4">
          <div className="bg-slate-800 rounded-lg p-4 shadow-lg">

            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-400">Items</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-slate-400 hover:text-white transition-colors p-1 rounded hover:bg-slate-700"
                  title="Edit"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  onClick={clearAll}
                  className="text-slate-400 hover:text-red-400 transition-colors p-1 rounded hover:bg-slate-700"
                  title="Clear all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Items list */}
            <div className="bg-slate-900 rounded-md p-2 mb-3 max-h-52 overflow-y-auto scrollbar-thin">
              {items.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-6">No items</p>
              ) : (
                <div className="space-y-1">
                  {items.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-slate-800 transition-colors group"
                    >
                      <span className="text-slate-500 text-xs w-5 shrink-0 text-right select-none">
                        {index + 1}
                      </span>
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      {isEditing ? (
                        <input
                          type="text"
                          value={item.text}
                          onChange={(e) => updateItem(item.id, e.target.value)}
                          className="flex-1 min-w-0 bg-slate-700 text-white px-2 py-0.5 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      ) : (
                        <span className="flex-1 min-w-0 text-sm text-slate-200 truncate">
                          {item.text}
                        </span>
                      )}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="shrink-0 text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        aria-label={`Remove ${item.text}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Input */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addItem()}
              placeholder="Add item and press Enter…"
              className="w-full bg-slate-700 text-white px-3 py-2 rounded-md text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-500"
            />

            {/* Spin / Reset */}
            <div className="flex gap-2">
              <button
                onClick={spin}
                disabled={isSpinning || items.length === 0}
                className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white py-2 px-4 rounded-md transition-colors font-semibold text-sm"
              >
                {isSpinning ? "Spinning…" : "Spin"}
              </button>
              <button
                onClick={resetWheel}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 rounded-md transition-colors font-medium text-sm"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Edit toggle */}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`w-full py-2 px-4 rounded-md transition-colors font-medium text-sm ${
              isEditing
                ? "bg-blue-600 hover:bg-blue-500 text-white"
                : "bg-slate-700 hover:bg-slate-600 text-white"
            }`}
          >
            {isEditing ? "✓ Save" : "✎ Edit items"}
          </button>
        </div>
      </div>

     {/* Winner banner */}
     
      {showWinner && winner && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-2xl text-center w-full max-w-[min(90vw,520px)]">
            <p className="text-slate-400 text-sm uppercase tracking-widest mb-3">Winner</p>
            <div
              className="font-bold text-yellow-400 mb-6 break-words leading-tight"
              style={{
                fontSize: winner.length > 30
                  ? "clamp(1rem, 3vw, 1.5rem)"
                  : winner.length > 15
                  ? "clamp(1.25rem, 4vw, 2rem)"
                  : "clamp(1.75rem, 6vw, 3rem)",
              }}
            >
              {winner.length > 380 ? `${winner.slice(0, 379)}...` : winner}
            </div>
            <button
              onClick={() => setShowWinner(false)}
              className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-8 rounded-lg transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <br />
      <Footer />
    </div>
  );
}