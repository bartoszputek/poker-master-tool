import { DEATH_CARDS_INDEX } from '../constants';
import CardsRepository from '../repositories/CardsRepository';
import Mapper from '../utils/Mapper';

export default class DeathCardsController {
  constructor(deathCardsView, setCursor) {
    this.deathCardsView = deathCardsView;
    this.setCursor = setCursor;
    this.cardsRepository = new CardsRepository();
  }

  get deathCards() {
    return this.cardsRepository.cards.filter((card) => card);
  }

  addCard(card) {
    const index = this.cardsRepository.addCard(card);

    this.deathCardsView.setCard(card, index);

    this.setCursor(DEATH_CARDS_INDEX + index + 1);
  }

  removeCard(cursor) {
    const cardIndex = Mapper.getDeathCardsIndex(cursor);

    const deletedCard = this.cardsRepository.removeCard(cardIndex);

    this.deathCardsView.resetCard(cardIndex);

    this.setCursor(DEATH_CARDS_INDEX + cardIndex);

    return deletedCard;
  }

  reset() {
    this.cardsRepository.reset();
  }
}
