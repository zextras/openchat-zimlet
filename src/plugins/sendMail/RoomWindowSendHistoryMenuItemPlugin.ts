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

import {ChatPlugin} from "../../lib/plugin/ChatPlugin";
import {RoomWindowMenuButton} from "../../dwt/windows/RoomWindowMenuButton";
import {RoomWindow} from "../../dwt/windows/RoomWindow";
import {ZmPopupMenu} from "../../zimbra/zimbraMail/share/view/ZmPopupMenu";
import {DwtMenuItem} from "../../zimbra/ajax/dwt/widgets/DwtMenuItem";
import {StringUtils} from "../../lib/StringUtils";
import {AjxListener} from "../../zimbra/ajax/events/AjxListener";
import {Room} from "../../client/Room";
import {ZmOperation} from "../../zimbra/zimbraMail/core/ZmOperation";
import {AjxDispatcher} from "../../zimbra/ajax/boot/AjxDispatcher";
import {DateProvider} from "../../lib/DateProvider";
import {Message} from "../../client/Message";
import {RoomHistoryFieldPlugin} from "./RoomHistoryFieldPlugin";
import {MessageReceived} from "../../client/MessageReceived";
import {HTMLUtils} from "../../lib/HTMLUtils";
import {MessageSent} from "../../client/MessageSent";

export class RoomWindowSendHistoryMenuItemPlugin implements ChatPlugin {

  public static Name = RoomWindowMenuButton.AddMenuItemPlugin;

  public trigger(roomWindow: RoomWindow, menu: ZmPopupMenu): void {
     let sendHistory: DwtMenuItem = menu.createMenuItem(
      "ZxChat_MenuItem_NewMail",
      {
        text: StringUtils.getMessage("send_email_conversation")
      }
     );
    sendHistory.addSelectionListener(
      new AjxListener(null, RoomWindowSendHistoryMenuItemPlugin.sendHistory, [roomWindow])
    );
  }

  private static sendHistory(roomWindow: RoomWindow): void {
    let body = RoomWindowSendHistoryMenuItemPlugin.getFormattedConversionHistory(
      roomWindow.room,
      roomWindow.dateProvider,
      Room.FORMAT_PLAIN
    );
    let recipients: string = "",
      nicknames: string[] = [];
    for (let buddy of roomWindow.room.getMembers()) {
      nicknames.push(buddy.getNickname());
      recipients += "\"" + buddy.getNickname() + "\" <" + buddy.getId() + ">;";
    }
    let email: {} = {
      action: ZmOperation.NEW_MESSAGE,
      subjOverride: StringUtils.getMessage("mail_title_prefix_chat_conversation", [nicknames.join(", ")]),
      toOverride: recipients,
      extraBodyText: body,
      composeMode: "text/plain"
    };
    AjxDispatcher.run("Compose", email);
  }

  /**
   * Get the history of the conversation in a human-readable format
   */
  private static getFormattedConversionHistory(room: Room, dateProvider: DateProvider, format: string = Room.FORMAT_PLAIN): string {
    switch (format) {
      case Room.FORMAT_HTML:
        return RoomWindowSendHistoryMenuItemPlugin.getHtmlFormattedHistory(room, dateProvider);
      default:
        return RoomWindowSendHistoryMenuItemPlugin.getPlainFormattedHistory(room, dateProvider);
    }
  }

  /**
   * Get the history of the conversation in HTML
   */
  private static getHtmlFormattedHistory(room: Room, dateProvider: DateProvider): string {
    return RoomWindowSendHistoryMenuItemPlugin.getPlainFormattedHistory(room, dateProvider);
  }

  /**
   * Get the history of the conversation in plain text
   */
  private static getPlainFormattedHistory(room: Room, dateProvider: DateProvider): string {
    let textPlain = [];
    let history: Message[] = room.getPluginManager().getFieldPlugin(RoomHistoryFieldPlugin.FieldName);
    for (let message of history) {
      if (message instanceof MessageReceived) {
        let user = (<MessageReceived>message).getSender().getNickname();
        let date = StringUtils.localizeHour(message.getDate(), dateProvider.getNow());
        let text = message.getMessage();
        textPlain.push("[" + date + "] " + user + ": " + HTMLUtils.htmlUnEscape(text));
      }
      if (message instanceof MessageSent) {
        let user = StringUtils.getMessage("Me");
        let date = StringUtils.localizeHour(message.getDate(), dateProvider.getNow());
        let text = message.getMessage();
        textPlain.push("[" + date + "] " + user + ": " + HTMLUtils.htmlUnEscape(text));
      }
    }
    return textPlain.join("\n");
  }
}
