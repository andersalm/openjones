import { IPlayerState, IGame, IPosition } from '@shared/types/contracts';
import { Action } from './Action';
import { ActionResponse, StateChangeBuilder } from './ActionResponse';
import { ActionType, IActionResponse, IActionRequirement as ActionRequirement } from '@shared/types/contracts';

// Helper function to calculate distance between two positions
function calculateDistance(from: IPosition, to: IPosition): number {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export class MovementAction extends Action {
  constructor(
    private fromPosition: IPosition,
    private toPosition: IPosition
  ) {
    const distance = calculateDistance(fromPosition, toPosition);
    const timeCost = 5 + Math.round(distance * 2);
    super(
      `move-${fromPosition.x},${fromPosition.y}-to-${toPosition.x},${toPosition.y}`,
      ActionType.MOVE,
      'Move',
      `Move to (${toPosition.x}, ${toPosition.y})`,
      timeCost
    );
  }

  canExecute(player: IPlayerState, game: IGame): boolean {
    // Must be on street (not in building)
    if (!this.requiresStreet(player)) {
      return false;
    }

    // Must have enough time
    if (!this.hasEnoughTime(player)) {
      return false;
    }

    // Target position must be valid
    if (!game.map.isValidPosition(this.toPosition)) {
      return false;
    }

    // Cannot move to current position
    if (player.position.x === this.toPosition.x && player.position.y === this.toPosition.y) {
      return false;
    }

    return true;
  }

  execute(player: IPlayerState, game: IGame): IActionResponse {
    if (!this.canExecute(player, game)) {
      const errors: string[] = [];

      if (!this.requiresStreet(player)) {
        errors.push('Must be on the street to move');
      }

      if (!this.hasEnoughTime(player)) {
        errors.push(`Not enough time (need ${this.timeCost} time units)`);
      }

      if (!game.map.isValidPosition(this.toPosition)) {
        errors.push('Invalid target position');
      }

      if (player.position.x === this.toPosition.x && player.position.y === this.toPosition.y) {
        errors.push('Already at target position');
      }

      return ActionResponse.failure(errors.join('; '));
    }

    const changes = StateChangeBuilder.create()
      .position(this.toPosition, `Moved to (${this.toPosition.x}, ${this.toPosition.y})`)
      .build();

    return ActionResponse.success(
      `Moved to (${this.toPosition.x}, ${this.toPosition.y})`,
      this.timeCost,
      changes
    );
  }

  getRequirements(): ActionRequirement[] {
    return [
      {
        type: 'location',
        value: 'street',
        description: 'Must be on the street to move',
      },
      {
        type: 'time',
        value: this.timeCost,
        description: `Requires ${this.timeCost} time units`,
      },
    ];
  }

  getFromPosition(): IPosition {
    return this.fromPosition;
  }

  getToPosition(): IPosition {
    return this.toPosition;
  }

  getDistance(): number {
    return calculateDistance(this.fromPosition, this.toPosition);
  }
}
