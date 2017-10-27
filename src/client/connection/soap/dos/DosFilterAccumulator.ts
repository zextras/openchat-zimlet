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
import {IRequest} from "../../IRequest";

export class DosFilterAccumulator {

  private static sCounter: number = 0;

  private mId: number;
  private mOnExecute: Callback;

  private mRequests: IRequest[] = [];
  private mExecuted: boolean = false;

  constructor(
    onExecute: Callback,
  ) {
    this.mId = (DosFilterAccumulator.sCounter++);
    this.mOnExecute = onExecute;
  }

  public pushRequest(request: IRequest): void {
    if (this.mExecuted) {
      throw new Error("Cannot add a request to an executed DosFilterAccumulator");
    }
    this.mRequests.push(request);
  }

  public execute(): void {
    if (this.mExecuted) {
      throw new Error("Cannot execute an already executed DosFilterAccumulator");
    }
    this.mExecuted = true;
    this.mOnExecute.run(this.getRequests());
  }

  public executed(): boolean {
    return this.mExecuted;
  }

  public size(): number {
    return this.mRequests.length;
  }

  public getRequests(): IRequest[] {
    return this.mRequests;
  }

  public getId() {
    return this.mId;
  }

}
