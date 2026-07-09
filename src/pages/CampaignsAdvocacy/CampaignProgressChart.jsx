import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';

export default function CampaignProgressChart({ current, goal, label = "Signatures" }) {
  const percent = Math.min(Math.round((current / goal) * 100), 100);
  const data = [
    {
      name: 'Progress',
      current: current,
      remaining: Math.max(goal - current, 0),
    },
  ];

  return (
    <div className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-6">
      <div className="flex justify-between items-center text-sm font-semibold text-gray-700 mb-2">
        <span>Current Progress ({percent}%)</span>
        <span className="text-gray-500">{current.toLocaleString()} / {goal.toLocaleString()} {label}</span>
      </div>

      <div className="w-full h-8 mb-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
          >
            <XAxis type="number" hide domain={[0, goal]} />
            <YAxis type="category" dataKey="name" hide />
            {/* Custom rounded stacked bar representing progress */}
            <Bar dataKey="current" stackId="a" fill="#e05b3d" radius={percent >= 100 ? [8, 8, 8, 8] : [8, 0, 0, 8]} />
            <Bar dataKey="remaining" stackId="a" fill="#ffedd5" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs text-gray-400 font-light mt-2">
        Updates automatically every 24 hours. Sign or share to help us cross the finish line.
      </p>
    </div>
  );
}
