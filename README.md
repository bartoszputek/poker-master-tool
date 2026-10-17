# Poker Master Tool

Open-source poker hand calculator.

## Table of contents

- [General info](#general-info)
- [Architecture](#architecture)
- [Features](#features)
- [Quick start with Docker](#quick-start-with-docker)
- [Installation](#installation)
- [Unit and performance tests](#unit-and-performance-tests)
- [Development](#development)
- [License](#license)

## General info

This project has been written to a develop fast open-source hand calculator for Texas Hold'em as an Engineering Thesis. It uses TwoPlusTwo evaluator for calculating hand ranks. The repository contains unit and performance tests, Docker image with Docker Compose for quick start and configured CI/CD with GitHub Actions.

![Application view](./docs/application-view.png)

## Architecture

The repository is a pnpm workspace with 3 packages:

```
apps/
  backend/     @poker-master-tool/backend  - Express API in TypeScript
  frontend/    @poker-master-tool/frontend - SvelteKit (Svelte 5) app in TypeScript
packages/
  addon/       @poker-master-tool/addon    - C++ calculator, lookup table generator and benchmark
e2e/           Playwright end-to-end test
docs/          Images for this README
```

- The backend uses the addon as the workspace dependency `@poker-master-tool/addon`.
- The frontend build writes static files to `apps/frontend/build`. The backend serves them.
- The addon reads the lookup table from `packages/addon/data/HandRanks.dat`.

## Features

- Responsive web application for Poker Texas Hold'em odds calculator up to 9 players
- Displaying the number of enumerated combinations and hand rank probability for each player
- Support for Death Cards
- Request caching on the backend side
- Logging requests to stdout and stderr, with optional log files that rotate daily

## Configuration

The backend reads these environment variables:

| Variable           | Default               | Description                                                                                                |
| ------------------ | --------------------- | ---------------------------------------------------------------------------------------------------------- |
| `LOG_FORMAT`       | `json`                | The format of the console logs. Set `pretty` for colored, indented logs. `pnpm dev` sets `pretty`.         |
| `LOG_TO_FILE`      | `false`               | Set `true` to also write the logs to the `logs` directory. Each file type rotates daily and stays 14 days. |
| `CORS_ORIGIN`      | not set               | The origin that can send cross-origin requests. CORS is off when the variable is not set.                  |
| `STATIC_DIRECTORY` | `apps/frontend/build` | The directory with the static frontend build.                                                              |

The console logs go to stdout. The `error` and `fatal` logs go to stderr. When `LOG_TO_FILE` is `true`, the backend writes 4 file types:

- `logs-<date>.log` - all logs.
- `error-<date>.log` - the `error` and `fatal` logs.
- `exceptions-<date>.log` - uncaught exceptions.
- `rejections-<date>.log` - unhandled promise rejections.

The Docker Compose file sets `LOG_TO_FILE` to `true` and mounts `apps/backend/logs` into the container.

## Quick start with Docker

Turn on Docker and in your terminal run:

```bash
docker-compose up
```

App will be listening on `http://localhost:3000`.

The image contains only the built backend, its production dependencies, the addon with the lookup table and the static frontend.

## Installation

To install the application, you need Node 26, pnpm 10, make and a g++ compiler.

Next, follow consecutive commands. `pnpm install` also builds the addon, and `pnpm build` builds the addon, the backend and the frontend:

```bash
pnpm install

pnpm generate-table

pnpm build

pnpm start
```

The app will be listening on `http://localhost:3000`.

## Unit and performance tests

Unit tests use the Node.js test runner (`node:test`).

To run unit tests run:

```bash
pnpm test
```

if you wish to get a coverage report you run `pnpm test:coverage`.

The end-to-end test uses Playwright. It builds the application, starts the backend and calculates the odds in the browser. Generate the lookup table before you run it:

```bash
pnpm exec playwright install chromium

pnpm test:e2e
```

To run the performance benchmark for the addon, run:

```bash
pnpm test:benchmark
```

The benchmark uses tinybench. It runs each scenario for a minimum of 2 seconds and 64 iterations. It writes the results to the `packages/addon/benchmark/results` directory:

- `tinybench-<timestamp>.md` - a Markdown table with the results.
- `tinybench-<timestamp>.json` - the same results in JSON format.

### Benchmark results

These results are from Node 26.7.0 on an Apple M3 Pro. The full output is in [tinybench-2026-10-17T09-07-31-790Z.md](./packages/addon/benchmark/results/tinybench-2026-10-17T09-07-31-790Z.md) and [tinybench-2026-10-17T09-07-31-790Z.json](./packages/addon/benchmark/results/tinybench-2026-10-17T09-07-31-790Z.json).

Player `n` has the cards `n` and `n + 10`. The community cards and the death cards are the cards 20 to 24. Combinations is the number of boards that the calculator examines.

| Scenario                     | Combinations | Mean (ms) | p99 (ms) | Operations/s |
| ---------------------------- | -----------: | --------: | -------: | -----------: |
| 1 player                     |    2,118,760 |     5.659 |    6.165 |        177.0 |
| 2 players                    |    1,712,304 |     7.795 |    8.993 |        128.6 |
| 3 players                    |    1,370,754 |     9.661 |    10.71 |        103.7 |
| 4 players                    |    1,086,008 |     8.015 |    8.742 |        124.9 |
| 5 players                    |      850,668 |     6.375 |    6.770 |        156.9 |
| 6 players                    |      658,008 |     5.661 |    6.093 |        176.7 |
| 7 players                    |      501,942 |     5.080 |    5.445 |        196.9 |
| 8 players                    |      376,992 |     3.428 |    3.843 |        292.1 |
| 9 players                    |      278,256 |     2.897 |    3.272 |        345.9 |
| 9 players, 1 community card  |       40,920 |     0.417 |    0.473 |      2,400.1 |
| 9 players, 2 community cards |        4,960 |     0.081 |    0.097 |     12,471.1 |
| 9 players, 3 community cards |          465 |     0.034 |    0.048 |     30,391.4 |
| 9 players, 4 community cards |           30 |     0.028 |    0.039 |     36,073.1 |
| 9 players, 5 community cards |            1 |     0.027 |    0.037 |     37,479.2 |
| 9 players, 1 death card      |      237,336 |     2.389 |    2.618 |        418.9 |
| 9 players, 2 death cards     |      201,376 |     2.055 |    2.280 |        487.2 |
| 9 players, 3 death cards     |      169,911 |     1.743 |    1.908 |        574.3 |
| 9 players, 4 death cards     |      142,506 |     1.473 |    1.643 |        679.5 |
| 9 players, 5 death cards     |      118,755 |     1.227 |    1.332 |        815.3 |

The results change with the hardware and the Node version.

## Development

To serve a frontend by the backend application you should build the frontend first using `pnpm --filter @poker-master-tool/frontend build`. After that you can run the backend development server with the command below. It restarts the backend when you change a file:

```bash
pnpm dev
```

When you work on the frontend, run the Vite development server. It is available on `http://localhost:8080` and sends the `/compute` requests to the backend on port 3000:

```bash
pnpm dev:frontend
```

All packages use the same ESLint, Prettier and TypeScript configuration in the root directory. Versions that more than one package uses are in the `catalog` of `pnpm-workspace.yaml`. To check the code, run:

```bash
pnpm check

pnpm lint

pnpm format:check
```

To format the code, run `pnpm format`.

## License

You can check out the full license [here](./LICENSE)

This project is licensed under the terms of **the MIT license**.
