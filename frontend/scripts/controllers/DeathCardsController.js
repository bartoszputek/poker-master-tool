import { DEATH_CARDS_INDEX, MAX_DEATH_CARDS } from '../constants';
import CardsRepository from '../repositories/CardsRepository';
import Mapper from '../utils/Mapper';

export default class DeathCardsController {
  constructor(deathCardsView, cursorController) {
    this.deathCardsView = deathCardsView;
    this.cursorController = cursorController;
    this.cardsRepository = new CardsRepository(MAX_DEATH_CARDS);
  }

  get deathCards() {
    return this.cardsRepository.cards.filter((card) => card);
  }

  addCard(card) {
    const isFull = this.cardsRepository.isFull();

    if (isFull) {
      return false;
    }

    const index = this.cardsRepository.addCard(card);
    const nextIndex = this.cardsRepository.getIndex();

    this.deathCardsView.setCard(card, index);

    this.cursorController.position = DEATH_CARDS_INDEX + nextIndex;

    return true;
  }

  removeCard(cursor) {
    const cardIndex = Mapper.getDeathCardsIndex(cursor);

    const deletedCard = this.cardsRepository.removeCard(cardIndex);

    this.deathCardsView.resetCard(cardIndex);

    this.cursorController.position = DEATH_CARDS_INDEX + cardIndex;

    return deletedCard;
  }

  reset() {
    this.cardsRepository.reset();
  }
}
