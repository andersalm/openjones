import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Game } from './engine/game/Game';
import { IBuilding, IPlayerState, IVictoryCondition } from '@shared/types/contracts';
import { PlayerStatsHUD } from './components/PlayerStats/PlayerStatsHUD';
import { BuildingModal } from './components/Buildings/BuildingModal';
import { Button } from './components/ui/Button';
import { Container } from './components/ui/Container';
import { Panel } from './components/ui/Panel';
import './App.css';

type GamePhase = 'menu' | 'playing' | 'paused' | 'victory' | 'defeat';

interface AppState {
  phase: GamePhase;
  playerState: IPlayerState | null;
  currentWeek: number;
  timeRemaining: number;
  selectedBuilding: IBuilding | null;
  showBuildingModal: boolean;
  victoryConditions: IVictoryCondition[];
  errorMessage: string | null;
}

/**
 * Main App Component - Integrates all game systems
 *
 * This is the root component that:
 * - Manages the game lifecycle (menu -> playing -> victory/defeat)
 * - Integrates the Game engine with React UI
 * - Handles player input and building interactions
 * - Displays game state through UI components
 *
 * Note: GameController, RenderCoordinator, and InputHandler will be
 * integrated when Workers 1-3 complete their tasks. For now, we manage
 * the game directly.
 */
export function App() {
  // Game instance ref (persists across renders)
  const gameRef = useRef<Game | null>(null);
  const gameLoopRef = useRef<number | null>(null);

  // React state for UI updates
  const [appState, setAppState] = useState<AppState>({
    phase: 'menu',
    playerState: null,
    currentWeek: 1,
    timeRemaining: 600,
    selectedBuilding: null,
    showBuildingModal: false,
    victoryConditions: [],
    errorMessage: null,
  });

  /**
   * Initialize a new game
   */
  const initializeGame = useCallback((playerName: string) => {
    const game = Game.createWithConfig({
      players: [
        {
          id: 'player-1',
          name: playerName,
          color: '#3B82F6',
          isAI: false,
        },
      ],
      startingCash: 500,
      startingStats: {
        health: 100,
        happiness: 100,
        education: 0,
      },
      victoryConditions: {
        targetWealth: 10000,
        targetHealth: 100,
        targetHappiness: 100,
        targetCareer: 850,
        targetEducation: 100,
      },
    });

    gameRef.current = game;
    updateAppState(game);

    setAppState(prev => ({
      ...prev,
      phase: 'playing',
    }));
  }, []);

  /**
   * Update app state from game state
   */
  const updateAppState = useCallback((game: Game) => {
    if (!game || game.players.length === 0) return;

    const player = game.getCurrentPlayer();
    const playerState: IPlayerState = player.state;

    // Create victory conditions for UI
    const victoryConditions: IVictoryCondition[] = [
      {
        id: 'wealth',
        type: 'measure',
        description: 'Accumulate wealth',
        targetValue: game.victoryConditions.targetWealth,
        currentValue: player.state.cash,
        measureType: 'WEALTH',
      },
      {
        id: 'career',
        type: 'measure',
        description: 'Build your career',
        targetValue: game.victoryConditions.targetCareer,
        currentValue: player.state.career,
        measureType: 'CAREER',
      },
    ];

    setAppState(prev => ({
      ...prev,
      playerState,
      currentWeek: game.currentWeek,
      timeRemaining: game.timeUnitsRemaining,
      victoryConditions,
    }));

    // Check for victory/defeat
    const victoryResults = game.checkVictory();
    if (victoryResults[0]?.isVictory) {
      setAppState(prev => ({ ...prev, phase: 'victory' }));
    } else if (player.state.health <= 0 || (player.state.cash <= 0 && game.currentWeek > 10)) {
      setAppState(prev => ({ ...prev, phase: 'defeat' }));
    }
  }, []);

  /**
   * Start the game loop
   */
  useEffect(() => {
    if (appState.phase === 'playing' && gameRef.current) {
      // Update every second
      gameLoopRef.current = window.setInterval(() => {
        if (gameRef.current) {
          updateAppState(gameRef.current);
        }
      }, 1000);

      return () => {
        if (gameLoopRef.current) {
          clearInterval(gameLoopRef.current);
        }
      };
    }
  }, [appState.phase, updateAppState]);

  /**
   * Handle building selection
   */
  const handleBuildingSelect = useCallback((buildingId: string) => {
    if (!gameRef.current) return;

    const building = gameRef.current.map.getBuildingById(buildingId);
    if (building) {
      setAppState(prev => ({
        ...prev,
        selectedBuilding: building,
        showBuildingModal: true,
      }));
    }
  }, []);

  /**
   * Handle action selection from building modal
   */
  const handleActionSelect = useCallback((_actionId: string) => {
    if (!gameRef.current || !appState.selectedBuilding) return;

    // For now, just close the modal
    // When action system is implemented, execute the action here
    setAppState(prev => ({
      ...prev,
      showBuildingModal: false,
      selectedBuilding: null,
      errorMessage: 'Action system integration coming soon!',
    }));

    // Clear error after 3 seconds
    setTimeout(() => {
      setAppState(prev => ({ ...prev, errorMessage: null }));
    }, 3000);
  }, [appState.selectedBuilding]);

  /**
   * Handle pause
   */
  const handlePause = useCallback(() => {
    setAppState(prev => ({ ...prev, phase: 'paused' }));
  }, []);

  /**
   * Handle resume
   */
  const handleResume = useCallback(() => {
    setAppState(prev => ({ ...prev, phase: 'playing' }));
  }, []);

  /**
   * Handle reset to main menu
   */
  const handleReset = useCallback(() => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }

    gameRef.current = null;

    setAppState({
      phase: 'menu',
      playerState: null,
      currentWeek: 1,
      timeRemaining: 600,
      selectedBuilding: null,
      showBuildingModal: false,
      victoryConditions: [],
      errorMessage: null,
    });
  }, []);

  /**
   * Render the app based on current phase
   */
  return (
    <div className="app">
      {/* Main Menu */}
      {appState.phase === 'menu' && (
        <MainMenu onNewGame={initializeGame} />
      )}

      {/* Playing/Paused */}
      {(appState.phase === 'playing' || appState.phase === 'paused') && (
        <div className="game-container">
          {/* Game Area */}
          <div className="game-area">
            {/* Placeholder for game canvas/map view */}
            <div className="game-canvas-placeholder">
              <div className="placeholder-content">
                <h2>Game Map View</h2>
                <p>Canvas rendering will be integrated when RenderCoordinator is complete</p>
                <div className="buildings-grid">
                  <h3>Available Buildings:</h3>
                  {gameRef.current?.map.getAllBuildings().slice(0, 6).map((building) => (
                    <Button
                      key={building.id}
                      onClick={() => handleBuildingSelect(building.id)}
                      variant="secondary"
                    >
                      {building.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* UI Overlay */}
          <div className="ui-overlay">
            {/* Player Stats HUD */}
            {appState.playerState && (
              <div className="hud-panel">
                <PlayerStatsHUD
                  playerState={appState.playerState}
                  currentWeek={appState.currentWeek}
                  timeRemaining={appState.timeRemaining}
                  victoryConditions={appState.victoryConditions}
                  showVictoryProgress={true}
                />
              </div>
            )}

            {/* Game Controls */}
            <div className="game-controls">
              {appState.phase === 'playing' ? (
                <Button onClick={handlePause} variant="secondary">
                  Pause
                </Button>
              ) : (
                <Button onClick={handleResume} variant="primary">
                  Resume
                </Button>
              )}
              <Button onClick={handleReset} variant="secondary">
                Main Menu
              </Button>
            </div>

            {/* Error Messages */}
            {appState.errorMessage && (
              <div className="error-message">
                {appState.errorMessage}
              </div>
            )}
          </div>

          {/* Building Modal */}
          {appState.showBuildingModal && appState.selectedBuilding && (
            <BuildingModal
              building={appState.selectedBuilding}
              isOpen={appState.showBuildingModal}
              onClose={() => setAppState(prev => ({ ...prev, showBuildingModal: false }))}
              onActionSelect={handleActionSelect}
            />
          )}
        </div>
      )}

      {/* Victory Screen */}
      {appState.phase === 'victory' && (
        <VictoryScreen
          playerName={gameRef.current?.getCurrentPlayer()?.name || 'Player'}
          week={appState.currentWeek}
          onMainMenu={handleReset}
        />
      )}

      {/* Defeat Screen */}
      {appState.phase === 'defeat' && (
        <DefeatScreen
          week={appState.currentWeek}
          onMainMenu={handleReset}
        />
      )}
    </div>
  );
}

/**
 * Main Menu Component
 */
function MainMenu({ onNewGame }: { onNewGame: (name: string) => void }) {
  const [playerName, setPlayerName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      onNewGame(playerName.trim());
    }
  };

  return (
    <Container className="main-menu">
      <Panel title="OpenJones" variant="default">
        <div className="menu-content">
          <h2>Welcome to OpenJones!</h2>
          <p className="menu-description">
            Build your career, manage your finances, and become successful!
          </p>

          <form onSubmit={handleSubmit} className="menu-form">
            <div className="form-group">
              <label htmlFor="player-name">Your Name:</label>
              <input
                id="player-name"
                type="text"
                placeholder="Enter your name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="name-input"
                autoFocus
                maxLength={20}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={!playerName.trim()}
              className="start-button"
            >
              Start Game
            </Button>
          </form>

          <div className="menu-info">
            <h3>Game Info</h3>
            <ul>
              <li>Goal: Accumulate $10,000 and build your career to 850 points</li>
              <li>Manage your health, happiness, education, and finances</li>
              <li>Visit buildings to work, study, and improve your life</li>
              <li>Pay rent weekly or face penalties</li>
            </ul>
          </div>
        </div>
      </Panel>
    </Container>
  );
}

/**
 * Victory Screen Component
 */
function VictoryScreen({
  playerName,
  week,
  onMainMenu
}: {
  playerName: string;
  week: number;
  onMainMenu: () => void
}) {
  return (
    <Container className="victory-screen">
      <Panel title="Victory!" variant="success">
        <div className="victory-content">
          <div className="victory-icon">🎉</div>
          <h2>Congratulations, {playerName}!</h2>
          <p className="victory-message">
            You've achieved your goals and become successful!
          </p>
          <div className="victory-stats">
            <p><strong>Weeks Played:</strong> {week}</p>
            <p>You've completed your journey from rags to riches!</p>
          </div>
          <Button onClick={onMainMenu} variant="primary">
            Play Again
          </Button>
        </div>
      </Panel>
    </Container>
  );
}

/**
 * Defeat Screen Component
 */
function DefeatScreen({
  week,
  onMainMenu
}: {
  week: number;
  onMainMenu: () => void
}) {
  return (
    <Container className="defeat-screen">
      <Panel title="Game Over" variant="warning">
        <div className="defeat-content">
          <div className="defeat-icon">😞</div>
          <h2>Better Luck Next Time!</h2>
          <p className="defeat-message">
            You ran out of resources and couldn't continue your journey.
          </p>
          <div className="defeat-stats">
            <p><strong>Weeks Survived:</strong> {week}</p>
            <p>Remember to manage your health, happiness, and finances carefully!</p>
          </div>
          <Button onClick={onMainMenu} variant="primary">
            Try Again
          </Button>
        </div>
      </Panel>
    </Container>
  );
}

export default App;
