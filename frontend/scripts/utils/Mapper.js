export default class Mapper {
  constructor(playerInstance, boardInstance, deathCardsInstance) {
    this.playerInstance = playerInstance;
    this.boardInstance = boardInstance;
    this.deathCardsInstance = deathCardsInstance;
  }

  getObject(index) {
    if (index < 18) {
      return this.playerInstance;
    }

    if (index < 23) {
      return this.boardInstance;
    }

    if (index < 31) {
      return this.deathCardsInstance;
    }

    return undefined;
  }

  static getPlayerIndexes(cursor) {
    return {
      cardIndex: cursor % 2,
      playerIndex: Math.floor(cursor / 2),
    };
  }

  static getBoardIndex(cursor) {
    return (cursor + 2) % 5;
  }

  static getDeathCardsIndex(cursor) {
    return (cursor + 1) % 8;
  }

// Maps 'Ad' name to another to avoid blocking the element by ad blocker browser extensions
  static mapCard(card) {
    if (card === 'Ad') {
      return 'ArD';
    }

    return card;
  }
}
