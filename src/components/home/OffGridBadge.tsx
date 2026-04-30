'use client';

import { motion } from 'motion/react';

interface OffGridBadgeProps {
  score: number;
  compact?: boolean;
}

export default function OffGridBadge({ score, compact = false }: OffGridBadgeProps) {
  const radius = compact ? 14 : 22;
  const stroke = compact ? 3 : 4;
  const circumference = 2 * Math.PI * radius;
  // score is 0–10 from the admin form slider
  const filled = (score / 10) * circumference;
  const size = compact ? 36 : 56;

  const getColor = (s: number) => {
    if (s >= 8) return '#4A5D4B';
    if (s >= 6) return '#7D8E7E';
    if (s >= 4) return '#D4A373';
    return '#B8A9A9';
  };

  const color = getColor(score);

  return (
    <div
      className={`relative flex items-center justify-center rounded-full glass ${
        compact ? 'w-9 h-9' : 'w-14 h-14'
      }`}
      title={`Off-Grid Score: ${score}/10`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0 score-ring"
      >
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(125,142,126,0.15)"
          strokeWidth={stroke}
        />
        {/* Progress ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          whileInView={{ strokeDashoffset: circumference - filled }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>
      <span
        className={`font-bold text-charcoal z-10 ${compact ? 'text-[9px]' : 'text-xs'}`}
        style={{ color }}
      >
        {score}/10
      </span>
    </div>
  );
}
