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

import {IRoom} from "../../client/IRoom";
import {Message} from "../../client/Message";
import {MessageReceived} from "../../client/MessageReceived";
import {MessageSent} from "../../client/MessageSent";
import {Room} from "../../client/Room";
import {RoomWindow} from "../../dwt/windows/RoomWindow";
import {RoomWindowMenuButton} from "../../dwt/windows/RoomWindowMenuButton";
import {DateProvider} from "../../lib/DateProvider";
import {HTMLUtils} from "../../lib/HTMLUtils";
import {IChatPlugin} from "../../lib/plugin/ChatPlugin";
import {StringUtils} from "../../lib/StringUtils";
import {AjxDispatcher} from "../../zimbra/ajax/boot/AjxDispatcher";
import {DwtMenuItem} from "../../zimbra/ajax/dwt/widgets/DwtMenuItem";
import {AjxListener} from "../../zimbra/ajax/events/AjxListener";
import {ZmOperation} from "../../zimbra/zimbraMail/core/ZmOperation";
import {ZmPopupMenu} from "../../zimbra/zimbraMail/share/view/ZmPopupMenu";
import {RoomHistoryFieldPlugin} from "./RoomHistoryFieldPlugin";

export class RoomWindowSendHistoryMenuItemPlugin implements IChatPlugin {

  public static Name = RoomWindowMenuButton.AddMenuItemPlugin;

  private static sendHistory(roomWindow: RoomWindow): void {
    const body = RoomWindowSendHistoryMenuItemPlugin.getFormattedConversionHistory(
      roomWindow.getRoom(),
      roomWindow.getDateProvider(),
      Room.FORMAT_PLAIN,
    );
    const nicknames: string[] = [];
    const history: Message[] = roomWindow.getRoom().getPluginManager().getFieldPlugin(RoomHistoryFieldPlugin.FieldName);
    for (const message of history) {
      if (message instanceof MessageReceived) {
        const user = (message as MessageReceived).getSender().getNickname();
        let alreadyAdded: boolean = false;
        for (const nickname of nicknames) {
          if (nickname === user) {
            alreadyAdded = true;
            break;
          }
        }
        if (!alreadyAdded) {
          nicknames.push(user);
        }
      }
    }
    const email: {} = {
      action: ZmOperation.NEW_MESSAGE,
      composeMode: "text/plain",
      extraBodyText: body,
      subjOverride: StringUtils.getMessage(
        "mail_title_prefix_chat_conversation",
        [nicknames.join(", ")],
      ),
    };
    AjxDispatcher.run("Compose", email);
  }

  /**
   * Get the history of the conversation in a human-readable format
   */
  private static getFormattedConversionHistory(
    room: IRoom,
    dateProvider: DateProvider,
    format: string = Room.FORMAT_PLAIN,
  ): string {
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
  private static getHtmlFormattedHistory(room: IRoom, dateProvider: DateProvider): string {
    return RoomWindowSendHistoryMenuItemPlugin.getPlainFormattedHistory(room, dateProvider);
  }

  /**
   * Get the history of the conversation in plain text
   */
  private static getPlainFormattedHistory(room: IRoom, dateProvider: DateProvider): string {
    const textPlain = [];
    const history: Message[] = room.getPluginManager().getFieldPlugin(RoomHistoryFieldPlugin.FieldName);
    for (const message of history) {
      if (message instanceof MessageReceived) {
        const user = (message as MessageReceived).getSender().getNickname();
        const date = StringUtils.localizeHour(message.getDate(), dateProvider.getNow());
        const text = message.getMessage();
        textPlain.push("[" + date + "] " + user + ": " + HTMLUtils.htmlUnEscape(text));
      }
      if (message instanceof MessageSent) {
        const user = StringUtils.getMessage("Me");
        const date = StringUtils.localizeHour(message.getDate(), dateProvider.getNow());
        const text = message.getMessage();
        textPlain.push("[" + date + "] " + user + ": " + HTMLUtils.htmlUnEscape(text));
      }
    }
    return textPlain.join("\n");
  }

  public trigger(roomWindow: RoomWindow, menu: ZmPopupMenu): void {
     const sendHistory: DwtMenuItem = menu.createMenuItem(
      "ZxChat_MenuItem_NewMail",
      {
        text: StringUtils.getMessage("send_email_conversation"),
      },
     );
     sendHistory.addSelectionListener(
      new AjxListener(null, RoomWindowSendHistoryMenuItemPlugin.sendHistory, [roomWindow]),
    );
  }

}
