const scoreElement = document.getElementById("score")

const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")

let enableGenerateNewMap = false
let enableStartGame = true
let gameOver = true

let score = 0

let gameSpeedFactor = 3

const heightTileSizeAspectRatio = 10
const numberOfTiles = canvas.height/(canvas.height/heightTileSizeAspectRatio*Math.sin(Math.PI/6)) + 4

let map, lastPos, playerPos, playerDirection, currentTileIndex

function generateNewMap() {
    currentTileIndex = 0
    map = []
    for (let i = 0; i < numberOfTiles; i++) {
        map.push(Math.round(Math.random()))
    }
    lastPos = map.reduce((accumulator, currentValue) => {return currentValue ? accumulator+1 : accumulator-1}, 0)
    playerPos = map[0] ? 1 : -1
    playerDirection = map[1] ? 1 : -1
}

generateNewMap()

const playerColor = "orange"

let animationStartTime, prevAnimationTimeStamp, gameStartTime, prevGameTimeStamp

let tileGradient, backgroundGradient, tileSize, playerSize, scrollSpeed, x, y, playerX, playerY

function resize() {

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    tileGradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    tileGradient.addColorStop(0, "#7CFC00")
    tileGradient.addColorStop(1, "green")

    backgroundGradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    backgroundGradient.addColorStop(0, "white")
    backgroundGradient.addColorStop(1, "blue")


    tileSize = canvas.height / heightTileSizeAspectRatio
    playerSize = tileSize / 4
    scrollSpeed = canvas.height * tileSize / canvas.height * 0.001 * gameSpeedFactor


    x = canvas.width / 2
    y = canvas.height - tileSize*Math.sin(Math.PI/6)*(numberOfTiles/3)

    playerX = x + tileSize*Math.cos(Math.PI/6)*playerPos
    playerY = y - playerSize/2 - tileSize/2

}

resize()


function drawDiamond(x, y, angle, size, color) {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + size * Math.cos(angle - Math.PI/3), y + size * Math.sin(angle - Math.PI/3))
    ctx.lineTo(x + size * Math.cos(angle), y + size * Math.sin(angle))
    ctx.lineTo(x + size * Math.cos(angle + Math.PI/3), y + size * Math.sin(angle + Math.PI/3))
    ctx.lineTo(x, y)
    ctx.stroke()
    ctx.fill()
    ctx.closePath()
}


function drawCube(x, y, size, color) {
    drawDiamond(x, y, Math.PI/6, size, color)
    drawDiamond(x, y, Math.PI/6, size, "rgba(255, 255, 255, 0.3)")
    drawDiamond(x, y, 5*Math.PI/6, size, color)
    drawDiamond(x, y, 5*Math.PI/6, size, "rgba(0, 0, 0, 0.4)")
    drawDiamond(x, y, 3*Math.PI/2, size, color)
}


function drawBackground() {
    ctx.fillStyle = backgroundGradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)
}


function drawTiles(first, last, lastPos) {
    let tempPos = lastPos
    for (let i = last-1; i >= first; i--) {

        drawCube(x + tileSize*Math.cos(Math.PI/6)*tempPos, y - tileSize*(Math.sin(Math.PI/6))*i, tileSize, tileGradient)

        if (map[i]) {
            tempPos--
        }
        else {
            tempPos++
        }

    }
}


function drawPlayer() {
    drawCube(playerX, playerY, playerSize, playerColor)
}


function drawFrame() {
    drawBackground()
    drawTiles(0, map.length, lastPos)
    drawPlayer()
}


function gameOverAnimation(timestamp) {

    if (animationStartTime == undefined) {
        animationStartTime = timestamp
        prevAnimationTimeStamp = timestamp
    }
    else {
        let elapsedTime = timestamp - prevAnimationTimeStamp
    
        playerX += scrollSpeed * elapsedTime * Math.tan(Math.PI/3) * playerDirection * 0.5
        playerY += scrollSpeed*(elapsedTime)*((timestamp - animationStartTime)/1000 - 0.1)*9.81

        playerSize *= 1-(timestamp - animationStartTime)/10000

        drawBackground()
        drawTiles(currentTileIndex, map.length, lastPos)
        drawPlayer()
        drawTiles(0, currentTileIndex, playerPos)
    
        prevAnimationTimeStamp = timestamp
    }

    if (playerY < canvas.height + playerSize) {
        requestAnimationFrame(gameOverAnimation)
    }
    else {
        animationStartTime = undefined
        enableGenerateNewMap = true
    }
}


window.addEventListener("keypress", () => {
    if (enableGenerateNewMap) {
        enableGenerateNewMap = false
        enableStartGame = true
        generateNewMap()
        resize()
        drawFrame()

    }
    else if (enableStartGame) {
        enableStartGame = false
        gameOver = false
        requestAnimationFrame(gameLoop)
    }
    else if (!gameOver) {
        playerDirection *= -1
    }
})


window.addEventListener("resize", () => {
    if (gameOver) {
        resize()
        drawFrame()
    }
})


function changeHighlightedBtn(event) {
    document.getElementsByClassName("highlightedBtn")[0].classList.remove("highlightedBtn")
    event.target.classList.add("highlightedBtn")
}

document.getElementById("easyBtn").onclick = (event) => {
    changeHighlightedBtn(event)
    gameSpeedFactor = 2.5
    scrollSpeed = canvas.height * tileSize / canvas.height * 0.001 * gameSpeedFactor
}
document.getElementById("mediumBtn").onclick = (event) => {
    changeHighlightedBtn(event)
    gameSpeedFactor = 3
    scrollSpeed = canvas.height * tileSize / canvas.height * 0.001 * gameSpeedFactor
}
document.getElementById("hardBtn").onclick = (event) => {
    changeHighlightedBtn(event)
    gameSpeedFactor = 3.5
    scrollSpeed = canvas.height * tileSize / canvas.height * 0.001 * gameSpeedFactor
}
document.getElementById("insaneBtn").onclick = (event) => {
    changeHighlightedBtn(event)
    gameSpeedFactor = 4
    scrollSpeed = canvas.height * tileSize / canvas.height * 0.001 * gameSpeedFactor
}


drawFrame()


function gameLoop(timestamp) {

    if (gameStartTime == undefined) {
        gameStartTime = timestamp
    }

    if (prevGameTimeStamp == undefined) {
        prevGameTimeStamp = timestamp
    }

    let elapsedTime = timestamp - prevGameTimeStamp

    y += scrollSpeed * elapsedTime

    let movement = scrollSpeed * elapsedTime * Math.tan(Math.PI/3) * playerDirection

    playerX += movement

    if (playerX < canvas.width*0.25 || playerX > canvas.width*0.75) {
        playerX -= movement
        x -= movement
    }
    
    // Calculate screen coords for the player and the tile it is currently standing on

    let playerLeftBottomCornerX = playerX - playerSize*Math.sin(Math.PI/3)
    let playerRightBottomCornerX = playerX + playerSize*Math.sin(Math.PI/3)
    let playerBottomSideCornersY = playerY + playerSize*Math.cos(Math.PI/3)

    let currentTileX = x + tileSize*Math.cos(Math.PI/6)*playerPos

    let currentTileBottomSideCornersY = y - tileSize*(Math.sin(Math.PI/6))*currentTileIndex - tileSize*Math.cos(Math.PI/3)

    let playerLeftBottomCornerCurrentTileOffsetX = playerLeftBottomCornerX - currentTileX
    let playerRightBottomCornerCurrentTileOffsetX = playerRightBottomCornerX - currentTileX

    let playerLeftBottomCornerLimitY = currentTileBottomSideCornersY - (tileSize - Math.abs(playerLeftBottomCornerCurrentTileOffsetX))*Math.sin(Math.PI/6)
    let playerRightBottomCornerLimitY = currentTileBottomSideCornersY - (tileSize - Math.abs(playerRightBottomCornerCurrentTileOffsetX))*Math.sin(Math.PI/6)


    // Check if the player falls out of the map
    if (playerBottomSideCornersY < playerLeftBottomCornerLimitY) {
        if (playerLeftBottomCornerCurrentTileOffsetX > 0) {
            if (map[currentTileIndex+1]) {
                playerPos++
            }
            else {
                gameOver = true
            }
            currentTileIndex++
        }
        else {
            if (!map[currentTileIndex+1]) {
                playerPos--
                currentTileIndex++
            }
        }
    }
    if (playerBottomSideCornersY < playerRightBottomCornerLimitY && !gameOver) {
        if (playerRightBottomCornerCurrentTileOffsetX < 0) {
            if (!map[currentTileIndex+1]) {
                playerPos--
            }
            else {
                gameOver = true
            }
            currentTileIndex++
        }
        else {
            if (map[currentTileIndex+1]) {
                playerPos++
                currentTileIndex++
            }
        }
    }

    // Remove the first element in map and add a new random at the end
    if (y > canvas.height + tileSize) {
        y -= tileSize*(Math.sin(Math.PI/6))
        map.shift()
        map.push(Math.round(Math.random()))
        if (map[map.length - 1]) {
            lastPos++
        }
        else {
            lastPos--
        }
        currentTileIndex--
    }

    score = Math.round((timestamp - gameStartTime)/100)
    scoreElement.innerText = score

    drawFrame()
    
    if (gameOver) {
        requestAnimationFrame(gameOverAnimation)
        prevGameTimeStamp = undefined
        gameStartTime = undefined
    }
    else {
        prevGameTimeStamp = timestamp
        requestAnimationFrame(gameLoop)
    }
}
