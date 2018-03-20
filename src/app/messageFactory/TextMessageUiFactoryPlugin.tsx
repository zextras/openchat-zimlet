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

import * as React from "react";
import {Store} from "redux";
import {IMessageUiFactoryPlugin} from "./IMessageUiFactoryPlugin";

import {IOpenChatState, IOpenChatTextMessage} from "../../redux/IOpenChatState";
import {TextMessage} from "./TextMessage";

export class TextMessageUiFactoryPlugin implements IMessageUiFactoryPlugin<IOpenChatState, IOpenChatTextMessage> {

  public getMessageType(): string {
    return "message";
  }

  public getMessage(store: Store<IOpenChatState>, m: IOpenChatTextMessage, emojiSize: "32" | "16"): JSX.Element {
    return (
      <TextMessage
        emojiSize={emojiSize}
        content={m.content}
        type={m.type}
        date={m.date}
        destination={m.destination}
        id={m.id}
        sender={m.sender}
        roomType={m.roomType}
      />
    );
  }

}
