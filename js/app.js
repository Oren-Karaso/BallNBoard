var WALL = 'WALL';
var FLOOR = 'FLOOR';
var PASSAGE = 'PASSAGE';
var BALL = 'BALL';
var GAMER = 'GAMER';

var GAMER_IMG = '<img src="img/gamer.png" />';
var BALL_IMG = '<img src="img/ball.png" />';

var gInterval;
var gBoard;
var gGamerPos;
var gBallsCollected;
var gBallsAdded;
var audioCollect = new Audio('collect.mp3');
var audioWon = new Audio('won.mp3');

function initGame() {
	gBallsCollected = 0;
	gBallsAdded = 2;
	gGamerPos = { i: 2, j: 9 };
	gBoard = buildBoard();
	addPassge(gBoard);
	renderBoard(gBoard);
	gInterval = setInterval(addBall, 5000, gBoard);
	// addBall(gBoard);
}

function buildBoard() {
	// Create the Matrix
	var board = createMat(10, 12)


	// Put FLOOR everywhere and WALL at edges
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[0].length; j++) {
			// Put FLOOR in a regular cell
			var cell = { type: FLOOR, gameElement: null };

			// Place Walls at edges
			if (i === 0 || i === board.length - 1 || j === 0 || j === board[0].length - 1) {
				cell.type = WALL;
			}

			// Add created cell to The game board
			board[i][j] = cell;
		}
	}


	// Place the gamer at selected position
	board[gGamerPos.i][gGamerPos.j].gameElement = GAMER;

	// Place the Balls (currently randomly chosen positions)
	board[3][8].gameElement = BALL;
	board[7][4].gameElement = BALL;

	// console.log(board);
	return board;
}

// Render the board to an HTML table
function renderBoard(board) {

	var strHTML = '';
	for (var i = 0; i < board.length; i++) {
		strHTML += '<tr>\n';
		for (var j = 0; j < board[0].length; j++) {
			var currCell = board[i][j];

			var cellClass = getClassName({ i: i, j: j })

			// TODO - change to short if statement
			if (currCell.type === FLOOR) cellClass += ' floor';
			else if (currCell.type === WALL) cellClass += ' wall';
			else if (currCell.type === PASSAGE) cellClass += ' passage';

			//TODO - Change To template string
			strHTML += '\t<td class="cell ' + cellClass +
				'"  onclick="moveTo(' + i + ',' + j + ')" >\n';

			// TODO - change to switch case statement
			if (currCell.gameElement === GAMER) {
				strHTML += GAMER_IMG;
			} else if (currCell.gameElement === BALL) {
				strHTML += BALL_IMG;
			}

			strHTML += '\t</td>\n';
		}
		strHTML += '</tr>\n';
	}

	// console.log('strHTML is:');
	// console.log(strHTML);
	var elBoard = document.querySelector('.board');
	elBoard.innerHTML = strHTML;
}

// Move the player to a specific location
function moveTo(i, j) {

	var targetCell = gBoard[i][j];
	if (targetCell.type === WALL) return;

	if (targetCell.type === PASSAGE) {
		console.log('here');
		moveThroughPassage(i, j);
		return;
	}

	// Calculate distance to make sure we are moving to a neighbor cell
	var iAbsDiff = Math.abs(i - gGamerPos.i);
	var jAbsDiff = Math.abs(j - gGamerPos.j);

	// If the clicked Cell is one of the four allowed
	if ((iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0)) {

		if (targetCell.gameElement === BALL) {
			gBallsCollected++;

			if (gBallsCollected === gBallsAdded) {
				console.log('Collecting! and Won! You have collected:', gBallsCollected + ' balls in total');
				audioWon.play();
				gBoard[gGamerPos.i][gGamerPos.j].gameElement = null;
				renderCell(gGamerPos, '');
				gGamerPos.i = i;
				gGamerPos.j = j;
				gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
				renderCell(gGamerPos, GAMER_IMG);
				clearInterval(gInterval);

				document.querySelector('.start').style.display = 'block';
				return;
			} else {
				console.log('Collecting! You have:', gBallsCollected + ' balls in total');
				audioCollect.play();
			}
		}

		
		// MOVING from current position
		// Model:
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = null;
		// Dom:
		renderCell(gGamerPos, '');


		// MOVING to selected position
		// Model:
		gGamerPos.i = i;
		gGamerPos.j = j;
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
		// DOM:
		renderCell(gGamerPos, GAMER_IMG);

	} // else console.log('TOO FAR', iAbsDiff, jAbsDiff);

}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
	var cellSelector = '.' + getClassName(location)
	var elCell = document.querySelector(cellSelector);
	elCell.innerHTML = value;
}

// Move the player by keyboard arrows
function handleKey(event) {

	var i = gGamerPos.i;
	var j = gGamerPos.j;


	switch (event.key) {
		case 'ArrowLeft':
			moveTo(i, j - 1);
			break;
		case 'ArrowRight':
			moveTo(i, j + 1);
			break;
		case 'ArrowUp':
			moveTo(i - 1, j);
			break;
		case 'ArrowDown':
			moveTo(i + 1, j);
			break;

	}

}

// Returns the class name for a specific cell
function getClassName(location) {
	var cellClass = 'cell-' + location.i + '-' + location.j;
	return cellClass;
}

// add a ball randomly to a location every 5 sec

function addBall(board) {
	var i = getRandomInt(0, board.length - 1);
	var j = getRandomInt(0, board[0].length - 1);
	while ((board[i][j].gameElement === null) &&
		(board[i][j].type === FLOOR)) {

		board[i][j].gameElement = BALL;
		renderCell({ i, j }, BALL_IMG);
		gBallsAdded++;
		break;
	}
}

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function addPassge(board) {
	var halfI = ((board.length - 1) / 2).toFixed(0);
	var halfJ = ((board[0].length - 1) / 2).toFixed(0);

	board[0][halfJ].type = PASSAGE;
	board[board.length - 1][halfJ].type = PASSAGE;
	board[halfI][0].type = PASSAGE;
	board[halfI][board[0].length - 1].type = PASSAGE;

}

function moveThroughPassage(i, j) {
	console.log('Move through');

	// MOVING from current position
		// Model:
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = null;
		// Dom:
		renderCell(gGamerPos, '');

	if (i === 0)  {  //upper passage
		gGamerPos.i = gBoard.length - 1;
		gGamerPos.j = j;
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
		// DOM:
		renderCell(gGamerPos, GAMER_IMG);
		return;
	}

	if (i === (gBoard.length - 1)) {  //lower passage
		gGamerPos.i = 1;
		gGamerPos.j = j;
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
		// DOM:
		renderCell(gGamerPos, GAMER_IMG);
		return;
	}

	if  (j === 0) {  //left passage
		gGamerPos.i = i;
		gGamerPos.j = gBoard[0].length - 1;
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
		// DOM:
		renderCell(gGamerPos, GAMER_IMG);
		return;
	}

	if (j = gBoard[0].length - 1) {  //right passage
		gGamerPos.i = i;
		gGamerPos.j = 1;
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
		// DOM:
		renderCell(gGamerPos, GAMER_IMG);
	}
	console.log('i=', i + ' j=', j);
}