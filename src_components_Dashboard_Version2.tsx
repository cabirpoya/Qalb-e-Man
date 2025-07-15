import React from "react";
import HeartRateChart from "./HeartRateChart";
import ECGChart from "./ECGChart";

const Dashboard: React.FC = () => {
  // Placeholder for live data from BLE
  const bpm = 72; // Example static data
  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col gap-4">
      <div className="flex items-center gap-6">
        <div>
          <div className="text-5xl font-bold text-pink-600">{bpm}</div>
          <div className="text-sm text-gray-500">BPM (Current)</div>
        </div>
        <div className="flex-1">
          <HeartRateChart />
        </div>
      </div>
      <div>
        <ECGChart />
      </div>
    </div>
  );
};

export default Dashboard;