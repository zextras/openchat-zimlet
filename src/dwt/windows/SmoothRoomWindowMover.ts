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

import {Callback} from "../../lib/callbacks/Callback";
import {CallbackManager} from "../../lib/callbacks/CallbackManager";
import {DwtPoint} from "../../zimbra/ajax/dwt/graphics/DwtPoint";
import {IWindowMover} from "./WindowMover";

import {TimedCallback} from "../../lib/callbacks/TimedCallback";
import {WindowBase} from "./WindowBase";

export class SmoothRoomWindowMover implements IWindowMover {
  public static DEFAULT_TIME: number = 70;

  private static DELAY: number = 7;

  private currentStep: number = 0;
  private callbackMgr: CallbackManager;
  private roomWindow: WindowBase;
  private startLocation: DwtPoint;
  private endLocation: DwtPoint;
  private totalSteps: number;
  private xSteps: number[] = [];
  private ySteps: number[] = [];
  private timedStepCallback: TimedCallback;

  /**
   *
   * @param roomWindow
   * @param endLocation
   * @param moveTime
   * @param cbkMgr
   * @constructor
   */
  constructor(roomWindow: WindowBase,
              endLocation: DwtPoint,
              moveTime: number = SmoothRoomWindowMover.DEFAULT_TIME,
              cbkMgr: CallbackManager = new CallbackManager()) {
    this.roomWindow = roomWindow;
    this.startLocation = roomWindow.getLocation();
    this.endLocation = endLocation;
    this.callbackMgr = cbkMgr;
    if (moveTime <= 0) {
      this.totalSteps = 1;
    } else {
      this.totalSteps = Math.round(moveTime / SmoothRoomWindowMover.DELAY);
    }
    if (this.totalSteps < 1) {
      this.totalSteps = 1;
    }
    const xStep: number = Math.round((this.endLocation.x - this.startLocation.x) / this.totalSteps);
    const yStep: number = Math.round((this.endLocation.y - this.startLocation.y) / this.totalSteps);

    for (let i = 0; i < this.totalSteps; i++) {
      // i = 0: this.startLocation; i = this.totalSteps: this.endLocation
      this.xSteps.push(this.startLocation.x + i * xStep);
      this.ySteps.push(this.startLocation.y + i * yStep);
    }
    this.timedStepCallback = new TimedCallback(
      new Callback(
        this,
        this.applyStep,
      ),
      SmoothRoomWindowMover.DELAY,
      true,
    );
  }

  public start(): void {
    if (typeof setInterval !== "undefined") { // The browser does not support the setTimeout Function, skip the movement
      if (this.startLocation.x !== this.endLocation.x ||
        this.startLocation.y !== this.endLocation.y) {
        this.timedStepCallback.start();
      } else {
        this.callbackMgr.run();
      }
    } else {
      this.setToEndLocation();
    }
  }

  /**
   * @private
   */
  private applyStep(): void {
    this.currentStep++;
    if (this.currentStep < this.totalSteps) {
      this.roomWindow.setLocation(
        this.xSteps[this.currentStep],
        this.ySteps[this.currentStep],
      );
    } else {
      this.timedStepCallback.stop();
      this.setToEndLocation();
    }
  }

  /**
   * @private
   */
  private setToEndLocation(): void {
    this.roomWindow.setLocation(
      this.endLocation.x,
      this.endLocation.y,
    );
    this.callbackMgr.run();
  }
}
