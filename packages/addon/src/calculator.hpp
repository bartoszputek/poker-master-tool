#pragma once

#include <array>
#include <cstddef>
#include <string>
#include <vector>

namespace calculator {

constexpr size_t MAX_PLAYERS = 9;
constexpr size_t CARDS_PER_PLAYER = 2;
constexpr size_t BOARD_SIZE = 5;
constexpr int DECK_SIZE = 52;

// The index of each name is the hand type in the lookup table.
constexpr std::array<const char*, 10> HAND_TYPE_NAMES = {
    "bad", "highCard", "onePair", "twoPair", "trips", "straight", "flush", "fullHouse", "quads", "straightFlush"};

using Hand = std::array<int, CARDS_PER_PLAYER>;

struct Outcome {
    int count = 0;
    double percentage = 0;
};

struct PlayerStats {
    std::array<int, HAND_TYPE_NAMES.size()> handTypes{};
    Outcome win;
    Outcome draw;
    Outcome lose;
};

struct Results {
    std::array<PlayerStats, MAX_PLAYERS> players{};
    int combinations = 0;
};

// Loads the TwoPlusTwo lookup table. Call it one time, before any compute() call.
bool loadTable(const std::string& path);

Results compute(const std::vector<Hand>& players, const std::vector<int>& communityCards,
                const std::vector<int>& deathCards);

}  // namespace calculator
