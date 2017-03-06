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

import {CommandFactory} from "../CommandFactory";
import {MessageEvent} from "../../events/chat/MessageEvent";
import {Command} from "./Command";
import {FriendshipEvent} from "../../events/chat/FriendshipEvent";
import {FriendshipInvitationEvent} from "../../events/chat/friendship/FriendshipInvitationEvent";
import {WritingStatusEvent} from "../../events/chat/WritingStatusEvent";
import {MessageAckEvent} from "../../events/chat/MessageAckEvent";
import {PingEvent} from "../../events/chat/PingEvent";
import {RegisterSessionEvent} from "../../events/chat/RegisterSessionEvent";
import {UnregisterSessionEvent} from "../../events/chat/UnregisterSessionEvent";
import {AcceptFriendshipEvent} from "../../events/chat/AcceptFriendshipEvent";
import {RemoveFriendshipEvent} from "../../events/chat/RemoveFriendshipEvent";
import {RenameFriendshipEvent} from "../../events/chat/RenameFriendshipEvent";
import {RenameGroupEvent} from "../../events/chat/RenameGroupEvent";
import {SetStatusEvent} from "../../events/chat/SetStatusEvent";

export class SoapCommands {

  public static registerCommands(commandFactory: CommandFactory): void {
    commandFactory.addCommand(MessageEvent.ID, Command.SEND_MESSAGE);
    commandFactory.addSpecialCommand(FriendshipEvent.ID, FriendshipInvitationEvent.getCommandFromFriendshipEvent);
    commandFactory.addCommand(WritingStatusEvent.ID, Command.NOTIFY_WRITING);
    commandFactory.addCommand(MessageAckEvent.ID, Command.NOTIFY_MSG_RECEIVED);
    commandFactory.addCommand(PingEvent.ID, Command.PING);
    commandFactory.addCommand(RegisterSessionEvent.ID, Command.REGISTER_SESSION);
    commandFactory.addCommand(UnregisterSessionEvent.ID, Command.UNREGISTER_SESSION);
    commandFactory.addCommand(AcceptFriendshipEvent.ID, Command.ACCEPT_FRIEND);
    commandFactory.addCommand(RemoveFriendshipEvent.ID, Command.REMOVE_FRIEND);
    commandFactory.addCommand(RenameFriendshipEvent.ID, Command.RENAME_FRIEND);
    commandFactory.addCommand(RenameGroupEvent.ID, Command.RENAME_GROUP);
    commandFactory.addSpecialCommand(SetStatusEvent.ID, SetStatusEvent.getCommandFromSetStatusEvent);
  }
}
