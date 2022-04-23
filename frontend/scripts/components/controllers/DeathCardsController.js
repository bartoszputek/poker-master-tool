import { DEATH_CARDS_INDEX } from '../../constants';
import Mapper from '../../utils/Mapper';

export default class DeathCardsController {
  constructor(deathCardsView, setCursor) {
    this.deathCardsView = deathCardsView;
    this.setCursor = setCursor;
    this.deathCards = [];
  }

  addCard(card, cursor) {
    const cardIndex = Mapper.getDeathCardsIndex(cursor);

    const { cardIndex: deathCardsIndex, deletedCard } = this.addCardToDeathCards(card, cardIndex);

    this.deathCardsView.setCard(card, deathCardsIndex);

    this.setCursor(DEATH_CARDS_INDEX + deathCardsIndex + 1);

    return deletedCard;
  }

  addCardToDeathCards(card, cardIndex) {
    if (this.deathCards.length < cardIndex) {
      const { length } = this.deathCards;
      const deletedCard = this.deathCards[length];
      this.deathCards[length] = card;

      return {
        cardIndex: length,
        deletedCard,
      };
    }

    const deletedCard = this.deathCards[cardIndex];
    this.deathCards[cardIndex] = card;

    return {
      cardIndex,
      deletedCard,
    };
  }

  reset() {
    this.deathCards = [];
  }
}
