import React from "react";

const Loader: React.FC = () => {
  return (
    <div className="loading-container antialiased bg-neutral-900 bg-grid-white/[0.006] z-999999">
      <div className="loading-circle"></div>
    </div>
  );
};

export default Loader;
