'use strict'

function buildBoard(size) {
    const board = []
    for (var i = 0; i < size; i++) {
        board.push([])
        for (var j = 0; j < size; j++) {
            var cell = {
                minesAroundCount: 2,
                isShown: false,
                isMine: false,
                isMarked: false
            }
            board[i][j] = cell
        }
    }
    return board
}


function renderBoard(mat, selector) {

    var strHTML = '<table border="1" cellpadding="10" id="table"><tbody class="board">'
    for (var i = 0; i < mat.length; i++) {
        strHTML += '\n<tr>\n'
        for (var j = 0; j < mat[0].length; j++) {
            var cell = mat[i][j]
            if (cell.isMarked) { cell = FLAG }
            else if (cell.isShown) {
                if (cell.isMine)
                    cell = BOMB
                else if (cell.minesAroundCount === 0) cell = ' '
                else cell = cell.minesAroundCount
            } else cell = ' '
            const className = 'cell cell-' + i + '-' + j
            strHTML += `\t<td class="${className}" onmousedown="markedOrClicked(event,this,${i},${j})">${cell}</td>\n`
        }
        strHTML += '\n</tr>'
    }
    strHTML += '</tbody></table>'
    const elContainer = document.querySelector(selector)
    elContainer.innerHTML = strHTML
    cancelRightClickPop()
}


function cellMarked(elCell, iIdx, jIdx) {
    var curCell = gBoard[iIdx][jIdx]
    if (gTimesCellClicked === 0 && gTimesCellMarked === 0) {
        const startTime = Date.now()
        gTimerId = setInterval(timer, 37, startTime)
    }
    gTimesCellMarked++
    if (curCell.isShown) return
    else if (!curCell.isMarked) {
        curCell.isMarked = true
        gGame.markedCount++
        renderCell(iIdx, jIdx, FLAG)
    }
    else {
        curCell.isMarked = false
        gGame.markedCount--
        renderCell(iIdx, jIdx, ' ')
    }
    if (gGame.markedCount === gCountedMines) checkGameOver()
}


function loose() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var curCell = gBoard[i][j]
            if (curCell.isMine) {
                curCell.isShown = true
                renderCell(i, j, BOMB)
            }
        }
    }
    var elLoose = document.querySelector('.startBtn')
    elLoose.innerText = LOOSEEMOJI
    gGame.isOn = false
    clearInterval(gTimerId)
}


function checkGameOver() {
    if (gBoard.length === 4 && gGame.markedCount >= 2 && gGame.shownCount >= 14) {
        easyModeWin()
    }
    else if (gBoard.length === 8 && gGame.markedCount >= 14 && gGame.shownCount >= 50) {
        mediumModeWin()
    }
    else if (gBoard.length === 12 && gGame.markedCount >= 32 && gGame.shownCount >= 112) {
        expertModeWin()
    }
    else return
}


function setMinesNegsCount(board, rowIdx, colIdx) {
    var minesAroundCount = 0
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board[0].length) continue
            if (i === rowIdx && j === colIdx) continue
            var currCell = board[i][j]
            if (currCell.isMine) minesAroundCount++
        }
    }
    return minesAroundCount
}


function createRandomMines(howManyMines, iIdx, jIdx) {
    for (var i = 0; i < howManyMines; i++) {
        createRandomMine(gBoard, iIdx, jIdx)
        gCountedMines++
    }
    renderBoard(gBoard, '.board-container')
}


function createSevenBoomMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (((j ** i) % 7 === 0) && j !== 0) {
                gBoard[i][j].isMine = true
                // gBoard[i][j].isShown = true
            }
            if (((i ** j) % 7 === 0) && i !== 0) {
                gBoard[i][j].isMine = true
                // gBoard[i][j].isShown = true
            }
        }
    }
    gBoard[0][7].isMine = true
    // gBoard[0][7].isShown = true
    gBoard[7][0].isMine = true
    // gBoard[7][0].isShown = true
}


function createRandomMine(gBoard, iIdx, jIdx) {
    var randomNum1 = getRandomIntInclusive(0, gBoard.length - 1)
    var randomNum2 = getRandomIntInclusive(0, gBoard.length - 1)
    if (gBoard[randomNum1][randomNum2].isMine || gBoard[randomNum1][randomNum2] === gBoard[iIdx][jIdx]) {
        while (gBoard[randomNum1][randomNum2].isMine || gBoard[randomNum1][randomNum2] === gBoard[iIdx][jIdx]) {
            randomNum1 = getRandomIntInclusive(0, gBoard.length - 1)
            randomNum2 = getRandomIntInclusive(0, gBoard.length - 1)
        }
    }
    gBoard[randomNum1][randomNum2].isMine = true
    //if you want to see the mines or not to see them
    // gBoard[randomNum1][randomNum2].isShown = true
}


function cellClicked(elCell, iIdx, jIdx) {
    var elCell = gBoard[iIdx][jIdx]
    if (gTimesCellClicked === 0) {
        if (!gSevenBoom) {
            if (gTimesCellClicked === 0 && !elCell.isMine) {
                if (gBoard.length === 4) { createRandomMines(gEasyLevel.MINES, iIdx, jIdx) }
                else if (gBoard.length === 8) { createRandomMines(gMediumLevel.MINES, iIdx, jIdx) }
                else { createRandomMines(gExpertLevel.MINES, iIdx, jIdx) }
            }
        }
    }
    if (gSevenBoom && gTimesCellClicked === 0) {
        createSevenBoomMines()
        renderBoard(gBoard, '.board-container')
    }
    gTimesCellClicked++
    if (elCell.isMarked) return
    else if (gIsMegaHintOn) {
        if (gFirstMoveMegaHint === 0) {
            saveLocation(iIdx, jIdx)
            gFirstMoveMegaHint++
            return
        }
        else if (gFirstMoveMegaHint === 1)
            var shownCells = showCellsMegaHint(gFirstMove.i, gFirstMove.j, iIdx, jIdx)
        setTimeout(hideCellsMegaHint, 2000, gFirstMove.i, gFirstMove.j, iIdx, jIdx, shownCells)
    }
    else if (gIsHintOn) {
        var shownCellsFromNormalHint = expandShownForHint(gBoard, iIdx, jIdx)
        setTimeout(expandUnShownForHint, 1000, gBoard, iIdx, jIdx, shownCellsFromNormalHint)
        // console.log(`gGame.shownCount= `, gGame.shownCount)
    }
    else {
        if (elCell.isMine) {
            switch (gLIfeCounter) {
                case 3:
                    var elHeart = document.querySelector('.hearts')
                    elHeart.innerText = 'Hearts Left: ' + LIFE + LIFE
                    gLIfeCounter--
                    break;
                case 2:
                    var elHeart = document.querySelector('.hearts')
                    elHeart.innerText = 'Hearts Left: ' + LIFE
                    gLIfeCounter--
                    break;
                case 1:
                    var elHeart = document.querySelector('.hearts')
                    elHeart.innerText = 'Hearts Left: '
                    gLIfeCounter--
                    break;
                case 0:
                    loose()
                    break;
            }
            return
        }
        elCell.minesAroundCount = setMinesNegsCount(gBoard, iIdx, jIdx)
        if (elCell.minesAroundCount === 0) { expandShown(gBoard, elCell, iIdx, jIdx) }
        else if (!gBoard[iIdx][jIdx].isShown) {
            gBoard[iIdx][jIdx].isShown = true
            if (gBoard[iIdx][jIdx].minesAroundCount === 0) renderCell(iIdx, jIdx, ' ')
            else renderCell(iIdx, jIdx, gBoard[iIdx][jIdx].minesAroundCount)

            colorTheNumber(iIdx, jIdx, elCell.minesAroundCount)
            gGame.shownCount++
        }
        if (gTimesCellClicked === 1 && gTimesCellMarked === 0) {
            const startTime = Date.now()
            gTimerId = setInterval(timer, 37, startTime)
        }
        if (gGame.shownCount === ((gBoard.length * gBoard.length) - gCountedMines)) checkGameOver()
    }
    console.log(`gGame.shownCount= `, gGame.shownCount)
}


function timer(time) {
    gTimer = (Date.now() - time) / 1000
    var elTimer = document.querySelector('.timer')
    elTimer.innerText = 'timer:' + gTimer
    elTimer.style.display = 'block'
}


function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}


function useHint(elButton) {
    if (gTimesCellClicked === 0) return
    switch (gHintCounter) {
        case 3:
            elButton.innerText = 'Hints Left: ' + HINTON + HINTON
            gHintCounter--
            break;
        case 2:
            elButton.innerText = 'Hints Left: ' + HINTON
            gHintCounter--
            break;
        case 1:
            elButton.innerText = 'Hints Left: '
            gHintCounter--
            break;
        case 0:
            return
    }
    gIsHintOn = true
}


//When user clicks a cell with no mines around, we need to open not only that cell, but also its neighbors.
function expandShown(board, elCell, rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board[0].length) continue
            if (!gBoard[i][j].isShown) {
                gBoard[i][j].minesAroundCount = setMinesNegsCount(gBoard, i, j)
                gBoard[i][j].isShown = true
                gGame.shownCount++
                colorTheNumber(i, j, gBoard[i][j].minesAroundCount)
                if (gBoard[i][j].minesAroundCount === 0) renderCell(i, j, ' ')
                else renderCell(i, j, gBoard[i][j].minesAroundCount)
            }
        }
    }
}


function expandShownForHint(board, rowIdx, colIdx) {
    var shownCells = []
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board[0].length) continue
            if (!gBoard[i][j].isShown) {
                if (gBoard[i][j].isMine) {
                    renderCell(i, j, BOMB)
                    gBoard[i][j].isShown = true
                }
                else {
                    gBoard[i][j].minesAroundCount = setMinesNegsCount(gBoard, i, j)
                    gBoard[i][j].isShown = true
                    renderCell(i, j, gBoard[i][j].minesAroundCount)
                }
            }
            else shownCells.push({ i, j })
        }
    }
    return shownCells
}


function expandUnShownForHint(board, rowIdx, colIdx, shownCells) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board[0].length) continue
            if (gBoard[i][j].isShown) {
                gBoard[i][j].isShown = false
                renderCell(i, j, ' ')
            }
        }
    }
    for (var p = 0; p < shownCells.length; p++) {
        if (gBoard[shownCells[p].i][shownCells[p].j].isMarked) renderCell(shownCells[p].i, shownCells[p].j, FLAG)
        else {
            if (gBoard[shownCells[p].i][shownCells[p].j].minesAroundCount === 0) renderCell(shownCells[p].i, shownCells[p].j, '')
            else renderCell(shownCells[p].i, shownCells[p].j, gBoard[shownCells[p].i][shownCells[p].j].minesAroundCount)
        }
        gBoard[shownCells[p].i][shownCells[p].j].isShown = true
    }
    switch (gHintCounter) {
        case 2:
            var elHint = document.querySelector('.hint')
            elHint.innerText = 'Hints Left: ' + HINTOFF + HINTOFF
            break;
        case 1:
            var elHint = document.querySelector('.hint')
            elHint.innerText = 'Hints Left: ' + HINTOFF
            break;
    }
    gIsHintOn = false
}


function safeClick(elButton) {
    if (gTimesCellClicked >= 1) {
        var randomCell = getRandomEmptyCell()
        var elMark = document.querySelector(`.cell-${randomCell.i}-${randomCell.j}`)

        if (!randomCell) return

        switch (gSafeClickCounter) {
            case 3:
                elMark.classList.add('mark')
                setTimeout(removeClassMark, 3000, randomCell.i, randomCell.j)
                elButton.innerText = 'Safe Clicks Left: 2'
                gSafeClickCounter--
                break;
            case 2:
                elMark.classList.add('mark')
                setTimeout(removeClassMark, 3000, randomCell.i, randomCell.j)
                elButton.innerText = 'Safe Clicks Left: 1'
                gSafeClickCounter--
                break;
            case 1:
                elMark.classList.add('mark')
                setTimeout(removeClassMark, 3000, randomCell.i, randomCell.j)
                elButton.innerText = 'Safe Clicks Left: 0'
                gSafeClickCounter--
                break;
            case 0:
                return
        }
    }

    else return
}


function removeClassMark(iIdx, jIdx) {
    var elMark = document.querySelector(`.cell-${iIdx}-${jIdx}`)
    if (elMark.classList.contains('mark')) {
        elMark.classList.remove('mark')
    }
}


function renderCell(i, j, value) {
    const elCell = document.querySelector(`.cell-${i}-${j}`)
    elCell.innerHTML = value
}


function colorTheNumber(iIdx, jIdx, minesAroundCell) {
    var elCell = document.querySelector('.cell-' + iIdx + '-' + jIdx)
    switch (minesAroundCell) {
        case 8:
            elCell.style.color = 'white'
            break;
        case 7:
            elCell.style.color = 'yello'
            break;
        case 6:
            elCell.style.color = 'purple'
            break;
        case 5:
            elCell.style.color = 'pink'
            break;
        case 4:
            elCell.style.color = 'orange'
            break;
        case 3:
            elCell.style.color = 'red'
            break;
        case 2:
            elCell.style.color = 'green'
            break;
        case 1:
            elCell.style.color = 'blue'
            break;
        case 0:
            elCell.style.backgroundColor = 'gray'
            break;

    }

}


function getRandomEmptyCell() {
    var positions = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            var cell = gBoard[i][j]
            if (!cell.isShown && !cell.isMine && !cell.isMarked) {
                var elMark = document.querySelector(`.cell-${i}-${j}`)
                if (!elMark.classList.contains('mark'))
                    positions.push({ i, j })
            }
        }
    }
    return positions[getRandomIntInclusive(0, positions.length - 1)]
}


function megaHint() {
    if (gTimesCellClicked === 0) return
    else if (gMegaHintCount === 1) {
        gIsMegaHintOn = true
        gMegaHintCount--
    }
    else return
}


function showCellsMegaHint(previousI, previousJ, currentI, currentJ) {
    var shownCells = []
    for (var i = previousI; i <= currentI; i++) {
        for (var j = previousJ; j <= currentJ; j++) {
            if (!gBoard[i][j].isShown) {
                if (gBoard[i][j].isMine) {
                    renderCell(i, j, BOMB)
                    gBoard[i][j].isShown = true
                }

                else {
                    gBoard[i][j].minesAroundCount = setMinesNegsCount(gBoard, i, j)
                    gBoard[i][j].isShown = true
                    renderCell(i, j, gBoard[i][j].minesAroundCount)
                }
            }
            else shownCells.push({ i, j })
        }
    }
    return shownCells
}


function hideCellsMegaHint(previousI, previousJ, currentI, currentJ, shownCells) {
    for (var i = previousI; i <= currentI; i++) {
        for (var j = previousJ; j <= currentJ; j++) {
            if (gBoard[i][j].isShown) {
                gBoard[i][j].isShown = false
                renderCell(i, j, ' ')
                for (var g = 0; g < shownCells.length; g++) {
                    if ((shownCells[g].i === i) && (shownCells[g].j === j)) {
                        gBoard[i][j].isShown = true
                        renderCell(i, j, gBoard[i][j].minesAroundCount)
                    }
                }
            }
        }
    }
    gIsMegaHintOn = false
}


function saveLocation(iIdx, jIdx) {
    gFirstMove = {
        i: iIdx,
        j: jIdx
    }

}


function easyModeWin() {
    var elVictory = document.querySelector('.startBtn')
    elVictory.innerText = WINEMOJI
    gGame.isOn = false
    clearInterval(gTimerId)
    if (!localStorage.getItem("myObj1EasyLevel")) {
        myObj1EasyLevel.timer = gTimer
        let myObj1EasyLevel_serialized1 = JSON.stringify(myObj1EasyLevel);
        localStorage.setItem("myObj1EasyLevel", myObj1EasyLevel_serialized1)
        console.log("best score for easy mode", localStorage.getItem("myObj1EasyLevel"))
    } else {
        let myObj1EasyLevel_deserialized1 = JSON.parse(localStorage.getItem("myObj1EasyLevel"))
        if (gTimer < parseInt(myObj1EasyLevel_deserialized1.timer)) {
            myObj1EasyLevel_deserialized1.timer = gTimer
            let myObj1EasyLevel_serialized2 = JSON.stringify(myObj1EasyLevel_deserialized1);
            localStorage.setItem("myObj1EasyLevel", myObj1EasyLevel_serialized2)
            console.log("you just did the best score for easy mode", localStorage.getItem("myObj1EasyLevel"))
        } else console.log("you didnt do the best score. the best score for easy mode is", localStorage.getItem("myObj1EasyLevel"))
    }
}


function mediumModeWin() {
    var elVictory = document.querySelector('.startBtn')
    elVictory.innerText = WINEMOJI
    gGame.isOn = false
    clearInterval(gTimerId)
    if (!localStorage.getItem("myObj1MediumLevel")) {
        myObj1MediumLevel.timer = gTimer
        let myObj1MediumLevel_serialized1 = JSON.stringify(myObj1MediumLevel);
        localStorage.setItem("myObj1MediumLevel", myObj1MediumLevel_serialized1)
        console.log("best score for medium mode", localStorage.getItem("myObj1MediumLevel"))
    } else {
        let myObj1MediumLevel_deserialized1 = JSON.parse(localStorage.getItem("myObj1MediumLevel"))
        if (gTimer < parseInt(myObj1MediumLevel_deserialized1.timer)) {
            myObj1MediumLevel_deserialized1.timer = gTimer
            let myObj1MediumLevel_serialized2 = JSON.stringify(myObj1MediumLevel_deserialized1);
            localStorage.setItem("myObj1MediumLevel", myObj1MediumLevel_serialized2)
            console.log("you just did the best score for medium mode", localStorage.getItem("myObj1MediumLevel"))
        } else console.log("you didnt do the best score. the best score for medium mode is", localStorage.getItem("myObj1MediumLevel"))
    }
}


function expertModeWin() {
    var elVictory = document.querySelector('.startBtn')
    elVictory.innerText = WINEMOJI
    gGame.isOn = false
    clearInterval(gTimerId)
    if (!localStorage.getItem("myObj1ExpertLevel")) {
        myObj1ExpertLevel.timer = gTimer
        let myObj1ExpertLevel_serialized1 = JSON.stringify(myObj1ExpertLevel);
        localStorage.setItem("myObj1ExpertLevel", myObj1ExpertLevel_serialized1)
        console.log("best score for expert mode", localStorage.getItem("myObj1ExpertLevel"))
    } else {
        let myObj1ExpertLevel_deserialized1 = JSON.parse(localStorage.getItem("myObj1ExpertLevel"))
        if (gTimer < parseInt(myObj1ExpertLevel_deserialized1.timer)) {
            myObj1ExpertLevel_deserialized1.timer = gTimer
            let myObj1ExpertLevel_serialized2 = JSON.stringify(myObj1ExpertLevel_deserialized1);
            localStorage.setItem("myObj1ExpertLevel", myObj1ExpertLevel_serialized2)
            console.log("you just did the best score for expert mode", localStorage.getItem("myObj1ExpertLevel"))
        } else console.log("you didnt do the best score. the best score for expert mode is", localStorage.getItem("myObj1ExpertLevel"))
    }
}