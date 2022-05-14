import { SELECT_CLASS_NAME } from '../constants';
import Mapper from '../utils/Mapper';

export default class PlayersView {
  playerResultsElements = [];

  playerWinsElements = [];

  playerLosesElements = [];

  playerDrawsElements = [];

  resultsElement = document.getElementById('results');

  resultsTable = document.getElementById('results-table');

  resultsCombinationsElement = document.getElementById('results-combinations');

  constructor() {
    for (let index = 0; index < 9; index += 1) {
      const playerResultElement = document.getElementById(`player-${index + 1}-results`);
      const playerWinsElement = document.getElementById(`player-${index + 1}-wins`);
      const playerLosesElement = document.getElementById(`player-${index + 1}-loses`);
      const playerDrawsElement = document.getElementById(`player-${index + 1}-draws`);

      this.playerResultsElements.push(playerResultElement);
      this.playerWinsElements.push(playerWinsElement);
      this.playerLosesElements.push(playerLosesElement);
      this.playerDrawsElements.push(playerDrawsElement);
    }
  }

  init(callback) {
    for (let index = 0; index < 9; index += 1) {
      const playerElement = document.getElementById(`player-${index + 1}`);

      for (let i = 0; i < 2; i += 1) {
        playerElement.children[0].children[i].addEventListener('click', () => {
          callback((index * 2) + i);
        });
      }
    }
  }

  setCard(card, playerIndex, cardIndex) {
    const mappedCard = Mapper.mapCard(card);
    const playerElement = document.getElementById(`player-${playerIndex + 1}`);

    const playerCardElement = this.playerCardElement(playerElement, cardIndex);

    playerCardElement.style.backgroundImage = `url(assets/img/${mappedCard.toUpperCase()}.svg)`;
  }

  resetCard(playerIndex, cardIndex) {
    const playerElement = document.getElementById(`player-${playerIndex + 1}`);

    const playerCardElement = this.playerCardElement(playerElement, cardIndex);

    playerCardElement.style.backgroundImage = 'url(assets/img/2B.svg)';
  }

  setPlayerResults(results) {
    this.setPopoutResults(results);

    this.resultsCombinationsElement.innerText = results.combinations;

    const tableData = this.generateTableData(results);
    this.setTableResults(tableData);
  }

  setPopoutResults(results) {
    this.resetPoputResults();

    results.players.forEach((player) => {
      const { playerIndex } = player;

      const resultsElement = this.playerResultsElements[playerIndex];

      resultsElement.classList.remove('hide');

      const winsElement = this.playerWinsElements[playerIndex];
      const losesElement = this.playerLosesElements[playerIndex];
      const drawsElement = this.playerDrawsElements[playerIndex];

      const wins = player.results.win[1];
      const loses = player.results.lose[1];
      const draws = player.results.draw[1];

      winsElement.innerText = wins;
      losesElement.innerText = loses;
      drawsElement.innerText = draws;
    });
  }

  resetPoputResults() {
    this.playerResultsElements.forEach((playerResultsElement) => {
      playerResultsElement.classList.add('hide');
    });
  }

  setTableResults(tableData) {
    let index = 0;

    for (let i = 0; i < 9; i += 1) {
      const row = this.resultsTable.rows[i + 1];
      for (let j = 0; j < 9; j += 1) {
        index += 1;
        const col = row.cells[j + 1];
        col.innerText = tableData[index];
      }
    }
  }

  resetPlayers() {
    for (let index = 0; index < 9; index += 1) {
      const playerElement = document.getElementById(`player-${index + 1}`);

      const items = [0, 1].map((value) => this.playerCardElement(playerElement, value));

      items.forEach((card) => {
        card.style.backgroundImage = 'url(assets/img/2B.svg)';
      });
    }
  }

  resetResults() {
    this.resultsCombinationsElement.innerText = 0;

    const tableData = Array(82).fill('0.00%');

    this.setTableResults(tableData);
  }

  generateTableData(results) {
    const { combinations } = results;

    const values = Array(82).fill('0.00%');

    const tableData = results.players.reduce((acc, player) => {
      const { playerIndex } = player;
      Object.values(player.handTypes).slice(1).forEach((hand, handIndex) => {
        acc[(playerIndex + 1) + handIndex * 9] = `${((hand * 100) / combinations).toFixed(2)}%`;
      });

      return acc;
    }, values);

    return tableData;
  }

  toggleSelection(index) {
    const { playerIndex, cardIndex } = Mapper.getPlayerIndexes(index);

    const playerElement = document.getElementById(`player-${playerIndex + 1}`);

    const playerCardElement = this.playerCardElement(playerElement, cardIndex);

    playerCardElement.classList.toggle(SELECT_CLASS_NAME);
  }

  playerCardElement(playerElement, index) {
    return playerElement.children[0].children[0].children[index];
  }
}
