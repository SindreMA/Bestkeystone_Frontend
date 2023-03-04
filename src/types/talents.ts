
export interface LookupTalents {
  id: number;
  talent: Talent;
  spell: Spell;
  specId: number;
  scanId: number;
  type: string;
  rank: number;
  isActive: boolean
  loadoutId: number
}

interface Spell {
  id: number;
  name: string;
  description: string;
  spellIconUrl: string;
  created: number;
}

interface Talent {
  uniqId: number;
  tierIndex: number;
  columnIndex: number;
  description: string;
  spellId: number;
  classId: number;
  name: string;
  created: number;
  specId: number;
  id: number;
}
