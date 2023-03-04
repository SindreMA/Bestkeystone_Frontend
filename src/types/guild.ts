export interface Guild {
  id: number;
  scan_id: number;
  faction: string;
  region: string;
  realm: string;
  realm_id: number;
  name: string;
  created: number;
  members: Member[];
}

export interface Member {
  scan_id: number;
  id: number;
  name: string;
  realm_id: number;
  realm: string;
  level: number;
  _class: number;
  race: number;
  rank: number;
  run_data: Rundata;
}

export interface Rundata {
  score: number;
  seasonBestRuns: SeasonBestRun[];
  weeklyRuns: SeasonBestRun[];
}

export interface SeasonBestRun {
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
}
