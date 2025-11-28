export default function HowToPlayPage() {
  return (
    <main className="min-h-screen w-full px-4 py-6 sm:py-10 flex justify-center">
      <div className="nes-container with-title is-centered pixel-art max-w-2xl w-full bg-white">
        <p className="title pixel-font">HOW TO PLAY</p>
        <div className="space-y-4 text-gray-800">
          <p className="pixel-font">Welcome to Mindora Runner! Learn + Earn while you play.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="nes-container pixel-art bg-white">
              <p className="pixel-font font-bold mb-1">Controls</p>
              <ul className="list-disc pl-5 text-sm">
                <li>Desktop: Press SPACE to jump</li>
                <li>Mobile: Tap anywhere on the game to jump</li>
                <li>Pause: Use the Pause button (bottom-right)</li>
              </ul>
            </div>
            <div className="nes-container pixel-art bg-white">
              <p className="pixel-font font-bold mb-1">Goal</p>
              <ul className="list-disc pl-5 text-sm">
                <li>Collect coins and avoid obstacles</li>
                <li>Answer knowledge walls to earn bonus points</li>
                <li>Reach the end of the stage to complete it</li>
              </ul>
            </div>
          </div>

          <div className="nes-container pixel-art bg-white">
            <p className="pixel-font font-bold mb-1">Tips</p>
            <ul className="list-disc pl-5 text-sm">
              <li>Short taps give precise jumps</li>
              <li>Watch the background for parallax hints</li>
              <li>Complete stages to unlock rewards</li>
            </ul>
          </div>

          <div className="flex justify-center gap-2">
            <a href="/" className="nes-btn pixel-font">HOME</a>
            <a href="/" className="nes-btn is-primary pixel-font">PLAY</a>
          </div>
        </div>
      </div>
    </main>
  );
}
