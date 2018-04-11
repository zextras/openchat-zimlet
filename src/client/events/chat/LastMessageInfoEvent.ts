/*
 * Copyright (C) 2018 ZeXtras S.r.l.
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

import {ILastMessageInfo} from "../../../redux/IOpenChatState";
import {ChatEvent} from "../ChatEvent";
import {OpenChatEventCode} from "./OpenChatEventCode";

export class LastMessageInfoEvent extends ChatEvent {
  private mUnreadCount: number;
  private mLastMessageSentInfo: ILastMessageInfo;
  private mLastIncomingMessageInfo: ILastMessageInfo;

  constructor(
    from: string,
    to: string,
    creationDate: Date,
    unreadCount: number,
    lastMessageSentInfo: ILastMessageInfo,
    lastIncomingMessageInfo: ILastMessageInfo,
  ) {
    super(OpenChatEventCode.LAST_MESSAGE_INFO, creationDate, false);
    this.setSender(from);
    this.setDestination(to);
    this.mUnreadCount = unreadCount;
    this.mLastMessageSentInfo = lastMessageSentInfo;
    this.mLastIncomingMessageInfo = lastIncomingMessageInfo;
  }

  public getUnreadCount(): number {
    return this.mUnreadCount;
  }

  public getLastMessageSentInfo(): ILastMessageInfo {
    return this.mLastMessageSentInfo;
  }

  public getLastIncomingMessageInfo(): ILastMessageInfo {
    return this.mLastIncomingMessageInfo;
  }

}
