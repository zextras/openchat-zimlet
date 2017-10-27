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

import {IBuddy} from "../../client/IBuddy";
import {IBuddyStatus} from "../../client/IBuddyStatus";
import {MessageReceived as MessageReceivedObj} from "../../client/MessageReceived";
import {MessageSent as MessageSentObj} from "../../client/MessageSent";
import {TimedCallbackFactory} from "../../lib/callbacks/TimedCallbackFactory";
import {DateProvider} from "../../lib/DateProvider";
import {Dwt} from "../../zimbra/ajax/dwt/core/Dwt";
import {DwtComposite} from "../../zimbra/ajax/dwt/widgets/DwtComposite";
import {MessageReceived} from "./MessageReceived";
import {MessageSent} from "./MessageSent";
import {MessageStatus} from "./MessageStatus";

export class Conversation extends DwtComposite {

  private mDateProvider: DateProvider;
  private mTimedCallbackFactory: TimedCallbackFactory;
  private mLastBuddyStatusMessages: {[name: string]: MessageStatus};

  constructor(parent: DwtComposite, dateProvider: DateProvider, timedCallbackFactory: TimedCallbackFactory) {
    super({
      className: "ZxChat_Conversation",
      parent: parent,
    });
    this.mDateProvider = dateProvider;
    this.mTimedCallbackFactory = timedCallbackFactory;
    this.mLastBuddyStatusMessages = {};
    this.setScrollStyle(Dwt.SCROLL_Y);
    this._setAllowSelection();
  }

  public addMessageReceived(message: MessageReceivedObj): void {
    const newMessage = new MessageReceived(this, message, this.mDateProvider);
    this.scrollToTop();
  }

  public addMessageSent(message: MessageSentObj): void {
    const newMessage = new MessageSent(this, message, this.mDateProvider);
    this.scrollToTop();
  }

  public addMessageStatus(buddy: IBuddy, buddyStatus: IBuddyStatus): void {
    if (this.mLastBuddyStatusMessages.hasOwnProperty(buddy.getId())) {
      this.mLastBuddyStatusMessages[buddy.getId()].setVisible(false);
    }
    this.mLastBuddyStatusMessages[buddy.getId()] = new MessageStatus(this, buddy, buddyStatus, this.mDateProvider);
    this.scrollToTop();
  }

  public scrollToTop(): void {
    this.getHtmlElement().scrollTop = this.getHtmlElement().scrollHeight;
  }

}
