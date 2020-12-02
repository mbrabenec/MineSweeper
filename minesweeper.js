// GLOBALS

var cells = [];         // array of cell objects. Side effect of tableCreate()
var numOfMines = 20;
var boardSize = 10;
var ids = [];           // array of cell object IDs. Side effect of tableCreate()
var FLAG = "&#9873;";
var MINE = "&#9881;";
var timeElapsed = 0;
var clicks = 0;
var mineKeys;


// Board creator - generates table, ID for cell and object for each cell

function tableCreate(size) {
    var div = document.getElementById("board");
    var tbl = document.createElement('table');

    for(var i = 0; i < size; i++) {     
        var tr = tbl.insertRow();
        for(var j = 0; j < size; j++) {
                
            //create cell
            var td = tr.insertCell();

            //add ID
            var newId = [j]+["a"]+[i];
            td.id = newId;

            //create cell object + push it to GLOBAL cells array
            cells.push(new Cell([j]+["a"]+[i]));
        }
    }
    div.appendChild(tbl);

    // create and populate GLOBAL ids array
    for (param in cells) {
        ids.push(cells[param].id);
    }
}


// Object CONSTRUCTOR for each cell. Prototype function calculates neighbouring cells

function Cell(id) {
    this.id = id,
    this.rowCol = this.splitRef(this.id),
    this.row = this.rowCol[0],
    this.column = this.rowCol[1],
    this.neighbours = this.getNeighbours(this.rowCol)
}

Cell.prototype.opened = false;
Cell.prototype.flagged = false;
Cell.prototype.mined = false;


// cell IDs (both object properties and HTML td IDs format: XaX (X = num) eg. "0a4"
// this function splits them before neighbours are found and edge adjustments made.

Cell.prototype.splitRef = function(id) {
cellStr = String(id);
rowCol = cellStr.split("a");
return rowCol;
}

Cell.prototype.getNeighbours = function(rowCol) {

var i = parseInt(rowCol[0]);
var j = parseInt (rowCol[1]);
var allNeighbours = [];
var neighbours = []

        allNeighbours.push([i-1]+["a"]+[j+1]);
        allNeighbours.push([i]+["a"]+[j+1]);
        allNeighbours.push([i+1]+["a"]+[j+1]);
        allNeighbours.push([i+1]+["a"]+[j-1]);
        allNeighbours.push([i]+["a"]+[j-1]);
        allNeighbours.push([i-1]+["a"]+[j-1]);
        allNeighbours.push([i-1]+["a"]+[j]);
        allNeighbours.push([i+1]+["a"]+[j]);

for (pop in allNeighbours) {
    var elementStr = allNeighbours[pop];
    var upperBound = (boardSize);
    if (!elementStr.match(/-/g) && !elementStr.match(upperBound, 'g')) {
        neighbours.push(elementStr);
    }
}
return neighbours;
}


// Mine creator. cells is GLOBAL array containing one object for each cell. Random 
// keys of this array are generated to determine mines.

function mineRandomiser(cells, numberRequired) {
    var i = 0;
    var mineKeys = [];

    do {
        var randomInt = Math.floor(Math.random() * (cells.length));
        if (mineKeys.indexOf(randomInt) >= 0) {
            
        } else {
            mineKeys.push(randomInt);
            i++;
        }
    } while (i < numberRequired);
    return mineKeys;
}


// Takes mine keys (of cell object array). 
// Sets object properties for mined=true & calculates nearby mines total

function mineProcessor(mineKeys) {

    // Toggle object paramaters if cell mined
    for (i = 0; i < mineKeys.length; i++) {
        cells[mineKeys[i]].mined = true;
    }

    // Calculate and create nearbyMine property in all objects - if mined, mmine count set to NULL
    for (param in cells) {
        var a = cells[param].neighbours;
        count = 0;
        for (i = 0; i < a.length; i++) {
            var index = ids.indexOf(a[i]);
            if (cells[index].mined === true) {
                count++
            }
        }
        if (cells[param].mined === true) {
            cells[param].minesNearby = "na";
        } else {
            cells[param].minesNearby = count;
        }
    }
}


// helper function. Takes object/html cell ID and returns its object 

function obj(id) {
    var index = ids.indexOf(id);
    var obj = cells[index];
    return obj;
}


// Event Listners

function assignListeners() {
    document.querySelectorAll("td").forEach(item => {
        item.addEventListener("click", listenLC);
        item.addEventListener("contextmenu", listenRC);
    })

    /*
    var startGameButton = document.getElementById("startButton");
    startGameButton.addEventListener("click", newGame());
    */
    
}


// EVENT HANDLERS

// Right click

function listenRC(e) {
    e.preventDefault();
    var targetID = e.currentTarget.id
    var targetobj = obj(targetID);
    var a = document.getElementById(targetID);

    if (targetobj.flagged === true) {
        targetobj.flagged = false;
        a.innerHTML = "";

    } else if ((targetobj.flagged === false) && targetobj.opened === false) {
        targetobj.flagged = true;
        a.innerHTML = FLAG;
        a.setAttribute("class", "flagged");
    }    
}

// Left click pt.1

function listenLC(e) {
    clicks++;
    var targetID = e.currentTarget.id
    processLC(targetID);
}

// Left click pt.2 - seperate to allow neighbour cell IDs of unmined clicked square to
// be passed for processing --> PROBLEM. Recursion? Doesn't overflow, but odd. Best seen with low mine count.

function processLC(targetID) {

    var targetobj = obj(targetID);
    var a = document.getElementById(targetID);

   if (targetobj.flagged === true) {
        // no action if flagged

    } else if (targetobj.mined === true) {
        if (clicks === 1) {
            preventLoss(targetID);
        } else {
        a.innerHTML = MINE;
        a.setAttribute("class", "mine");
        alert("game over");
        }

    } else if (targetobj.minesNearby >= 1){
        // if any mines in surrounding 8 cells
        a.innerHTML = targetobj.minesNearby;
        a.setAttribute("class", getNumberColor(targetobj.minesNearby));
        targetobj.opened = true;

    } else if (targetobj.minesNearby === 0) { 
        //no mines
        var results = emptyCalc(targetID);
        var empties = results[0];
        var borders = results[1];

        for (i = 0; i < empties.length; i++) {
            var cellId = empties[i];
            var cellObj = obj(cellId);
            if (cellObj.flagged === true) {
                // no action
            } else {
                cellObj.opened = true;
                var b = document.getElementById(cellId);
                b.innerHTML = "";
                b.setAttribute("class", getNumberColor(cellObj.minesNearby));
            }
        }

        for (i = 0; i < borders.length; i++) {
            processLC(borders[i]);
            }
        }
}




function preventLoss (targetID) {
    console.log(mineKeys);
    var targetID = targetID;
    var targetObj = obj(targetID);
    
    for (i = 0; i < cells.length; i++) {
        if(cells[i].id === targetID) {
            var problemMineRef = i;
        }
    }

    console.log(problemMineRef);

    var j = 0;
    do {
        var randomInt = Math.floor(Math.random() * (cells.length));
        if (mineKeys.indexOf(randomInt) < 0) {
            mineKeys.push(randomInt);
            j++;
        }
    } while (j < 1);


    var mineToDelete = mineKeys.indexOf(problemMineRef);
    mineKeys.splice(mineToDelete, 1);
    targetObj.mined = false;
    mineProcessor(mineKeys);
    count++
    processLC(targetID);

}

/*
do {
    var randomInt = Math.floor(Math.random() * (cells.length));
    if (mineKeys.indexOf() >= 0) {
        
    } else {
        mineKeys.push(randomInt);
        i++;
    }
} while (i < numberRequired);
return mineKeys;
*/




// determines color of innerHTML mine numer text.

function getNumberColor(number) {
	var color = 'black';
	if( number === 1 )
	{
	    color = 'blue';
	}
	else if( number === 2 )
	{
		color = 'green';
	}
	else if( number === 3 )
	{
		color = 'red';
	}
	else if( number >= 4 )
	{
        color = 'lotsaMines';
	}
	return color;
}


// calculate linked (ie auto revealed) cells with zero neighbouring mines and also the edge cases which do 
// have neighbouirng mines.

function emptyCalc(targetID) {

    var allToOpen = [];             // all explored cells. Checked to avoid re-adding them to hash-array
    var hashedTrueEmpties = [];     // hash-array of neighbours with no mines, to check neighbours of
    var linkedBorder = [];          // edge cases that have a mine nearby.
    var linkedEmpties = [];         // ...and mine free

    hashedTrueEmpties.push(targetID);                   // clicked initital value for hash-arry

    while (hashedTrueEmpties.length > 0) {              // start search for auto-reveal linked cells
        var targetID = hashedTrueEmpties.shift();       // remove the initial clicked value
        var targetObj = obj(targetID);

        for (i in targetObj.neighbours) {
            var nID = targetObj.neighbours[i];
            var nObj = obj(nID);
            if ((nObj.minesNearby === 0) && ((allToOpen.indexOf(nID) < 0))) {
                allToOpen.push(nID);
                hashedTrueEmpties.push(nID);            // new cells with no mines nearby added to hash
                linkedEmpties.push(nID);
            } else if ((nObj.minesNearby > 0) && ((allToOpen.indexOf(nID) < 0))) {
                allToOpen.push(nID);
                linkedBorder.push(nID);
            }
        }
    }

var results = [];
linkedEmpties.push(targetID);  // add back as if lone clear cell, doesn't get returned by a neighbour
results[0] = linkedEmpties;
results[1] = linkedBorder;
return results;
}

// Timer

function updateTime() {
    timeElapsed++
    var time = document.getElementById("time");
    time.innerHTML = timeElapsed;
}

function stopTime() {
    clearInterval(timer);
}



function newGame() {
    
    /*
    cells.length = 0;
    ids.length = 0;
    timeElpased = 0
    clicks = 0
    mineKeys.length = 0;
*/

    tableCreate(boardSize);

    /*
    mineKeys = mineRandomiser(cells, numOfMines);
    mineProcessor(mineKeys);
    assignListeners();
    console.log(cells);

    var timer = setInterval(function() {updateTime()}, 1000); 
*/



}

// Execute

tableCreate(boardSize);
mineKeys = mineRandomiser(cells, numOfMines);
mineProcessor(mineKeys);
assignListeners();
console.log(cells);

var timer = setInterval(function() {updateTime()}, 1000); 







