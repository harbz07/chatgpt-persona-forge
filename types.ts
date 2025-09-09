export interface PersonaVersion {
  versionId: string;
  timestamp: number;
  commitMessage: string;
  rostamSpecs: string; 
  sanctuarySpecs: string;
}

export interface Persona {
  id: string;
  name: string;
  glyph: string;
  description: string;
  versions: PersonaVersion[];
  currentVersionId: string;
  isCustom?: boolean;
}
