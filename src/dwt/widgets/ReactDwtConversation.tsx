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

import {h} from "preact";
import {Conversation, IConversationProps} from "../../app/conversation/Conversation";

import "./ReactDwtConversation.scss";

import {Bowser} from "../../libext/bowser";
import {DwtCompositeParams} from "../../zimbra/ajax/dwt/widgets/DwtComposite";
import {ReactDwtComposite} from "./ReactDwtComposite";

export interface IReactDwtConversationParams extends DwtCompositeParams {
  props: IConversationProps;
}

export class ReactDwtConversation extends ReactDwtComposite<IConversationProps, undefined> {

  constructor(params: IReactDwtConversationParams) {
    super({
      ...params,
      className: `ReactDwtConversation${Bowser.isUnsupportedBrowser({msie: "11"}) ? "-ie" : ""}`,
    });
  }

  public render() {
    return (
      <Conversation
        dataStore={this.props.dataStore}
        roomJid={this.props.roomJid}
        messageUIFactory={this.props.messageUIFactory}
        emojiSize={this.props.emojiSize}
      />
    );
  }
}
