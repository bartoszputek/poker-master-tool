#include <stdio.h>

#include "arrays.hpp"
#include "poker.hpp"

unsigned find_fast(unsigned u) {
    unsigned a, b, r;
    u += 0xe91aaa35;
    u ^= u >> 16;
    u += u << 8;
    u ^= u >> 4;
    b = (u >> 8) & 0x1ff;
    a = (u + (u << 2)) >> 19;
    r = a ^ hash_adjust[b];
    return r;
}

int eval_5hand_fast(int c1, int c2, int c3, int c4, int c5) {
    int q = (c1 | c2 | c3 | c4 | c5) >> 16;
    short s;
    if (c1 & c2 & c3 & c4 & c5 & 0xf000) return flushes[q];  // check for flushes and straight flushes
    if ((s = unique5[q])) return s;                          // check for straights and high card hands
    return hash_values[find_fast((c1 & 0xff) * (c2 & 0xff) * (c3 & 0xff) * (c4 & 0xff) * (c5 & 0xff))];
}

short eval_5hand(int *hand) {
    int c1, c2, c3, c4, c5;

    c1 = *hand++;
    c2 = *hand++;
    c3 = *hand++;
    c4 = *hand++;
    c5 = *hand;

    return (eval_5hand_fast(c1, c2, c3, c4, c5));
}

// This is a non-optimized method of determining the
// best five-card hand possible out of seven cards.
short eval_7hand(int *hand) {
    int i, j, q, best = 9999, subhand[5];

    for (i = 0; i < 21; i++) {
        for (j = 0; j < 5; j++)
            subhand[j] = hand[perm7[i][j]];
        q = eval_5hand(subhand);
        if (q < best)
            best = q;
    }
    return (best);
}
