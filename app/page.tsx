import TetrisGame from "@/components/tetris-game"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-gray-900 to-black">
      <h1 className="text-4xl md:text-5xl font-bold mb-8 text-white tracking-tight">
        <span className="text-red-500">T</span>
        <span className="text-blue-500">E</span>
        <span className="text-green-500">T</span>
        <span className="text-yellow-500">R</span>
        <span className="text-purple-500">I</span>
        <span className="text-cyan-500">S</span>
      </h1>
      <TetrisGame />
    </main>
  )
}

