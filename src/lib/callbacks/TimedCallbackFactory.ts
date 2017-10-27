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

import {DateProvider} from "../DateProvider";
import {Callback} from "./Callback";
import {TimedCallback} from "./TimedCallback";

// tslint:disable:max-classes-per-file

export class TimedCallbackFactory {

  public createTimedCallback(
    callback: Callback,
    timeout: number,
    repeat: boolean = false,
  ): TimedCallback {
    return new TimedCallback(
      callback,
      timeout,
      repeat,
    );
  }
}

export class FakeTimedCallbackFactory {
    private mDateProvider: DateProvider;

  constructor(dateProvider?: DateProvider) {
    this.mDateProvider = dateProvider;
  }

  public createTimedCallback(
    callback: Callback,
    timeout: number,
    repeat: boolean = false,
  ) {
    return new FakeTimedCallback(
      callback,
      timeout,
      repeat,
      this.mDateProvider,
    );
  }
}

export class FakeTimedCallback extends TimedCallback {
  private mDateProvider: DateProvider;
  private mStartingTime: number;

  constructor(callback: Callback, timeout: number, repeat: boolean = false, dateProvider: DateProvider) {
    super(callback, timeout, repeat);
    if (typeof dateProvider !== "undefined") {
      this.mDateProvider = dateProvider;
    }
  }

  public start(): any {
    // If mDateProvider is defined the FakeTimedCallback is managed by mDateProvider,
    // else execute timed callback immediatly
    // Removed any ...args as parameters of start method,
    // in case they should be inserted in this.mCallback constructor
    if (typeof this.mDateProvider !== "undefined") {
      this.mStartingTime = this.mDateProvider.getCurrentTimeMillis();
      const checkTimeCallback = () => {
        if (this.mDateProvider.getCurrentTimeMillis() >= this.mStartingTime + this.mTimeout) {
          this.mCallback.run();
          this.mCallback.run = void 0;
        }
      };
      this.mDateProvider.onTimeChange(
        new Callback(
          this,
          checkTimeCallback,
        ),
      );
    } else {
      this.mCallback.run();
    }
  }

  public stop(): void { return; }

}
