import React, { useState, useMemo } from 'react';
import type { Persona } from '../types';
import type { TargetAI } from '../App';
import SpecRenderer from './SpecRenderer';
import LiveTweak from './LiveTweak';
import ConnectorInfo from './ConnectorInfo';
import VersionHistory from './VersionHistory';
import { EditIcon, DeleteIcon } from './icons';

interface PersonaDetailProps {
  persona: Persona;
  targetAI: TargetAI;
  onTargetAIChange: (target: TargetAI) => void;
  onEdit: (persona: Persona) => void;
  onDelete: (personaId: string) => void;
  onSwitchVersion: (personaId: string, versionId: string) => void;
  onSaveTweak: (personaData: {
    name: string;
    glyph: string;
    description: string;
    rostamSpecs: string;
    sanctuarySpecs: string;
    commitMessage: string;
  }) => void;
}

type Tab = 'specs' | 'tweak' | 'connectors';

const PersonaDetail: React.FC<PersonaDetailProps> = ({ persona, targetAI, onTargetAIChange, onEdit, onDelete, onSwitchVersion, onSaveTweak }) => {
  const [activeTab, setActiveTab] = useState<Tab>('specs');

  const currentVersion = useMemo(() => {
    return persona.versions.find(v => v.versionId === persona.currentVersionId) || persona.versions[persona.versions.length - 1];
  }, [persona]);
  
  if (!persona || !currentVersion) {
    return <div className="p-8 text-center text-slate-400">Error: Could not load persona data.</div>;
  }

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete the persona "${persona.name}"? This action cannot be undone.`)) {
      onDelete(persona.id);
    }
  };

  const TabButton: React.FC<{ tabName: Tab; label: string }> = ({ tabName, label }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
        activeTab === tabName
          ? 'themed-bg-primary text-white'
          : 'text-slate-300 hover:bg-slate-700'
      }`}
    >
      {label}
    </button>
  );
  
  const headerBg = targetAI === 'chatgpt' ? 'sanctuary-bg' : 'rostam-bg';

  return (
    <div className="flex-1 flex flex-col bg-slate-800/50 overflow-y-auto">
      <header className={`p-4 border-b border-slate-700 sticky top-0 bg-slate-800/80 backdrop-blur-sm z-10 ${headerBg}`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-2xl shadow-inner themed-glow">
              {persona.glyph}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{persona.name}</h2>
              <p className="text-sm text-slate-400">{persona.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <VersionHistory persona={persona} onSwitchVersion={onSwitchVersion} />
            <button
              onClick={() => onEdit(persona)}
              className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-700 rounded-md transition-colors"
              aria-label="Edit persona"
              title="Edit persona details and specs"
            >
              <EditIcon />
            </button>
            {persona.isCustom && (
              <button
                onClick={handleDelete}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-md transition-colors"
                aria-label="Delete persona"
                title="Delete this custom persona"
              >
                <DeleteIcon />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="p-4 md:p-6 space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-700 p-1 rounded-lg">
                <TabButton tabName="specs" label="Specs" />
                <TabButton tabName="tweak" label="Live Tweak" />
                <TabButton tabName="connectors" label="Connectors" />
            </div>
          
            {activeTab !== 'connectors' && (
              <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-700 p-1 rounded-lg">
                  <span className="text-xs px-2 text-slate-400">Target AI:</span>
                  <button onClick={() => onTargetAIChange('claude')} className={`px-3 py-1 text-xs rounded-md transition-colors ${targetAI === 'claude' ? 'rostam-btn-active' : 'hover:bg-slate-700 text-slate-300'}`}>Claude</button>
                  <button onClick={() => onTargetAIChange('chatgpt')} className={`px-3 py-1 text-xs rounded-md transition-colors ${targetAI === 'chatgpt' ? 'sanctuary-btn-active' : 'hover:bg-slate-700 text-slate-300'}`}>ChatGPT</button>
              </div>
            )}
        </div>

        <div className="animate-fade-in-fast">
            {activeTab === 'specs' && (
                <div className="space-y-8">
                <SpecRenderer title="Rostam Specs (for Claude)" specs={currentVersion.rostamSpecs} />
                <SpecRenderer title="Sanctuary Specs (for ChatGPT)" specs={currentVersion.sanctuarySpecs} />
                </div>
            )}
            {activeTab === 'tweak' && <LiveTweak persona={persona} currentVersion={currentVersion} targetAI={targetAI} onSaveTweak={onSaveTweak} />}
            {activeTab === 'connectors' && <ConnectorInfo persona={persona} />}
        </div>
      </main>
    </div>
  );
};

export default PersonaDetail;
