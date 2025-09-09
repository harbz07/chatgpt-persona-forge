import React, { useState, useEffect } from 'react';
import PersonaList from './components/PersonaList';
import PersonaDetail from './components/PersonaDetail';
import InfoCard from './components/InfoCard';
import PersonaForm from './components/PersonaForm';
import { PERSONAS } from './constants';
import type { Persona, PersonaVersion } from './types';

export type TargetAI = 'claude' | 'chatgpt';

const App: React.FC = () => {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(null);
  const [targetAI, setTargetAI] = useState<TargetAI>('claude');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [personaToEdit, setPersonaToEdit] = useState<Persona | null>(null);

  useEffect(() => {
    try {
      const loadedPersonas = localStorage.getItem('personas');
      if (loadedPersonas) {
        setPersonas(JSON.parse(loadedPersonas));
      } else {
        setPersonas(PERSONAS);
      }
    } catch (error) {
      console.error("Failed to load personas from localStorage", error);
      setPersonas(PERSONAS);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('personas', JSON.stringify(personas));
    } catch (error) {
      console.error("Failed to save personas to localStorage", error);
    }
  }, [personas]);

  const handleSelectPersona = (persona: Persona) => {
    setSelectedPersonaId(persona.id);
  };
  
  const handleNewPersona = () => {
    setPersonaToEdit(null);
    setIsFormOpen(true);
  };

  const handleEditPersona = (persona: Persona) => {
    setPersonaToEdit(persona);
    setIsFormOpen(true);
  };

  const handleDeletePersona = (personaId: string) => {
    setPersonas(prev => prev.filter(p => p.id !== personaId));
    if (selectedPersonaId === personaId) {
      setSelectedPersonaId(null);
    }
  };

  const handleSavePersona = (data: {
    name: string;
    glyph: string;
    description: string;
    rostamSpecs: string;
    sanctuarySpecs: string;
    commitMessage: string;
  }) => {
    const newVersion: PersonaVersion = {
      versionId: `v${Date.now()}`,
      timestamp: Date.now(),
      commitMessage: data.commitMessage,
      rostamSpecs: data.rostamSpecs,
      sanctuarySpecs: data.sanctuarySpecs,
    };

    if (personaToEdit) {
      // Update existing persona
      setPersonas(prev =>
        prev.map(p =>
          p.id === personaToEdit.id
            ? {
                ...p,
                name: data.name,
                glyph: data.glyph,
                description: data.description,
                versions: [...p.versions, newVersion],
                currentVersionId: newVersion.versionId,
              }
            : p
        )
      );
    } else {
      // Create new persona
      const newPersona: Persona = {
        id: `custom-${Date.now().toString(36)}-${Math.random().toString(36).substring(2)}`,
        name: data.name,
        glyph: data.glyph,
        description: data.description,
        isCustom: true,
        versions: [newVersion],
        currentVersionId: newVersion.versionId,
      };
      setPersonas(prev => [...prev, newPersona]);
      setSelectedPersonaId(newPersona.id);
    }

    setIsFormOpen(false);
    setPersonaToEdit(null);
  };

  const handleSwitchVersion = (personaId: string, versionId: string) => {
    setPersonas(prev =>
      prev.map(p =>
        p.id === personaId ? { ...p, currentVersionId: versionId } : p
      )
    );
  };

  const selectedPersona = personas.find(p => p.id === selectedPersonaId);
  const theme = targetAI === 'chatgpt' ? 'sanctuary-theme' : 'rostam-theme';
  const bgTheme = targetAI === 'chatgpt' ? 'sanctuary-bg' : 'rostam-bg';

  return (
    <div className={`bg-slate-900 text-slate-300 font-sans h-screen flex flex-col md:flex-row antialiased transition-colors duration-500 ${theme} ${bgTheme}`}>
      <aside className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-800 flex-shrink-0 bg-slate-900/70 backdrop-blur-sm md:overflow-y-auto">
        <div className="p-4 border-b border-slate-800 hidden md:block">
          <h1 className="text-xl font-bold text-white">⚗️ Persona Forge</h1>
        </div>
        <PersonaList
          personas={personas}
          selectedPersonaId={selectedPersonaId}
          onSelectPersona={handleSelectPersona}
          onNewPersona={handleNewPersona}
        />
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        {selectedPersona ? (
          <PersonaDetail
            persona={selectedPersona}
            targetAI={targetAI}
            onTargetAIChange={setTargetAI}
            onEdit={handleEditPersona}
            onDelete={handleDeletePersona}
            onSwitchVersion={handleSwitchVersion}
            onSaveTweak={handleSavePersona}
          />
        ) : (
          <InfoCard />
        )}
      </main>

      {isFormOpen && (
        <PersonaForm
          personaToEdit={personaToEdit}
          onSave={handleSavePersona}
          onClose={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
