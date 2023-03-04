export interface Player {
  id: number;
  name: string;
  region: string;
  realm: string;
  class: number;
  details?: any;
  blizzardId: number;
}

export interface MatchResult {
  player: Player;
  lastRun: LastRun;
  lastSeenSpec: number;
}

interface LastRun {
  id: number;
  contentId: string;
  region: string;
  keystoneLevel: number;
  duration: number;
  completedTimestamp: number;
  faction: string;
  dungeon: number;
  created: number;
  affix1: number;
  affix2: number;
  affix3: number;
  affix4: number;
  periode: number;
  player1Id: number;
  player1Spec: number;
  player2Id: number;
  player2Spec: number;
  player3Id: number;
  player3Spec: number;
  player4Id: number;
  player4Spec: number;
  player5Id: number;
  player5Spec: number;
  score: number;
  zone: number;
  scoreLink?: any;
}


export interface RunData {
  player_id: number;
  region: string;
  realm: string;
  name: string;
  renames: any[];
  spec: number;
  season: Season;
  score: number;
  runs: Run[];
}

interface Run {
  dungeon: Dungeon;
  zone: Dungeon;
  affixes: number[];
  time: Time;
  keystonrun_id: number;
  keystone_level: number;
  faction: string;
  score: number;
  periode: number;
  players: BasicPlayer[];
  player_id: number;
}

interface BasicPlayer {
  index: number;
  id: number;
  spec: number;
}

interface Time {
  map_time: number;
  clear_time: number;
  ontime: boolean;
  completed_timestamp: number;
}

interface Dungeon {
  id: number;
  name: string;
  slug: string;
}

interface Season {
  id: number;
  name: string;
  start: number;
  end: number;
  region: string;
}
