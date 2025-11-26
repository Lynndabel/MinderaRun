# Mindora Runner - Frontend

A blockchain-powered educational runner game built with Next.js and Hedera.

## 🚀 Quick Start

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🎮 Game Features

- **Endless Runner**: Jump and collect coins
- **Educational Quizzes**: Answer questions to progress
- **Blockchain Integration**: Earn tokens and NFTs
- **Real-time Scoring**: Compete on leaderboards

## 🎯 How to Play

1. **Connect Wallet** - Click "Connect Wallet" to start
2. **Start Game** - Click "Start Game" button  
3. **Jump** - Press SPACE to jump over obstacles
4. **Collect Coins** - Gather golden coins for points
5. **Answer Questions** - Hit the purple wall to answer quiz questions
6. **Progress** - Complete stages to earn tokens and NFTs

## 🛠️ Development

The game uses:
- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **HTML5 Canvas** - Game rendering
- **Zustand** - State management
- **Hedera SDK** - Blockchain integration

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router
├── components/          # React components
│   ├── SimpleGameCanvas.tsx  # Main game component
│   ├── GameUI.tsx           # Game interface
│   ├── QuizModal.tsx        # Quiz system
│   ├── WalletConnection.tsx # Wallet integration
│   └── Leaderboard.tsx      # Leaderboard display
├── services/            # External services
│   └── hederaService.ts     # Hedera integration
└── store/               # State management
    └── gameStore.ts         # Game state
```

## 🎨 Customization

- **Game Speed**: Modify `gameSpeed` in `SimpleGameCanvas.tsx`
- **Coin Spawn Rate**: Adjust `Math.random() < 0.03` in game loop
- **Player Physics**: Change `playerVelocityY` and gravity values
- **UI Colors**: Update Tailwind classes in components

## 🔧 Troubleshooting

If you encounter issues:

1. **Module Resolution**: Ensure all dependencies are installed
2. **Canvas Issues**: Check browser compatibility
3. **Wallet Connection**: Verify Hedera network settings
4. **Build Errors**: Try `npm run build` to check for issues

## 🌐 Deployment

The app can be deployed to:
- **Vercel** (recommended)
- **Netlify**
- **AWS Amplify**
- **Any Node.js hosting**

Make sure to set environment variables for Hedera integration.

---

Built with ❤️ for the Hedera ecosystem