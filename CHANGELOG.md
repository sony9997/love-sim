# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [0.2.0] - 2026-03-23

### Added
- Complete Agent system with mood, memory, goals, and personality traits
- Character scheduling system for dynamic locations
- Relationship progression with personality compatibility
- Agent memory system with emotional valence tracking
- Conversation context management for AI dialogues
- Agent visualization dashboard for debugging
- Test mode for AI responses (via localStorage or URL parameter)

### Changed
- Extended `AgentState` to `ExtendedAgentState` with full agent capabilities
- AI service now uses character context (memories, history, mood, goals)
- Dialogue system supports dynamic AI responses and dialogue loops

### Fixed
- ISSUE-001: Fixed AI dialogue crash by properly initializing `agentStates` with `createAgentState()`
- ISSUE-002: Fixed location description mismatch in Su Qingqian's dialogue (removed hardcoded background)

## [0.1.0] - 2026-02-13

### Added
- Initial release with core game mechanics
- Main menu with new game/continue game
- Campus navigation and location system
- Character dialogue system with AI integration
- Save/Load functionality with localStorage
- Internationalization support (en/zh)