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
import {RoomWindowType} from "../../dwt/windows/RoomWindow";
import {RoomWindowMenuButton} from "../../dwt/windows/RoomWindowMenuButton";
import {HTMLUtils} from "../../lib/HTMLUtils";
import {IChatPlugin} from "../../lib/plugin/ChatPlugin";
import {StringUtils} from "../../lib/StringUtils";
import {IOpenChatMessage, IOpenChatState, IOpenChatTextMessage} from "../../redux/IOpenChatState";
import {AjxDispatcher} from "../../zimbra/ajax/boot/AjxDispatcher";
import {DwtMenuItem} from "../../zimbra/ajax/dwt/widgets/DwtMenuItem";
import {AjxListener} from "../../zimbra/ajax/events/AjxListener";
import {ZmOperation} from "../../zimbra/zimbraMail/core/ZmOperation";
import {ZmPopupMenu} from "../../zimbra/zimbraMail/share/view/ZmPopupMenu";

export class RoomWindowSendHistoryMenuItemPlugin implements IChatPlugin {

  public static Name = RoomWindowMenuButton.AddMenuItemPlugin;

  private static FORMAT_PLAIN: string = "plain";
  private static FORMAT_HTML: string = "html";

  private static sendHistory(store: Store<IOpenChatState>, roomJid: string): void {
    const state: IOpenChatState = store.getState();
    if (typeof state.rooms[roomJid] === "undefined") { return; }
    const body = RoomWindowSendHistoryMenuItemPlugin.getFormattedConversionHistory(
      state,
      roomJid,
      RoomWindowSendHistoryMenuItemPlugin.FORMAT_PLAIN,
    );
    const nicknames: string[] = [];
    for (const message of state.rooms[roomJid].messages) {
      let user: string = message.sender;
      if (user !== state.sessionInfo.username) {
        if (typeof state.buddyList[user] !== "undefined") {
          user = state.buddyList[user].nickname;
        }
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
    state: IOpenChatState,
    roomJid: string,
    format: string = RoomWindowSendHistoryMenuItemPlugin.FORMAT_PLAIN,
  ): string {
    switch (format) {
      case RoomWindowSendHistoryMenuItemPlugin.FORMAT_HTML:
        return RoomWindowSendHistoryMenuItemPlugin.getHtmlFormattedHistory(
          state,
          roomJid,
        );
      default:
        return RoomWindowSendHistoryMenuItemPlugin.getPlainFormattedHistory(
          state,
          roomJid,
        );
    }
  }

  /**
   * Get the history of the conversation in HTML
   */
  private static getHtmlFormattedHistory(
    state: IOpenChatState,
    roomJid: string,
  ): string {
    return RoomWindowSendHistoryMenuItemPlugin.getPlainFormattedHistory(
      state,
      roomJid,
    );
  }

  /**
   * Get the history of the conversation in plain text
   */
  private static getPlainFormattedHistory(
    state: IOpenChatState,
    roomJid: string,
  ): string {
    const textPlain = [];
    const messages: IOpenChatMessage[] = state.rooms[roomJid].messages;
    for (
      let i = (messages.length > 50) ? (messages.length - 50) : 0;
      i < state.rooms[roomJid].messages.length;
      i++
    ) {
    // for (const message of state.rooms[roomJid].messages) {
      const message: IOpenChatMessage = messages[i];
      if (message.type === "message") {
        if (message.sender === state.sessionInfo.username) {
          const user: string = StringUtils.getMessage("Me");
          const date: string = message.date.toLocaleString();
          const text: string = (message as IOpenChatTextMessage).content;
          textPlain.push("[" + date + "] " + user + ": " + HTMLUtils.htmlUnEscape(text));
        } else {
          let user: string = message.sender;
          if (typeof state.buddyList[user] !== "undefined") {
            user = state.buddyList[user].nickname;
          }
          const date: string = message.date.toLocaleString();
          const text: string = (message as IOpenChatTextMessage).content;
          textPlain.push("[" + date + "] " + user + ": " + HTMLUtils.htmlUnEscape(text));
        }
      }
    }
    return textPlain.join("\n");
  }

  private mStore: Store<IOpenChatState>;

  constructor(
    store: Store<IOpenChatState>,
  ) {
    this.mStore = store;
  }

  public trigger(roomWindow: RoomWindowType, menu: ZmPopupMenu): void {
     const sendHistory: DwtMenuItem = menu.createMenuItem(
      "ZxChat_MenuItem_NewMail",
      {
        image: "fa fas fal fa-share",
        text: StringUtils.getMessage("send_email_conversation"),
      },
     );
     sendHistory.addSelectionListener(
      new AjxListener(
        null,
        RoomWindowSendHistoryMenuItemPlugin.sendHistory,
        [this.mStore, roomWindow.getId()],
      ),
    );
  }

}
