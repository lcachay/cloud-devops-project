import React from "react";

interface CircularProgressProps {
  size?: number;
  strokeWidth?: number;
  percentage: number;
  color?: string;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  size = 100,
  strokeWidth = 8,
  percentage,
  color = "slate-900",
}) => {
  const pct = Math.min(100, Math.max(0, percentage));

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <svg width={size} height={size} className='rotate-[-90deg]'>
      {/* Background Circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke='#e5e7eb' // Tailwind gray-200
        strokeWidth={strokeWidth}
        fill='none'
      />
      {/* Progress Circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap='round'
        fill='none'
      />
      <text
        x='50%'
        y='50%'
        dominantBaseline='middle'
        textAnchor='middle'
        className='text-sm font-medium fill-current text-gray-700'
        transform={`rotate(90, ${size / 2}, ${size / 2})`}
        style={{ lineHeight: 0 }}
      >
        {pct}%
      </text>
    </svg>
  );
};

export default CircularProgress;
