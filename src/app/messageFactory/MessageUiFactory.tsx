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

import {Component, h} from "preact";
import {Store} from "redux";

import {IOpenChatBuddyListMap, IOpenChatMessage, IOpenChatState} from "../../redux/IOpenChatState";
import {IMessageUiFactory} from "./IMessageUiFactory";
import {IMessageUiFactoryPlugin} from "./IMessageUiFactoryPlugin";
import {MessageReceived} from "./MessageReceived";
import {MessageSent} from "./MessageSent";
import {MessageStatusType} from "./MessageStatusType";

export class MessageUiFactory<T extends IOpenChatState> implements IMessageUiFactory<T> {

  private mPlugins: {[messageType: string]: IMessageUiFactoryPlugin<T, IOpenChatMessage>};

  constructor() {
    this.mPlugins = {};
  }

  public addPlugin(plugin: IMessageUiFactoryPlugin<T, IOpenChatMessage>): void {
    if (this.mPlugins.hasOwnProperty(plugin.getMessageType())) {
      throw new Error(`Plugin for message type '${plugin.getMessageType()}' already added.`);
    }
    this.mPlugins[plugin.getMessageType()] = plugin;
  }

  public getMessage(
    store: Store<T>,
    message: IOpenChatMessage,
    emojiSize: "16" | "32",
  ): JSX.Element {
    if (!this.mPlugins.hasOwnProperty(message.type)) {
      // Add a warning or something;
      return null;
    } else {
      const status: IMessageUiFactoryMessageStatus = this.getStatusAndReadByWho(store, message);
      if (this.isSentByMe(store, message)) {
        return (
          <MessageSent
            key={message.id}
            date={message.date}
            status={status.status}
            readBy={status.bl}
            username={"Me"}
          >
            {this.mPlugins[message.type].getMessage(store, message, emojiSize)}
          </MessageSent>
        );
      } else {
        return (
          <MessageReceived
            key={message.id}
            date={message.date}
            status={status.status}
            readBy={status.bl}
            username={this.getNicknameFromSender(store, message.sender)}
          >
            {this.mPlugins[message.type].getMessage(store, message, emojiSize)}
          </MessageReceived>
        );
      }
    }
  }

  public isSentByMe(dataStore: Store<T>, message: IOpenChatMessage): boolean {
    return dataStore.getState().sessionInfo.username === message.sender;
  }

  protected getNicknameFromSender(
    dataStore: Store<T>,
    sender: string,
  ): string {
    let senderAddress: string;
    let senderSource: string;
    if (sender.indexOf("/") !== -1) {
      senderAddress = sender.substring(0, sender.indexOf("/"));
      senderSource = sender.substring(sender.indexOf("/") + 1);
    } else {
      senderAddress = sender;
    }
    if (typeof senderSource !== "undefined") {
      if (dataStore.getState().buddyList.hasOwnProperty(senderSource)) {
        return dataStore.getState().buddyList[senderSource].nickname;
      } else {
        return senderSource;
      }
    } else {
      if (dataStore.getState().buddyList.hasOwnProperty(senderAddress)) {
        return dataStore.getState().buddyList[senderAddress].nickname;
      } else {
        return senderAddress;
      }
    }
  }

  protected getStatusAndReadByWho(
    dataStore: Store<T>,
    message: IOpenChatMessage,
  ): IMessageUiFactoryMessageStatus {
    if (this.isSentByMe(dataStore, message)) {
      if (/^TEMP\-/.test(message.id)) {
        return { status: MessageStatusType.SENDING };
      } else if (/^FAIL\-/.test(message.id)) {
        return { status: MessageStatusType.FAILED };
      } else {
        if (
          dataStore.getState().roomAcks.hasOwnProperty(message.destination)
          && dataStore.getState().roomAcks[message.destination].hasOwnProperty(message.destination)
          && (
            dataStore.getState().roomAcks[message.destination][message.destination].lastMessageDate.getTime()
            < message.date.getTime()
          )
        ) {
          return { status: MessageStatusType.SENT};
        } else {
          return { status: MessageStatusType.READ_BY_ALL};
        }
      }
    } else {
      return { status: MessageStatusType.READ_BY_ALL};
    }
  }

}

export interface IMessageUiFactoryMessageStatus {
  bl?: IOpenChatBuddyListMap;
  status: MessageStatusType;
}
