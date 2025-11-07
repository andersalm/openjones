/**
 * Player - Represents a player in the game
 *
 * Part of Task A3: Player State
 * Worker 3 - Track A (Core Engine)
 */

import { IPlayer, IPlayerState } from '../../../../shared/types/contracts';
import { PlayerState } from './PlayerState';

export class Player implements IPlayer {
  id: string;
  name: string;
  color: string;
  state: IPlayerState;
  isAI: boolean;

  constructor(params: {
    id: string;
    name: string;
    color: string;
    state: IPlayerState;
    isAI?: boolean;
  }) {
    this.id = params.id;
    this.name = params.name;
    this.color = params.color;
    this.state = params.state;
    this.isAI = params.isAI ?? false;

    // Validate color is a valid hex color
    if (!this.isValidColor(this.color)) {
      throw new Error(`Invalid color format: ${this.color}. Expected hex color like #FF0000`);
    }
  }

  /**
   * Validate that a string is a valid hex color
   */
  private isValidColor(color: string): boolean {
    return /^#[0-9A-Fa-f]{6}$/.test(color);
  }

  /**
   * Create a clone of this player with a cloned state
   */
  clone(): Player {
    return new Player({
      id: this.id,
      name: this.name,
      color: this.color,
      state: this.state.clone(),
      isAI: this.isAI,
    });
  }

  /**
   * Factory method to create a Player
   */
  static create(params: {
    id: string;
    name: string;
    color: string;
    playerId?: string;
    isAI?: boolean;
    stateOverrides?: Partial<IPlayerState>;
  }): Player {
    const playerId = params.playerId ?? params.id;
    const state = PlayerState.create(playerId, params.stateOverrides);

    return new Player({
      id: params.id,
      name: params.name,
      color: params.color,
      state,
      isAI: params.isAI ?? false,
    });
  }

  /**
   * Factory method to create a Player from IPlayer interface
   */
  static from(player: IPlayer): Player {
    return new Player({
      id: player.id,
      name: player.name,
      color: player.color,
      state: PlayerState.from(player.state),
      isAI: player.isAI,
    });
  }
}
