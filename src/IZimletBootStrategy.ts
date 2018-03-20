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

import {IMessageUiFactory} from "./app/messageFactory/IMessageUiFactory";
import {ICommandFactory} from "./client/connection/ICommandFactory";
import {IChatEvent} from "./client/events/IChatEvent";
import {IEventManager} from "./client/events/IEventManager";
import {IChatEventParser} from "./client/events/parsers/IChatEventParser";
import {IChatClient} from "./client/IChatClient";
import {IRoomWindowFactory} from "./dwt/windows/IRoomWindowFactory";
import {IOpenChatState} from "./redux/IOpenChatState";
import {IOpenChatUIState} from "./redux/IOpenChatUIState";
import {IStoreFactory} from "./redux/IStoreFactory";
import {IMiddlewareFactory} from "./redux/middleware/IMiddlewareFactory";

export interface IZimletBootStrategy {
  configureCommandFactory(cf: ICommandFactory): void;
  configureEventManager(
    em: IEventManager,
    store: Store<IOpenChatState>,
    uiStore: Store<IOpenChatUIState>,
  ): void;
  configureEventParser(ep: IChatEventParser<IChatEvent>): void;
  configureMessageUiFactory(muif: IMessageUiFactory<IOpenChatState>): void;
  getStore(): Store<IOpenChatState>;
  getUIStore(): Store<IOpenChatUIState>;
  getRoomWindowFactory(): IRoomWindowFactory;
  initStore(
    store: Store<IOpenChatState>,
    statusLabels: {
      away: string,
      busy: string,
      invisible: string,
      online: string,
    },
  ): void;

  configureClientInMiddlewares(client: IChatClient): void;
  /**
   * @deprecated
   */
  installLegacyPlugins(
    store: Store<IOpenChatState>,
    uiStore: Store<IOpenChatUIState>,
  ): void;
}
