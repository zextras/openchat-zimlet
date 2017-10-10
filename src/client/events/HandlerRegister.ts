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

import {EventManager} from "./EventManager";
import {MessageEventHandler} from "./handlers/MessageEventHandler";
import {FriendshipEventHandler} from "./handlers/FriendshipEventHandler";
import {FriendshipAcceptedHandler} from "./handlers/friendship/FriendshipAcceptedHandler";
import {FriendshipBlockedHandler} from "./handlers/friendship/FriendshipBlockedHandler";
import {FriendshipDeniedHandler} from "./handlers/friendship/FriendshipDeniedHandler";
import {FriendshipInvitationHandler} from "./handlers/friendship/FriendshipInvitationHandler";
import {FriendshipRemovedHandler} from "./handlers/friendship/FriendshipRemovedHandler";
import {FriendshipRenameHandler} from "./handlers/friendship/FriendshipRenameHandler";
import {ContactInformationEventHandler} from "./handlers/ContactInformationEventHandler";
import {RequiredRegistrationEventHandler} from "./handlers/RequiredRegistrationEventHandler";
import {BroadcastMessageEventHandler} from "./handlers/BroadcastMessageEventHandler";
import {BuddyListEventHandler} from "./handlers/BuddyListEventHandler";
import {TimeoutEventHandler} from "./handlers/TimeoutEventHandler";
import {WritingStatusEventHandler} from "./handlers/WritingStatusEventHandler";
import {FriendBackAddedEventHandler} from "./handlers/FriendBackAddedEventHandler";
import {MessageAckReceivedEventHandler} from "./handlers/MessageAckReceivedEventHandler";
import {NewClientVersionEventHandler} from "./handlers/NewClientVersionEventHandler";
import {ShutdownEventHandler} from "./handlers/ShutdownEventHandler";
import {ErrorEventHandler} from "./handlers/ErrorEventHandler";
import {ChatZimletBase} from "../../ChatZimletBase";
import {EventSessionRegisteredHandler} from "./handlers/EventSessionRegisteredHandler";
import {UnregisterSessionEventHandler} from "./handlers/UnregisterSessionEventHandler";
import {SuperSecretEventHandler} from "./handlers/SuperSecretEventHandler";

export class HandlerRegister {
  public static registerHandlers(eventManager: EventManager, zimletContext: ChatZimletBase): void {
    eventManager.addEventHandler(new MessageEventHandler());
    eventManager.addEventHandler(new FriendshipEventHandler(
        new FriendshipAcceptedHandler(),
        new FriendshipBlockedHandler(),
        new FriendshipDeniedHandler(),
        new FriendshipInvitationHandler(zimletContext),
        new FriendshipRemovedHandler(),
        new FriendshipRenameHandler()
      )
    );
    eventManager.addEventHandler(new ContactInformationEventHandler());
    eventManager.addEventHandler(new RequiredRegistrationEventHandler());
    eventManager.addEventHandler(new BroadcastMessageEventHandler());
    eventManager.addEventHandler(new BuddyListEventHandler());
    eventManager.addEventHandler(new TimeoutEventHandler());
    eventManager.addEventHandler(new WritingStatusEventHandler());
    eventManager.addEventHandler(new MessageAckReceivedEventHandler());
    eventManager.addEventHandler(new FriendBackAddedEventHandler());
    eventManager.addEventHandler(new NewClientVersionEventHandler());
    eventManager.addEventHandler(new ShutdownEventHandler());
    eventManager.addEventHandler(new ErrorEventHandler());
    eventManager.addEventHandler(new EventSessionRegisteredHandler());
    eventManager.addEventHandler(new UnregisterSessionEventHandler());
    eventManager.addEventHandler(new SuperSecretEventHandler());
  }

}
