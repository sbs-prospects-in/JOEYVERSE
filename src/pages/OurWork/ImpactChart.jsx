import React from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { FUNDING_ALLOCATION, MONTHLY_IMPACT_TRENDS } from '../../data/impactStats';

export default function ImpactChart() {
  // Custom tooltips for better styling control
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-100 p-3.5 rounded-xl shadow-md text-xs font-semibold text-gray-800">
          <p className="mb-1 text-gray-400 uppercase tracking-wider">{payload[0].name}</p>
          <p className="text-sm font-bold text-primary">
            {payload[0].value.toLocaleString()} {payload[0].name.includes('Meals') ? 'Meals' : payload[0].name.includes('Allocation') ? '%' : ''}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      
      {/* 1. Pie Chart - Resource Allocation */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Fund Allocation</h3>
          <p className="text-xs text-gray-500 mb-6">How every dollar/rupee donated is put to work</p>
        </div>
        <div className="h-64 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={FUNDING_ALLOCATION}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {FUNDING_ALLOCATION.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Custom Legend to match design tokens */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          {FUNDING_ALLOCATION.map((entry, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
              <span className="text-gray-500">{entry.name} ({entry.value}%)</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Bar Chart - Monthly Trends */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Monthly Feeding Trends</h3>
          <p className="text-xs text-gray-500 mb-6">Total cooked meals distributed per month in Ahmedabad</p>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={MONTHLY_IMPACT_TRENDS}
              margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} tickLine={false} />
              <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip formatter={(value) => [`${value.toLocaleString()} meals`, 'Meals distributed']} />
              <Bar dataKey="meals" fill="#e05b3d" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[11px] text-gray-400 text-center mt-6">
          Data compiled from daily kitchen stock counts & distribution route maps.
        </p>
      </div>

    </div>
  );
}
