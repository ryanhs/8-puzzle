
function Puzzle (boardTable) {
	this.boardTable = boardTable;
	this.blankCoordinate = [0, 0];
	this.legalMoves = [];
	
	this.defaultData = [
		[1, 2, 3],
		[8, 0, 4],
		[7, 6, 5]
	];
	this.data = [];
	
	this.random = function(){
		this.data = [];
		for(row = 1; row <= 3; row++){
			this.data.push([]);
			for(cell = 1; cell <= 3; cell++){
				this.data[row - 1][cell -1] = this.defaultData[row - 1][cell -1];
			}
		}
		
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
		
		return this;
	}
	
	this.init = function(){
		this.data = [];
		for(row = 1; row <= 3; row++){
			this.data.push([]);
			for(cell = 1; cell <= 3; cell++){
				this.data[row - 1][cell -1] = this.defaultData[row - 1][cell -1];
			}
		}
		
		this.calculateSituation();
		
		return this;
	}
	
	this.clone = function(){
		c = new Puzzle();
		
		c.data = [];
		for(row = 1; row <= 3; row++){
			c.data.push([]);
			for(cell = 1; cell <= 3; cell++){
				c.data[row - 1][cell -1] = this.data[row - 1][cell -1];
			}
		}
		c.blankCoordinate = this.blankCoordinate.slice(0);
		c.legalMoves = this.legalMoves.slice(0);
		return c;
	}
	
	
	
	this.findTile = function(tile){
		coordinate = [0, 0];
		for(row = 1; row <= 3; row++){
			for(cell = 1; cell <= 3; cell++){
				if(this.data[row - 1][cell -1] == tile){
					coordinate = [row - 1, cell - 1];
					break;
					break;
				}
			}
		}
		return coordinate;
	}
	
	this.findTileDefault = function(tile){
		coordinate = [0, 0];
		for(row = 1; row <= 3; row++){
			for(cell = 1; cell <= 3; cell++){
				if(this.defaultData[row - 1][cell -1] == tile){
					coordinate = [row - 1, cell - 1];
					break;
					break;
				}
			}
		}
		return coordinate;
	}
	
	this.calculateSituation = function(){
		// get blank coordinate
		this.blankCoordinate = this.findTile(0);
		
		// calculate legal moves
		legalMoves = [];
		if(this.blankCoordinate[0] < 2) legalMoves.push('down');
		if(this.blankCoordinate[0] > 0) legalMoves.push('up');
		if(this.blankCoordinate[1] < 2) legalMoves.push('right');
		if(this.blankCoordinate[1] > 0) legalMoves.push('left');
		this.legalMoves = legalMoves;
		
		return this;
	}
	
	this.isLegalMove = function(move){
		return this.legalMoves.indexOf(move) > -1;
	}
	
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
		
		return this;
	}
	
	this.refreshBoard = function(){
		//if(this.boardTable == null) return false;
		
		this.boardTable.empty();
		
		for(row = 1; row <= 3; row++){
			tr = $('<tr>')
			for(cell = 1; cell <= 3; cell++){
				puzzleCell = this.data[row - 1][cell -1];
				tr.append('<td class="puzzle-' + puzzleCell + '">' + (puzzleCell == 0 ? '' : puzzleCell) + '</td>')
			}
			this.boardTable.append(tr);
		}
		
		return this;
	}
	
	this.isFinish = function(){
		finish = true;
		for(row = 1; row <= 3; row++){
			for(cell = 1; cell <= 3; cell++){
				//console.log('f(' + this.data[row - 1][cell - 1] + ',' + this.defaultData[row - 1][cell - 1] + ')');
				if(this.data[row - 1][cell - 1] != this.defaultData[row - 1][cell - 1]){
					return false;
				}
			}
		}
		
		return finish;
	}
		
}
