'use strict'
const WINEMOJI = '😎'
const LOOSEEMOJI = '😥'
const NORAMLEMOJI = '😃'
const BOMB = '💣'
const FLAG = '🚩'
const LIFE = '💗'
const HINTON = '🔦'
const HINTOFF = '💡'

var gBoard
var gTimesCellClicked = 0
var gTimesCellMarked = 0
var gTimer
var gTimerId
var gCountedMines = 0
var gLIfeCounter = 3
var gHintCounter = 3
var gSafeClickCounter = 3
var gMegaHintCount = 1
var gSevenBoom = false
var gIsHintOn = false
var gIsMegaHintOn = false
var gFirstMoveMegaHint = 0
var gFirstMove
// var gCreateYourOwn = false
// var gPlayYourOwn = false
let myObj1EasyLevel = {
    timer: 1000000
};
let myObj1MediumLevel = {
    timer: 1000000
};
let myObj1ExpertLevel = {
    timer: 1000000
};
const gEasyLevel = {
    SIZE: 4,
    MINES: 2
};
const gMediumLevel = {
    SIZE: 8,
    MINES: 14
};
const gExpertLevel = {
    SIZE: 12,
    MINES: 32
};
var gGame = {
    isOn: true,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

function init() {
    //if you want to set your own record you can delete the previous one
    // localStorage.removeItem("myObj1EasyLevel")
    // localStorage.removeItem("myObj1MediumLevel")
    // localStorage.removeItem("myObj1ExpertLevel")
    var elStart = document.querySelector('.startBtn')
    elStart.innerText = NORAMLEMOJI
    var elTimer = document.querySelector('.timer')
    elTimer.innerText = 'Timer:'
    var elSafeClick = document.querySelector('.safeClick')
    elSafeClick.innerText = 'Safe Clicks Left: 3'
    var elHearts = document.querySelector('.hearts')
    elHearts.innerText = 'Hearts Left: ' + LIFE + LIFE + LIFE
    var elHint = document.querySelector('.hint')
    elHint.innerText = 'Hints Left: ' + HINTOFF + HINTOFF + HINTOFF
    gBoard = buildBoard(4)
    renderBoard(gBoard, '.board-container')
    gTimesCellClicked = 0
    gTimesCellMarked = 0
    gCountedMines = 0
    gLIfeCounter = 3
    gHintCounter = 3
    gSafeClickCounter = 3
    gMegaHintCount = 1
    gFirstMoveMegaHint = 0
    gIsHintOn = false
    gSevenBoom = false
    gIsMegaHintOn = false
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
    clearInterval(gTimerId)
}
function cancelRightClickPop() {
    const noContexts = document.querySelectorAll('.cell');
    for (var p = 0; p < noContexts.length; p++) {
        const noContext = noContexts[p]
        noContext.addEventListener('contextmenu', function (disable) {
            disable.preventDefault();
        });
    }
}

function difficulty(elBtn) {
    if (elBtn.innerText === 'Beginner') {
        if (gSevenBoom) {
            sevenBoom()
        }
        else init()
        gBoard = buildBoard(gEasyLevel.SIZE)
        renderBoard(gBoard, '.board-container')
    } else if (elBtn.innerText === 'Medium') {
        if (gSevenBoom) {
            sevenBoom()
        }
        else init()
        gBoard = buildBoard(gMediumLevel.SIZE)
        renderBoard(gBoard, '.board-container')
    } else {
        if (gSevenBoom) {
            sevenBoom()
        }
        else init()
        gBoard = buildBoard(gExpertLevel.SIZE)
        renderBoard(gBoard, '.board-container')
    }
}


function markedOrClicked(event, elCell, iIdx, jIdx) {
    cancelRightClickPop()
    if (!gGame.isOn) return
    if (event.buttons === 1) {
        cellClicked(elCell, iIdx, jIdx)
    } else if (event.buttons === 2) cellMarked(elCell, iIdx, jIdx)
    else console.log('unknown click')
}


function sevenBoom() {
    var elStart = document.querySelector('.startBtn')
    elStart.innerText = NORAMLEMOJI
    var elTimer = document.querySelector('.timer')
    elTimer.innerText = 'Timer:'
    var elSafeClick = document.querySelector('.safeClick')
    elSafeClick.innerText = 'Safe Clicks Left: 3'
    var elHearts = document.querySelector('.hearts')
    elHearts.innerText = 'Hearts Left: ' + LIFE + LIFE + LIFE
    var elHint = document.querySelector('.hint')
    elHint.innerText = 'Hints Left: ' + HINTOFF + HINTOFF + HINTOFF
    gBoard = buildBoard(4)
    renderBoard(gBoard, '.board-container')
    gTimesCellClicked = 0
    gTimesCellMarked = 0
    gCountedMines = 0
    gLIfeCounter = 3
    gHintCounter = 3
    gSafeClickCounter = 3
    gMegaHintCount = 1
    gFirstMoveMegaHint = 0
    gIsHintOn = false
    gSevenBoom = true
    gIsMegaHintOn = false
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
    clearInterval(gTimerId)
}




