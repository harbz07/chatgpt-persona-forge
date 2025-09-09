import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import type { Persona, PersonaVersion } from '../types';
import type { TargetAI } from '../App';
import { SparklesIcon } from './icons';

interface LiveTweakProps {
  persona: Persona;
  currentVersion: PersonaVersion;
  targetAI: TargetAI;
  onSaveTweak: (personaData: {
    name: string;
    glyph: string;
    description: string;
    rostamSpecs: string;
    sanctuarySpecs: string;
    commitMessage: string;
  }) => void;
}

const LiveTweak: React.FC<LiveTweakProps> = ({ persona, currentVersion, targetAI, onSaveTweak }) => {
  const [tweakInstruction, setTweakInstruction] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedSpecs, setSuggestedSpecs] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateTweak = async () => {
    if (!tweakInstruction.trim()) {
      setError('Please enter a tweak instruction.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuggestedSpecs(null);

    try {
      if (!process.env.API_KEY) {
        throw new Error("API key not found.");
      }
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const currentSpecs = targetAI === 'chatgpt' ? currentVersion.sanctuarySpecs : currentVersion.rostamSpecs;
      const format = targetAI === 'claude' ? 'JSON' : 'structured text';

      const systemInstruction = `You are an automated persona specification editor. Your task is to modify the provided specs based on the user's instruction.

CRITICAL INSTRUCTIONS:
1. Your response must be *only* the modified specification content.
2. Output ONLY the raw, modified spec content.
3. The output format must match the original format (${format}).
4. Do not include any commentary, explanations, code fences (e.g., \`\`\`json), or markdown. Your entire response should be the raw spec text and nothing else.
5. If the instruction is ambiguous, unsafe, or cannot be reasonably applied, return the original specs without any changes or explanation.`;
      
      const userPrompt = `Apply the following tweak to the provided persona specs.

---Tweak Instruction---
"${tweakInstruction}"

---Original Specs---
${currentSpecs}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userPrompt,
        config: {
          systemInstruction: systemInstruction,
        }
      });

      const tweakedSpecs = response.text.trim();
      
      if (!tweakedSpecs) {
        setError('AI could not generate suggestions for this tweak.');
        setIsLoading(false);
        return;
      }
      
      if (targetAI === 'claude') {
        try {
          JSON.parse(tweakedSpecs);
        } catch (jsonError) {
          console.error("AI returned invalid JSON for Claude:", jsonError);
          setError("AI returned invalid JSON. Please try rewording your tweak or regenerating.");
          setIsLoading(false);
          return;
        }
      }

      setSuggestedSpecs(tweakedSpecs);

    } catch (err) {
      console.error("Error generating tweak:", err);
      // Fix: Update Gemini API error message to be more compliant with guidelines.
      setError("Error: The API_KEY environment variable is not configured. This feature requires a valid Google Gemini API key to function.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyTweak = () => {
    if (!suggestedSpecs) return;

    const newRostamSpecs = targetAI === 'claude' ? suggestedSpecs : currentVersion.rostamSpecs;
    const newSanctuarySpecs = targetAI === 'chatgpt' ? suggestedSpecs : currentVersion.sanctuarySpecs;

    onSaveTweak({
      name: persona.name,
      glyph: persona.glyph,
      description: persona.description,
      rostamSpecs: newRostamSpecs,
      sanctuarySpecs: newSanctuarySpecs,
      commitMessage: `AI Tweak: ${tweakInstruction}`,
    });

    // Reset form
    setSuggestedSpecs(null);
    setTweakInstruction('');
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="tweak-instruction" className="block text-sm font-medium text-slate-300 mb-1">
          Describe a change in plain English
        </label>
        <p className="text-xs text-slate-400 mb-2">Example: "Make the persona more sarcastic" or "Add a core motif about loyalty."</p>
        <textarea
          id="tweak-instruction"
          value={tweakInstruction}
          onChange={(e) => setTweakInstruction(e.target.value)}
          rows={3}
          className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="Enter tweak instruction..."
          disabled={isLoading}
          title="Describe the change you want to make to the persona"
        />
      </div>
      <button
        onClick={handleGenerateTweak}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
        title="Use AI to generate a new version based on your instruction"
      >
        {isLoading ? (
          'Generating...'
        ) : (
          <>
            <SparklesIcon />
            Generate Suggestion
          </>
        )}
      </button>

      {error && <p className="text-sm text-red-400 bg-red-900/50 p-3 rounded-md">{error}</p>}

      {suggestedSpecs && (
        <div className="space-y-4 pt-4 border-t border-slate-700/50">
          <h4 className="font-semibold text-slate-200">Suggested Update:</h4>
          <pre className="w-full bg-slate-900 border border-slate-700 rounded-md p-3 text-xs text-slate-300 max-h-60 overflow-auto whitespace-pre-wrap">
            <code>{suggestedSpecs}</code>
          </pre>
          <div className="flex gap-4">
            <button
              onClick={() => setSuggestedSpecs(null)}
              className="w-full px-4 py-2 text-sm font-semibold text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors"
            >
              Discard
            </button>
            <button
              onClick={handleApplyTweak}
              className="w-full px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
            >
              Apply and Save as New Version
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveTweak;
