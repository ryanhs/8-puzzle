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
			if(a.f > b. f) return 1;
			if(a.f < b. f) return -1;
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
