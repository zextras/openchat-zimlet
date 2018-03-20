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
import {IUserCapabilities} from "../../client/connection/soap/chat/decoders/SessionRegisteredEventDecoder";
import {EventSessionRegistered} from "../../client/events/chat/EventSessionRegistered";
import {OpenChatEventCode} from "../../client/events/chat/OpenChatEventCode";
import {IChatClient} from "../../client/IChatClient";
import {ISessionInfoProvider} from "../../client/ISessionInfoProvider";
import {ISetSessionInfoAction} from "../action/ISetSessionInfoAction";
import {IOpenChatState} from "../IOpenChatState";
import {ReduxEventHandler} from "./ReduxEventHandler";

export class SessionRegisteredReduxEventHandler extends ReduxEventHandler<EventSessionRegistered<IUserCapabilities>> {
  private mSessionInfoProvider: ISessionInfoProvider;
  private mConnectionManager: IConnectionManager;

  constructor(
    store: Store<IOpenChatState>,
    connectionManager: IConnectionManager,
    sessionInfoProvider: ISessionInfoProvider,
  ) {
    super(store);
    this.mSessionInfoProvider = sessionInfoProvider;
    this.mConnectionManager = connectionManager;
  }

  public getEventCode(): number {
    return OpenChatEventCode.REGISTER_SESSION;
  }

  public handleEvent(ev: EventSessionRegistered<IUserCapabilities>, client: IChatClient): boolean {
    // Maybe is not necessary
    // this.mStore.dispatch<IResetSessionInfoAction>({
    //   type: "RESET_SESSION_INFO",
    // });

    this.mStore.dispatch<ISetSessionInfoAction>({
      info: {
        avatarSrc: "",
        capabilities: ev.getCapabilities(),
        displayname: this.mSessionInfoProvider.getDisplayName(),
        responseReceived: 0,
        serverVersion: ev.getInfo<string>("server_version"),
        sessionId: ev.getInfo<string>("session_id"),
        username: this.mSessionInfoProvider.getUsername(),
        zimletVersion: ev.getInfo<string>("required_zimlet_version"),
      },
      type: "SET_SESSION_INFO",
    });

    client.serverOnline(ev);
    this.mConnectionManager.openStream();
    return true;
  }
}
