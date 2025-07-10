# Changelog

All notable changes to the Momentum App project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2025-07-10

### Fixed
- **Web Platform Compatibility**: Fixed React version mismatch that prevented the app from rendering on web
  - Updated `react-dom` from `^19.1.0` to `19.0.0` to match `react` version `19.0.0`
  - Resolved blank white screen issue when running `npm run web`
  - App now loads successfully on `http://localhost:8081` with full functionality

### Technical Details
- Fixed dependency incompatibility between React and React DOM packages
- Ensured consistent React ecosystem versions for web platform support
- Maintained mobile platform compatibility while fixing web rendering

## [1.0.0] - Initial Release

### Added
- **Core Features**
  - Task management with categories (work, personal, health, learning, social, creative, maintenance)
  - XP and leveling system for gamification
  - Streak tracking for habit building
  - Daily progress monitoring
  - Task scheduling with time slots
  - Priority levels (low, medium, high, urgent)

- **User Interface**
  - Home screen with today's tasks and progress
  - Statistics screen with progress analytics
  - Settings screen for user preferences
  - Task creation and detail modals
  - Bottom tab navigation

- **Technical Implementation**
  - React Native with Expo framework
  - TypeScript for type safety
  - AsyncStorage for local data persistence
  - React Navigation for screen management
  - Context API for state management

- **Platform Support**
  - iOS mobile platform
  - Android mobile platform
  - Web platform (via React Native Web)