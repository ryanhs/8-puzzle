$(function(){
	
	function resizeStyle(){
		board_td = $('.board tr td');
		board_td.height(board_td.width());
		$('.log').scrollTop($('.log')[0].scrollHeight);
	}
	
	var board = new Puzzle($('.board table'));
	board.random();
	board.refreshBoard();
	resizeStyle();
	
	
	log = $('.log');
	log.empty();
	$(document).keydown(function(e) {
		switch(e.which) {
			case 37: move('left'); break;
			case 38: move('up'); break;
			case 39: move('right'); break;
			case 40: move('down'); break;
			default: return;
		}
		e.preventDefault();
	});
	
	
	log_i = 1;
	function move(direction){
		if(board.isLegalMove(direction)){
			board.move(direction);
			board.refreshBoard();
			resizeStyle();
			
			log.append($('<p>').html(log_i + '. ' + direction));
			log_i++;
		}
	}
	
});


function Puzzle (boardTable) {
	this.boardTable = boardTable;
	this.blankCoordinate = [0, 0];
	this.legalMoves = [];
	
	this.data = [
		[1, 2, 3],
		[4, 5, 6],
		[7, 8, 0]
	];
	
	this.random = function(){
		tmp = [];
		while(true){
			rand = Math.floor((Math.random() * 100000) % 10)
			if(tmp.indexOf(rand) == -1 && rand >= 0 && rand <= 8){
				tmp.push(rand);
			}
			
			if(tmp.length == 9)
				break;
		}
		
		// convert to this.data format
		tmp_i = 0;
		for(row = 1; row <= 3; row++){
			for(cell = 1; cell <= 3; cell++){
				this.data[row - 1][cell -1] = tmp[tmp_i++];
			}
		}
		
		this.calculateSituation();
	};
	
	this.init = function(){
		this.calculateSituation();
	}
	
	
	
	this.calculateSituation = function(){
		// get blank coordinate
		blankCoordinate = [0, 0];
		for(row = 1; row <= 3; row++){
			for(cell = 1; cell <= 3; cell++){
				if(this.data[row - 1][cell -1] == 0){
					blankCoordinate = [row - 1, cell - 1];
				}
			}
		}
		this.blankCoordinate = blankCoordinate;
		
		// calculate legal moves
		legalMoves = [];
		if(this.blankCoordinate[0] < 2) legalMoves.push('down');
		if(this.blankCoordinate[0] > 0) legalMoves.push('up');
		if(this.blankCoordinate[1] < 2) legalMoves.push('right');
		if(this.blankCoordinate[1] > 0) legalMoves.push('left');
		this.legalMoves = legalMoves;
	};
	
	this.isLegalMove = function(move){
		return this.legalMoves.indexOf(move) > -1;
	};
	
	this.move = function(direction){
		if(!this.isLegalMove(direction)) return false;
		
		switch(direction){
			case 'up':
				destination = this.data[this.blankCoordinate[0] - 1][this.blankCoordinate[1]];
				this.data[this.blankCoordinate[0] - 1][this.blankCoordinate[1]] = 0;
				this.data[this.blankCoordinate[0]][this.blankCoordinate[1]] = destination;
				break;
			case 'down':
				destination = this.data[this.blankCoordinate[0] + 1][this.blankCoordinate[1]];
				this.data[this.blankCoordinate[0] + 1][this.blankCoordinate[1]] = 0;
				this.data[this.blankCoordinate[0]][this.blankCoordinate[1]] = destination;
				break;
			case 'left':
				destination = this.data[this.blankCoordinate[0]][this.blankCoordinate[1] - 1];
				this.data[this.blankCoordinate[0]][this.blankCoordinate[1] - 1] = 0;
				this.data[this.blankCoordinate[0]][this.blankCoordinate[1]] = destination;
				break;
			case 'right':
				destination = this.data[this.blankCoordinate[0]][this.blankCoordinate[1] + 1];
				this.data[this.blankCoordinate[0]][this.blankCoordinate[1] + 1] = 0;
				this.data[this.blankCoordinate[0]][this.blankCoordinate[1]] = destination;
				break;
		}
		
		this.calculateSituation();
	}
	
	this.refreshBoard = function(){
		this.boardTable.empty();
		
		for(row = 1; row <= 3; row++){
			tr = $('<tr>')
			for(cell = 1; cell <= 3; cell++){
				puzzleCell = this.data[row - 1][cell -1];
				tr.append('<td class="puzzle-' + puzzleCell + '">' + puzzleCell + '</td>')
			}
			this.boardTable.append(tr);
		}
	};
	
	
	
}


