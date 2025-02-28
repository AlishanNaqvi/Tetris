"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { RotateCw, ArrowLeft, ArrowRight, ArrowDown, Play, Pause, RefreshCw, ChevronsDown } from "lucide-react"
import GameBoard from "./game-board"
import NextPiece from "./next-piece"
import { useToast } from "@/components/ui/use-toast"

// Tetromino shapes with colors
const TETROMINOES = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: "#06b6d4", // cyan-500
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: "#3b82f6", // blue-500
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: "#f97316", // orange-500
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: "#eab308", // yellow-500
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    color: "#22c55e", // green-500
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: "#a855f7", // purple-500
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    color: "#ef4444", // red-500
  },
}

// Board dimensions
const BOARD_WIDTH = 10
const BOARD_HEIGHT = 20

// Create an empty board
const createEmptyBoard = () => Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(0))

// Random tetromino generator
const randomTetromino = () => {
  const keys = Object.keys(TETROMINOES)
  const tetromino = keys[Math.floor(Math.random() * keys.length)]
  return {
    type: tetromino,
    ...TETROMINOES[tetromino],
    position: { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 },
  }
}

export default function TetrisGame() {
  const [board, setBoard] = useState(createEmptyBoard())
  const [currentPiece, setCurrentPiece] = useState(randomTetromino())
  const [nextPiece, setNextPiece] = useState(randomTetromino())
  const [gameOver, setGameOver] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [lines, setLines] = useState(0)
  const [dropTime, setDropTime] = useState(1000)
  const [gameStarted, setGameStarted] = useState(false)
  const { toast } = useToast()

  const gameInterval = useRef(null)

  // Check for collisions
  const checkCollision = useCallback(
    (piece, position) => {
      for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
          // Skip empty cells
          if (!piece.shape[y][x]) continue

          // Calculate the position on the board
          const boardX = position.x + x
          const boardY = position.y + y

          // Check boundaries
          if (boardX < 0 || boardX >= BOARD_WIDTH || boardY >= BOARD_HEIGHT) {
            return true
          }

          // Check if the position is already filled
          if (boardY >= 0 && board[boardY][boardX]) {
            return true
          }
        }
      }
      return false
    },
    [board],
  )

  // Rotate a piece
  const rotatePiece = useCallback(
    (piece) => {
      // Create a new rotated matrix
      const rotatedShape = piece.shape[0].map((_, index) => piece.shape.map((row) => row[index]).reverse())

      const newPiece = {
        ...piece,
        shape: rotatedShape,
      }

      // Check if the rotation is valid
      if (!checkCollision(newPiece, currentPiece.position)) {
        setCurrentPiece(newPiece)
      }
    },
    [currentPiece, checkCollision],
  )

  // Move piece horizontally
  const movePiece = useCallback(
    (direction) => {
      if (gameOver || isPaused || !gameStarted) return

      const newPosition = {
        ...currentPiece.position,
        x: currentPiece.position.x + direction,
      }

      if (!checkCollision(currentPiece, newPosition)) {
        setCurrentPiece({
          ...currentPiece,
          position: newPosition,
        })
      }
    },
    [currentPiece, checkCollision, gameOver, isPaused, gameStarted],
  )

  // Drop piece faster
  const dropPiece = useCallback(() => {
    if (gameOver || isPaused || !gameStarted) return

    const newPosition = {
      ...currentPiece.position,
      y: currentPiece.position.y + 1,
    }

    if (!checkCollision(currentPiece, newPosition)) {
      setCurrentPiece({
        ...currentPiece,
        position: newPosition,
      })
    } else {
      // If we can't move down, place the piece
      placePiece()
    }
  }, [currentPiece, checkCollision, gameOver, isPaused, gameStarted])

  // Place the current piece on the board
  const placePiece = useCallback(() => {
    const newBoard = [...board]
    let isGameOver = false

    // Add the piece to the board
    for (let y = 0; y < currentPiece.shape.length; y++) {
      for (let x = 0; x < currentPiece.shape[y].length; x++) {
        if (currentPiece.shape[y][x]) {
          const boardY = currentPiece.position.y + y
          const boardX = currentPiece.position.x + x

          if (boardY < 0) {
            isGameOver = true
            break
          }

          if (boardY >= 0 && boardY < BOARD_HEIGHT) {
            newBoard[boardY][boardX] = {
              filled: 1,
              color: currentPiece.color,
            }
          }
        }
      }
      if (isGameOver) break
    }

    if (isGameOver) {
      setGameOver(true)
      toast({
        title: "You Lose!",
        description: `Your score: ${score}`,
        duration: 5000,
      })
      return
    }

    // Check for completed lines
    let linesCleared = 0
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
      if (newBoard[y].every((cell) => cell !== 0)) {
        // Remove the line
        newBoard.splice(y, 1)
        // Add a new empty line at the top
        newBoard.unshift(Array(BOARD_WIDTH).fill(0))
        linesCleared += 1
        y++ // Check the same row again
      }
    }

    // Update score
    if (linesCleared > 0) {
      const linePoints = [0, 40, 100, 300, 1200] // Points for 0, 1, 2, 3, 4 lines
      const levelMultiplier = level
      let pointsGained = linePoints[linesCleared] * levelMultiplier

      // Special case for Tetris (4 lines cleared)
      if (linesCleared === 4) {
        pointsGained *= 2 // Double points for Tetris
      }

      setScore((prevScore) => prevScore + pointsGained)
      setLines((prevLines) => {
        const newLines = prevLines + linesCleared
        // Level up every 10 lines
        if (Math.floor(newLines / 10) > Math.floor(prevLines / 10)) {
          const newLevel = Math.floor(newLines / 10) + 1
          setLevel(newLevel)
          // Increase speed
          setDropTime(Math.max(100, 1000 - (newLevel - 1) * 100))

          toast({
            title: "Level Up!",
            description: `You've reached level ${newLevel}!`,
            duration: 2000,
          })
        }
        return newLines
      })

      // Show toast for line clears
      const messages = ["Single!", "Double!", "Triple!", "Tetris!"]
      if (linesCleared > 0 && linesCleared <= 4) {
        toast({
          title: messages[linesCleared - 1],
          description: `+${pointsGained} points`,
          duration: 1500,
        })
      }
    }

    setBoard(newBoard)
    const newPiece = nextPiece
    setCurrentPiece(newPiece)
    setNextPiece(randomTetromino())

    // Check if the new piece can be placed
    if (checkCollision(newPiece, newPiece.position)) {
      setGameOver(true)
      toast({
        title: "You Lose!",
        description: `Your score: ${score}`,
        duration: 5000,
      })
    }
  }, [board, currentPiece, nextPiece, score, level, toast, checkCollision])

  // Hard drop - move piece all the way down without placing it
  const hardDrop = useCallback(() => {
    if (gameOver || isPaused || !gameStarted) return

    let newY = currentPiece.position.y

    while (!checkCollision(currentPiece, { ...currentPiece.position, y: newY + 1 })) {
      newY++
    }

    setCurrentPiece({
      ...currentPiece,
      position: { ...currentPiece.position, y: newY },
    })
  }, [currentPiece, checkCollision, gameOver, isPaused, gameStarted])

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!gameStarted || gameOver || isPaused) return

      switch (e.key) {
        case "ArrowLeft":
          movePiece(-1)
          break
        case "ArrowRight":
          movePiece(1)
          break
        case "ArrowDown":
          dropPiece()
          break
        case "ArrowUp":
          rotatePiece(currentPiece)
          break
        case " ":
          hardDrop()
          break
        case "p":
          setIsPaused((prev) => !prev)
          break
        default:
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [movePiece, dropPiece, rotatePiece, hardDrop, currentPiece, gameStarted, gameOver, isPaused])

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver || isPaused) return

    const interval = setInterval(() => {
      dropPiece()
    }, dropTime)

    gameInterval.current = interval

    return () => {
      clearInterval(interval)
    }
  }, [dropPiece, dropTime, gameStarted, gameOver, isPaused])

  // Start a new game
  const startGame = () => {
    setBoard(createEmptyBoard())
    setCurrentPiece(randomTetromino())
    setNextPiece(randomTetromino())
    setGameOver(false)
    setIsPaused(false)
    setScore(0)
    setLevel(1)
    setLines(0)
    setDropTime(1000)
    setGameStarted(true)
  }

  // Pause/resume game
  const togglePause = () => {
    if (gameStarted && !gameOver) {
      setIsPaused((prev) => !prev)
    }
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 items-center">
      <div className="flex flex-col gap-4">
        <Card className="p-4 bg-gray-800 border-gray-700">
          <GameBoard board={board} currentPiece={currentPiece} gameOver={gameOver} />

          {gameOver && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center flex-col">
              <h2 className="text-3xl font-bold text-white mb-4">You Lose!</h2>
              <p className="text-xl text-white mb-6">Score: {score}</p>
              <Button onClick={startGame} className="bg-purple-600 hover:bg-purple-700">
                Play Again
              </Button>
            </div>
          )}
        </Card>

        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            className="bg-gray-800 border-gray-700 text-white"
            onClick={() => movePiece(-1)}
            disabled={!gameStarted || gameOver || isPaused}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            className="bg-gray-800 border-gray-700 text-white"
            onClick={dropPiece}
            disabled={!gameStarted || gameOver || isPaused}
          >
            <ArrowDown className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            className="bg-gray-800 border-gray-700 text-white"
            onClick={() => movePiece(1)}
            disabled={!gameStarted || gameOver || isPaused}
          >
            <ArrowRight className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            className="bg-gray-800 border-gray-700 text-white"
            onClick={() => rotatePiece(currentPiece)}
            disabled={!gameStarted || gameOver || isPaused}
          >
            <RotateCw className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            className="bg-gray-800 border-gray-700 text-white"
            onClick={hardDrop}
            disabled={!gameStarted || gameOver || isPaused}
          >
            <ChevronsDown className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            className="bg-gray-800 border-gray-700 text-white"
            onClick={togglePause}
            disabled={!gameStarted || gameOver}
          >
            {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Card className="p-4 bg-gray-800 border-gray-700 text-white">
          <h2 className="text-xl font-bold mb-4">Next Piece</h2>
          <NextPiece piece={nextPiece} />
        </Card>

        <Card className="p-4 bg-gray-800 border-gray-700 text-white">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Score</h3>
            <p className="text-2xl">{score}</p>
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-semibold">Level</h3>
            <p className="text-2xl">{level}</p>
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-semibold">Lines</h3>
            <p className="text-2xl">{lines}</p>
          </div>

          {!gameStarted ? (
            <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={startGame}>
              Start Game
            </Button>
          ) : (
            <Button className="w-full bg-red-600 hover:bg-red-700" onClick={startGame}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Restart
            </Button>
          )}
        </Card>

        <Card className="p-4 bg-gray-800 border-gray-700 text-white">
          <h3 className="text-lg font-semibold mb-2">Controls</h3>
          <ul className="space-y-1 text-sm">
            <li className="flex justify-between">
              <span>Move Left</span>
              <span className="font-mono bg-gray-700 px-2 rounded">←</span>
            </li>
            <li className="flex justify-between">
              <span>Move Right</span>
              <span className="font-mono bg-gray-700 px-2 rounded">→</span>
            </li>
            <li className="flex justify-between">
              <span>Move Down</span>
              <span className="font-mono bg-gray-700 px-2 rounded">↓</span>
            </li>
            <li className="flex justify-between">
              <span>Rotate</span>
              <span className="font-mono bg-gray-700 px-2 rounded">↑</span>
            </li>
            <li className="flex justify-between">
              <span>Hard Drop</span>
              <span className="font-mono bg-gray-700 px-2 rounded">Space</span>
            </li>
            <li className="flex justify-between">
              <span>Pause</span>
              <span className="font-mono bg-gray-700 px-2 rounded">P</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  )
}

