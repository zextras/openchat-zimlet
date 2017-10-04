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

import {FriendshipInvitationEvent} from "../../events/chat/friendship/FriendshipInvitationEvent";
import {OpenChatEventCode} from "../../events/chat/OpenChatEventCode";
import {SetStatusEvent} from "../../events/chat/SetStatusEvent";
import {CommandFactory} from "../CommandFactory";
import {Command} from "./Command";

export class SoapCommands {

  public static registerCommands(commandFactory: CommandFactory): void {
    commandFactory.addCommand(OpenChatEventCode.MESSAGE, Command.SEND_MESSAGE);
    commandFactory.addSpecialCommand(OpenChatEventCode.FRIENDSHIP, FriendshipInvitationEvent.getCommandFromFriendshipEvent);
    commandFactory.addCommand(OpenChatEventCode.WRITING_STATUS, Command.NOTIFY_WRITING);
    commandFactory.addCommand(OpenChatEventCode.MESSAGE_ACK, Command.NOTIFY_MSG_RECEIVED);
    commandFactory.addCommand(OpenChatEventCode.PING, Command.PING);
    commandFactory.addCommand(OpenChatEventCode.REGISTER_SESSION, Command.REGISTER_SESSION);
    commandFactory.addCommand(OpenChatEventCode.UNREGISTER_SESSION, Command.UNREGISTER_SESSION);
    commandFactory.addCommand(OpenChatEventCode.ACCEPT_FRIENDSHIP, Command.ACCEPT_FRIEND);
    commandFactory.addCommand(OpenChatEventCode.REMOVE_FRIENDSHIP, Command.REMOVE_FRIEND);
    commandFactory.addCommand(OpenChatEventCode.RENAME_FRIENDSHIP, Command.RENAME_FRIEND);
    commandFactory.addCommand(OpenChatEventCode.RENAME_GROUP, Command.RENAME_GROUP);
    commandFactory.addSpecialCommand(OpenChatEventCode.SET_STATUS, SetStatusEvent.getCommandFromSetStatusEvent);
  }
}
