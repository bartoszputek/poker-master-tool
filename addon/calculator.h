struct PlayerStats {
	std::array<int, 10> handTypeSum;
	std::array<std::pair<int, double>, 3> results; 
};

struct Results {
	std::array<PlayerStats, 9> playerStats;
	int combinations;
};

Results compute(std::vector<std::vector<int>> players, std::vector<int> communityCards, std::vector<int> deathCards);
int initData();
std::array<std::string, 10> getHandNames();
std::array<std::string, 3> getResultNames();