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

import {Middleware, Store} from "redux";

import {IConnectionManager} from "../../client/connection/IConnectionManager";
import {IChatClient} from "../../client/IChatClient";
import {ISessionInfoProvider} from "../../client/ISessionInfoProvider";
import {IDateProvider} from "../../lib/IDateProvider";
import {Version} from "../../lib/Version";
import {ISettingsManager} from "../../settings/ISettingsManager";
import {IOpenChatState} from "../IOpenChatState";
import {ChatMiddlewareBase} from "./ChatMiddlewareBase";
import {IMiddlewareFactory} from "./IMiddlewareFactory";
import {AddBuddyEventMiddleware} from "./middlewares/AddBuddyEventMiddleware";
import {DeleteBuddyEventMiddleware} from "./middlewares/DeleteBuddyEventMiddleware";
import {Legacy2SendMessageEventMiddleware} from "./middlewares/legacy/2/Legacy2SendMessageEventMiddleware";
import {Legacy2SendRoomAckMiddleware} from "./middlewares/legacy/2/Legacy2SendRoomAckMiddleware";
import {QueryArchiveMiddleware} from "./middlewares/QueryArchiveMiddleware";
import {RenameBuddyEventMiddleware} from "./middlewares/RenameBuddyEventMiddleware";
import {SendMessageEventMiddleware} from "./middlewares/SendMessageEventMiddleware";
import {SendRoomAckMiddleware} from "./middlewares/SendRoomAckMiddleware";
import {SendUserStatusEventMiddleware} from "./middlewares/SendUserStatusEventMiddleware";
import {SendWritingStatusEventMiddleware} from "./middlewares/SendWritingStatusEventMiddleware";
import {SessionInfoMiddleware} from "./middlewares/SessionInfoMiddleware";

export class OpenChatMiddlewareFactory implements IMiddlewareFactory {

  private mConnectionManager: IConnectionManager;
  private mDateProvider: IDateProvider;
  private mSettingsManager: ISettingsManager;
  private mChatBaseMiddleWares: Array<ChatMiddlewareBase<IOpenChatState>>;
  private mSessionInfoProvider: ISessionInfoProvider;
  private mServerVersion: Version;

  constructor(
    connectionManager: IConnectionManager,
    dateProvider: IDateProvider,
    settingsManager: ISettingsManager,
    sessionInfoProvider: ISessionInfoProvider,
    serverVersion: Version,
  ) {
    this.mConnectionManager = connectionManager;
    this.mDateProvider = dateProvider;
    this.mSettingsManager = settingsManager;
    this.mSessionInfoProvider = sessionInfoProvider;
    this.mServerVersion = serverVersion;
    this.populateMiddlewares();
  }

  public getMiddlewares(): Middleware[] {
    const middlewares: Middleware[] = [];
    for (const chatBaseMiddleware of this.mChatBaseMiddleWares) {
      middlewares.push(chatBaseMiddleware.getMiddleware());
    }
    return middlewares;
  }

  public setClient(client: IChatClient): void {
    for (const chatBaseMiddleware of this.mChatBaseMiddleWares) {
      chatBaseMiddleware.setClient(client);
    }
  }

  public setStore(store: Store<IOpenChatState>): void {
    // The store is passed by the store itself when is running the middleware.
  }

  private populateMiddlewares(): void {
    const isLegacy2Server = this.mServerVersion.lessThan(new Version(2, 2));

    this.mChatBaseMiddleWares = [
      new AddBuddyEventMiddleware(this.mConnectionManager, this.mDateProvider),
      new DeleteBuddyEventMiddleware(this.mConnectionManager, this.mDateProvider),
      new QueryArchiveMiddleware(this.mConnectionManager, this.mDateProvider),
      new RenameBuddyEventMiddleware(this.mConnectionManager, this.mDateProvider),
      (isLegacy2Server) ?
        new Legacy2SendMessageEventMiddleware(this.mConnectionManager, this.mDateProvider)
        :
        new SendMessageEventMiddleware(this.mConnectionManager, this.mDateProvider),
      (isLegacy2Server) ?
        new Legacy2SendRoomAckMiddleware(this.mConnectionManager)
        :
        new SendRoomAckMiddleware(this.mConnectionManager),
      new SendUserStatusEventMiddleware(this.mConnectionManager, this.mDateProvider, this.mSettingsManager),
      new SendWritingStatusEventMiddleware(this.mConnectionManager, this.mDateProvider),
      new SessionInfoMiddleware(this.mSessionInfoProvider, this.mConnectionManager),
    ];
  }
}
