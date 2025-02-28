"use client"

import { useEffect, useRef } from "react"

export default function NextPiece({ piece }) {
  const canvasRef = useRef(null)
  const cellSize = 20

  useEffect(() => {
    if (!piece) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const pieceWidth = piece.shape[0].length * cellSize
    const pieceHeight = piece.shape.length * cellSize

    const centerX = (canvas.width - pieceWidth) / 2
    const centerY = (canvas.height - pieceHeight) / 2

    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          // Use the actual color value
          ctx.fillStyle = piece.color
          ctx.fillRect(centerX + x * cellSize, centerY + y * cellSize, cellSize, cellSize)

          ctx.strokeStyle = "rgba(0, 0, 0, 0.3)"
          ctx.strokeRect(centerX + x * cellSize, centerY + y * cellSize, cellSize, cellSize)

          ctx.fillStyle = "rgba(255, 255, 255, 0.2)"
          ctx.fillRect(centerX + x * cellSize, centerY + y * cellSize, cellSize, 2)
          ctx.fillRect(centerX + x * cellSize, centerY + y * cellSize, 2, cellSize)
        }
      }
    }
  }, [piece])

  return <canvas ref={canvasRef} width={100} height={100} className="bg-gray-900 border border-gray-700" />
}

