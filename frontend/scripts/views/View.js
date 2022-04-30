import { CARDS, APP_VERSION } from '../constants';
import Mapper from '../utils/Mapper';
import BoardView from './BoardView';
import DeathCardsView from './DeathCardsView';
import PlayersView from './PlayersView';

export default class View {
  cardsElements = CARDS.map((card) => document.getElementById(card));

  versionElement = document.getElementById('version');

  resetButton = document.getElementById('reset');

  playersView = new PlayersView();

  boardView = new BoardView();

  deathCardsView = new DeathCardsView();

  mapper = new Mapper(this.playersView, this.boardView, this.deathCardsView);

  initElements(callback) {
    this.playersView.init(callback);
    this.boardView.init(callback);
    this.deathCardsView.init(callback);
    this.versionElement.innerText = `v${APP_VERSION}`;
  }

  initCardIcons(addCard) {
    this.cardsElements.forEach((card) => {
      card.addEventListener('click', () => {
        if (addCard(card.id)) {
          card.classList.add('hide');
        }
      });
    });
  }

  initResetButton(callback) {
    this.resetButton.addEventListener('click', callback);

    this.resetButton.addEventListener('click', () => {
      this.playersView.resetPlayers();
      this.playersView.resetPoputResults();
      this.playersView.resetResults();
      this.boardView.reset();
      this.deathCardsView.reset();
    });

    this.resetButton.addEventListener('click', () => {
      this.cardsElements.forEach((card) => {
        card.classList.remove('hide');
      });
    });
  }

  resetCardIcon(card) {
    const cardElement = document.getElementById(card);

    cardElement.classList.remove('hide');
  }

  focusElement(card) {
    const nextElement = this.getNextElementToFocus(card);

    nextElement.focus();
  }

  getNextElementToFocus(card) {
    let index = CARDS.findIndex((c) => c === card) + 1;
    let element = this.cardsElements[index] ?? this.resetButton;

    while (element.classList.contains('hide')) {
      if (index === 51) {
        element = this.resetButton;
        break;
      }

      index += 1;
      element = this.cardsElements[index];
    }

    return element;
  }

  toggleSelection(index) {
    const object = this.mapper.getObject(index);

    object.toggleSelection(index);
  }
}
