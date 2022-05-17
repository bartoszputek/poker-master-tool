/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-unused-vars */
const addon = require('../addon/addon');
const Timer = require('../dist/helpers/Timer').default;

const args = process.argv.slice(2);
const printResults = args[0] === 'printResults';

(async () => {
  await addon.initLookUpTable();

  const timer = new Timer();

  const playersCards = [];

  for (let i = 0; i < 9; i += 1) {
    playersCards.push([(i + 1), (i + 1) + 10]);

    timer.start();

    const results = await addon.calculate(playersCards, [], []);

    console.log(`${timer.stop()}ms: ${playersCards.length} players, 0 communityCards, 0 deathCards`);

    if (printResults) {
      console.log(JSON.stringify(results));
    }
  }

  const communityCards = [];

  for (let i = 0; i < 5; i += 1) {
    communityCards.push([(i + 10), (i + 10) + 10]);

    timer.start();

    const results = await addon.calculate(playersCards, communityCards, []);

    console.log(`${timer.stop()}ms: ${playersCards.length} players, ${communityCards.length} communityCards, 0 deathCards`);

    if (printResults) {
      console.log(JSON.stringify(results));
    }
  }

  const deathCards = [];

  for (let i = 0; i < 5; i += 1) {
    deathCards.push([(i + 10), (i + 10) + 10]);

    timer.start();

    const results = await addon.calculate(playersCards, [], deathCards);

    console.log(`${timer.stop()}ms: ${playersCards.length} players, 0 communityCards, ${deathCards.length} deathCards`);

    if (printResults) {
      console.log(JSON.stringify(results));
    }
  }
})();
