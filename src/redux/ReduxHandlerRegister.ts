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

import {ArchiveResultFinEventHandler} from "../client/events/handlers/ArchiveResultFinEventHandler";
import {IEventManager} from "../client/events/IEventManager";
import {ISessionInfoProvider} from "../client/ISessionInfoProvider";
import {ArchiveCountReduxEventHandler} from "./eventHandler/ArchiveCountReduxEventHandler";
import {BroadcastMessageReduxEventHandler} from "./eventHandler/BroadcastMessageReduxEventHandler";
import {BuddyListReduxEventHandler} from "./eventHandler/BuddyListReduxEventHandler";
import {ContactInformationReduxEventHandler} from "./eventHandler/ContactInformationReduxEventHandler";
import {ErrorReduxEventHandler} from "./eventHandler/ErrorReduxEventHandler";
import {FriendBackAddedReduxEventHandler} from "./eventHandler/FriendBackAddedReduxEventHandler";
import {FriendshipReduxEventHandler} from "./eventHandler/FriendshipReduxEventHandler";
import {MessageReduxEventHandler} from "./eventHandler/MessageReduxEventHandler";
import {NewClientVersionReduxEventHandler} from "./eventHandler/NewClientVersionReduxEventHandler";
import {RequiredRegistrationReduxEventHandler} from "./eventHandler/RequiredRegistrationReduxEventHandler";
import {RoomAckReceivedReduxEventHandler} from "./eventHandler/RoomAckReceivedReduxEventHandler";
import {SessionRegisteredReduxEventHandler} from "./eventHandler/SessionRegisteredReduxEventHandler";
import {ShutdownReduxEventHandler} from "./eventHandler/ShutdownReduxEventHandler";
import {SuperSecretReduxEventHandler} from "./eventHandler/SuperSecretReduxEventHandler";
import {TimeoutReduxEventHandler} from "./eventHandler/TimeoutReduxEventHandler";
import {UnregisterSessionReduxEventHandler} from "./eventHandler/UnregisterSessionReduxEventHandler";
import {WritingStatusReduxEventHandler} from "./eventHandler/WritingStatusReduxEventHandler";
import {IOpenChatState} from "./IOpenChatState";

/**
 * @deprecated
 */
export class ReduxHandlerRegister {
  /**
   * @deprecated
   */
  public static registerHandlers(
    eventManager: IEventManager,
    store: Store<IOpenChatState>,
    sessionInfoProvider: ISessionInfoProvider,
  ): void {
    eventManager.addEventHandler(new BroadcastMessageReduxEventHandler(store));
    eventManager.addEventHandler(new BuddyListReduxEventHandler(store));
    eventManager.addEventHandler(new ContactInformationReduxEventHandler(store));
    eventManager.addEventHandler(new ErrorReduxEventHandler(store));
    eventManager.addEventHandler(new FriendBackAddedReduxEventHandler(store));
    eventManager.addEventHandler(new FriendshipReduxEventHandler(store));
    eventManager.addEventHandler(new RoomAckReceivedReduxEventHandler(store));
    eventManager.addEventHandler(new MessageReduxEventHandler(store));
    eventManager.addEventHandler(new NewClientVersionReduxEventHandler(store));
    // eventManager.addEventHandler(new RequiredRegistrationReduxEventHandler(store));
    // eventManager.addEventHandler(new SessionRegisteredHistoryEnabledReduxEventHandler(store));
    // eventManager.addEventHandler(new SessionRegisteredReduxEventHandler(store, sessionInfoProvider));
    eventManager.addEventHandler(new ShutdownReduxEventHandler(store));
    // eventManager.addEventHandler(new SuperSecretReduxEventHandler(store));
    eventManager.addEventHandler(new TimeoutReduxEventHandler(store));
    eventManager.addEventHandler(new UnregisterSessionReduxEventHandler(store));
    eventManager.addEventHandler(new WritingStatusReduxEventHandler(store));
    eventManager.addEventHandler(new ArchiveResultFinEventHandler(store));
    // eventManager.addEventHandler(new ArchiveCountReduxEventHandler(store));
  }
}
