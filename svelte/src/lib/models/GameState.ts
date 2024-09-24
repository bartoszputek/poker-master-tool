import type { IPlayer } from '../types';

const CURSOR_STARTING_POSITION: number = 0;

export default class GameState {
	private _cursorPosition: number = CURSOR_STARTING_POSITION;

	private get _playerPosition() {
		return Math.floor(this._cursorPosition / 2);
	}

	private get _playerCardPosition() {
		return this._cursorPosition % 2;
	}

	public players: IPlayer[] = [
		{ name: 'Player 1', cards: [] },
		{ name: 'Player 2', cards: [] },
		{ name: 'Player 3', cards: [] }
	];

	public setCard(card: string): void {
		this.players[this._playerPosition].cards[this._playerCardPosition] = card;
		this._cursorPosition++;
	}

	public reset(): void {
		this._cursorPosition = CURSOR_STARTING_POSITION;

		this.players.forEach((player) => {
			player.cards = [];
		});
	}
}
