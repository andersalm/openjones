/**
 * MapFactory - Creates the default 5x5 game map with all buildings
 *
 * Based on Java MapManager.java - creates the exact same layout
 */

import { Map } from './Map';
import { Position } from '../types/Position';
import {
  Factory,
  Bank,
  College,
  LowCostApartment,
  SecurityApartment,
  ClothesStore,
  Restaurant,
  RentAgency,
  EmploymentAgency,
} from '../buildings';

export class MapFactory {
  /**
   * Create the default 5x5 map matching Java implementation
   * Grid layout (x, y):
   * (0,0) SecurityApartment   (1,0) RentAgency      (2,0) LowCostApartment  (3,0) Empty  (4,0) Empty
   * (0,1) Empty                (1,1) Empty           (2,1) Empty              (3,1) Empty  (4,1) Restaurant
   * (0,2) Empty                (1,2) Empty           (2,2) Empty              (3,2) Empty  (4,2) ClothesStore
   * (0,3) Bank                 (1,3) Empty           (2,3) Empty              (3,3) Empty  (4,3) Empty
   * (0,4) Factory              (1,4) EmploymentAgency (2,4) Empty             (3,4) College (4,4) Empty
   */
  static createDefaultMap(): Map {
    const map = Map.create();

    // Create apartment buildings first
    const securityApt = new SecurityApartment(
      'security-apartment',
      'Security Apartment',
      new Position(0, 0)
    );

    const lowCostApt = new LowCostApartment(
      'lowcost-apartment',
      'Low-Cost Apartment',
      new Position(2, 0)
    );

    // Create rent agency with reference to available homes
    const rentAgency = new RentAgency(
      'rent-agency',
      'Rent Agency',
      new Position(1, 0),
      ['lowcost-apartment', 'security-apartment']
    );

    // Create other buildings
    const factory = new Factory(
      'factory',
      'Factory',
      new Position(0, 4)
    );

    const bank = new Bank(
      'bank',
      'Bank',
      new Position(0, 3)
    );

    const college = new College(
      'college',
      'HI-TECH U',
      new Position(3, 4)
    );

    const clothesStore = new ClothesStore(
      'clothes-store',
      'QT Clothing',
      new Position(4, 2)
    );

    const restaurant = new Restaurant(
      'restaurant',
      'Monolith Burgers',
      new Position(4, 1)
    );

    const employmentAgency = new EmploymentAgency(
      'employment-agency',
      'Employment Agency',
      new Position(1, 4)
    );

    // Add all buildings to map in order
    map.addBuilding(securityApt);
    map.addBuilding(lowCostApt);
    map.addBuilding(rentAgency);
    map.addBuilding(factory);
    map.addBuilding(bank);
    map.addBuilding(college);
    map.addBuilding(clothesStore);
    map.addBuilding(restaurant);
    map.addBuilding(employmentAgency);

    return map;
  }
}
