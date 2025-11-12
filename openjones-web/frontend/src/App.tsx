import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameController } from './engine/GameController';
import { RenderCoordinator } from './rendering/RenderCoordinator';
import { InputHandler } from './input/InputHandler';
import { IBuilding, IPlayerState, IGame, IAction } from '@shared/types/contracts';
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
  buildingActions: IAction[];
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

  // Game key to force React remount on reset
  const [gameKey, setGameKey] = useState(0);

  // React state for UI updates
  const [appState, setAppState] = useState<AppState>({
    phase: 'menu',
    playerState: null,
    currentWeek: 1,
    timeRemaining: 600,
    selectedBuilding: null,
    buildingActions: [],
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

    // Check for victory/defeat
    const victoryResults = game.checkVictory();
    if (victoryResults[0]?.isVictory) {
      setAppState(prev => ({ ...prev, phase: 'victory' }));
      stopGame();
    } else if (player.state.health < 0 || (player.state.cash < 0 && game.currentWeek > 1)) {
      // Health < 0 (not <= 0) since Java starts at 0
      // Cash < 0 after week 1 (give player a chance to earn money)
      setAppState(prev => ({ ...prev, phase: 'defeat' }));
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
      // Get available actions from the building
      const player = game.getCurrentPlayer();
      const actions = building.getAvailableActions(player.state, game);

      setAppState(prev => ({
        ...prev,
        selectedBuilding: building,
        buildingActions: actions,
        showBuildingModal: true,
      }));
    }
  }, []);

  /**
   * Initialize a new game with full integration
   */
  const initializeGame = useCallback((playerName: string) => {
    // Clean up any existing game systems first (safety check)
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

      // Set canvas size to match Java version: 5x5 grid
      // Java uses 155x96 tiles, we'll use 100x100 for simplicity
      const TILE_SIZE = 100;
      const GRID_SIZE = 5;
      canvas.width = TILE_SIZE * GRID_SIZE;  // 500px
      canvas.height = TILE_SIZE * GRID_SIZE; // 500px

      // Create RenderCoordinator
      const renderCoordinator = new RenderCoordinator({
        canvas,
        game: gameController.getGame(),
        pixelScale: 1,
        showFPS: false,
      });
      renderCoordinatorRef.current = renderCoordinator;

      // Create InputHandler
      const inputHandler = new InputHandler({
        canvas,
        gameController,
        playerId: 'player-1',
        tileSize: 100, // Match 5x5 grid
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
   * Handle closing building modal
   * Executes exit action to properly update player state before closing modal
   */
  const handleCloseModal = useCallback(() => {
    if (!gameControllerRef.current) return;

    // Find the exit action and execute it
    const exitAction = appState.buildingActions.find(a => a.type === 'EXIT_BUILDING');
    if (exitAction) {
      const game = gameControllerRef.current.getGame();
      const player = game.getCurrentPlayer();

      gameControllerRef.current.executeAction(player.id, exitAction).then(() => {
        // Close modal after exit action completes
        setAppState(prev => ({
          ...prev,
          showBuildingModal: false,
          selectedBuilding: null,
          buildingActions: [],
        }));
      });
    } else {
      // Fallback: just close modal if no exit action found
      setAppState(prev => ({
        ...prev,
        showBuildingModal: false,
        selectedBuilding: null,
        buildingActions: [],
      }));
    }
  }, [appState.buildingActions]);

  /**
   * Handle action selection from building modal
   */
  const handleActionSelect = useCallback((actionId: string) => {
    if (!gameControllerRef.current || !appState.selectedBuilding) return;

    // Find the action by ID
    const action = appState.buildingActions.find(a => a.id === actionId);
    if (!action) {
      console.warn('Action not found:', actionId);
      return;
    }

    // Execute the action through the gameController (this will notify observers)
    const game = gameControllerRef.current.getGame();
    const player = game.getCurrentPlayer();

    // Use gameController.executeAction() to ensure observers are notified
    gameControllerRef.current.executeAction(player.id, action).then((result) => {
      // Close modal only if action succeeded AND it's an EXIT action
      const shouldCloseModal = result.success && action.type === 'EXIT_BUILDING';

      if (shouldCloseModal) {
        // Close modal - player exited building
        setAppState(prev => ({
          ...prev,
          showBuildingModal: false,
          selectedBuilding: null,
          buildingActions: [],
          errorMessage: result.message,
        }));

        // Clear message after 3 seconds
        setTimeout(() => {
          setAppState(prev => ({ ...prev, errorMessage: null }));
        }, 3000);
      } else {
        // Keep modal open - refresh actions and show result message
        const building = appState.selectedBuilding;
        if (building) {
          const updatedGame = gameControllerRef.current!.getGame();
          const updatedPlayer = updatedGame.getCurrentPlayer();
          const updatedActions = building.getAvailableActions(updatedPlayer.state, updatedGame);

          setAppState(prev => ({
            ...prev,
            buildingActions: updatedActions,
            errorMessage: result.message,
          }));

          // Clear message after 3 seconds
          setTimeout(() => {
            setAppState(prev => ({ ...prev, errorMessage: null }));
          }, 3000);
        }
      }
    });
  }, [appState.selectedBuilding, appState.buildingActions]);

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
    try {
      console.log('Resetting to main menu...');

      // Stop all systems immediately
      if (renderCoordinatorRef.current) {
        renderCoordinatorRef.current.stop();
      }
      if (gameControllerRef.current) {
        gameControllerRef.current.stop();
      }

      // First, close any open modals and clear state
      setAppState(prev => ({
        ...prev,
        showBuildingModal: false,
        selectedBuilding: null,
        buildingActions: [],
        errorMessage: null,
      }));

      // Give React a moment to close modals and clean up UI
      setTimeout(() => {
        try {
          // Clean up existing game systems with error handling
          if (unsubscribeRef.current) {
            try {
              unsubscribeRef.current();
            } catch (e) {
              console.warn('Error unsubscribing:', e);
            }
            unsubscribeRef.current = null;
          }

          if (inputHandlerRef.current) {
            try {
              inputHandlerRef.current.destroy();
            } catch (e) {
              console.warn('Error destroying input handler:', e);
            }
            inputHandlerRef.current = null;
          }

          if (renderCoordinatorRef.current) {
            try {
              renderCoordinatorRef.current.destroy();
            } catch (e) {
              console.warn('Error destroying render coordinator:', e);
            }
            renderCoordinatorRef.current = null;
          }

          if (gameControllerRef.current) {
            try {
              gameControllerRef.current.stop();
            } catch (e) {
              console.warn('Error stopping game controller:', e);
            }
            gameControllerRef.current = null;
          }

          // Reset canvas ref to ensure fresh canvas on next game
          if (canvasRef.current) {
            canvasRef.current = null;
          }

          // Reset state to main menu and increment game key to force remount
          setGameKey(prev => prev + 1);
          setAppState({
            phase: 'menu',
            playerState: null,
            currentWeek: 1,
            timeRemaining: 600,
            selectedBuilding: null,
            buildingActions: [],
            showBuildingModal: false,
            victoryConditions: [],
            errorMessage: null,
          });

          console.log('Reset to main menu complete');
        } catch (error) {
          console.error('Error during cleanup:', error);
          // Force reset even if cleanup fails
          if (canvasRef.current) {
            canvasRef.current = null;
          }
          setGameKey(prev => prev + 1);
          setAppState({
            phase: 'menu',
            playerState: null,
            currentWeek: 1,
            timeRemaining: 600,
            selectedBuilding: null,
            buildingActions: [],
            showBuildingModal: false,
            victoryConditions: [],
            errorMessage: null,
          });
        }
      }, 50);
    } catch (error) {
      console.error('Error resetting to main menu:', error);
      // Force reset on error
      if (canvasRef.current) {
        canvasRef.current = null;
      }
      setGameKey(prev => prev + 1);
      setAppState({
        phase: 'menu',
        playerState: null,
        currentWeek: 1,
        timeRemaining: 600,
        selectedBuilding: null,
        buildingActions: [],
        showBuildingModal: false,
        victoryConditions: [],
        errorMessage: null,
      });
    }
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
        <div key={gameKey} className="game-container">
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

            {/* Error Messages - only show when modal is not open */}
            {appState.errorMessage && !appState.showBuildingModal && (
              <div className="error-message">
                {appState.errorMessage}
              </div>
            )}
          </div>

          {/* Building Modal */}
          {appState.showBuildingModal && appState.selectedBuilding && (
            <BuildingModal
              building={appState.selectedBuilding}
              actions={appState.buildingActions}
              isOpen={appState.showBuildingModal}
              onClose={handleCloseModal}
              onActionSelect={handleActionSelect}
              message={appState.errorMessage}
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
