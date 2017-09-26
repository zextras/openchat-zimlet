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

import {Callback} from "./callbacks/Callback";

export class IdleTimer {

  private static sAttachedToWindow: boolean = false;
  private static sIdleTimers: {[id: number]: IdleTimer} = {};
  private static sPrevTimerId: number = -1;
  private static sIdCounter: number = 0;

  private static _attachToWindow(): void {
    if (!IdleTimer.sAttachedToWindow) {
      if ((typeof window !== "undefined" && window !== null) && window.addEventListener) {
        window.addEventListener("keydown", IdleTimer._onEvent, true);
        window.addEventListener("mousemove", IdleTimer._onEvent, true);
        window.addEventListener("mousedown", IdleTimer._onEvent, true);
        window.addEventListener("focus", IdleTimer._onEvent, true);
        IdleTimer.sAttachedToWindow = true;
      } else if (
        (typeof document !== "undefined" && document !== null)
        && (document.body != null)
        && ((document.body as EventAttachableElement).attachEvent != null)
      ) {
        (document.body as EventAttachableElement).attachEvent("onkeydown", IdleTimer._onEvent);
        (document.body as EventAttachableElement).attachEvent("onkeyup", IdleTimer._onEvent);
        (document.body as EventAttachableElement).attachEvent("onmousedown", IdleTimer._onEvent);
        (document.body as EventAttachableElement).attachEvent("onmousemove", IdleTimer._onEvent);
        (document.body as EventAttachableElement).attachEvent("onmouseover", IdleTimer._onEvent);
        (document.body as EventAttachableElement).attachEvent("onmouseout", IdleTimer._onEvent);
        (window as EventAttachableWindow).attachEvent("onfocus", IdleTimer._onEvent);
        IdleTimer.sAttachedToWindow = true;
      } else {
        IdleTimer.sAttachedToWindow = false;
        throw new Error("Unable to attach avent listeners to the window");
      }
    }
  }

  private static _onEvent(): void {
    let idleTimer: IdleTimer;
    for (const id in IdleTimer.sIdleTimers) {
      if (!IdleTimer.sIdleTimers.hasOwnProperty(id)) { continue; }
      idleTimer = IdleTimer.sIdleTimers[id];
      if (!idleTimer.mStopped || idleTimer.mIdle) {
        idleTimer.setIdle(false);
        idleTimer.start();
      }
    }
  }

  private mTimerId: number;
  private mCallback: Callback;
  private mWindowTimerId: number;
  private mTimeout: number;
  private mIdle: boolean;
  private mStopped: boolean;

  constructor(timeout: number = 60000, callback: Callback) {
    IdleTimer._attachToWindow();
    IdleTimer.sPrevTimerId += 1;
    this.mTimerId = IdleTimer.sPrevTimerId;
    IdleTimer.sIdleTimers[this.mTimerId] = this;
    this.mTimeout = timeout;
    this.mCallback = callback;
    this.mIdle = false;
    this.mWindowTimerId = null;
    this.mStopped = true;
    this.start();
  }

  public start(): void {
    this.stop();
    this.mWindowTimerId = setTimeout(
      (new Callback(this, this.setIdle, true)).toClosure(),
      this.mTimeout,
    );
    this.mStopped = false;
  }

  public setTime(newTime: number): void {
    this.mTimeout = newTime;
    // reset Timer if is started
    if (!this.mStopped) {
      this.start();
    }
  }

  public stop(): void {
    if (typeof this.mWindowTimerId !== "undefined" && this.mWindowTimerId !== null) {
      clearTimeout(this.mWindowTimerId);
      this.mWindowTimerId = null;
      this.mStopped = true;
    }
  }

  public isIdle(): boolean {
    return this.mIdle;
  }

  public toString(): string {
    return "IdleTimer";
  }

  private setIdle(idleStatus: boolean) {
    if (this.mIdle !== idleStatus) {
      this.mIdle = idleStatus;
      try {
        if (idleStatus) {
          this.stop();
        } else {
          this.start();
        }
        if (this.mCallback != null) {
          this.mCallback.run(idleStatus);
        }
      } catch (ignored) {}
    }
  }

}

interface EventAttachableElement extends HTMLElement {
  attachEvent(
    ev: "onkeydown" | "onkeyup" | "onmousedown" | "onmousemove" | "onmouseover" | "onmouseout" | "onfocus",
    fn: () => void,
  ): void;
}

interface EventAttachableWindow extends Window {
  attachEvent(
    ev: "onkeydown" | "onkeyup" | "onmousedown" | "onmousemove" | "onmouseover" | "onmouseout" | "onfocus",
    fn: () => void,
  ): void;
}
