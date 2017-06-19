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

import {TimedCallbackFactory} from "../../../../lib/callbacks/TimedCallbackFactory";
import {DosFilterAccumulator} from "./DosFilterAccumulator";
import {Callback} from "../../../../lib/callbacks/Callback";
import {Request} from "../../Request";
import {DateProvider} from "../../../../lib/DateProvider";
import {DosDirector} from "./DosDirector";
import {DosFilter} from "./DosFilter";

export class DosFilterImp implements DosFilter {

  public static TIME_SLOT: number = 1000; // 1 sec
  public static LIMIT: number = 10;

  private mTimedCallbackFactory: TimedCallbackFactory;
  private mDateProvider: DateProvider;
  private mDosDirector: DosDirector;
  private mAccumulator: DosFilterAccumulator;

  private mEnabled: boolean = true;

  constructor(
    dateProvider: DateProvider,
    timedCallbackFactory: TimedCallbackFactory
  ) {
    this.mDateProvider = dateProvider;
    this.mTimedCallbackFactory = timedCallbackFactory;
    this.mDosDirector = new DosDirector(
      dateProvider,
      DosFilterImp.TIME_SLOT,
      DosFilterImp.LIMIT,
      new Callback(this, this.executeRequest),
      new Callback(this, this.deferRequest)
    );
  }

  public enable(): void {
    this.mEnabled = true;
  }

  public disable(): void {
    this.mEnabled = false;
  }

  public enabled(): boolean {
    return this.mEnabled;
  }

  public sendRequest(request: Request): void {
    if (!this.mEnabled) {
      this.executeRequest(request);
    } else {
       this.mDosDirector.filter(request);
    }
  }

  private executeRequest(request: Request): void {
    request.send();
  }

  private deferRequest(request: Request): void {
    if (typeof this.mAccumulator === "undefined" || this.mAccumulator.executed()) {
      this.mAccumulator = new DosFilterAccumulator(new Callback(this, this.onExecuteAccumulator));
      this.mAccumulator.pushRequest(request);
      this.mTimedCallbackFactory.createTimedCallback(
        new Callback(
          this.mAccumulator,
          this.mAccumulator.execute
        ),
        DosFilterImp.TIME_SLOT
      ).start();
    } else {
      this.mAccumulator.pushRequest(request);
    }
  }

  private onExecuteAccumulator(requests: Request[]): void {
    this.mAccumulator = void 0;
    for (let i: number = 0; i < requests.length; i += 1) {
      this.sendRequest(requests[i]);
    }
  }

}


