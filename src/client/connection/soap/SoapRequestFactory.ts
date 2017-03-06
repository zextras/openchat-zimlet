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

import {Request} from "../Request";
import {Callback} from "../../../lib/callbacks/Callback";
import {SoapRequest} from "./SoapRequest";
import {SessionInfoProvider} from "../../SessionInfoProvider";
import {RequestFactory} from "../RequestFactory";
import {ZmController} from "../../../zimbra/zimbraMail/share/controller/ZmController";
import {DummyRequestBehavior} from "../dummy/DummyRequest";

export class SoapRequestFactory implements RequestFactory {

  private mAppController: ZmController;
  private mSessionInfoProvider: SessionInfoProvider;

  constructor(
    appController: ZmController,
    sessionInfoProvider: SessionInfoProvider
  ) {
    this.mAppController = appController;
    this.mSessionInfoProvider = sessionInfoProvider;
  }

  public createRequest(
    reqId: number,
    command: string,
    params: {[key: string]: any},
    callback: Callback = new Callback(this, this.voidFcn),
    errorCallback: Callback = new Callback(this, this.voidFcn)
  ): Request {

    callback = Callback.standardize(callback);
    errorCallback = Callback.standardize(errorCallback);

    return new SoapRequest(
      this.mAppController,
      this.mSessionInfoProvider.getSessionId(),
      reqId + "",
      command,
      params,
      callback,
      errorCallback
    );
  }

  public setRequestBehavior (
      behavior: DummyRequestBehavior
  ): void {}

  private voidFcn(): void {}
}
