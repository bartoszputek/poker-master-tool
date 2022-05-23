main: generate-table
	./dist/generate-table

generate-table: *.cpp *.hpp
	mkdir -p ./dist
	g++ -std=c++17 generate_table.cpp  pokerlib.cpp -o ./dist/generate-table -O3 -Wall -Wextra -Wshadow -Wnon-virtual-dtor -pedantic
	