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
import {ZxError} from "../../../lib/error/ZxError";
import {IRequest} from "../IRequest";

export class DummyRequest implements IRequest {

  private mParams: {};
  private mCallback: Callback;
  private mErrorCallback: Callback;
  private mResponse: any;
  private mErrorResponse: any;
  private mBehavior: DummyRequestBehavior;

  constructor(
    behavior: DummyRequestBehavior,
    object: {},
    callback: Callback,
    errorCallback: Callback,
  ) {
    this.mBehavior = behavior;
    this.mParams = object;
    this.mCallback = callback;
    this.mErrorCallback = errorCallback;
  }

  public send(): string {
    switch (this.mBehavior) {
      case DummyRequestBehavior.CALLBACK:
        if (typeof this.mCallback !== "undefined") {
          if (typeof this.mResponse !== "undefined") {
            return this.mCallback.run(this.mResponse);
          } else {
            return this.mCallback.run();
          }
        }
        break;
      case DummyRequestBehavior.ERROR_CALLBACK:
        if (typeof this.mErrorCallback !== "undefined") {
          return this.mErrorCallback.run(this.mErrorResponse);
        }
        break;
    }
    return undefined;
  }

  public setResponse(response: any) {
    this.mResponse = response;
  }

  public setErrorResponse(errorResponse: any) {
    this.mErrorResponse = ZxError.fromResponse({error: errorResponse});
  }

  public cancelRequest(errorCallback: Callback): void {
    errorCallback = Callback.standardize(errorCallback);
    errorCallback.run();
  }
}

export enum DummyRequestBehavior {
  CALLBACK,
  ERROR_CALLBACK,
}
