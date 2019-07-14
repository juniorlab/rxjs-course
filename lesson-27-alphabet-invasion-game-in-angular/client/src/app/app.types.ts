export interface Key {
  timestamp: number;
  value: string;
}

export interface Letter {
  interval: number;
  timestamp: number;
  xCoordinate: number;
  value: string;
}

export interface State {
  gameIsOver: boolean;
  letters: Letter[];
  score: number;
  level: number;
}
