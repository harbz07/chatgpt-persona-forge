import React from 'react';

interface SpecCardProps {
  title: string;
  children: React.ReactNode;
}

const SpecCard: React.FC<SpecCardProps> = ({ title, children }) => {
  return (
    <div className="bg-slate-800/50 p-4 rounded-lg border themed-border-primary h-full transition-colors duration-500">
      <h4 className="font-bold themed-text-primary mb-2 transition-colors duration-500">{title}</h4>
      <div className="text-sm text-slate-400">{children}</div>
    </div>
  );
};

export default SpecCard;
