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
import {DateProvider} from "../../../../lib/DateProvider";

export class DosDirector {

  private mDateProvider: DateProvider;
  private mLimit: number;
  private mTimeSpan: number;
  private mOnAccept: Callback;
  private mOnReject: Callback;
  private mReferenceTime: number;
  private mCount: number = 0;

  constructor(
    dateProvider: DateProvider,
    timeSpan: number,
    limit: number,
    onAccept: Callback,
    onReject: Callback,
  ) {
    this.mDateProvider = dateProvider;
    this.mTimeSpan = timeSpan;
    this.mLimit = limit;
    this.mOnAccept = onAccept;
    this.mOnReject = onReject;
  }

  public filter(obj: any): boolean {
    const now: number = this.mDateProvider.getCurrentTimeMillis();
    if (typeof this.mReferenceTime === "undefined") {
      this.mReferenceTime = now;
    }

    if ((now - this.mReferenceTime) >= this.mTimeSpan) {
      // Is outside the time span, reset the Director
      this.mReferenceTime = this.mDateProvider.getCurrentTimeMillis();
      this.mCount = 0;
    }

    if ((this.mCount + 1) <= this.mLimit) {
      this.mCount++;
      this.mOnAccept.run(obj);
      return true;
    } else {
      this.mOnReject.run(obj);
      return false;
    }

  }

}
