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
import {ZmController} from "../../../zimbra/zimbraMail/share/controller/ZmController";
import {SessionInfoProvider} from "../../SessionInfoProvider";
import {DummyRequestBehavior} from "../dummy/DummyRequest";
import {IRequest} from "../IRequest";
import {IRequestFactory} from "../IRequestFactory";
import {SoapRequest} from "./SoapRequest";

export class SoapRequestFactory implements IRequestFactory {

  private mAppController: ZmController;
  private mSessionInfoProvider: SessionInfoProvider;

  constructor(
    appController: ZmController,
    sessionInfoProvider: SessionInfoProvider,
  ) {
    this.mAppController = appController;
    this.mSessionInfoProvider = sessionInfoProvider;
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

    return new SoapRequest(
      this.mAppController,
      this.mSessionInfoProvider.getSessionId(),
      reqId + "",
      command,
      params,
      callback,
      errorCallback,
    );
  }

  public setRequestBehavior(
      behavior: DummyRequestBehavior,
  ): void { return; }

  private voidFcn(): void { return; }
}
