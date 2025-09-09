import React, { useState, useCallback, useMemo } from 'react';
import type { Persona } from '../types';
import { CopyIcon, CheckIcon } from './icons';

const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    const textToCopy = typeof children === 'string' ? children : String(children);
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  }, [children]);

  return (
    <div className="relative group mt-2">
      <pre className="bg-slate-900 p-4 rounded-md border border-slate-700 text-xs text-slate-300 overflow-x-auto">
        <code>{children}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 bg-slate-700/50 text-slate-400 rounded-md opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Copy code"
        title="Copy code snippet"
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </button>
    </div>
  );
};

interface ConnectorInfoProps {
    persona: Persona;
}

const ConnectorInfo: React.FC<ConnectorInfoProps> = ({ persona }) => {
  const currentVersion = useMemo(() => {
    return persona?.versions.find(v => v.versionId === persona.currentVersionId) || persona?.versions[persona.versions.length - 1];
  }, [persona]);

  const openApiSchema = `openapi: 3.1.0
info:
  title: Persona Forge API
  description: API to fetch persona specifications.
  version: 1.0.0
servers:
  - url: https://your-api-server.com
paths:
  /personas/{personaId}:
    get:
      summary: Get Specs for '${persona.name}'
      description: Retrieves the latest version of specs for the persona '${persona.name}'. Role: ${persona.description}.
      operationId: getPersonaSpecsById
      parameters:
        - name: personaId
          in: path
          required: true
          schema:
            type: string
          example: "${persona.id}"
      responses:
        '200':
          description: Successful response with both Rostam (Claude) and Sanctuary (ChatGPT) specs.
          content:
            application/json:
              schema:
                type: object
                properties:
                  rostamSpecs:
                    type: string
                    description: "The JSON-formatted specs for Claude."
                  sanctuarySpecs:
                    type: string
                    description: "The text-formatted specs for ChatGPT."`;

    const claudeToolSchema = {
      name: "get_persona_specs",
      description: `Retrieves the detailed specifications for the '${persona.name}' persona (${persona.description}) to adopt its characteristics.`,
      input_schema: {
        type: "object",
        properties: {
          persona_id: {
            type: "string",
            description: `The unique identifier for the persona. Use '${persona.id}' for ${persona.name}.`
          }
        },
        required: ["persona_id"]
      }
    };

    const mockApiResponse = JSON.stringify({
        rostamSpecs: currentVersion?.rostamSpecs,
        sanctuarySpecs: currentVersion?.sanctuarySpecs
    }, null, 2);


  return (
    <div className="space-y-6 text-sm text-slate-400">
      <h3 className="text-xl font-bold text-white">Using Personas with Connectors</h3>
      <p>
        To allow an AI like ChatGPT or Claude to dynamically access a persona's latest version, you need to host a simple API. This application is client-side, but it can provide you with the necessary schemas and response structures to build that API.
      </p>
      
      <div>
        <h4 className="font-semibold text-lg text-slate-200 mb-2">Iterative Tweaking with Live AIs</h4>
        <p>
          While interacting with an AI using a persona, you can ask it for improvement suggestions:
        </p>
        <blockquote className="border-l-4 border-blue-500 pl-4 my-2 italic text-slate-500">
          "Based on our conversation, what's one change you'd suggest for your persona instructions to make you more effective?"
        </blockquote>
        <p>
          Copy the AI's suggestion and paste it into the "Live Tweak" tab. Gemini will apply the tweak to the specs, which you can then save as a new version. This makes your API-connected persona instantly up-to-date.
        </p>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-lg text-slate-200">ChatGPT Action Schema (OpenAPI)</h4>
        <p>Use this OpenAPI schema to create a GPT Action. Your server should expose an endpoint like <code className="bg-slate-700 text-xs rounded px-1 py-0.5">/personas/&#123;personaId&#125;</code> that returns the latest raw specs.</p>
        <CodeBlock>{openApiSchema}</CodeBlock>
      </div>

       <div className="space-y-4">
        <h4 className="font-semibold text-lg text-slate-200">Claude Tool Schema</h4>
        <p>Use this JSON schema to define a Tool for Claude. Your tool's implementation would call your API to fetch and return the specs.</p>
        <CodeBlock>{JSON.stringify(claudeToolSchema, null, 2)}</CodeBlock>
      </div>
      
      <div className="space-y-4">
        <h4 className="font-semibold text-lg text-slate-200">Mock API Response</h4>
        <p>Your API endpoint for <code className="bg-slate-700 text-xs rounded px-1 py-0.5">/personas/{persona.id}</code> should return a JSON object structured like this:</p>
        <CodeBlock>{mockApiResponse}</CodeBlock>
      </div>
    </div>
  );
};

export default ConnectorInfo;