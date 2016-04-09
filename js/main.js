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
	if(board.isFinish()){
		$('.dfs-stop-btn').addClass('hide');
		$('.dfs-btn').removeAttr('disabled');
		return true;
	}
	
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
	if(board.isFinish()){
		$('.bfs-stop-btn').addClass('hide');
		$('.bfs-btn').removeAttr('disabled');
		return true;
	}
	
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
testAlgoAStarTimeout = false;
function testAlgoAStar(){
	testAlgoAStarTimeout = false;
	
	startPuzzle = board.clone();
	startStringify = JSON.stringify(startPuzzle.data);
	
	closedSet = [];
	openSet = [startStringify];
	
	cameFrom = {};
	
	gScore = {};
	gScore[startStringify] = 0;
	
	fScore = {};
	fScore[startStringify] = calculateDistance(startPuzzle);
	
	i = 0;
	
	function do_AStar(){
		if(openSet.length == 0){
			$('.astar-stop-btn').addClass('hide');
			$('.astar-btn').removeAttr('disabled');
			console.log('no solution!'); // failure
			return;
		}
		
		openSet.sort(function(a, b){
			if(fScore[a] > fScore[b]) return 1;
			if(fScore[a] < fScore[b]) return -1;
			return 0;
		});
		
		currentStringify = openSet[0];
		currentPuzzle = new Puzzle();
		currentPuzzle.data = JSON.parse(currentStringify);
		currentPuzzle.calculateSituation();
		
		// if finish, do animation
		if(currentPuzzle.isFinish()) return testAlgoAStarReconstructPath(cameFrom, currentStringify); 
		
		openSet.splice(0, 1);
		closedSet.push(currentStringify);
		
		
		moves = [];
		for(move in currentPuzzle.legalMoves){
			neighborBoard = currentPuzzle.clone();
			neighborBoard.move(currentPuzzle.legalMoves[move]);
			neighborBoardStringify = JSON.stringify(neighborBoard.data);
			
			if(closedSet.indexOf(neighborBoardStringify) != -1) continue;
			
			tentative_gScore = gScore[currentStringify] + 1; // dist between is 1, on block at the time
			
			if(openSet.indexOf(neighborBoardStringify) == -1){
				openSet.push(neighborBoardStringify);
			}else if(tentative_gScore >=  gScore[neighborBoardStringify]){
				continue; // this is not better path
			}
			
			cameFrom[neighborBoardStringify] = currentStringify;
			gScore[neighborBoardStringify] = tentative_gScore;
			fScore[neighborBoardStringify] = tentative_gScore + calculateDistance(neighborBoard);
			
			
			log.append($('<p style="font-family:monospace;">').html(neighborBoardStringify));
			resizeStyle();
			console.log(neighborBoardStringify);
		}
		
		i++;
		testAlgoAStarTimeout = setTimeout(do_AStar, 1);
	}
	
	
	testAlgoAStarTimeout = setTimeout(do_AStar, 1);
}

function testAlgoAStarReconstructPath(cameFrom, currentStringify){
	console.log('solution found!');
	console.log('recontructing path...');
	
	totalPath = [currentStringify];
	
	while(cameFrom[currentStringify] !== undefined){
		currentStringify = cameFrom[currentStringify];
		totalPath.push(currentStringify);
	}
	
	
	pathReversed = [];
	for(i = totalPath.length; i > 0; i--){
		pathReversed.push(totalPath[i - 1])
	}
	
	prev = pathReversed[0];
	function do_animate(){
		if(pathReversed.length == 0){
			$('.astar-stop-btn').addClass('hide');
			$('.astar-btn').removeAttr('disabled');
			return;
		}
		
		now = pathReversed[0];
		pathReversed.splice(0, 1);
		
		prevData = JSON.parse(prev);
		prevPuzzle = new Puzzle();
		prevPuzzle.data = prevData;
		prevPuzzle.calculateSituation();
		
		if(JSON.stringify(prevPuzzle.clone().move('up').data) == now) moveTile('up');
		if(JSON.stringify(prevPuzzle.clone().move('right').data) == now) moveTile('right');
		if(JSON.stringify(prevPuzzle.clone().move('down').data) == now) moveTile('down');
		if(JSON.stringify(prevPuzzle.clone().move('left').data) == now) moveTile('left');
		
		prev = now;
		testAlgoAStarTimeout = setTimeout(do_animate, 300);
	}
	
	console.log('do animation...');
	log.empty();
	testAlgoAStarTimeout = setTimeout(do_animate, 300);
}
