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

import {ArchiveResultEventHandler} from "./handlers/ArchiveResultEventHandler";
import {BroadcastMessageEventHandler} from "./handlers/BroadcastMessageEventHandler";
import {BuddyListEventHandler} from "./handlers/BuddyListEventHandler";
import {ErrorEventHandler} from "./handlers/ErrorEventHandler";
// import {EventSessionRegisteredHandler} from "./handlers/EventSessionRegisteredHandler";
import {FriendBackAddedEventHandler} from "./handlers/FriendBackAddedEventHandler";
import {FriendshipAcceptedHandler} from "./handlers/friendship/FriendshipAcceptedHandler";
import {FriendshipBlockedHandler} from "./handlers/friendship/FriendshipBlockedHandler";
import {FriendshipDeniedHandler} from "./handlers/friendship/FriendshipDeniedHandler";
import {FriendshipInvitationHandler} from "./handlers/friendship/FriendshipInvitationHandler";
import {FriendshipRemovedHandler} from "./handlers/friendship/FriendshipRemovedHandler";
import {FriendshipRenameHandler} from "./handlers/friendship/FriendshipRenameHandler";
import {FriendshipEventHandler} from "./handlers/FriendshipEventHandler";
import {NewClientVersionEventHandler} from "./handlers/NewClientVersionEventHandler";
import {ShutdownEventHandler} from "./handlers/ShutdownEventHandler";
import {SuperSecretEventHandler} from "./handlers/SuperSecretEventHandler";
import {TimeoutEventHandler} from "./handlers/TimeoutEventHandler";
import {IEventManager} from "./IEventManager";

/**
 * @deprecated
 */
export class HandlerRegister {
  /**
   * @deprecated
   * @param {IEventManager} eventManager
   */
  public static registerHandlers(eventManager: IEventManager): void {
    eventManager.addEventHandler(new FriendshipEventHandler(
        new FriendshipAcceptedHandler(),
        new FriendshipBlockedHandler(),
        new FriendshipDeniedHandler(),
        new FriendshipInvitationHandler(),
        new FriendshipRemovedHandler(),
        new FriendshipRenameHandler(),
      ),
    );
    eventManager.addEventHandler(new BroadcastMessageEventHandler());
    eventManager.addEventHandler(new BuddyListEventHandler());
    eventManager.addEventHandler(new TimeoutEventHandler());
    eventManager.addEventHandler(new FriendBackAddedEventHandler());
    eventManager.addEventHandler(new NewClientVersionEventHandler());
    eventManager.addEventHandler(new ShutdownEventHandler());
    eventManager.addEventHandler(new ErrorEventHandler());
    // eventManager.addEventHandler(new EventSessionRegisteredHandler());
    eventManager.addEventHandler(new SuperSecretEventHandler());
    eventManager.addEventHandler(new ArchiveResultEventHandler(eventManager));
  }

}
