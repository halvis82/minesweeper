/* 
 * Minesweeper
 * By: Halvor
 * Created: 14.6.21-04.07.2021
 * NO INTERNET PROJECT. x & y flipped for some reason. Tons of terrible code
*/

/*
Changes:
- comment more code
- maybe! flip x & y back to correct idk
*/

// Classes
class Tile {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.flagged = false
    this.tooManyFlags = false
    this.opened = false
    this.checked = false
    this.hasBomb = false
    this.neighborBombs = 0
    this.neighbors = []

    // Put neighbor coordinates in a list
    const neighborCoords = [-1, 0, 1]
    for (let x2 of neighborCoords) {
      for (let y2 of neighborCoords) {
        const xHere = this.x + x2
        const yHere = this.y + y2

        const x0y0 = (xHere === this.x && yHere === this.y)
        if (xHere < 0 || yHere < 0 || xHere >= tiles || yHere >= tiles || x0y0) {
          continue
        }

        this.neighbors.push([xHere, yHere])
      }
    }
  }

  countNeighborBombs() {
    for (let coords of this.neighbors) {
      if (game[coords[0]][coords[1]].hasBomb) {
        this.neighborBombs++
      }
    }
  }
  
  toggleFlag() {
    if (unopenedTiles === Math.pow(tiles, 2)) { //Game not started
      return
    }

    this.flagged = !this.flagged

    // Draw background first
      ctx.fillStyle = "#0000FF"
      ctx.fillRect(borderSize / 2 + this.y * tileSize + this.y * borderSize, borderSize / 2 + this.x * tileSize + this.x * borderSize, tileSize, tileSize)

    if (this.flagged) {
      // Draw flag
      ctx.drawImage(flagImg, borderSize / 2 + this.y * tileSize + this.y * borderSize, borderSize / 2 + this.x * tileSize + this.x * borderSize, tileSize, tileSize)
      flags++
    }
    else {
      flags--
    }
    
    this.determineHighlight()

    // Update flag label
    document.getElementById("flagAmount").innerText = ` ${flags}`
    document.getElementById("flagAmount").style.color = (flags > bombs) ? "red" : "black"
  }

  determineHighlight() {
    for (let coords of this.neighbors) {
      const xHere = coords[0]
      const yHere = coords[1]
      const tileHere = game[xHere][yHere]

      // Skip if unopened tile or no bomb neighbors
      if (!tileHere.opened || tileHere.neighborBombs === 0) {
        continue
      }

      // Find flagged neighbor amount
      let flaggedNeighborAmount = 0
      for (let coords2 of tileHere.neighbors) {
        if (game[coords2[0]][coords2[1]].flagged) {
          flaggedNeighborAmount++
        }
      }

      // Add highlight
      if (flaggedNeighborAmount > tileHere.neighborBombs && !tileHere.tooManyFlags) {
        ctx.globalAlpha = 0.5
        ctx.fillStyle = "#FF0000"

        ctx.fillRect(borderSize / 2 + (yHere) * tileSize + (yHere) * borderSize, borderSize / 2 + (xHere) * tileSize + (xHere) * borderSize, tileSize, tileSize)

        ctx.globalAlpha = 1

        tileHere.tooManyFlags = true
      }
      // Remove highlight
      else if (flaggedNeighborAmount <= tileHere.neighborBombs && tileHere.tooManyFlags) {
        ctx.clearRect(borderSize / 2 + (yHere) * tileSize + (yHere) * borderSize, borderSize / 2 + (xHere) * tileSize + (xHere) * borderSize, tileSize, tileSize)
        tileHere.showNumber(false)

        tileHere.tooManyFlags = false
      }
    }
  }

  open() {
    if (!this.hasBomb) {
      this.opened = true
      this.flagged = false
      unopenedTiles--
    }
  }

  showTile() {
    if (!this.hasBomb) {
      this.open()

      ctx.clearRect(borderSize / 2 + this.y * tileSize + this.y * borderSize, borderSize / 2 + this.x * tileSize + this.x * borderSize, tileSize, tileSize)

      // Check if win
      if (unopenedTiles === bombs) {
        gameOver = true

        const timePassword = new Date()
        drawAllBombs(Math.pow(+timePassword.getSeconds(), 3))

        ctx.fillStyle = "#00FF00"
        ctx.font = `bolder ${tiles * 2 * canvasMultiplier}px Arial`
        ctx.fillText("You won", canvasSize / 2, canvasSize / 2)
        ctx.strokeText("You won", canvasSize / 2, canvasSize / 2)

        c.removeEventListener("mousedown", mouseDown)
        setTimeout(() => {
          c.addEventListener("mousedown", mouseDown)
        }, 500)
      }
    }
    // If tile has bomb
    else {
      gameOver = true
      
      const timePassword = new Date()
      drawAllBombs(Math.pow(+timePassword.getSeconds(), 3))
  
      ctx.drawImage(bombImg, borderSize / 2 + this.y * tileSize + this.y * borderSize, borderSize / 2 + this.x * tileSize + this.x * borderSize, tileSize, tileSize)
      ctx.fillStyle = "#FF0000"
      ctx.font = `bolder ${tiles * 2 * canvasMultiplier}px Arial`
      ctx.fillText("GAME OVER", canvasSize / 2, canvasSize / 2)
      ctx.strokeText("GAME OVER", canvasSize / 2, canvasSize / 2)
    
      c.removeEventListener("mousedown", mouseDown)
      setTimeout(() => {
        c.addEventListener("mousedown", mouseDown)
      }, 500)
    }
  }

  showNumber(run_determineHighlight = true) {
    // Set fillStyle according to the number
    switch (this.neighborBombs) {
      case 1:
        ctx.fillStyle = "#0000FF"
        break
      case 2:
        ctx.fillStyle = "#00FF00"
        break
      case 3:
        ctx.fillStyle = "#FF0000"
        break
      case 4:
        ctx.fillStyle = "#800080"
        break
      case 5:
        ctx.fillStyle = "#800000"
        break
      case 6:
        ctx.fillStyle = "#30D5C8"
        break
      case 7:
        ctx.fillStyle = "#000000"
        break
      case 8:
        ctx.fillStyle = "#808080"
        break

      default:
        ctx.fillStyle = "#FFFFFF"
        break
    }
  
    ctx.font = `bolder ${14 * canvasMultiplier}px Arial`
    ctx.fillText(this.neighborBombs, borderSize / 2 + this.y * tileSize + this.y * borderSize + tileSize / 2, borderSize / 2 + this.x * tileSize + this.x * borderSize + tileSize / 2)
  
    if (run_determineHighlight) {
      this.determineHighlight()
    }
  }

  showNeighbors() {
    this.checked = true

    if (this.neighborBombs > 0) {
      this.showNumber()
      return
    }

    for (let coords of this.neighbors) {
      const xNew = coords[0]
      const yNew = coords[1]
      const tileNew = game[xNew][yNew]

      if (tileNew.checked || tileNew.hasBomb) {
        continue
      }

      game[xNew][yNew].checked = true

      if (tileNew.neighborBombs === 0) {
        tileNew.showTile()
        tileNew.showNeighbors()
      }
      else {
        tileNew.showTile()
        tileNew.showNumber()
      }
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
let bombs = 50 // Must be less than tiles^2
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

// Set tiles & bombs
if (localStorage.getItem("tiles") !== null) {
  tiles = +localStorage.getItem("tiles")
} else {
  tiles = 20
}
if (localStorage.getItem("bombs") !== null || localStorage.getItem("bombs") > Math.pow(tiles, 2) - 5) {
  bombs = +localStorage.getItem("bombs")
} else {
  bombs = 50
}
tileSettings.amount.value = +tiles
tileSettings.label.innerText = `Tiles [${tileSettings.amount.value}]:`
bombSettings.amount.value = +bombs
bombSettings.label.innerText = `Bombs [${bombSettings.amount.value}]:`

// Canvas setup
let canvasMultiplier = 1 //For low resolution with few tiles
let tileSize = 16 * canvasMultiplier
let borderSize = 2 * canvasMultiplier
let canvasSize = tiles * (tileSize + borderSize) * canvasMultiplier
const c = document.getElementsByTagName("canvas")[0]
c.width = canvasSize
c.height = canvasSize
const ctx = c.getContext("2d")
ctx.strokeStyle = "#FFFFFF"
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

  if (e.button === 0) { //Left click
    if (!game[x][y].flagged && !game[x][y].opened) {
      game[x][y].showTile()

      if (!gameOver) {
        game[x][y].showNeighbors()
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
tileSettings.amount.addEventListener("input", tileInput)
function tileInput() {
  tileSettings.label.innerText = `Tiles [${tileSettings.amount.value}]:`
  bombSettings.amount.max = Math.pow(+tileSettings.amount.value, 2) - 5

  if (!bombsUpdatedManually) {
    bombSettings.amount.value = Math.floor(+Math.pow(tileSettings.amount.value, 2) / 7)
    bombSettings.label.innerText = `Bombs [${bombSettings.amount.value}]:`
  }
}
bombSettings.amount.addEventListener("input", () => {
  bombSettings.label.innerText = `Bombs [${bombSettings.amount.value}]:`

  bombsUpdatedManually = true
})

// Update game on slider change
const settingsList = [tileSettings, bombSettings]
settingsList.forEach(el => el.amount.addEventListener("change", settingsAmountChange))
function settingsAmountChange() {
  tiles = +tileSettings.amount.value
  bombs = +bombSettings.amount.value

  // Save to local storage
  localStorage.setItem("tiles", tiles)
  localStorage.setItem("bombs", bombs)

  setupGame()
}

// Click labels to reset values
settingsList.forEach(el => el.label.addEventListener("click", () => {
  tileSettings.amount.value = 20
  bombsUpdatedManually = false
  tileInput()
  settingsAmountChange()
}))

// Functions
function setupGame(exceptionPoint = []) {
  // Reset timer & flags
  clearInterval(timer.id)
  timer.running = false
  timer.time = 0
  document.getElementById("timer").innerText = " 0"
  document.getElementById("flagAmount").innerText = " 0"

  // Update variables
  if (tiles <= 8) {
    canvasMultiplier = 5
  } else if (tiles <= 14) {
    canvasMultiplier = 3
  } else if (tiles <= 20) {
    canvasMultiplier = 2
  } else {
    canvasMultiplier = 1
  }
  game = []
  gameOver = false
  unopenedTiles = Math.pow(tiles, 2)
  flags = 0
  tileSize = 16 * canvasMultiplier
  borderSize = 2 * canvasMultiplier
  canvasSize = tiles * (tileSize + borderSize)
  c.width = canvasSize
  c.height = canvasSize
  ctx.textBaseline = "middle"
  ctx.textAlign = "center"
  if (document.getElementById("info").children.length > 2) {
    document.getElementById("info").children[2].remove()
  }

  // Draw game background (black border)
  ctx.fillStyle = "#000000"
  ctx.fillRect(0, 0, canvasSize, canvasSize)

  // Draw game tiles
  let x = borderSize / 2
  let y = borderSize / 2
  ctx.fillStyle = tileColor
  for (let i = 0; i < tiles; i++) {
    for (let j = 0; j < tiles; j++) {
      ctx.fillRect(x, y, tileSize, tileSize)

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

  // Create game (data structure), & put all coords in list
  let coords = []
  for (let x = 0; x < tiles; x++) {
    game.push([])
    for (let y = 0; y < tiles; y++) {
      game[x].push(new Tile(x, y))
      coords.push([x, y])
    }
  }

  // Set random bombs
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

  // Count neighbor bomb amount per tile
  for (let x = 0; x < tiles; x++) {
    for (let y = 0; y < tiles; y++) {
      game[x][y].countNeighborBombs()
    }
  }
}

function drawAllBombs(password) {
  if (!game.length) {
    console.error("NO")
    return
  }

  for (let x = 0; x < tiles; x++) {
    for (let y = 0; y < tiles; y++) {
      if (game[x][y].flagged) {
        game[x][y].toggleFlag(x, y)
      }

      if (game[x][y].hasBomb) {
        ctx.drawImage(bombImg, borderSize / 2 + y * tileSize + y * borderSize, borderSize / 2 + x * tileSize + x * borderSize, tileSize, tileSize)
      }
    }
  }

  const timePassword = new Date()
  if (document.getElementById("info").children.length === 2 && password !== Math.pow(+timePassword.getSeconds(), 3)) {
    document.getElementById("info").innerHTML += `
    <div style="color: red; margin-left: 1em; font-weight: 700;">CHEATED</div>
    `
  }
}