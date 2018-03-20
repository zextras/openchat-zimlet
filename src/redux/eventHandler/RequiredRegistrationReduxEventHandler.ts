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

import {Store} from "redux";

import {IConnectionManager} from "../../client/connection/IConnectionManager";
import {OpenChatEventCode} from "../../client/events/chat/OpenChatEventCode";
import {RequiredRegistrationEvent} from "../../client/events/chat/RequiredRegistrationEvent";
import {IChatClient} from "../../client/IChatClient";
import {IResetSessionInfoAction} from "../action/IResetSessionInfoAction";
import {IOpenChatState} from "../IOpenChatState";
import {ReduxEventHandler} from "./ReduxEventHandler";

export class RequiredRegistrationReduxEventHandler extends ReduxEventHandler<RequiredRegistrationEvent> {
  private mConnectionManager: IConnectionManager;

  constructor(
    store: Store<IOpenChatState>,
    connectionManager: IConnectionManager,
  ) {
    super(store);
    this.mConnectionManager = connectionManager;
  }

  public getEventCode(): number {
    return OpenChatEventCode.REQUIRED_REGISTRATION;
  }

  public handleEvent(ev: RequiredRegistrationEvent, client: IChatClient): boolean {
    this.mConnectionManager.closeStream();
    this.mStore.dispatch<IResetSessionInfoAction>({type: "RESET_SESSION_INFO"});
    this.mConnectionManager.openStream();
    return true;
  }

}
