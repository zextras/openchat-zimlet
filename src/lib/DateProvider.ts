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
import {IDateProvider} from "./IDateProvider";

export class DateProvider implements IDateProvider {

  public getNow(): Date {
    return new Date();
  }

  public getCurrentTimeMillis(): number {
    return this.getNow().getTime();
  }

  public getDate(timestamp: number): Date {
    return new Date(timestamp);
  }

  public onTimeChange(callback: Callback): void {
    return undefined;
  }

}
