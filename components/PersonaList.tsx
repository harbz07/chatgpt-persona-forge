import React from 'react';
import type { Persona } from '../types';
import { AddIcon } from './icons';

interface PersonaListProps {
  personas: Persona[];
  selectedPersonaId: string | null;
  onSelectPersona: (persona: Persona) => void;
  onNewPersona: () => void;
}

const PersonaList: React.FC<PersonaListProps> = ({ personas, selectedPersonaId, onSelectPersona, onNewPersona }) => {
  return (
    <nav className="p-2 md:p-0 md:pt-2">
      <div className="px-2 md:px-4 mb-2">
        <button 
          onClick={onNewPersona}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-blue-300 bg-blue-600/20 hover:bg-blue-600/40 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          title="Create a new custom persona"
        >
          <AddIcon />
          New Persona
        </button>
      </div>
      <ul className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
        {personas.map((persona) => (
          <li key={persona.id} className="flex-shrink-0 md:flex-shrink-1 pr-2 md:pr-0 md:px-4 md:py-0">
            <button
              onClick={() => onSelectPersona(persona)}
              className={`w-full text-left p-3 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center space-x-3 ${
                selectedPersonaId === persona.id
                  ? 'themed-bg-primary text-white shadow-md'
                  : 'hover:bg-slate-700/50'
              }`}
            >
              <div className="w-8 h-8 rounded-full flex-shrink-0 bg-slate-700 flex items-center justify-center text-lg shadow-inner">
                {persona.glyph}
              </div>
              <div className="truncate">
                <p className="font-semibold text-sm">{persona.name}</p>
                <p className="text-xs text-slate-400 truncate">{persona.description}</p>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default PersonaList;
