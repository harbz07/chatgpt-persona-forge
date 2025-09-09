import React, { useState } from 'react';
import type { Persona, PersonaVersion } from '../types';
import { HistoryIcon, CheckIcon } from './icons';

interface VersionHistoryProps {
  persona: Persona;
  onSwitchVersion: (personaId: string, versionId: string) => void;
}

const VersionHistory: React.FC<VersionHistoryProps> = ({ persona, onSwitchVersion }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectVersion = (versionId: string) => {
    onSwitchVersion(persona.id, versionId);
    setIsOpen(false);
  };
  
  const sortedVersions = [...persona.versions].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-700 rounded-md transition-colors"
        aria-label="View version history"
        title="View and switch between persona versions"
      >
        <HistoryIcon />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-20">
          <div className="p-3 border-b border-slate-700">
            <h3 className="font-semibold text-sm text-white">Version History</h3>
            <p className="text-xs text-slate-400">Select a version to view its specs.</p>
          </div>
          <ul className="py-1 max-h-60 overflow-y-auto">
            {sortedVersions.map((version) => (
              <li key={version.versionId}>
                <button
                  onClick={() => handleSelectVersion(version.versionId)}
                  className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700/50 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">{version.commitMessage}</p>
                    <p className="text-xs text-slate-500">{new Date(version.timestamp).toLocaleString()}</p>
                  </div>
                  {version.versionId === persona.currentVersionId && (
                    <CheckIcon />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default VersionHistory;