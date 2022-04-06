export function initLookUpTable(): void;
export function calculate(playersCards:number[][], communityCards:number[], deathCards:number[]): Promise<ICalculateResponse>;

export interface ICalculateResponse {
  players: IPlayerResponse[]
  combinations: number
}

export interface IPlayerResponse {
  handTypes: {
    bad: number,
    highCard: number,
    onePair: number,
    twoPair: number,
    trips: number,
    straight: number,
    flush: number,
    fullHouse: number,
    quads: number,
    straightFlush: number
  },
  results: {
    win: number[],
    draw: number[],
    lose: number[]
  }
}
