import { Card } from 'constant';
import { ISerializedBoard } from 'interfaces';

export default class Board {
  public readonly playersCards: Card[][];

  public readonly communityCards: Card[];

  public readonly deathCards: Card[];

  constructor(board: ISerializedBoard) {
    const { players, communityCards, deathCards } = board;

    this.playersCards = players.map((serializedPlayer) => {
      const cards: Card[] = serializedPlayer.cards.map((serializedCard) => Card[serializedCard.toLowerCase() as keyof typeof Card]);
      return cards;
    });

    this.communityCards = communityCards.map((card) => Card[card.toLowerCase() as keyof typeof Card]);

    this.deathCards = deathCards.map((card) => Card[card.toLowerCase() as keyof typeof Card]);
  }
}
