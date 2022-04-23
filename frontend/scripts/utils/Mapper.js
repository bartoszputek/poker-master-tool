export default class Mapper {
  static getObject(index) {
    if (index < 18) {
      return 'player';
    }

    if (index < 23) {
      return 'board';
    }

    if (index < 31) {
      return 'deathCards';
    }

    return {
      object: undefined,
    };
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

  static mapCard(card) {
    if (card === 'Ad') {
      return 'ArD';
    }

    return card;
  }
}
