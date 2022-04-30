export default class CardsRepository {
  constructor(maxAmount) {
    this.maxLength = maxAmount - 1;

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
      if (index === this.cards.length - 1) {
        this.cards.pop();
      } else {
        this.cards[index] = null;
      }
    }

    return deletedCard;
  }

  getIndex() {
    let index = this.cards.findIndex(((value) => value === null));

    if (index === -1) {
      index = this.cards.length;
    }

    if (this.isFull()) {
      return this.maxLength;
    }

    return index;
  }

  isFull() {
    return this.maxLength && this.cards.length > this.maxLength;
  }
}
