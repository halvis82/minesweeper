/*
 * Minesweeper
 * By: Halvor
 * Created: 14.6.21-13.07.2021
 * NO INTERNET PROJECT. x & y flipped for some reason. Tons of terrible code (performance sucks)
*/


// Tile class
// //////////////////////////////////////////-//////////////////////////////////////////
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
    // Don't allow if game not started
    if (unopenedTiles === Math.pow(tiles, 2)) {
      return
    }

    this.flagged = !this.flagged

    // Draw tile background first
    ctx.fillStyle = "#0000FF"
    ctx.fillRect(borderSize / 2 + this.y * tileSize + this.y * borderSize, borderSize / 2 + this.x * tileSize + this.x * borderSize, tileSize, tileSize)

    if (this.flagged) {
      // Draw flag
      ctx.drawImage(flagImg, borderSize / 2 + this.y * tileSize + this.y * borderSize, borderSize / 2 + this.x * tileSize + this.x * borderSize, tileSize, tileSize)
      flags--
    }
    else {
      flags++
    }
    
    this.determineHighlight()

    // Update flag label
    document.getElementById("flagAmount").innerText = ` ${flags}`
    document.getElementById("flagAmount").style.color = (flags < 0) ? "red" : "black"
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

      // Add highlight (50% opacity red square)
      if (flaggedNeighborAmount > tileHere.neighborBombs && !tileHere.tooManyFlags) {
        ctx.globalAlpha = 0.5
        ctx.fillStyle = "#FF0000"

        ctx.fillRect(borderSize / 2 + (yHere) * tileSize + (yHere) * borderSize, borderSize / 2 + (xHere) * tileSize + (xHere) * borderSize, tileSize, tileSize)

        ctx.globalAlpha = 1

        tileHere.tooManyFlags = true
      }
      // Remove highlight
      else if (flaggedNeighborAmount <= tileHere.neighborBombs && tileHere.tooManyFlags) {
        ctx.fillStyle = "#FFFFFF"
        ctx.fillRect(borderSize / 2 + (yHere) * tileSize + (yHere) * borderSize, borderSize / 2 + (xHere) * tileSize + (xHere) * borderSize, tileSize, tileSize)
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

      // Clear tile
      ctx.fillStyle = "#FFFFFF"
      ctx.fillRect(borderSize / 2 + this.y * tileSize + this.y * borderSize, borderSize / 2 + this.x * tileSize + this.x * borderSize, tileSize, tileSize)

      // Check if win
      if (unopenedTiles === bombs) {
        gameOver = true

        // Show all bombs (not cheat)
        const timePassword = new Date()
        drawAllBombs(Math.pow(+timePassword.getSeconds(), 3))

        // Draw 'you won' on screen
        ctx.fillStyle = "#00FF00"
        ctx.font = `bolder ${tiles * 2 * canvasMultiplier}px Arial`
        ctx.fillText("You won", canvasSize / 2, canvasSize / 2)
        ctx.strokeText("You won", canvasSize / 2, canvasSize / 2)

        // Disable input for .5 seconds
        c.removeEventListener("mousedown", mouseDown)
        c.removeEventListener("mouseup", mouseUp)
        setTimeout(() => {
          c.addEventListener("mousedown", mouseDown)
          c.addEventListener("mouseup", mouseUp)
        }, 500)
      }
    }
    // If tile has bomb
    else {
      gameOver = true
      
      // Show all bombs (not cheat)
      const timePassword = new Date()
      drawAllBombs(Math.pow(+timePassword.getSeconds(), 3))
  
      // Draw 'game over' on screen
      ctx.fillStyle = "#FF0000"
      ctx.font = `bolder ${tiles * 2 * canvasMultiplier}px Arial`
      ctx.fillText("GAME OVER", canvasSize / 2, canvasSize / 2)
      ctx.strokeText("GAME OVER", canvasSize / 2, canvasSize / 2)
    
      // Disable input for .5 seconds
      c.removeEventListener("mousedown", mouseDown)
      c.removeEventListener("mouseup", mouseUp)
      setTimeout(() => {
        c.addEventListener("mousedown", mouseDown)
        c.addEventListener("mouseup", mouseUp)
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
  
    // Write number on empty tile representing amount of neighbor bombs
    ctx.font = `bolder ${14 * canvasMultiplier}px Arial`
    ctx.fillText(this.neighborBombs, borderSize / 2 + this.y * tileSize + this.y * borderSize + tileSize / 2, borderSize / 2 + this.x * tileSize + this.x * borderSize + tileSize / 2)
  
    if (run_determineHighlight) {
      this.determineHighlight()
    }
  }

  showNeighbors() {
    this.checked = true

    // Stop and show number here if has bomb neighbors
    if (this.neighborBombs > 0) {
      this.showNumber()
      return
    }

    for (let coords of this.neighbors) {
      const xNew = coords[0]
      const yNew = coords[1]
      const tileNew = game[xNew][yNew]

      // Skip if checked before or has bomb
      if (tileNew.checked || tileNew.hasBomb) {
        continue
      }

      game[xNew][yNew].checked = true

      // Run this again if still no bomb neighbors
      if (tileNew.neighborBombs === 0) {
        tileNew.showTile()
        tileNew.showNeighbors()
      }
      // Stop and show number if has bomb neighbors
      else {
        tileNew.showTile()
        tileNew.showNumber()
      }
    }
  }
}
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\-\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\


// Program setup
// //////////////////////////////////////////-//////////////////////////////////////////
// Settings elements (tiles & bombs)
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
const holdFlagTime = 300 // ms
let game = []
let gameOver = true
let bombsUpdatedManually = false
let actuallyStarted = false
let unopenedTiles = Math.pow(tiles, 2)
let flags = bombs
let timer = {id: "", time: 0, running: false}
let mouseTimeout
let cancelMouseUp = false

// Set tiles & bombs
if (localStorage.getItem("tiles") !== null) {
  tiles = +localStorage.getItem("tiles")
} else {
  tiles = 20
}
if (localStorage.getItem("bombs") !== null && localStorage.getItem("bombs") <= Math.pow(tiles, 2) - 5) {
  bombs = +localStorage.getItem("bombs")
} else {
  bombs = 50
}
tileSettings.amount.value = +tiles
tileSettings.label.innerText = `Tiles [${tileSettings.amount.value}]:`
bombSettings.amount.value = +bombs
bombSettings.label.innerText = `Bombs [${bombSettings.amount.value}]:`
bombSettings.amount.max = Math.pow(tiles, 2) - 5

// Canvas setup
let canvasMultiplier = 1 // For low resolution when few tiles
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
const flagImg = new Image()
flagImg.src = "./images/flag.png"
const bombImg = new Image()
bombImg.src = "./images/bomb.png"

// Setup game (set variables and create random game)
setupGame()
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\-\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\


// Event listeners
// //////////////////////////////////////////-//////////////////////////////////////////
c.addEventListener("mouseleave", () => {
  // Prevent start hold on canvas and leave, and still flag
  clearTimeout(mouseTimeout)
})

c.addEventListener("mouseenter", () => {
  // Prevent mouse down outside and up on canvas, and still open tile
  cancelMouseUp = true
})

c.addEventListener("mousedown", mouseDown)
function mouseDown(e) {
  var event = e || window.event; ///////////////////////////////////////
  event.preventDefault(); ///////////////////////////////////////
  event.stopPropagation(); ///////////////////////////////////////
  // Find game coordinates according to canvas element size
  const canvasElementSize = parseInt(window.getComputedStyle(c).width, 10)
  const x = Math.floor(((e.layerY - (borderSize / 2)) / canvasElementSize) * tiles)
  const y = Math.floor(((e.layerX - (borderSize / 2)) / canvasElementSize) * tiles)

  // Cancel if clicked slightly off screen
  if (x < 0 || x >= tiles || y < 0 || y >= tiles) {
    return
  }

  // Reset cancel mouse up
  cancelMouseUp = false

  // If not started
  if (gameOver) {
    // If actually not started or right click -> start 'fake' game
    if (actuallyStarted) {
      // If left or right click
      if (e.button === 0 || e.button === 2) {
        setupGame()
      }
    }
    // Left click
    else if (e.button === 0) {
      setupGame([x, y])
      actuallyStarted = true

      game[x][y].showTile()
      game[x][y].showNeighbors()
    }

    // Stop here & cancel mouse up
    cancelMouseUp = true
    return
  }

  // Right click (flag)
  if (e.button === 2 && actuallyStarted) {
    if (!game[x][y].opened) {
      game[x][y].toggleFlag()
    }
    cancelMouseUp = true
  }
  // Left click (check hold to flag)
  if (e.button === 0 && actuallyStarted) {
    mouseTimeout = setTimeout(() => {
      if (!game[x][y].opened) {
        game[x][y].toggleFlag()
      }
      cancelMouseUp = true
    }, holdFlagTime)
  }
}

c.addEventListener("mouseup", mouseUp)
function mouseUp(e) {
  var event = e || window.event; ///////////////////////////////////////
  event.preventDefault(); ///////////////////////////////////////
  event.stopPropagation(); ///////////////////////////////////////
  // Stop if cancel mouse up 
  if (cancelMouseUp) {
    cancelMouseUp = false
    return
  }
  // Stop timout from mousedown
  clearTimeout(mouseTimeout)

  // Left click (open tile)
  if (e.button === 0) {
    // Find game coordinates according to canvas element size
    const canvasElementSize = parseInt(window.getComputedStyle(c).width, 10)
    const x = Math.floor(((e.layerY - (borderSize / 2)) / canvasElementSize) * tiles)
    const y = Math.floor(((e.layerX - (borderSize / 2)) / canvasElementSize) * tiles)
  
    // Cancel if clicked slightly off screen
    if (x < 0 || x >= tiles || y < 0 || y >= tiles) {
      return
    }

    // Start game
    if (!actuallyStarted) {
      setupGame([x, y])
      actuallyStarted = true
  
      game[x][y].showTile()
      game[x][y].showNeighbors()
  
      return
    }

    // Open tile
    if (!game[x][y].flagged && !game[x][y].opened) {
      game[x][y].showTile()

      if (!gameOver) {
        game[x][y].showNeighbors()
      }
    }
  }
}

// Update labels & max bombs relative to slider
tileSettings.amount.addEventListener("input", tileInput)
function tileInput() {

  // Update bombs & label
  if (!bombsUpdatedManually) {
    bombSettings.amount.value = Math.floor(+Math.pow(tileSettings.amount.value, 2) / 7)
  }
  
  // Update labels & max bombs
  tileSettings.label.innerText = `Tiles [${tileSettings.amount.value}]:`
  bombSettings.amount.max = Math.pow(+tileSettings.amount.value, 2) - 5
  bombSettings.label.innerText = `Bombs [${bombSettings.amount.value}]:`
}
bombSettings.amount.addEventListener("input", () => {
  bombSettings.label.innerText = `Bombs [${bombSettings.amount.value}]:`

  // Prevent future auto bomb amount updates
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
tileSettings.label.addEventListener("click", () => {
  tileSettings.amount.value = 20
  bombsUpdatedManually = false
  tileInput()
  settingsAmountChange()
})
bombSettings.label.addEventListener("click", () => {  
  bombsUpdatedManually = false
  tileInput()
  settingsAmountChange()
})
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\-\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\


// Functions
// //////////////////////////////////////////-//////////////////////////////////////////
function setupGame(exceptionPoint = []) {
  // Reset timer & flags
  clearInterval(timer.id)
  timer.running = false
  timer.time = 0
  document.getElementById("timer").innerText = " 0"
  document.getElementById("flagAmount").innerText = bombs

  // Update variables (game & canvas)
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
  flags = bombs
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

  // Draw game background (black borders)
  ctx.fillStyle = "#000000"
  ctx.fillRect(0, 0, canvasSize, canvasSize)

  // Draw all game tiles
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

  // Only draw game & don't set up game structure
  if (!exceptionPoint.length) {
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
  // Set bombs at random & remove coordinate to avoid repetition
  for (let i = 0; i < bombs; i++) {
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
  // Cancel if game not started
  if (!game.length) {
    console.error("NO")
    return
  }

  // Remove all flags & draw all bombs
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

  // Write 'cheated' if incorrect password
  const timePassword = new Date()
  if (document.getElementById("info").children.length === 2 && password !== Math.pow(+timePassword.getSeconds(), 3)) {
    document.getElementById("info").innerHTML += `
    <div style="color: red; margin-left: 1em; font-weight: 700;">CHEATED</div>
    `
  }
}
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\-\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\