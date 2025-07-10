# Momentum App

A productivity and task management app built with React Native and Expo, featuring gamification elements to help you build momentum in your daily tasks.

## Features

- **Task Management**: Create, organize, and track tasks across multiple categories
- **Gamification**: Earn XP and level up by completing tasks
- **Streak Tracking**: Build habits with streak counters for different categories
- **Progress Analytics**: Monitor your daily and weekly progress
- **Cross-Platform**: Runs on iOS, Android, and Web

## Categories

- Work
- Personal
- Health
- Learning
- Social
- Creative
- Maintenance

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/momentum-app.git
cd momentum-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
# For mobile development
npm start

# For web development
npm run web

# For specific platforms
npm run ios
npm run android
```

## Usage

### Web Platform
After running `npm run web`, open your browser to `http://localhost:8081` to access the web version.

### Mobile Platform
Use the Expo Go app to scan the QR code displayed in your terminal after running `npm start`.

## Project Structure

```
momentum-app/
├── src/
│   ├── components/     # Reusable UI components
│   ├── screens/        # Screen components
│   ├── contexts/       # React Context providers
│   ├── services/       # Business logic and data services
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   ├── hooks/          # Custom React hooks
│   └── constants/      # App constants
├── assets/             # Images and static assets
├── App.tsx            # Main app component
└── index.ts           # App entry point
```

## Technologies Used

- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and tools
- **TypeScript**: Type-safe JavaScript
- **React Navigation**: Navigation library
- **AsyncStorage**: Local data persistence
- **React Context**: State management

## Recent Updates

### v1.0.1 (2025-07-10)
- Fixed React version mismatch preventing web platform rendering
- Added loading and error screens for better user experience
- Improved web platform compatibility

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Expo](https://expo.dev/)
- Icons by [Expo Vector Icons](https://docs.expo.dev/guides/icons/)
- Inspired by productivity and habit-building methodologies