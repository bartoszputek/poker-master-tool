import { ICalculateResponse } from '../addon/addon';

// eslint-disable-next-line import/prefer-default-export
export function getExampleResults(): ICalculateResponse {
  return {
    players: [
      {
        handTypes: {
          bad: 0,
          highCard: 24174,
          onePair: 35394,
          twoPair: 9182,
          trips: 1356,
          straight: 1600,
          flush: 1875,
          fullHouse: 226,
          quads: 7,
          straightFlush: 1,
        },
        results: {
          win: [
            9326,
            12.64,
          ],
          draw: [
            25680,
            34.79,
          ],
          lose: [
            38809,
            52.58,
          ],
        },
      },
      {
        handTypes: {
          bad: 0,
          highCard: 24969,
          onePair: 35885,
          twoPair: 9146,
          trips: 1356,
          straight: 1616,
          flush: 609,
          fullHouse: 226,
          quads: 7,
          straightFlush: 1,
        },
        results: {
          win: [
            9326,
            12.64,
          ],
          draw: [
            25680,
            34.79,
          ],
          lose: [
            38809,
            52.58,
          ],
        },
      },
      {
        handTypes: {
          bad: 0,
          highCard: 20493,
          onePair: 35820,
          twoPair: 11576,
          trips: 1780,
          straight: 1832,
          flush: 1875,
          fullHouse: 431,
          quads: 7,
          straightFlush: 1,
        },
        results: {
          win: [
            11317,
            15.34,
          ],
          draw: [
            25680,
            34.79,
          ],
          lose: [
            36818,
            49.88,
          ],
        },
      },
      {
        handTypes: {
          bad: 0,
          highCard: 17652,
          onePair: 35999,
          twoPair: 14176,
          trips: 2137,
          straight: 2538,
          flush: 608,
          fullHouse: 696,
          quads: 7,
          straightFlush: 2,
        },
        results: {
          win: [
            16757,
            22.71,
          ],
          draw: [
            25680,
            34.79,
          ],
          lose: [
            31378,
            42.51,
          ],
        },
      },
      {
        handTypes: {
          bad: 0,
          highCard: 16512,
          onePair: 34682,
          twoPair: 14002,
          trips: 2116,
          straight: 3924,
          flush: 1841,
          fullHouse: 696,
          quads: 7,
          straightFlush: 35,
        },
        results: {
          win: [
            25607,
            34.7,
          ],
          draw: [
            25680,
            34.79,
          ],
          lose: [
            22528,
            30.52,
          ],
        },
      },
      {
        handTypes: {
          bad: 0,
          highCard: 17253,
          onePair: 33103,
          twoPair: 11394,
          trips: 1748,
          straight: 8003,
          flush: 1873,
          fullHouse: 431,
          quads: 7,
          straightFlush: 3,
        },
        results: {
          win: [
            22563,
            30.57,
          ],
          draw: [
            25680,
            34.79,
          ],
          lose: [
            25572,
            34.65,
          ],
        },
      },
    ],
    combinations: 73815,
  };
}
