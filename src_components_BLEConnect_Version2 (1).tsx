import React from "react";

const BLEConnect: React.FC = () => {
  // Placeholder for BLE connection logic
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <h2 className="text-xl font-semibold mb-2">Device Connection</h2>
      <button
        className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 transition"
        // onClick={handleConnect}
        disabled
      >
        Connect to Heart Sensor (coming soon)
      </button>
      <p className="text-gray-500 mt-2 text-sm">Bluetooth support for heart-rate devices will be enabled soon.</p>
    </div>
  );
};

export default BLEConnect;