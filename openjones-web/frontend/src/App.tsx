import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameController } from './engine/GameController';
import { RenderCoordinator } from './rendering/RenderCoordinator';
import { InputHandler } from './input/InputHandler';
import { IBuilding, IPlayerState, IGame } from '@shared/types/contracts';
import { PlayerStatsHUD } from './components/PlayerStats/PlayerStatsHUD';
import { BuildingModal } from './components/Buildings/BuildingModal';
import { Button } from './components/ui/Button';
import { Container } from './components/ui/Container';
import { Panel } from './components/ui/Panel';
import './App.css';

type GamePhase = 'menu' | 'playing' | 'paused' | 'victory' | 'defeat';

// Local victory condition type for UI display
interface VictoryCondition {
  id: string;
  type: 'measure' | 'cash' | 'education' | 'career' | 'happiness';
  description: string;
  targetValue: number;
  currentValue: number;
}

interface AppState {
  phase: GamePhase;
  playerState: IPlayerState | null;
  currentWeek: number;
  timeRemaining: number;
  selectedBuilding: IBuilding | null;
  showBuildingModal: boolean;
  victoryConditions: VictoryCondition[];
  errorMessage: string | null;
}

/**
 * Main App Component - Full Integration with GameController, RenderCoordinator, InputHandler
 *
 * This is the root component that:
 * - Manages the game lifecycle (menu -> playing -> victory/defeat)
 * - Integrates GameController for game loop orchestration
 * - Integrates RenderCoordinator for canvas rendering
 * - Integrates InputHandler for player input
 * - Displays game state through UI components
 */
export function App() {
  // Controller refs (persist across renders)
  const gameControllerRef = useRef<GameController | null>(null);
  const renderCoordinatorRef = useRef<RenderCoordinator | null>(null);
  const inputHandlerRef = useRef<InputHandler | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

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
   * Stop all game systems
   */
  const stopGame = useCallback(() => {
    if (gameControllerRef.current) {
      gameControllerRef.current.stop();
    }
    if (renderCoordinatorRef.current) {
      renderCoordinatorRef.current.stop();
    }
  }, []);

  /**
   * Update app state from game state
   */
  const updateAppState = useCallback((game: IGame) => {
    if (!game || game.players.length === 0) return;

    const player = game.getCurrentPlayer();
    const playerState = player.state;

    // Create victory conditions for UI - ALL 5 goals must be met!
    const victoryConditions: VictoryCondition[] = [
      {
        id: 'wealth',
        type: 'cash',
        description: 'Wealth',
        targetValue: game.victoryConditions.targetWealth,
        currentValue: player.state.cash,
      },
      {
        id: 'health',
        type: 'measure',
        description: 'Health',
        targetValue: game.victoryConditions.targetHealth,
        currentValue: player.state.health,
      },
      {
        id: 'happiness',
        type: 'happiness',
        description: 'Happiness',
        targetValue: game.victoryConditions.targetHappiness,
        currentValue: player.state.happiness,
      },
      {
        id: 'career',
        type: 'career',
        description: 'Career',
        targetValue: game.victoryConditions.targetCareer,
        currentValue: player.state.career,
      },
      {
        id: 'education',
        type: 'education',
        description: 'Education',
        targetValue: game.victoryConditions.targetEducation,
        currentValue: player.state.education,
      },
    ];

    setAppState(prev => ({
      ...prev,
      playerState,
      currentWeek: game.currentWeek,
      timeRemaining: game.timeUnitsRemaining,
      victoryConditions,
    }));

    // Check for victory (Java has NO defeat conditions - game continues until victory)
    const victoryResults = game.checkVictory();
    if (victoryResults[0]?.isVictory) {
      setAppState(prev => ({ ...prev, phase: 'victory' }));
      stopGame();
    }
  }, [stopGame]);

  /**
   * Handle building selection
   */
  const handleBuildingSelect = useCallback((buildingId: string) => {
    if (!gameControllerRef.current) return;

    const game = gameControllerRef.current.getGame();
    const building = game.map.getBuildingById(buildingId);

    if (building) {
      // Get available actions for this building
      const player = game.getCurrentPlayer();
      const actions = building.getAvailableActions(player.state, game);

      // Attach actions to building for modal display
      const buildingWithActions = {
        ...building,
        actions,
      };

      setAppState(prev => ({
        ...prev,
        selectedBuilding: buildingWithActions as IBuilding,
        showBuildingModal: true,
      }));
    }
  }, []);

  /**
   * Initialize a new game with full integration
   */
  const initializeGame = useCallback((playerName: string) => {
    // Store player name and switch to playing phase
    // The actual initialization will happen in useEffect once canvas is rendered
    setAppState(prev => ({
      ...prev,
      phase: 'playing',
      errorMessage: null,
    }));

    // Defer initialization to next tick after React renders the canvas
    setTimeout(() => {
      // Create game configuration
      const gameConfig = {
        players: [
          {
            id: 'player-1',
            name: playerName,
            color: '#3B82F6',
            isAI: false,
          },
        ],
        startingCash: 200, // Match Java version
        startingStats: {
          health: 0,      // Java starts at 0, not 100!
          happiness: 0,   // Java starts at 0, not 100!
          education: 0,
        },
        victoryConditions: {
          targetWealth: 10000,
          targetHealth: 100,
          targetHappiness: 100,
          targetCareer: 850,
          targetEducation: 100,
        },
      };

      // Create GameController with initialized game
      const gameController = GameController.createWithGame(gameConfig);
      gameControllerRef.current = gameController;

      // Get canvas element
      const canvas = canvasRef.current;
      if (!canvas) {
        console.error('Canvas element not found');
        setAppState(prev => ({ ...prev, errorMessage: 'Failed to initialize canvas', phase: 'menu' }));
        return;
      }

      // Set canvas size - optimized for 5x5 grid
      // Java uses 155x96 tiles = 775x480 total for 5x5 grid
      // We'll use 640x480 (128px tiles) for good visibility and clean scaling
      canvas.width = 640;  // 5 tiles * 128px = 640px
      canvas.height = 480; // 5 tiles * 96px = 480px (matching Java aspect)

      // Create RenderCoordinator
      const renderCoordinator = new RenderCoordinator({
        canvas,
        game: gameController.getGame(),
        pixelScale: 2, // 64 * 2 = 128px tiles (closer to Java's 155px)
        showFPS: true,
      });
      renderCoordinatorRef.current = renderCoordinator;

      // Create InputHandler
      const inputHandler = new InputHandler({
        canvas,
        game: gameController.getGame(),
        playerId: 'player-1',
        tileSize: 128, // Match the rendering tile size
        onBuildingSelected: handleBuildingSelect,
        onActionSelected: (actionType) => {
          console.log('Action selected:', actionType);
        },
      });
      inputHandlerRef.current = inputHandler;

      // Wire observer pattern: GameController -> RenderCoordinator
      const unsubscribe = gameController.subscribe((game: IGame) => {
        // Update render coordinator with new game state
        renderCoordinator.onGameStateChange(game);

        // Update React UI state
        updateAppState(game);
      });
      unsubscribeRef.current = unsubscribe;

      // Start all systems
      gameController.start();
      renderCoordinator.start();
      inputHandler.initialize();

      // Initial state update
      updateAppState(gameController.getGame());
    }, 0);
  }, [updateAppState, handleBuildingSelect]);

  /**
   * Clean up on unmount
   */
  useEffect(() => {
    return () => {
      // Unsubscribe from game controller
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }

      // Stop and destroy all systems
      if (inputHandlerRef.current) {
        inputHandlerRef.current.destroy();
      }
      if (renderCoordinatorRef.current) {
        renderCoordinatorRef.current.destroy();
      }
      if (gameControllerRef.current) {
        gameControllerRef.current.stop();
      }
    };
  }, []);

  /**
   * Handle action selection from building modal
   */
  const handleActionSelect = useCallback(async (actionId: string) => {
    if (!gameControllerRef.current || !appState.selectedBuilding) return;

    // Get the action from the building's available actions
    const building = appState.selectedBuilding as any;
    const action = building.actions?.find((a: any) => a.id === actionId);

    if (!action) {
      console.error('Action not found:', actionId);
      setAppState(prev => ({
        ...prev,
        errorMessage: 'Action not found',
      }));
      return;
    }

    // Execute the action via GameController
    try {
      const result = await gameControllerRef.current.executeAction('player-1', action);

      if (result.success) {
        // Success - close modal and show success message
        setAppState(prev => ({
          ...prev,
          showBuildingModal: false,
          selectedBuilding: null,
          errorMessage: result.message,
        }));

        // Clear message after 3 seconds
        setTimeout(() => {
          setAppState(prev => ({ ...prev, errorMessage: null }));
        }, 3000);
      } else {
        // Failure - keep modal open and show error
        setAppState(prev => ({
          ...prev,
          errorMessage: result.message,
        }));

        // Clear error after 3 seconds
        setTimeout(() => {
          setAppState(prev => ({ ...prev, errorMessage: null }));
        }, 3000);
      }
    } catch (error) {
      console.error('Error executing action:', error);
      setAppState(prev => ({
        ...prev,
        errorMessage: `Error: ${error}`,
      }));
    }
  }, [appState.selectedBuilding]);

  /**
   * Handle pause
   */
  const handlePause = useCallback(() => {
    if (gameControllerRef.current) {
      gameControllerRef.current.stop();
    }
    if (renderCoordinatorRef.current) {
      renderCoordinatorRef.current.stop();
    }
    setAppState(prev => ({ ...prev, phase: 'paused' }));
  }, []);

  /**
   * Handle resume
   */
  const handleResume = useCallback(() => {
    if (gameControllerRef.current) {
      gameControllerRef.current.start();
    }
    if (renderCoordinatorRef.current) {
      renderCoordinatorRef.current.start();
    }
    setAppState(prev => ({ ...prev, phase: 'playing' }));
  }, []);

  /**
   * Handle reset to main menu
   */
  const handleReset = useCallback(() => {
    // Clean up existing game
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    if (inputHandlerRef.current) {
      inputHandlerRef.current.destroy();
      inputHandlerRef.current = null;
    }

    if (renderCoordinatorRef.current) {
      renderCoordinatorRef.current.destroy();
      renderCoordinatorRef.current = null;
    }

    if (gameControllerRef.current) {
      gameControllerRef.current.stop();
      gameControllerRef.current = null;
    }

    // Reset state
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
          {/* Game Canvas */}
          <div className="game-area">
            <canvas
              ref={canvasRef}
              id="gameCanvas"
              className="game-canvas"
              style={{
                border: '2px solid #333',
                display: 'block',
                margin: '0 auto',
                backgroundColor: '#000',
              }}
            />
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
          playerName={appState.playerState?.job?.title || 'Player'}
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
              <li>Click on the map to move and interact with buildings</li>
              <li>Use arrow keys or WASD for movement</li>
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
