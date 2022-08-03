const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")

canvas.width = window.innerHeight
canvas.height = window.innerHeight

const tileSize = canvas.height * 0.1
let playerSize = tileSize / 4

const scrollSpeed = canvas.height * tileSize / canvas.height * 0.003

const map = []

const numberOfTiles = canvas.height/(tileSize*Math.sin(Math.PI/6)) + 4

let currentTileIndex = 0

for (let i = 0; i < numberOfTiles; i++) {
    map.push(Math.round(Math.random()))
}

let lastPos = map.reduce((accumulator, currentValue) => {return currentValue ? accumulator+1 : accumulator-1}, 0)

let playerPos = map[0] ? 1 : -1
let playerDirection = map[1] ? 1 : -1

let x = canvas.width / 2
let y = canvas.height - tileSize*Math.sin(Math.PI/6)*(numberOfTiles/4)

let playerX = x + tileSize*Math.cos(Math.PI/6)*playerPos
let playerY = - playerSize/2 - tileSize/2 + y

let animationStartTime 
let prevAnimationTimeStamp

let prevGameTimeStamp

let gameOver = false
let startGame = false


const backgroundGradient = ctx.createLinearGradient(0, canvas.height, canvas.width, 0)
backgroundGradient.addColorStop(0, "blue")
backgroundGradient.addColorStop(1, "white")


function mapToValue(value, minInput, maxInput, minOutput, maxOutput) {
    return (maxOutput - minOutput)*(value - minInput) / (maxInput - minInput) + minOutput
}


function drawDiamond(x, y, angle, color, size) {
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
    drawDiamond(x, y, Math.PI/6, color, size)
    drawDiamond(x, y, Math.PI/6, "rgba(255, 255, 255, 0.3)", size)
    drawDiamond(x, y, 5*Math.PI/6, color, size)
    drawDiamond(x, y, 5*Math.PI/6, "rgba(0, 0, 0, 0.4)", size)
    drawDiamond(x, y, 3*Math.PI/2, color, size)
}


function drawBackground() {
    ctx.fillStyle = backgroundGradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)
}


function drawTiles(first, last, lastPos) {
    let tempPos = lastPos
    for (let i = last-1; i >= first; i--) {

        drawCube(x + tileSize*Math.cos(Math.PI/6)*tempPos, y - tileSize*(Math.sin(Math.PI/6))*i, tileSize, "green")

        if (map[i]) {
            tempPos--
        }
        else {
            tempPos++
        }

    }
}


function drawPlayer() {
    drawCube(playerX, playerY, playerSize, "orange")
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
}


drawBackground()
drawTiles(0, map.length, lastPos)
drawPlayer()

window.addEventListener("keypress", () => {
    if (!startGame) {
        startGame = true
        requestAnimationFrame(gameLoop)
    }
    else if (!gameOver) {
        playerDirection *= -1
    }
})


function gameLoop(timestamp) {

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

    drawBackground()
    drawTiles(0, map.length, lastPos)
    drawPlayer()
    
    if (gameOver) {
        requestAnimationFrame(gameOverAnimation)
    }
    else {
        prevGameTimeStamp = timestamp
        requestAnimationFrame(gameLoop)
    }
}
