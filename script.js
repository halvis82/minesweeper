// Halvor, Created: 14.6.21-17.6.21, Minesweeper - NO INTERNET PROJECT (x & y flipped for some reason)

/*
Changes:
- highlight tiles with to many flagged neighbors (only for first neighbors)
- low resolution when few tiles (multiply some variables by x when tiles lower than y)
- change h1 font size
- structure and clean up code, change variable/function names
- prevent drawing bombs on flags upon completion (& for use in console)
- different colors for different numbers (https://www.reddit.com/r/Piracy/comments/nzlsw8/why_so_many_buttons/?utm_source=share&utm_medium=ios_app&utm_name=iossmf)
*/

// Classes
class Tile {
  constructor() {
    this.flagged = false
    this.opened = false
    this.checked = false
    this.hasBomb = false
    this.neighborBombs = 0
  }
  
  toggleFlag(x, y) {
    this.flagged = !this.flagged

    if (this.flagged) {
      ctx.drawImage(flagImg, borderSize / 2 + y * tileSize + y * borderSize, borderSize / 2 + x * tileSize + x * borderSize)
      flags++
    } else {
      ctx.beginPath()
      ctx.fillRect(borderSize / 2 + y * tileSize + y * borderSize, borderSize / 2 + x * tileSize + x * borderSize, tileSize, tileSize)
      ctx.closePath()
      flags--
    }

    document.getElementById("flagAmount").innerText = ` ${flags}`
    document.getElementById("flagAmount").style.color = (flags > bombs) ? "red" : "black"
  }

  open() {
    if (!this.hasBomb) {
      this.opened = true
      unopenedTiles--
    }
  }
}

// Elements (settings)
const tileSettings = {
  label: document.getElementById("tilesAmountText"),
  amount: document.getElementById("tilesAmountRange")
}
const bombSettings = {
  label: document.getElementById("bombAmountText"),
  amount: document.getElementById("bombAmountRange")
}

// Variables
let tiles = 20
let bombs = 50 //Must be less than tiles^2
let tileColor = "#0000FF"
let game = []
let gameOver = false
let bombsUpdatedManually = false
let actuallyStarted = false
let unopenedTiles = Math.pow(tiles, 2)
let flags = 0
let timer = {id: "", time: 0, running: false}
const flagImg = new Image()
flagImg.src = "./images/flag.png"
const bombImg = new Image()
bombImg.src = "./images/bomb.png"

// Canvas setup
const tileSize = 16
const borderSize = 2
let canvasSize = tiles * (tileSize + borderSize)
const c = document.getElementsByTagName("canvas")[0]
c.width = canvasSize
c.height = canvasSize
const ctx = c.getContext("2d")
ctx.strokeStyle = "#FFFFFF"
ctx.fillStyle = "#000000"
ctx.font = `bolder ${tiles * 2}px Arial`
ctx.textBaseline = "middle"
ctx.textAlign = "center"

// Setup game (set variables and create random game)
setupGame()

// Event listeners
c.addEventListener("mousedown", mouseDown)
function mouseDown(e) {
  if (gameOver) { //Restart
    setupGame()
    return
  }

  const canvasElementSize = parseInt(window.getComputedStyle(c).width, 10)
  const x = Math.floor(((e.layerY - (borderSize / 2)) / canvasElementSize) * tiles)
  const y = Math.floor(((e.layerX - (borderSize / 2)) / canvasElementSize) * tiles)

  // Cancel if clicked slightly off screen
  if (x < 0 || x >= tiles || y < 0 || y >= tiles) {
    return
  }

  // Setup game & guarantee first isn't a bomb
  if (!actuallyStarted) {
    setupGame([x, y])
    actuallyStarted = true
  }

  // console.log(x, y, game[x][y])   //Sometimes throws errors cant read property idk
  if (e.button === 0) { //Left click
    if (!game[x][y].flagged && !game[x][y].opened) {
      showTile(x, y)

      if (!gameOver) {
        showNeighbors(x, y)
      }
    }
  }
  else if (e.button === 2) { //Right click
    if (!game[x][y].opened) {
      game[x][y].toggleFlag(x, y)
    }
  }
}

// Update labels & max bombs relative to slider
tileSettings.amount.addEventListener("input", () => {
  tileSettings.label.innerText = `Tiles [${tileSettings.amount.value}]:`
  bombSettings.amount.max = Math.pow(+tileSettings.amount.value, 2) - 5

  if (!bombsUpdatedManually) {
    bombSettings.amount.value = Math.floor(+Math.pow(tileSettings.amount.value, 2) / 7)
    bombSettings.label.innerText = `Bombs [${bombSettings.amount.value}]:`
  }
})
bombSettings.amount.addEventListener("input", () => {
  bombSettings.label.innerText = `Bombs [${bombSettings.amount.value}]:`

  bombsUpdatedManually = true
})

// Update game on slider change
const settingsList = [tileSettings.amount, bombSettings.amount]
settingsList.forEach(el => el.addEventListener("change", () => {
  tiles = +tileSettings.amount.value
  bombs = +bombSettings.amount.value
  setupGame()
}))

// Functions
function setupGame(exceptionPoint = []) {
  // Reset timer
  clearInterval(timer.id)
  timer.running = false
  timer.time = 0
  document.getElementById("timer").innerText = " 0"

  // Update variables
  game = []
  gameOver = false
  unopenedTiles = Math.pow(tiles, 2)
  flags = 0
  canvasSize = tiles * (tileSize + borderSize)
  c.width = canvasSize
  c.height = canvasSize
  ctx.fillStyle = "#000000"
  ctx.font = `bolder ${tiles * 2}px Arial`  
  ctx.textBaseline = "middle"
  ctx.textAlign = "center"
  if (document.getElementById("info").children.length > 2) {
    document.getElementById("info").children[2].remove()
  }

  // Draw game backgrond (blck borer)
  ctx.beginPath()
  ctx.fillRect(0, 0, canvasSize, canvasSize)
  ctx.closePath()
  ctx.fillStyle = tileColor

  // Draw game tiles
  let x = borderSize / 2
  let y = borderSize / 2
  for (let i = 0; i < tiles; i++) {
    for (let j = 0; j < tiles; j++) {
      ctx.beginPath()
      ctx.fillRect(x, y, tileSize, tileSize)
      ctx.closePath()

      x += tileSize + borderSize
    }
    x = borderSize / 2
    y += tileSize + borderSize
  }

  if (!exceptionPoint.length) { //Only draw
    actuallyStarted = false
    return
  }

  // Start timer if not already
  timer.id = setInterval(() => {
    if (gameOver) {
      clearInterval(timer.id)
      return
    }
    timer.time++
    document.getElementById("timer").innerText = ` ${timer.time}`
  }, 1000) //One second

  // Create game (data structure)
  for (let x = 0; x < tiles; x++) {
    game.push([])
    for (let y = 0; y < tiles; y++) {
      game[x].push(new Tile())
    }
  }

  // Set random bombs
  let coords = [] // Put all game coords in a list
  for (let x = 0; x < tiles; x++) {
    for (let y = 0; y < tiles; y++) {
      coords.push([x, y])
    }
  }
  for (let point = 0; point < coords.length; point++) { // Remove excepted coords
    if (exceptionPoint[0] === coords[point][0] && exceptionPoint[1] === coords[point][1]) {
      coords.splice(point, 1)
    }
  }
  for (let i = 0; i < bombs; i++) { // Set bombs at random & remove coordinate to avoid repetition
    const randomCoordinate = Math.floor(Math.random() * coords.length)
    game[coords[randomCoordinate][0]][coords[randomCoordinate][1]].hasBomb = true
    coords.splice(randomCoordinate, 1)
  }

  // Find how many neighbor bombs
  const neighborCoords = [-1, 0, 1]
  for (let x = 0; x < tiles; x++) {
    for (let y = 0; y < tiles; y++) {
      for (let x2 of neighborCoords) {
        for (let y2 of neighborCoords) {
          if (x + x2 >= 0 && y + y2 >= 0 && x + x2 < tiles && y + y2 < tiles) {
            if (x2 === 0 && y2 === 0) {
              continue
            }
            if (game[x + x2][y + y2].hasBomb) {
              game[x][y].neighborBombs++
            }
          }
        }
      }
    }
  }
}

function showTile(x, y) {
  if (!game[x][y].hasBomb) {
    game[x][y].open()

    ctx.clearRect(borderSize / 2 + y * tileSize + y * borderSize, borderSize / 2 + x * tileSize + x * borderSize, tileSize, tileSize)

    // Check if win
    if (unopenedTiles === bombs) {
      gameOver = true
          
      drawAllBombs("IDIDNOTCHEAT")
    
      ctx.fillStyle = "#00FF00"
      ctx.fillText("You won", canvasSize / 2, canvasSize / 2)
      if (tiles > 14) {
        ctx.strokeText("You won", canvasSize / 2, canvasSize / 2)
      }
      ctx.fillStyle = tileColor

      c.removeEventListener("mousedown", mouseDown)
      setTimeout(() => {
        c.addEventListener("mousedown", mouseDown)
      }, 500)
    }

    return
  }
  

  gameOver = true
  
  drawAllBombs("IDIDNOTCHEAT")

  ctx.drawImage(bombImg, borderSize / 2 + y * tileSize + y * borderSize, borderSize / 2 + x * tileSize + x * borderSize)
  ctx.fillStyle = "#FF0000"
  ctx.fillText("GAME OVER", canvasSize / 2, canvasSize / 2)
  if (tiles > 14) {
    ctx.strokeText("GAME OVER", canvasSize / 2, canvasSize / 2)
  }
  ctx.fillStyle = tileColor

  c.removeEventListener("mousedown", mouseDown)
  setTimeout(() => {
    c.addEventListener("mousedown", mouseDown)
  }, 500)
}

function showNeighbors(x, y) {
  const neighborCoords = [-1, 0, 1]
  game[x][y].checked = true

  if (game[x][y].neighborBombs > 0) {
    showNumber(x, y)
    return
  }

  for (let x2 of neighborCoords) {
    for (let y2 of neighborCoords) {
      const xNew = x + x2
      const yNew = y + y2

      if (xNew >= 0 && yNew >= 0 && xNew < tiles && yNew < tiles) {
        if (x2 === 0 && y2 === 0) {
          continue
        }
  
        if (game[xNew][yNew].checked || game[xNew][yNew].hasBomb) {
          continue
        }
        game[xNew][yNew].checked = true

        if (!game[xNew][yNew].neighborBombs) { // Doesn't have bomb neighbors
          showTile(xNew, yNew)
          showNeighbors(xNew, yNew)
        }
        else { // Has bomb neighbors
          showTile(xNew, yNew)
          showNumber(xNew, yNew)
        }
      }
    }
  }
}

function showNumber(x, y) {
  ctx.fillStyle = "#000000"
  ctx.font = `bolder 14px Arial`
  ctx.fillText(game[x][y].neighborBombs, borderSize / 2 + y * tileSize + y * borderSize + tileSize / 2, borderSize / 2 + x * tileSize + x * borderSize + tileSize / 2)
  ctx.fillStyle = tileColor
  ctx.font = `bolder ${tiles * 2}px Arial`
}

function drawAllBombs(password) {
  if (!game.length) {
    console.error("NO")
    return
  }

  for (let x = 0; x < tiles; x++) {
    for (let y = 0; y < tiles; y++) {
      if (game[x][y].hasBomb) {
        // ctx.beginPath()
        // ctx.fillRect(borderSize / 2 + y * tileSize + y * borderSize, borderSize / 2 + x * tileSize + x * borderSize, tileSize, tileSize)
        // ctx.closePath()
        ctx.drawImage(bombImg, borderSize / 2 + y * tileSize + y * borderSize, borderSize / 2 + x * tileSize + x * borderSize)
      }
    }
  }

  if (document.getElementById("info").children.length === 2 && password !== "IDIDNOTCHEAT") {
    document.getElementById("info").innerHTML += `
    <div style="color: red; margin-left: 1em; font-weight: 700;">CHEATED</div>
    `
  }
}