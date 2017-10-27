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

import {Command} from "../../../connection/soap/Command";
import {FriendshipEvent} from "../FriendshipEvent";

export class FriendshipInvitationEvent extends FriendshipEvent {

  public static TYPE: number = 0;

  public static getCommandFromFriendshipEvent(friendshipEvent: FriendshipEvent) {
    if (friendshipEvent.getFriendshipStatus() === FriendshipInvitationEvent.TYPE) {
      return Command.ADD_FRIEND;
    } else {
      return void 0;
    }
  }

  private mBuddyId: string;
  private mNickname: string;
  private mGroup: string;

  constructor(buddyId: string, nickname: string, group: string, creationDate: Date) {
    super(FriendshipInvitationEvent.TYPE, creationDate);
    if (typeof buddyId !== "undefined" && buddyId !== null) {
      this.setDestination(buddyId);
    }
    this.mBuddyId = buddyId;
    this.mNickname = nickname;
    this.mGroup = group;
  }

  public getBuddyId(): string {
    return this.mBuddyId;
  }

  public getNickname(): string {
    return this.mNickname;
  }

  public getGroup(): string {
    return this.mGroup;
  }

}
