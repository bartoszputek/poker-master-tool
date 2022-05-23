main: generate-table
	./dist/generate-table

generate-table: *.cpp *.h
	mkdir -p ./dist
	g++ -std=c++17 generate_table.cpp  pokerlib.cpp -o ./dist/generate-table