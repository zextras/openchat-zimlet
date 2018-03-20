/*
 * Copyright (C) 2017 ZeXtras S.r.l.
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation, version 2 of
 * the License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License.
 * If not, see <http://www.gnu.org/licenses/>.
 */

import {DwtPoint} from "../../../zimbra/ajax/dwt/graphics/DwtPoint";
import {RoomWindowType} from "../RoomWindow";

export class WindowDragTask {
  private static THRESHOLD: number = 5;

  private windowId: string;
  private startLocation: DwtPoint;
  private originalZIndex: number;

  constructor(window: RoomWindowType) {
    this.windowId = window.getId();
    this.originalZIndex = window.getOriginalZIndex();
    this.startLocation = window.getLocation();
  }

  /**
   * Get if the movement has exceeded the threshold value.
   * This is made to prevent to detect a window click as drag.
   * @param {number} x The X Position.
   * @param {number} y The Y Position.
   * @return {boolean}
   */
  public isReallyMoved(x: number, y: number): boolean {
    const diffX: number = this.startLocation.x - x;
    const diffY: number = this.startLocation.y - y;

    return (Math.abs(diffX) > WindowDragTask.THRESHOLD || Math.abs(diffY) > WindowDragTask.THRESHOLD);
  }

  public getOriginalZIndex(): number {
    return this.originalZIndex;
  }
}
