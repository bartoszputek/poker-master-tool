export default class Mapper {
  static getObject(index) {
    if (index < 18) {
      return {
        object: 'player',
        cardIndex: index % 2,
        playerIndex: Math.floor(index / 2),
      };
    }

    if (index < 23) {
      return {
        object: 'board',
        cardIndex: (index + 2) % 5,
      };
    }

    if (index < 31) {
      return {
        object: 'deathCards',
        cardIndex: (index + 1) % 8,
      };
    }

    return {
      object: undefined,
    };
  }

  static mapCard(card) {
    if (card === 'Ad') {
      return 'ArD';
    }

    return card;
  }
}
