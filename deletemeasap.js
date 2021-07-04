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

  c.removeEventListener("mousedown", mouseDown)
  setTimeout(() => {
    c.addEventListener("mousedown", mouseDown)
  }, 500)
}