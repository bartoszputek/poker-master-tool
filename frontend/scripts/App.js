import Mapper from './utils/Mapper';
import View from './views/View';
import ApiProxy from './utils/ApiProxy';
import PlayersController from './controllers/PlayersController';
import BoardController from './controllers/BoardController';
import DeathCardsController from './controllers/DeathCardsController';
import CursorController from './controllers/CursorController';

export default class App {
  constructor() {
    this.view = new View();
    this.apiProxy = new ApiProxy();

    this.cursorController = new CursorController(this.view);

    this.playersController = new PlayersController(this.view.playersView, this.cursorController);
    this.boardController = new BoardController(this.view.boardView, this.cursorController);
    this.deathCardsController = new DeathCardsController(this.view.deathCardsView, this.cursorController);

    this.mapper = new Mapper(this.playersController, this.boardController, this.deathCardsController);
  }

  prepare() {
    this.view.initCardIcons((card) => this.addCard(card));
    this.view.initResetButton(() => {
      this.cursorController.reset();
      this.playersController.reset();
      this.boardController.reset();
      this.deathCardsController.reset();
    });

    this.view.initElements((i) => {
      this.cursorController.position = i;
      this.removeCard();
    });
  }

  addCard(card) {
    const { position } = this.cursorController;
    const object = this.mapper.getObject(position);

    if (!object) {
      return false;
    }

    const isCardAdded = object.addCard(card, position);

    if (!isCardAdded) {
      return false;
    }

    this.view.focusElement(card);

    this.handleResults();

    return true;
  }

  removeCard() {
    const { position } = this.cursorController;
    const object = this.mapper.getObject(position);

    if (!object) {
      return false;
    }

    const deletedCard = object.removeCard(position);

    if (deletedCard) {
      this.view.resetCardIcon(deletedCard);
    }

    this.handleResults();

    return true;
  }

  async handleResults() {
    if (this.shouldFetchResults()) {
      const results = await this.getResults();

      this.view.playersView.setPlayerResults(results);
    }
  }

  shouldFetchResults() {
    const { players } = this.playersController;
    const { communityCards } = this.boardController;

    const isEveryPlayerReady = players.every((player) => player.cards.length === 0 || player.cards.length === 2);
    const isAtLeastOnePlayerFilled = players.some((player) => player.cards.length === 2);
    const areCommunityCardsReady = communityCards.length !== 2 && communityCards.length !== 1;

    return isEveryPlayerReady && isAtLeastOnePlayerFilled && areCommunityCardsReady;
  }

  async getResults() {
    const board = {
      communityCards: this.boardController.communityCards,
      deathCards: this.deathCardsController.deathCards,
      players: this.playersController.players,
    };

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
