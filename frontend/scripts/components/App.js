import { BOARD_INDEX, DEATH_CARDS_INDEX } from '../constants';

import Board from './Board';
import Mapper from '../utils/Mapper';
import View from './views/View';
import ApiProxy from './ApiProxy';

export default class App {
  constructor() {
    this.board = new Board();
    this.view = new View();
    this.apiProxy = new ApiProxy();

    this.cursor = 0;
  }

  prepare() {
    this.view.initCardIcons((card) => this.addCard(card));
    this.view.initResetButton(() => {
      this.cursor = 0;
      this.board.reset();
    });

    this.view.initElements((i) => {
      this.cursor = i;
    });
  }

  async addCard(card) {
    const { object, playerIndex, cardIndex } = Mapper.getObject(this.cursor);

    if (!object) {
      return false;
    }

    if (object === 'player') {
      const { cardIndex: playerCardIndex, deletedCard } = this.board.addCardToPlayer(card, playerIndex, cardIndex);

      this.view.playersView.setCard(card, playerIndex, playerCardIndex);

      this.cursor = (playerIndex * 2) + playerCardIndex + 1;

      if (deletedCard) {
        this.view.resetCardIcon(deletedCard);
      }
    }

    if (object === 'board') {
      const { cardIndex: boardCardIndex, deletedCard } = this.board.addCardToBoard(card, cardIndex);

      this.view.boardView.setCard(card, boardCardIndex);

      this.cursor = BOARD_INDEX + boardCardIndex + 1;

      if (deletedCard) {
        this.view.resetCardIcon(deletedCard);
      }
    }

    if (object === 'deathCards') {
      const { cardIndex: deathCardsIndex, deletedCard } = this.board.addCardToDeathCards(card, cardIndex);

      this.view.deathCardsView.setCard(card, deathCardsIndex);

      this.cursor = DEATH_CARDS_INDEX + deathCardsIndex + 1;

      if (deletedCard) {
        this.view.resetCardIcon(deletedCard);
      }
    }

    this.view.focusElement(this.cursor);

    if (this.shouldRetrieve()) {
      const results = await this.getResults(this.board);

      this.view.playersView.setPlayerResults(results);
    }

    return true;
  }

  shouldRetrieve() {
    const { players } = this.board;
    const isEveryVillianReady = players.every((player) => player.cards.length === 0 || player.cards.length === 2);
    const isAtLeastOneVillianFilled = players.some((player) => player.cards.length === 2);
    const areCommunityCardsReady = this.board.communityCards.length !== 2 && this.board.communityCards.length !== 1;

    return isEveryVillianReady
          && isAtLeastOneVillianFilled
          && areCommunityCardsReady;
  }

  async getResults(board) {
    const data = this.getPlayersWithCards(board);
    const indexesReadyPlayers = this.getIndexesReadyPlayers(board);

    const response = await this.apiProxy.getResults(data);

    response.players = response.players.map((playerResponse, index) => (
      {
        playerIndex: indexesReadyPlayers[index],
        ...playerResponse,
      }
    ));

    return response;
  }

  getPlayersWithCards(board) {
    const data = { ...board };
    const playersWithCards = data.players.filter((player) => player.cards.length);

    data.players = playersWithCards;

    return data;
  }

  getIndexesReadyPlayers(board) {
    const indexesReadyPlayers = [];

    board.players.forEach((player, index) => {
      if (player.cards.length) {
        indexesReadyPlayers.push(index);
      }
    });

    return indexesReadyPlayers;
  }
}
