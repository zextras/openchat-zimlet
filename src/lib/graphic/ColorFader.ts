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

import {CallbackManager} from "../callbacks/CallbackManager";
import {ColorFaderColor} from "./ColorFaderColor";
import {Callback} from "../callbacks/Callback";
import {TimedCallback} from "../callbacks/TimedCallback";

export class ColorFader {

  private static STEPS: number = 1;

  private mCallbackMgr: CallbackManager;
  private mEndCallbackMgr: CallbackManager;
  private mStartColor: ColorFaderColor;
  private mStartFontColor: ColorFaderColor;
  private mEndColor: ColorFaderColor;
  private mEndFontColor: ColorFaderColor;
  private mTime: number;
  private mSteps: number = ColorFader.STEPS;
  private mStepsDuration: number;
  private mStepR: number;
  private mStepG: number;
  private mStepB: number;
  private mStepFontR: number;
  private mStepFontG: number;
  private mStepFontB: number;

  constructor(startColor: ColorFaderColor,
              endColor: ColorFaderColor,
              startFontColor: ColorFaderColor,
              endFontColor: ColorFaderColor,
              time: number,
              callbackMgr: CallbackManager = new CallbackManager(),
              endCallbackMgr: CallbackManager = new CallbackManager()) {
    this.mStartColor = startColor;
    this.mStartFontColor = startFontColor;
    this.mEndColor = endColor;
    this.mEndFontColor = endFontColor;
    this.mTime = time;
    this.mCallbackMgr = callbackMgr;
    this.mEndCallbackMgr = endCallbackMgr;
    this.mStepsDuration = Math.floor(time / this.mSteps);

    if (this.mStartColor.r > this.mEndColor.r) {
      this.mStepR = Math.floor((this.mStartColor.r - this.mEndColor.r) / this.mSteps);
    } else {
      this.mStepR = Math.floor((this.mEndColor.r - this.mStartColor.r) / this.mSteps);
    }
    if (this.mStartColor.g > this.mEndColor.g) {
      this.mStepG = Math.floor((this.mStartColor.g - this.mEndColor.g) / this.mSteps);
    } else {
      this.mStepG = Math.floor((this.mEndColor.g - this.mStartColor.g) / this.mSteps);
    }
    if (this.mStartColor.b > this.mEndColor.b) {
      this.mStepB = Math.floor((this.mStartColor.b - this.mEndColor.b) / this.mSteps);
    } else {
      this.mStepB = Math.floor((this.mEndColor.b - this.mStartColor.b) / this.mSteps);
    }
    if (this.mStartFontColor.r > this.mEndFontColor.r) {
      this.mStepFontR = Math.floor((this.mStartFontColor.r - this.mEndFontColor.r) / this.mSteps);
    } else {
      this.mStepFontR = Math.floor((this.mEndFontColor.r - this.mStartFontColor.r) / this.mSteps);
    }
    if (this.mStartFontColor.g > this.mEndFontColor.g) {
      this.mStepFontG = Math.floor((this.mStartFontColor.g - this.mEndFontColor.g) / this.mSteps);
    } else {
      this.mStepFontG = Math.floor((this.mEndFontColor.g - this.mStartFontColor.g) / this.mSteps);
    }
    if (this.mStartFontColor.b > this.mEndFontColor.b) {
      this.mStepFontB = Math.floor((this.mStartFontColor.b - this.mEndFontColor.b) / this.mSteps);
    } else {
      this.mStepFontB = Math.floor((this.mEndFontColor.b - this.mStartFontColor.b) / this.mSteps);
    }
  }

  public start(): void {
    this.doStep(this.mSteps);
  }

  private doStep(remaining: number): void {
    remaining -= 1;
    if (remaining > 0) {
      this.mCallbackMgr.run(new ColorFaderColor(
        this.mStartColor.r + (this.mStepR * (this.mSteps - remaining)),
        this.mStartColor.g + (this.mStepG * (this.mSteps - remaining)),
        this.mStartColor.b + (this.mStepB * (this.mSteps - remaining))
      ),
      new ColorFaderColor(
        this.mStartFontColor.r + (this.mStepFontR * (this.mSteps - remaining)),
        this.mStartFontColor.g + (this.mStepFontG * (this.mSteps - remaining)),
        this.mStartFontColor.b + (this.mStepFontB * (this.mSteps - remaining))
      ));
      if (typeof setTimeout !== "undefined") {
        let timedCallback = new TimedCallback(new Callback(
          this,
          this.doStep,
          [remaining]
        ), this.mStepsDuration, false);
        timedCallback.start();
      }
      else {
        this.doStep(remaining);
      }
    }
    else {
      this.mCallbackMgr.run(this.mEndColor, this.mEndFontColor);
      this.mEndCallbackMgr.run();
    }
  }

}
