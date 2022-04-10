import { Card } from 'constant';
import { ISerializedBoard } from 'interfaces';

export default class Board {
  public readonly playersCards: Card[][];

  public readonly communityCards: Card[];

  public readonly deathCards: Card[];

  constructor(board: ISerializedBoard) {
    const { players, communityCards, deathCards } = board;

    this.playersCards = players.map((serializedPlayer) => {
      const cards: Card[] = serializedPlayer.cards.map(this.mapToCard).sort(this.sortCardPredicate);
      return cards;
    });

    this.communityCards = communityCards.map(this.mapToCard).sort(this.sortCardPredicate);

    this.deathCards = deathCards.map(this.mapToCard).sort(this.sortCardPredicate);
  }

  private mapToCard(card:string):Card {
    return Card[card.toLowerCase() as keyof typeof Card];
  }

  private sortCardPredicate(a: Card, b:Card):number {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  }
}
