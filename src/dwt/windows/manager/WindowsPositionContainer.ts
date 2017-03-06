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

export class WindowsPositionContainer {
  private positions: {[windowId: string]: number} = {};
  private windows: {[position: number]: string} = {};

  public setWindowPosition(windowId: string, position: number): void {
    this.positions[windowId] = position;
    this.windows[position] = windowId;
  }

  public window2position(windowId: string): number {
    return this.positions[windowId];
  }

  public position2window(position: number): string {
    return this.windows[position];
  }

  public remove(windowId: string) {
    let position: number = this.positions[windowId];
    delete this.positions[windowId];
    delete this.windows[position];
  }
}