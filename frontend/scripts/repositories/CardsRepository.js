export default class CardsRepository {
  constructor() {
    this.reset();
  }

  reset() {
    this.cards = [];
  }

  addCard(card) {
    const index = this.getIndex();

    this.cards[index] = card;

    return index;
  }

  removeCard(index) {
    const deletedCard = this.cards[index];

    if (deletedCard) {
      this.cards[index] = null;
    }

    return deletedCard;
  }

  getIndex() {
    let index = this.cards.findIndex(((value) => value === null));

    if (index === -1) {
      index = this.cards.length;
    }

    return index;
  }
}
