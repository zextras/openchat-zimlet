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

import {Callback} from "./Callback";

export class TimedCallback {
  protected mCallback: Callback;
  protected mTimeout: number;
  protected mRepeat: boolean;
  protected mIntervalId: number;

  constructor(callback: Callback, timeout: number, repeat: boolean = false) {
    this.mCallback = callback;
    this.mTimeout = timeout;
    this.mRepeat = repeat;
    this.mIntervalId = void 0;
  }

  public getId(): number {
    return this.mIntervalId;
  }


  public start(): void {
    if (this.mRepeat) {
      this.mIntervalId = setInterval(this.mCallback.toClosure(), this.mTimeout);
    }
    else {
      this.mIntervalId = setTimeout(this.mCallback.toClosure(), this.mTimeout);
    }
  }

  public stop(): void {
    if (this.mIntervalId === void 0) {
      return;
    }
    if (this.mRepeat) {
      clearInterval(this.mIntervalId);
    }
    else {
      clearTimeout(this.mIntervalId);
    }
  }
}
