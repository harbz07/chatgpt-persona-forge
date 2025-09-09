import React from 'react';

const InfoCard = () => {
  return (
    <div className="flex-1 flex items-center justify-center p-4 md:p-8">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-4">⚗️</div>
        <h2 className="text-2xl font-bold text-white mb-2">Welcome to Persona Forge</h2>
        <p className="text-slate-400">
          Select a persona from the list to view and manage its specifications, or create a new custom persona to get started.
        </p>
      </div>
    </div>
  );
};

export default InfoCard;
