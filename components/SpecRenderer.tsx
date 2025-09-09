import React, { useState, useCallback, useMemo } from 'react';
import { CopyIcon, CheckIcon } from './icons';
import SpecCard from './SpecCard';

// Helper to format keys like "voice_signature" to "Voice Signature"
const formatKey = (key: string): string => {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

// Enhanced recursive helper to render different value types from JSON
const renderValue = (value: any, level = 0): React.ReactNode => {
    if (Array.isArray(value)) {
        return (
            <ul className="list-disc list-inside space-y-1">
                {value.map((item, index) => (
                    <li key={index} className="break-words ml-4">
                        {renderValue(item, level + 1)}
                    </li>
                ))}
            </ul>
        );
    }
    if (typeof value === 'object' && value !== null) {
        return (
            <div className={`space-y-2 text-xs ${level > 0 ? 'pl-4 mt-1 border-l-2 border-slate-600' : ''}`}>
                {Object.entries(value).map(([key, val]) => (
                    <div key={key}>
                        <strong className="font-semibold text-slate-200">{formatKey(key)}:</strong>
                        <div className="pl-2">{renderValue(val, level + 1)}</div>
                    </div>
                ))}
            </div>
        );
    }
     if (typeof value === 'string' && value.includes('\n')) {
      return <p className="whitespace-pre-wrap break-words">{String(value)}</p>;
    }
    return <span className="break-words">{String(value)}</span>;
};


// More robust parser for Sanctuary Specs (text-based) using indentation cues
const parseSanctuarySpecs = (specs: string) => {
    if (!specs || !specs.trim()) {
        return [];
    }

    const sections: { title: string; content: string | string[] }[] = [];
    const lines = specs.trim().split('\n');
    let currentTitle = '';
    let currentContent: string[] = [];

    const commitSection = () => {
        if (currentTitle) {
            const contentStr = currentContent.join('\n').trim();
            
            // Check if it's a list by seeing if all non-empty lines start with '-'
            const contentLines = contentStr.split('\n').filter(line => line.trim() !== '');
            if (contentLines.length > 0 && contentLines.every(line => line.trim().startsWith('-'))) {
                const listItems = contentLines.map(line => line.trim().substring(1).trim()).filter(Boolean);
                sections.push({ title: currentTitle, content: listItems });
            } else {
                sections.push({ title: currentTitle, content: contentStr });
            }
        }
        currentTitle = '';
        currentContent = [];
    };

    for (const line of lines) {
        // A new section is a non-indented line with a colon.
        const isNewSection = !line.startsWith(' ') && !line.startsWith('\t') && line.includes(':');
        
        if (isNewSection) {
            commitSection();
            const parts = line.split(':');
            currentTitle = parts[0].trim();
            const restOfLine = parts.slice(1).join(':').trim();
            if (restOfLine) {
                currentContent.push(restOfLine);
            }
        } else if (currentTitle) {
            // This is a content line for the current section
            currentContent.push(line);
        }
    }
    commitSection(); // commit the last one

    return sections;
};


interface SpecRendererProps {
  title: string;
  specs: string;
}

const SpecRenderer: React.FC<SpecRendererProps> = ({ title, specs }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(specs).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy specs: ', err);
      alert('Failed to copy specs.');
    });
  }, [specs]);
  
  const parsedContent = useMemo(() => {
    const trimmedSpecs = specs ? specs.trim() : '';

    if (!trimmedSpecs) {
      return { type: 'empty' as const, data: null };
    }
    
    try {
      const data = JSON.parse(trimmedSpecs);
      // We only want to treat objects and arrays as JSON for SpecCard display
      if (typeof data === 'object' && data !== null) {
          return { type: 'json' as const, data };
      }
    } catch (e) {
      // Not valid JSON, fall through to text parsing
    }
    
    // Fallback for non-JSON or primitive JSON values
    return { type: 'text' as const, data: parseSanctuarySpecs(trimmedSpecs) };
  }, [specs]);


  return (
    <div className="space-y-4">
        <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg text-slate-300">{title}</h3>
            <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1 text-xs font-semibold text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Copy raw specs to clipboard"
            title="Copy the raw, unformatted specs to your clipboard"
            >
            {copied ? <CheckIcon /> : <CopyIcon />}
            {copied ? 'Copied Raw' : 'Copy Raw'}
            </button>
        </div>
      
      <div>
        {parsedContent.type === 'empty' ? (
            <div className="text-center text-slate-500 py-8 bg-slate-800/50 rounded-lg">No specs provided for this AI target.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {parsedContent.type === 'json' && Object.entries(parsedContent.data as Record<string, any>).map(([key, value]) => (
              <SpecCard key={key} title={formatKey(key)}>
                {renderValue(value)}
              </SpecCard>
            ))}

            {parsedContent.type === 'text' && (parsedContent.data as {title: string, content: string | string[] }[]).map(({ title, content }, index) => (
              <SpecCard key={`${title}-${index}`} title={formatKey(title)}>
                {Array.isArray(content) ? (
                  <ul className="list-disc list-inside space-y-1">
                    {content.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                ) : (
                  <p className="whitespace-pre-wrap break-words">{content}</p>
                )}
              </SpecCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SpecRenderer;