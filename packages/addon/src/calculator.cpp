#include "calculator.hpp"

#include <cmath>
#include <cstdio>
#include <memory>

namespace calculator {
namespace {

constexpr size_t TABLE_SIZE = 32487834;
// The row of the table for zero cards. Each entry for a card points to the row for one more card.
// After seven cards, the entry is the hand value.
constexpr int TABLE_START = 53;
// A hand value has the hand type above this bit, and the rank inside the hand type below it.
constexpr int HAND_TYPE_SHIFT = 12;

std::array<int, TABLE_SIZE> table;

using Pointers = std::array<int, MAX_PLAYERS>;

std::vector<int> remainingDeck(const std::vector<Hand>& players, const std::vector<int>& communityCards,
                               const std::vector<int>& deathCards) {
    std::array<bool, DECK_SIZE + 1> used{};
    for (const Hand& hand : players) {
        for (const int card : hand) {
            used[card] = true;
        }
    }
    for (const int card : communityCards) {
        used[card] = true;
    }
    for (const int card : deathCards) {
        used[card] = true;
    }

    std::vector<int> deck;
    for (int card = 1; card <= DECK_SIZE; ++card) {
        if (!used[card]) {
            deck.push_back(card);
        }
    }
    return deck;
}

Pointers startPointers(const std::vector<Hand>& players, const std::vector<int>& communityCards) {
    Pointers pointers{};
    for (size_t i = 0; i < players.size(); ++i) {
        int pointer = TABLE_START;
        for (const int card : communityCards) {
            pointer = table[pointer + card];
        }
        for (const int card : players[i]) {
            pointer = table[pointer + card];
        }
        pointers[i] = pointer;
    }
    return pointers;
}

// A board where all players have the best hand is a draw for all of them.
// Otherwise each player with the best hand gets a win.
void countBoard(const Pointers& handValues, size_t playerCount, std::array<PlayerStats, MAX_PLAYERS>& stats) {
    int best = 0;
    size_t winners = 0;

    for (size_t i = 0; i < playerCount; ++i) {
        const int value = handValues[i];
        ++stats[i].handTypes[value >> HAND_TYPE_SHIFT];

        if (value > best) {
            best = value;
            winners = 1;
        } else if (value == best) {
            ++winners;
        }
    }

    if (winners == playerCount) {
        for (size_t i = 0; i < playerCount; ++i) {
            ++stats[i].draw.count;
        }
        return;
    }

    for (size_t i = 0; i < playerCount; ++i) {
        if (handValues[i] == best) {
            ++stats[i].win.count;
        }
    }
}

// Examines each set of missingCards cards from deck[start..], in ascending order. Returns the number of boards.
int enumerate(const std::vector<int>& deck, size_t start, size_t missingCards, const Pointers& pointers,
              size_t playerCount, std::array<PlayerStats, MAX_PLAYERS>& stats) {
    if (missingCards == 0) {
        countBoard(pointers, playerCount, stats);
        return 1;
    }

    Pointers nextPointers;
    int boards = 0;

    for (size_t card = start; card + missingCards <= deck.size(); ++card) {
        for (size_t i = 0; i < playerCount; ++i) {
            nextPointers[i] = table[pointers[i] + deck[card]];
        }
        boards += enumerate(deck, card + 1, missingCards - 1, nextPointers, playerCount, stats);
    }

    return boards;
}

double toPercentage(int count, int combinations) {
    return std::ceil(count / static_cast<double>(combinations) * 10000.0) / 100.0;
}

}  // namespace

bool loadTable(const std::string& path) {
    std::unique_ptr<FILE, decltype(&fclose)> file(fopen(path.c_str(), "rb"), &fclose);
    if (!file) {
        return false;
    }
    return fread(table.data(), sizeof(table), 1, file.get()) == 1;
}

Results compute(const std::vector<Hand>& players, const std::vector<int>& communityCards,
                const std::vector<int>& deathCards) {
    Results results;
    const std::vector<int> deck = remainingDeck(players, communityCards, deathCards);

    results.combinations = enumerate(deck, 0, BOARD_SIZE - communityCards.size(),
                                     startPointers(players, communityCards), players.size(), results.players);

    for (size_t i = 0; i < players.size(); ++i) {
        PlayerStats& stats = results.players[i];
        stats.lose.count = results.combinations - stats.win.count - stats.draw.count;
        stats.win.percentage = toPercentage(stats.win.count, results.combinations);
        stats.draw.percentage = toPercentage(stats.draw.count, results.combinations);
        stats.lose.percentage = toPercentage(stats.lose.count, results.combinations);
    }

    return results;
}

}  // namespace calculator
