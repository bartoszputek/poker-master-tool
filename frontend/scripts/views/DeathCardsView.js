import { DEATH_CARDS_INDEX } from '../constants';
import Mapper from '../utils/Mapper';

export default class DeathCardsView {
  deathCardsElement = document.getElementById('death-cards');

  init(callback) {
    for (let i = 0; i < 8; i += 1) {
      this.deathCardsElement.children[i].addEventListener('click', () => {
        callback(DEATH_CARDS_INDEX + i);
      });
    }
  }

  setCard(card, cardIndex) {
    const mappedCard = Mapper.mapCard(card);
    this.deathCardsElement.children[cardIndex].style.backgroundImage = `url(assets/img/${mappedCard.toUpperCase()}.svg)`;
  }

  resetCard(cardIndex) {
    this.deathCardsElement.children[cardIndex].style.backgroundImage = 'url(assets/img/2B.svg)';
  }

  reset() {
    const items = Array.from(this.deathCardsElement.children);

    items.forEach((card) => {
      card.style.backgroundImage = 'url(assets/img/2B.svg)';
    });
  }

  focus(index) {
    const cardIndex = Mapper.getDeathCardsIndex(index);

    this.deathCardsElement.children[cardIndex].focus();
  }
}
