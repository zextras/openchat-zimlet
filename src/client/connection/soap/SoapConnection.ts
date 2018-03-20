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
import {ISessionInfoProvider} from "../../ISessionInfoProvider";
import {IConnection} from "../IConnection";
import {IRequestFactory} from "../IRequestFactory";
import {Command} from "./Command";
import {IDosFilter} from "./dos/IDosFilter";

import {ZxError} from "../../../lib/error/ZxError";
import {ZxErrorCode} from "../../../lib/error/ZxErrorCode";
import {IRequest} from "../IRequest";
import {IPingManager} from "./IPingManager";

export class SoapConnection implements IConnection {

  private mRequestCount: number = 0;
  private mRequestFactory: IRequestFactory;
  private mSessionInfoProvider: ISessionInfoProvider;
  private mDosFilter: IDosFilter;
  private mPingManager: IPingManager;

  constructor(
    requestFactory: IRequestFactory,
    sessionInfoProvider: ISessionInfoProvider,
    dosFilter: IDosFilter,
    pingManager: IPingManager,
  ) {
    this.mRequestFactory = requestFactory;
    this.mSessionInfoProvider = sessionInfoProvider;
    this.mDosFilter = dosFilter;
    this.mPingManager = pingManager;

    this.mPingManager.setConnection(this);
  }

  public sendObject(
    command: string,
    object: {},
    callback: Callback,
    errorCallback: Callback,
  ): IRequest {

    // TODO: Accumulate events with command "Command.NOTIFY_MSG_RECEIVED"
    if (
      (typeof this.mSessionInfoProvider.getSessionId() === "undefined"
        || this.mSessionInfoProvider.getSessionId() === null)
      &&  command !== Command.REGISTER_SESSION
    ) {
      errorCallback.run(
        new ZxError(ZxErrorCode.NO_SUCH_CHAT_SESSION, new Error("Error on SoapConnection.sendObject")),
      );
    } else {
      const request: IRequest = this.mRequestFactory.createRequest(
        (++this.mRequestCount),
        command,
        object,
        callback,
        errorCallback,
      );
      this.mDosFilter.sendRequest(request);
      return request;
    }
  }

  public openStream(): void {
    this.mPingManager.openStream();
  }

  public closeStream(): void {
    this.mPingManager.closeStream();
  }

  public isStreamOpened(): boolean {
    return this.mPingManager.isStreamOpened();
  }

  public onStreamEvent(callback: Callback): void {
    this.mPingManager.onStreamEvent(callback);
  }

  public onStreamError(callback: Callback): void {
    this.mPingManager.onStreamError(callback);
  }

  public onEndProcessResponses(callback: Callback): void {
    this.mPingManager.onEndProcessResponses(callback);
  }

}
