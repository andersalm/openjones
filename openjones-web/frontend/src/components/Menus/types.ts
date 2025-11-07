export interface GameStats {
  finalWealth: number;
  finalHealth: number;
  finalHappiness: number;
  finalEducation: number;
  finalCareer: number;
  weeksPlayed: number;
  goalsAchieved: string[];
  goalsMissed: string[];
}

export interface VictoryScreenProps {
  stats: GameStats;
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

export interface GameOverScreenProps {
  stats: GameStats;
  reason: 'timeout' | 'death' | 'bankruptcy';
  onPlayAgain: () => void;
  onMainMenu: () => void;
}
