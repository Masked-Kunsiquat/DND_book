import React from "react";

const LocationsSection = () => {
  return (
    <div className="locations-section">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
        Locations
      </h2>
      <p className="text-gray-600 dark:text-gray-400">
        Manage and explore locations for your campaign.
      </p>
      {/* Placeholder for locations content */}
      <div className="mt-4 space-y-2">
        <div className="p-4 border rounded-md shadow-sm">Location 1</div>
        <div className="p-4 border rounded-md shadow-sm">Location 2</div>
        <div className="p-4 border rounded-md shadow-sm">Location 3</div>
      </div>
    </div>
  );
};

export default LocationsSection;
