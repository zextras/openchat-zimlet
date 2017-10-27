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

import {Callback} from "../../../../lib/callbacks/Callback";
import {TimedCallbackFactory} from "../../../../lib/callbacks/TimedCallbackFactory";
import {DateProvider} from "../../../../lib/DateProvider";
import {IRequest} from "../../IRequest";
import {DosDirector} from "./DosDirector";
import {DosFilterAccumulator} from "./DosFilterAccumulator";
import {IDosFilter} from "./IDosFilter";

export class DosFilter implements IDosFilter {

  public static TIME_SLOT: number = 1000; // 1 sec
  public static LIMIT: number = 10;

  private mTimedCallbackFactory: TimedCallbackFactory;
  private mDateProvider: DateProvider;
  private mDosDirector: DosDirector;
  private mAccumulator: DosFilterAccumulator;

  private mEnabled: boolean = true;

  constructor(
    dateProvider: DateProvider,
    timedCallbackFactory: TimedCallbackFactory,
  ) {
    this.mDateProvider = dateProvider;
    this.mTimedCallbackFactory = timedCallbackFactory;
    this.mDosDirector = new DosDirector(
      dateProvider,
      DosFilter.TIME_SLOT,
      DosFilter.LIMIT,
      new Callback(this, this.executeRequest),
      new Callback(this, this.deferRequest),
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

  public sendRequest(request: IRequest): void {
    if (!this.mEnabled) {
      this.executeRequest(request);
    } else {
       this.mDosDirector.filter(request);
    }
  }

  private executeRequest(request: IRequest): void {
    request.send();
  }

  private deferRequest(request: IRequest): void {
    if (typeof this.mAccumulator === "undefined" || this.mAccumulator.executed()) {
      this.mAccumulator = new DosFilterAccumulator(new Callback(this, this.onExecuteAccumulator));
      this.mAccumulator.pushRequest(request);
      this.mTimedCallbackFactory.createTimedCallback(
        new Callback(
          this.mAccumulator,
          this.mAccumulator.execute,
        ),
        DosFilter.TIME_SLOT,
      ).start();
    } else {
      this.mAccumulator.pushRequest(request);
    }
  }

  private onExecuteAccumulator(requests: IRequest[]): void {
    this.mAccumulator = void 0;
    for (const request of requests) {
      this.sendRequest(request);
    }
  }

}
