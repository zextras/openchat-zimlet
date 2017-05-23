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

  private static _attachedToWindow: boolean = false;
  private static _idleTimers: {[id: number]: IdleTimer} = {};
  private static _prevTimerId: number = -1;
  private static _idCounter: number = 0;

  private _timerId: number;
  private _callback: Callback;
  private _windowTimerId: number;
  private _timeout: number;
  private mIdle: boolean;
  private _stopped: boolean;

  constructor(timeout: number = 60000, callback: Callback) {
    IdleTimer._attachToWindow();
    IdleTimer._prevTimerId += 1;
    this._timerId = IdleTimer._prevTimerId;
    IdleTimer._idleTimers[this._timerId] = this;
    this._timeout = timeout;
    this._callback = callback;
    this.mIdle = false;
    this._windowTimerId = null;
    this._stopped = true;
    this.start();
  }

  public start(): void {
    this.stop();
    this._windowTimerId = setTimeout(
      (new Callback(this, this.setIdle, true)).toClosure(),
      this._timeout
    );
    this._stopped = false;
  }

  public setTime(newTime: number): void {
    this._timeout = newTime;
    this.start();
  }

  public stop(): void {
    if (typeof this._windowTimerId !== "undefined" && this._windowTimerId !== null) {
      clearTimeout(this._windowTimerId);
      this._windowTimerId = null;
      this._stopped = true;
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
        if (this._callback != null) {
          this._callback.run(idleStatus);
        }
      } catch (ignored) {}
    }
  }

  private static _attachToWindow(): void {
    if (!IdleTimer._attachedToWindow) {
      if ((typeof window !== "undefined" && window !== null) && window.addEventListener) {
        window.addEventListener("keydown", IdleTimer._onEvent, true);
        window.addEventListener("mousemove", IdleTimer._onEvent, true);
        window.addEventListener("mousedown", IdleTimer._onEvent, true);
        window.addEventListener("focus", IdleTimer._onEvent, true);
        IdleTimer._attachedToWindow = true;
      } else if ((typeof document !== "undefined" && document !== null) && (document.body != null) && ((<EventAttachableElement>document.body).attachEvent != null)) {
        (<EventAttachableElement>document.body).attachEvent("onkeydown", IdleTimer._onEvent);
        (<EventAttachableElement>document.body).attachEvent("onkeyup", IdleTimer._onEvent);
        (<EventAttachableElement>document.body).attachEvent("onmousedown", IdleTimer._onEvent);
        (<EventAttachableElement>document.body).attachEvent("onmousemove", IdleTimer._onEvent);
        (<EventAttachableElement>document.body).attachEvent("onmouseover", IdleTimer._onEvent);
        (<EventAttachableElement>document.body).attachEvent("onmouseout", IdleTimer._onEvent);
        (<EventAttachableWindow>window).attachEvent("onfocus", IdleTimer._onEvent);
        IdleTimer._attachedToWindow = true;
      } else {
        IdleTimer._attachedToWindow = false;
        throw new Error("Unable to attach avent listeners to the window");
      }
    }
  }

  private static _onEvent(): void {
    let idleTimer: IdleTimer;
    for (let id in IdleTimer._idleTimers) {
      if (!IdleTimer._idleTimers.hasOwnProperty(id)) continue;
      idleTimer = IdleTimer._idleTimers[id];
      if (!idleTimer._stopped || idleTimer.mIdle) {
        idleTimer.setIdle(false);
        idleTimer.start();
      }
    }
  }

}

interface EventAttachableElement extends HTMLElement {
  attachEvent(ev: "onkeydown" | "onkeyup" | "onmousedown" | "onmousemove" | "onmouseover" | "onmouseout" | "onfocus", fn: Function): void;
}

interface EventAttachableWindow extends Window {
  attachEvent(ev: "onkeydown" | "onkeyup" | "onmousedown" | "onmousemove" | "onmouseover" | "onmouseout" | "onfocus", fn: Function): void;
}
