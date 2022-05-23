#pragma once
#include <string>

#define STRAIGHT_FLUSH 1
#define FOUR_OF_A_KIND 2
#define FULL_HOUSE 3
#define FLUSH 4
#define STRAIGHT 5
#define THREE_OF_A_KIND 6
#define TWO_PAIR 7
#define ONE_PAIR 8
#define HIGH_CARD 9

#define RANK(x) ((x >> 8) & 0xF)

static std::string value_str[] = {
    "",
    "Straight Flush",
    "Four of a Kind",
    "Full House",
    "Flush",
    "Straight",
    "Three of a Kind",
    "Two Pair",
    "One Pair",
    "High Card"};

#define CLUB 0x8000
#define DIAMOND 0x4000
#define HEART 0x2000
#define SPADE 0x1000

#define Deuce 0
#define Trey 1
#define Four 2
#define Five 3
#define Six 4
#define Seven 5
#define Eight 6
#define Nine 7
#define Ten 8
#define Jack 9
#define Queen 10
#define King 11
#define Ace 12

// jmd declarations added
short eval_5hand(int *hand);
int eval_5hand_fast(int c1, int c2, int c3, int c4, int c5);
short eval_5cards(int c1, int c2, int c3, int c4, int c5);
short eval_7hand(int *hand);
