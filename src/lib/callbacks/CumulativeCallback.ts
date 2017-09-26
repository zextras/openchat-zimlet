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

export class CumulativeCallback extends Callback {
  private howMany: number;

  constructor(howMany: number, obj: object, func: (...args: any[]) => any, ...args: any[]) {
    super(obj, func);
    this.mArguments = args;
    this.howMany = howMany;
  }

  public run(...args: any[]): any {
    this.howMany--;
    if (this.howMany > 0) { return; }
    if (this.howMany < 0) { throw new Error("CumulativeCallback already fired."); }
    return super.run(args);
  }
}
