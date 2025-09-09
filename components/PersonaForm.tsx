import React, { useState, useEffect } from 'react';
import type { Persona } from '../types';

interface PersonaFormProps {
  personaToEdit: Persona | null;
  onSave: (data: {
    name: string;
    glyph: string;
    description: string;
    rostamSpecs: string;
    sanctuarySpecs: string;
    commitMessage: string;
  }) => void;
  onClose: () => void;
}

const PersonaForm: React.FC<PersonaFormProps> = ({ personaToEdit, onSave, onClose }) => {
  const [name, setName] = useState('');
  const [glyph, setGlyph] = useState('');
  const [description, setDescription] = useState('');
  const [rostamSpecs, setRostamSpecs] = useState('');
  const [sanctuarySpecs, setSanctuarySpecs] = useState('');
  const [commitMessage, setCommitMessage] = useState('');
  
  const [errors, setErrors] = useState({ glyph: '', rostamSpecs: '' });

  useEffect(() => {
    if (personaToEdit) {
      const currentVersion = personaToEdit.versions.find(v => v.versionId === personaToEdit.currentVersionId) || personaToEdit.versions[personaToEdit.versions.length - 1];
      setName(personaToEdit.name);
      setGlyph(personaToEdit.glyph);
      setDescription(personaToEdit.description);
      setRostamSpecs(currentVersion.rostamSpecs);
      setSanctuarySpecs(currentVersion.sanctuarySpecs);
      setCommitMessage('');
    } else {
      setName('');
      setGlyph('');
      setDescription('');
      setRostamSpecs('');
      setSanctuarySpecs('');
      setCommitMessage('Initial version');
    }
  }, [personaToEdit]);

  const validate = () => {
    const newErrors = { glyph: '', rostamSpecs: '' };
    let isValid = true;

    if (glyph.length > 1 || (!/\p{Emoji}/u.test(glyph) && glyph.length > 1)) {
       newErrors.glyph = 'Glyph must be a single character or emoji.';
       isValid = false;
    }

    try {
      if (rostamSpecs.trim()) JSON.parse(rostamSpecs);
    } catch (e) {
      newErrors.rostamSpecs = 'Rostam Specs must be valid JSON.';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleGlyphChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Use grapheme splitter logic if complex emojis are needed, for now this is fine.
    const firstChar = Array.from(val)[0] || '';
    setGlyph(firstChar);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !name.trim() || !glyph.trim() || !description.trim()) {
        alert("Please fix the errors and fill out all required fields.");
        return;
    }
    onSave({
      name,
      glyph,
      description,
      rostamSpecs,
      sanctuarySpecs,
      commitMessage: commitMessage || (personaToEdit ? 'Updated specs' : 'Initial version'),
    });
  };

  const formTitle = personaToEdit ? `Editing: ${personaToEdit.name}` : 'Create New Persona';

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-fast"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="form-title"
    >
      <form 
        onSubmit={handleSubmit}
        className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-slate-700"
        onClick={e => e.stopPropagation()}
      >
        <header className="p-4 border-b border-slate-700 flex-shrink-0">
          <h2 id="form-title" className="text-xl font-bold text-white">{formTitle}</h2>
        </header>

        <div className="p-6 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-slate-400 mb-1">Name</label>
              <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none" title="The public name of the persona"/>
            </div>
            <div>
              <label htmlFor="glyph" className="block text-sm font-medium text-slate-400 mb-1">Glyph</label>
              <input type="text" id="glyph" value={glyph} onChange={handleGlyphChange} required className={`w-full bg-slate-900 border ${errors.glyph ? 'border-red-500' : 'border-slate-700'} rounded-md px-3 py-2 text-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-center`} title="A single character or emoji to represent the persona"/>
              {errors.glyph && <p className="text-xs text-red-400 mt-1">{errors.glyph}</p>}
            </div>
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-400 mb-1">Description</label>
            <input type="text" id="description" value={description} onChange={e => setDescription(e.target.value)} required className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none" title="A short, one-line summary of the persona's role"/>
          </div>

          <div>
             <label htmlFor="commitMessage" className="block text-sm font-medium text-slate-400 mb-1">Reason for Change (Commit Message)</label>
             <input type="text" id="commitMessage" value={commitMessage} onChange={e => setCommitMessage(e.target.value)} required placeholder="e.g., 'Initial version' or 'Tuned down aggression'" className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none" title="Describe the changes you made in this version"/>
          </div>
          
          <div>
            <label htmlFor="rostamSpecs" className="block text-sm font-medium text-slate-400 mb-1">Rostam Specs (for Claude)</label>
            <textarea id="rostamSpecs" value={rostamSpecs} onChange={e => setRostamSpecs(e.target.value)} rows={6} className={`w-full bg-slate-900 border ${errors.rostamSpecs ? 'border-red-500' : 'border-slate-700'} rounded-md px-3 py-2 text-slate-300 font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none`} placeholder="Enter specs for Claude AI..." title="The detailed persona specifications for Claude (must be valid JSON)"/>
            {errors.rostamSpecs && <p className="text-xs text-red-400 mt-1">{errors.rostamSpecs}</p>}
          </div>

          <div>
            <label htmlFor="sanctuarySpecs" className="block text-sm font-medium text-slate-400 mb-1">Sanctuary Specs (for ChatGPT)</label>
            <textarea id="sanctuarySpecs" value={sanctuarySpecs} onChange={e => setSanctuarySpecs(e.target.value)} rows={6} className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-slate-300 font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Enter specs for ChatGPT..." title="The detailed persona specifications for ChatGPT (can be structured text)"/>
          </div>
        </div>

        <footer className="p-4 border-t border-slate-700 flex justify-end gap-3 flex-shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors" title="Close the form without saving changes">Cancel</button>
          <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed" title="Save the current changes as a new version">Save Persona</button>
        </footer>
      </form>
    </div>
  );
};

export default PersonaForm;