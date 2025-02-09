import React, { useState } from "react";

const CollapsibleSection = ({ title, children }) => {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">{title}</h2>
        <button
          onClick={() => setIsVisible((prev) => !prev)}
          className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
        >
          {isVisible ? "Hide" : "Show"}
        </button>
      </div>
      {isVisible && children}
    </section>
  );
};

export default CollapsibleSection;
