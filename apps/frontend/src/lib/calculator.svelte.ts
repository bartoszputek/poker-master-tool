export const PLAYERS_COUNT = 9;
export const BOARD_SIZE = 5;
export const MAX_DEATH_CARDS = 8;

// The cursor addresses every card slot: player cards first, then the board, then the death cards.
export const BOARD_INDEX = PLAYERS_COUNT * 2;
export const DEATH_CARDS_INDEX = BOARD_INDEX + BOARD_SIZE;

export type HandType =
  | 'bad'
  | 'highCard'
  | 'onePair'
  | 'twoPair'
  | 'trips'
  | 'straight'
  | 'flush'
  | 'fullHouse'
  | 'quads'
  | 'straightFlush';

type Result = [count: number, percentage: number];

export interface PlayerResult {
  handTypes: Record<HandType, number>;
  results: { win: Result; draw: Result; lose: Result };
}

interface ComputeResponse {
  combinations: number;
  players: PlayerResult[];
}

export interface Results {
  combinations: number;
  players: (PlayerResult | undefined)[];
}

class CardsRepository {
  // A removed card leaves a null hole, unless it was the last card.
  cards: (string | null)[] = $state([]);

  constructor(private readonly maxAmount?: number) {}

  get filled(): string[] {
    return this.cards.filter((card): card is string => card !== null);
  }

  isFull(): boolean {
    return this.maxAmount !== undefined && this.cards.length >= this.maxAmount;
  }

  // The next free slot: the first hole, else the end. A full repository returns its last slot.
  nextIndex(): number {
    if (this.maxAmount !== undefined && this.isFull()) {
      return this.maxAmount - 1;
    }

    const hole = this.cards.indexOf(null);

    return hole === -1 ? this.cards.length : hole;
  }

  addCard(card: string): number {
    const index = this.nextIndex();

    this.cards[index] = card;

    return index;
  }

  removeCard(index: number): string | null {
    const card = this.cards[index] ?? null;

    if (card !== null) {
      if (index === this.cards.length - 1) {
        this.cards.pop();
      } else {
        this.cards[index] = null;
      }
    }

    return card;
  }

  reset(): void {
    this.cards = [];
  }
}

export class Calculator {
  readonly players: CardsRepository[] = Array.from(
    { length: PLAYERS_COUNT },
    () => new CardsRepository(),
  );

  readonly board = new CardsRepository();

  readonly deathCards = new CardsRepository(MAX_DEATH_CARDS);

  // undefined: no slot is selected, and the next card goes to the first slot.
  cursor: number | undefined = $state();

  results: Results | null = $state(null);

  readonly usedCards: ReadonlySet<string> = $derived(
    // A new Set on each change, never mutated, so SvelteSet is not necessary.
    // eslint-disable-next-line svelte/prefer-svelte-reactivity
    new Set([
      ...this.players.flatMap((player) => player.filled),
      ...this.board.filled,
      ...this.deathCards.filled,
    ]),
  );

  private requestId = 0;

  slotCard(position: number): string | null {
    const { repository, index } = this.locate(position);

    return repository.cards[index] ?? null;
  }

  addCard(card: string): boolean {
    const position = this.cursor ?? 0;

    if (position < BOARD_INDEX) {
      const playerIndex = Math.floor(position / 2);
      const player = this.players[playerIndex];

      if (player.nextIndex() >= 2) {
        return false;
      }

      player.addCard(card);
      this.cursor = playerIndex * 2 + player.nextIndex();
    } else if (position < DEATH_CARDS_INDEX) {
      this.board.addCard(card);
      this.cursor = BOARD_INDEX + this.board.nextIndex();
    } else {
      if (this.deathCards.isFull()) {
        return false;
      }

      this.deathCards.addCard(card);
      this.cursor = DEATH_CARDS_INDEX + this.deathCards.nextIndex();
    }

    void this.updateResults();

    return true;
  }

  // Selects the slot and removes its card.
  selectSlot(position: number): void {
    const { repository, index } = this.locate(position);

    this.cursor = position;
    repository.removeCard(index);

    void this.updateResults();
  }

  reset(): void {
    this.cursor = undefined;
    this.players.forEach((player) => player.reset());
    this.board.reset();
    this.deathCards.reset();
    this.results = null;
    this.requestId += 1;
  }

  private locate(position: number): { repository: CardsRepository; index: number } {
    if (position < BOARD_INDEX) {
      return { repository: this.players[Math.floor(position / 2)], index: position % 2 };
    }

    if (position < DEATH_CARDS_INDEX) {
      return { repository: this.board, index: position - BOARD_INDEX };
    }

    return { repository: this.deathCards, index: position - DEATH_CARDS_INDEX };
  }

  private shouldFetchResults(): boolean {
    const players = this.players.map((player) => player.filled.length);
    const communityCards = this.board.filled.length;

    return (
      players.every((count) => count === 0 || count === 2) &&
      players.some((count) => count === 2) &&
      communityCards !== 1 &&
      communityCards !== 2
    );
  }

  private async updateResults(): Promise<void> {
    if (!this.shouldFetchResults()) {
      return;
    }

    const requestId = ++this.requestId;
    const readyPlayers = this.players
      .map((player, index) => ({ cards: player.filled, index }))
      .filter(({ cards }) => cards.length > 0);

    const board = {
      communityCards: this.board.filled,
      deathCards: this.deathCards.filled,
      players: readyPlayers.map(({ cards }) => ({ cards })),
    };

    try {
      const response = await fetch(
        `/compute?board=${encodeURIComponent(btoa(JSON.stringify(board)))}`,
        { headers: { 'Content-Type': 'application/json' } },
      );

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = (await response.json()) as ComputeResponse;

      // Ignore a response that a newer request or a reset made out of date.
      if (requestId !== this.requestId) {
        return;
      }

      const players: (PlayerResult | undefined)[] = Array(PLAYERS_COUNT).fill(undefined);
      data.players.forEach((player, i) => {
        players[readyPlayers[i].index] = player;
      });

      this.results = { combinations: data.combinations, players };
    } catch (error) {
      console.error(error);
    }
  }
}
