var board;
var log;

$(function(){
	board = new Puzzle($('.board table'));
	board.random();
	board.refreshBoard();
	resizeStyle();
	
	log = $('.log');
	log.empty();
	$(document).keydown(function(e) {
		switch(e.which) {
			case 37: moveTile('left'); break;
			case 38: moveTile('up'); break;
			case 39: moveTile('right'); break;
			case 40: moveTile('down'); break;
			default: return;
		}
		e.preventDefault();
	});
	
});

function resizeStyle(){
	board_td = $('.board tr td');
	board_td.height(board_td.width());
	$('.log').scrollTop($('.log')[0].scrollHeight);
}

var log_i = 1;
function moveTile(direction){
	if(board.isLegalMove(direction)){
		board.move(direction);
		board.refreshBoard();
		
		log.append($('<p>').html(log_i + '. ' + direction));
		log_i++;
		resizeStyle();
	}
}


// Manhattan Distance
// https://heuristicswiki.wikispaces.com/Manhattan+Distance
function manhattanDistance(boardTmp){
	h = 0;
	for(tile = 1; tile < 9; tile++){
		now = boardTmp.findTile(tile)
		goal = boardTmp.findTileDefault(tile);
		h += Math.abs(now[0] - goal[0]) + Math.abs(now[1] - goal[1]);
	}
	return h;
}

// Nilsson's Sequence Score
// https://heuristicswiki.wikispaces.com/Nilsson%27s+Sequence+Score
function nilssonSequenceScore(boardTmp){
	s = 0;
	for(row = 1; row <= 3; row++){
		for(cell = 1; cell <= 3; cell++){
			if(row == 2 && cell == 2){
				if(boardTmp.data[row - 1][cell -1] != 0)
					s += 1;
			}
			else if(boardTmp.data[row - 1][cell -1] != boardTmp.defaultData[row - 1][cell -1]){
				s += 2;
			}
			
		}
	}
	return s;
}

function calculateDistance(boardTmp){
	h = manhattanDistance(boardTmp) + (3 * nilssonSequenceScore(boardTmp));
	return h;
}



	
// http://heyes-jones.com/astar.php
// f = g + h
// 'g' is the sum of all the costs it took to get here, (number of iteration)
// 'h' is our heuristic function, the estimate of what it will take to get to the goal (in this case, manhattan distance)
// 'f' is the sum of these two


// DFS
testAlgoDFSlog = [];
testAlgoDFSstack = [];
testAlgoDFSTimeout = 0;
function testAlgoDFS(){
	if(board.isFinish()) return true;
	parentState = board.data;
	
	moves = [];
	for(move in board.legalMoves){
		testBoard = board.clone();
		testBoard.move(board.legalMoves[move]);
		
		// check state
		if(testAlgoDFSlog.indexOf(JSON.stringify(testBoard.data)) != -1) continue;
		
		
		moves.push({
			'move' : board.legalMoves[move],
			//'f' : f
		});
		
		break; //DFS
	}
	
	
	if(moves.length > 0){
		moveTile(moves[0].move);
		testAlgoDFSlog.push(JSON.stringify(board.data));
		testAlgoDFSstack.push(JSON.stringify(board.data));
	}else{
		newStack = testAlgoDFSstack.pop();
		board.data = JSON.parse(newStack);
		board.calculateSituation();
		board.refreshBoard();
		resizeStyle();
	}
	
	testAlgoDFSTimeout = setTimeout(testAlgoDFS, 13);
}


// BFS
testAlgoBFSlog = [];
testAlgoBFSstack = [];
testAlgoBFSTimeout = 0;
function testAlgoBFS(){
	if(board.isFinish()) return true;
	parentState = board.data;
	
	moves = [];
	for(move in board.legalMoves){
		testBoard = board.clone();
		testBoard.move(board.legalMoves[move]);
		
		// check state
		if(testAlgoBFSlog.indexOf(JSON.stringify(testBoard.data)) != -1) continue;
		
		f = calculateDistance(testBoard);
		moves.push({
			'move' : board.legalMoves[move],
			'f' : f
		});
	}
	
	if(moves.length > 0){
		//sort
		moves.sort(function(a, b){
			if(a.f > b.f) return 1;
			if(a.f < b.f) return -1;
			return 0;
		});
		
		moveTile(moves[0].move);
		testAlgoBFSlog.push(JSON.stringify(board.data));
		testAlgoBFSstack.push(JSON.stringify(board.data));
	}else{
		newStack = testAlgoBFSstack.pop();
		board.data = JSON.parse(newStack);
		board.calculateSituation();
		board.refreshBoard();
		resizeStyle();
	}
	
	testAlgoBFSTimeout = setTimeout(testAlgoBFS, 3);
}

// A*
testAlgoAStarlog = [];
testAlgoAStarstack = [];
testAlgoAStarTimeout = 0;
function testAlgoAStar(){
	start = board.clone();
	
	closedSet = [];
	openSet = [JSON.stringify(start.data)];
	cameFrom = {};
	
	gScore = {};
	gScore[JSON.stringify(start.data)] = 0;
	
	fScore = [];
	fScore.push([JSON.stringify(start.data), calculateDistance(start)]);
	
	i = 0;
	while(openSet.length > 0){
		//sort fScore
		fScore.sort(function(a, b){
			if(a[1] > b[1]) return 1;
			if(a[1] < b[1]) return -1;
			return 0;
		});
		
		// check if goal
		current = openSet.indexOf(fScore[0][0]);
		currentPuzzle = new Puzzle();
		currentPuzzle.data = JSON.parse(fScore[0][0]);
		currentPuzzle.calculateSituation();
		currentF = calculateDistance(currentPuzzle);
		
		if(currentPuzzle.isFinish())
			return testAlgoAStarReconstructPath(cameFrom, JSON.stringify(currentPuzzle.data));
		
		closedSet.push(JSON.stringify(currentPuzzle.data));
		openSet.splice(current, 1)
		
			
		neighbors = [];
		for(move in currentPuzzle.legalMoves){
			neighborBoard = currentPuzzle.clone();
			neighborBoard.move(currentPuzzle.legalMoves[move]);
			neighborF = calculateDistance(neighborBoard);
			
			if(closedSet.indexOf(JSON.stringify(neighborBoard.data)) != -1) continue;
			
			dummyPuzzle = currentPuzzle.clone();
			dummyPuzzle.defaultData = neighborBoard.data.slice(0);
			tentative_gScore = gScore[JSON.stringify(currentPuzzle.data)] + calculateDistance(dummyPuzzle);
			//console.log(tentative_gScore);
			
			if(openSet.indexOf(JSON.stringify(neighborBoard.data)) == -1){
				openSet.push(JSON.stringify(neighborBoard.data));
			}else if (tentative_gScore >= gScore[JSON.stringify(neighborBoard.data)]){
				continue; // this is not a  better path.
			}
			
			cameFrom[JSON.stringify(neighborBoard.data)] = JSON.stringify(currentPuzzle.data);
			gScore[JSON.stringify(neighborBoard.data)] = tentative_gScore;
			fScore.push([JSON.stringify(neighborBoard.data), tentative_gScore + neighborF]);
		}
		
		console.log(openSet);
		i++;
		if(i == 3000) break; // just break too much loop
	}
	
	return false; // failure?
	
}
function testAlgoAStarReconstructPath(cameFrom, currentData){
	totalPath = [currentData];
	while(cameFrom[currentData] !== undefined){
		currentData = cameFrom[currentData];
		totalPath.append(currentData);
	}
	
	console.log(totalPath);
	return totalPath;
}


/*
function A*(start, goal)
    // The set of nodes already evaluated.
    closedSet := {}
    // The set of currently discovered nodes still to be evaluated.
    // Initially, only the start node is known.
    openSet := {start}
    // For each node, which node it can most efficiently be reached from.
    // If a node can be reached from many nodes, cameFrom will eventually contain the
    // most efficient previous step.
    cameFrom := the empty map

    // For each node, the cost of getting from the start node to that node.
    gScore := map with default value of Infinity
    // The cost of going from start to start is zero.
    gScore[start] := 0 
    // For each node, the total cost of getting from the start node to the goal
    // by passing by that node. That value is partly known, partly heuristic.
    fScore := map with default value of Infinity
    // For the first node, that value is completely heuristic.
    fScore[start] := heuristic_cost_estimate(start, goal)

    while openSet is not empty
        current := the node in openSet having the lowest fScore[] value
        if current = goal
            return reconstruct_path(cameFrom, goal)

        openSet.Remove(current)
        closedSet.Add(current)
        for each neighbor of current
            if neighbor in closedSet
                continue		// Ignore the neighbor which is already evaluated.
            // The distance from start to a neighbor
            tentative_gScore := gScore[current] + dist_between(current, neighbor)
            if neighbor not in openSet	// Discover a new node
                openSet.Add(neighbor)
            else if tentative_gScore >= gScore[neighbor]
                continue		// This is not a better path.

            // This path is the best until now. Record it!
            cameFrom[neighbor] := current
            gScore[neighbor] := tentative_gScore
            fScore[neighbor] := gScore[neighbor] + heuristic_cost_estimate(neighbor, goal)

    return failure

function reconstruct_path(cameFrom, current)
    total_path := [current]
    while current in cameFrom.Keys:
        current := cameFrom[current]
        total_path.append(current)
    return total_path
*/
