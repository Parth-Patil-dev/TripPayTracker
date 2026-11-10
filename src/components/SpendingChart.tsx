import React, { useState } from 'react';
import { TrendingUp, Calendar } from 'lucide-react';

interface ChartPoint {
  day: string;
  label: string;
  amount: number;
  cumulative: number;
}

interface SpendingChartProps {
  data: ChartPoint[];
  currencySymbol?: string;
}

export const SpendingChart: React.FC<SpendingChartProps> = ({
  data,
  currencySymbol = '$',
}) => {
  const [activeIdx, setActiveIdx] = useState<number>(data.length - 1);
  const [mode, setMode] = useState<'daily' | 'cumulative'>('daily');

  const values = data.map((d) => (mode === 'daily' ? d.amount : d.cumulative));
  const maxVal = Math.max(...values, 100);
  const minVal = 0;

  // Chart SVG coordinate calculations
  const width = 340;
  const height = 140;
  const paddingX = 20;
  const paddingY = 20;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const points = values.map((val, i) => {
    const x = paddingX + (i / (values.length - 1)) * chartWidth;
    const y = height - paddingY - ((val - minVal) / (maxVal - minVal)) * chartHeight;
    return { x, y, val, original: data[i] };
  });

  // Generate smooth SVG curve path (or cubic bezier)
  const linePath = points.reduce((acc, point, i, arr) => {
    if (i === 0) return `M ${point.x} ${point.y}`;
    const prev = arr[i - 1];
    const cpX1 = prev.x + (point.x - prev.x) / 2;
    const cpY1 = prev.y;
    const cpX2 = prev.x + (point.x - prev.x) / 2;
    const cpY2 = point.y;
    return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${point.x} ${point.y}`;
  }, '');

  // Gradient area underneath
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  const selectedPoint = points[activeIdx] || points[points.length - 1];

  return (
    <div className="bg-white rounded-[22px] p-4.5 border border-black/5 shadow-xs">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#E6FCB0] flex items-center justify-center text-[#3F6212]">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#0B0B0B] tracking-tight uppercase">
              Trip Velocity
            </h3>
            <p className="text-[11px] text-black/50">Spending trend across days</p>
          </div>
        </div>

        {/* Mode Toggle Pills */}
        <div className="flex items-center bg-[#F4F4F2] p-1 rounded-full border border-black/5">
          <button
            onClick={() => setMode('daily')}
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition ${
              mode === 'daily'
                ? 'bg-[#0B0B0B] text-white shadow-xs'
                : 'text-black/60 hover:text-black'
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setMode('cumulative')}
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition ${
              mode === 'cumulative'
                ? 'bg-[#0B0B0B] text-white shadow-xs'
                : 'text-black/60 hover:text-black'
            }`}
          >
            Total
          </button>
        </div>
      </div>

      {/* Selected Value Highlight Display */}
      <div className="flex items-baseline justify-between mt-2 mb-1 px-1">
        <div>
          <span className="text-[10px] font-semibold uppercase text-black/40">
            {selectedPoint.original.day} ({selectedPoint.original.label})
          </span>
          <div className="text-xl font-extrabold text-[#0B0B0B] tracking-tight">
            {currencySymbol}
            {selectedPoint.val.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#3F6212] bg-[#E6FCB0] px-2 py-0.5 rounded-full">
            ● Day {activeIdx + 1}
          </span>
        </div>
      </div>

      {/* Modern SVG Curve Chart */}
      <div className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-28 overflow-visible"
        >
          <defs>
            {/* Soft lime-to-white gradient fill underneath */}
            <linearGradient id="limeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C4F96B" stopOpacity="0.75" />
              <stop offset="70%" stopColor="#E6FCB0" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area Fill */}
          <path d={areaPath} fill="url(#limeGradient)" />

          {/* Thin dark-green line */}
          <path
            d={linePath}
            fill="none"
            stroke="#3F6212"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Clickable Nodes */}
          {points.map((pt, i) => {
            const isSelected = i === activeIdx;
            return (
              <g
                key={i}
                className="cursor-pointer group"
                onClick={() => setActiveIdx(i)}
              >
                {/* Invisible larger hit target */}
                <circle cx={pt.x} cy={pt.y} r="16" fill="transparent" />

                {isSelected && (
                  <>
                    {/* Vertical indicator guideline */}
                    <line
                      x1={pt.x}
                      y1={pt.y}
                      x2={pt.x}
                      y2={height}
                      stroke="#3F6212"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                      opacity="0.4"
                    />
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="7"
                      fill="#C4F96B"
                      stroke="#3F6212"
                      strokeWidth="2"
                    />
                  </>
                )}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isSelected ? '4' : '3'}
                  fill="#0B0B0B"
                  className="transition-transform group-hover:scale-125"
                />
              </g>
            );
          })}
        </svg>

        {/* X-Axis Day Labels */}
        <div className="flex justify-between items-center px-2 pt-1 text-[11px] font-semibold text-black/50 border-t border-black/5 mt-1">
          {data.map((d, i) => (
            <button
              key={d.day}
              onClick={() => setActiveIdx(i)}
              className={`transition hover:text-black ${
                i === activeIdx ? 'text-[#0B0B0B] font-bold' : ''
              }`}
            >
              {d.day}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
