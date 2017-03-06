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

import {MessageSent} from "./MessageSent";

export class MessageAckWaiter {

  private mMap: {[id: string]: MessageSent} = {};

  public addMessage(message: MessageSent): void {
    this.mMap[message.getMessageId()] = message;
  }

  /**
   * Return a message from the internal map
   */
  public getMessageById(messageId: string): MessageSent {
    return this.mMap[messageId];
  }

  /**
   * Remove the reference from the internal map
   */
  removeMessage(message: MessageSent): void {
    delete this.mMap[message.getMessageId()];
  }

}
