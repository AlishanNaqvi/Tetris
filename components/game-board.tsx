"use client"

import { useEffect, useRef } from "react"

export default function GameBoard({ board, currentPiece, gameOver }) {
  const boardRef = useRef(null)
  const cellSize = 25
  const boardWidth = board[0].length * cellSize
  const boardHeight = board.length * cellSize

  useEffect(() => {
    const canvas = boardRef.current
    const ctx = canvas.getContext("2d")

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw the board
    for (let y = 0; y < board.length; y++) {
      for (let x = 0; x < board[y].length; x++) {
        const cell = board[y][x]

        if (cell) {
          // Convert Tailwind class to actual color value
          ctx.fillStyle = cell.color.startsWith("#") ? cell.color : "#000000"
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize)

          // Draw cell border
          ctx.strokeStyle = "rgba(0, 0, 0, 0.3)"
          ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize)

          // Draw highlight
          ctx.fillStyle = "rgba(255, 255, 255, 0.2)"
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, 2)
          ctx.fillRect(x * cellSize, y * cellSize, 2, cellSize)
        } else {
          // Draw empty cell
          ctx.fillStyle = "rgba(30, 30, 30, 0.8)"
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize)
          ctx.strokeStyle = "rgba(60, 60, 60, 0.5)"
          ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize)
        }
      }
    }

    // Draw current piece
    if (currentPiece && !gameOver) {
      for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
          if (currentPiece.shape[y][x]) {
            const boardX = currentPiece.position.x + x
            const boardY = currentPiece.position.y + y

            // Only draw if the piece is within the visible board
            if (boardY >= 0) {
              // Use the actual color value
              ctx.fillStyle = currentPiece.color
              ctx.fillRect(boardX * cellSize, boardY * cellSize, cellSize, cellSize)

              // Draw cell border
              ctx.strokeStyle = "rgba(0, 0, 0, 0.3)"
              ctx.strokeRect(boardX * cellSize, boardY * cellSize, cellSize, cellSize)

              // Draw highlight
              ctx.fillStyle = "rgba(255, 255, 255, 0.2)"
              ctx.fillRect(boardX * cellSize, boardY * cellSize, cellSize, 2)
              ctx.fillRect(boardX * cellSize, boardY * cellSize, 2, cellSize)
            }
          }
        }
      }

      // Draw ghost piece
      let ghostY = currentPiece.position.y

      // Find the lowest valid position
      const isValidPosition = (y) => {
        for (let pieceY = 0; pieceY < currentPiece.shape.length; pieceY++) {
          for (let pieceX = 0; pieceX < currentPiece.shape[pieceY].length; pieceX++) {
            if (currentPiece.shape[pieceY][pieceX]) {
              const boardX = currentPiece.position.x + pieceX
              const boardY = y + pieceY

              if (
                boardY >= board.length ||
                boardX < 0 ||
                boardX >= board[0].length ||
                (boardY >= 0 && board[boardY][boardX])
              ) {
                return false
              }
            }
          }
        }
        return true
      }

      while (isValidPosition(ghostY + 1)) {
        ghostY++
      }

      // Only draw ghost if it's different from the current position
      if (ghostY > currentPiece.position.y) {
        for (let y = 0; y < currentPiece.shape.length; y++) {
          for (let x = 0; x < currentPiece.shape[y].length; x++) {
            if (currentPiece.shape[y][x]) {
              const boardX = currentPiece.position.x + x
              const boardY = ghostY + y

              if (boardY >= 0) {
                ctx.fillStyle = "rgba(255, 255, 255, 0.2)"
                ctx.fillRect(boardX * cellSize, boardY * cellSize, cellSize, cellSize)
                ctx.strokeStyle = currentPiece.color
                ctx.strokeRect(boardX * cellSize, boardY * cellSize, cellSize, cellSize)
              }
            }
          }
        }
      }
    }

    if (gameOver) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
  }, [board, currentPiece, gameOver])

  return (
    <div className="relative">
      <canvas ref={boardRef} width={boardWidth} height={boardHeight} className="border border-gray-700 shadow-lg" />
    </div>
  )
}

