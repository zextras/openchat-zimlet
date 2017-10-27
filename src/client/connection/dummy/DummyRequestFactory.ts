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

import {Callback} from "../../../lib/callbacks/Callback";
import {IRequest} from "../IRequest";
import {IRequestFactory} from "../IRequestFactory";
import {DummyRequest, DummyRequestBehavior} from "./DummyRequest";

export class DummyRequestFactory implements IRequestFactory {

  private mBehavior: DummyRequestBehavior;

  constructor(
    behavior: DummyRequestBehavior,
  ) {
    this.mBehavior = behavior;
  }

  public createRequest(
    reqId: number,
    command: string,
    params: {[key: string]: any},
    callback: Callback = new Callback(this, this.voidFcn),
    errorCallback: Callback = new Callback(this, this.voidFcn),
  ): IRequest {

    callback = Callback.standardize(callback);
    errorCallback = Callback.standardize(errorCallback);

    const fakeRequest = new DummyRequest(
      this.mBehavior,
      params,
      callback,
      errorCallback,
    );

    return fakeRequest;

  }

  public setRequestBehavior(
    behavior: DummyRequestBehavior,
  ): void {
    this.mBehavior = behavior;
  }

  private voidFcn(): void { return; }
}
