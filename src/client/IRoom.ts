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

import {Callback} from "../lib/callbacks/Callback";
import {ChatPluginManager} from "../lib/plugin/ChatPluginManager";
import {MessageType} from "./events/chat/MessageEvent";
import {ChatEvent} from "./events/ChatEvent";
import {IBuddy} from "./IBuddy";
import {IBuddyStatus} from "./IBuddyStatus";
import {MessageReceived} from "./MessageReceived";
import {MessageSent} from "./MessageSent";
import {MessageWritingStatus} from "./MessageWritingStatus";

export interface IRoom {

  getPluginManager(): ChatPluginManager;

  /**
   * Get the room id
   */
  getId(): string;

  /**
   * Get the room title
   */
  getTitle(): string;

  /**
   * Set the room title
   */
  setTitle(title: string): void;

  /**
   * Set a callback which will be invoked when the title of the room is changed.
   */
  onTitleChange(callback: Callback): void;

  /**
   * Get the members of the room
   */
  getMembers(): IBuddy[];

  /**
   * Add a member to the group
   */
  addMember(buddy: IBuddy): void;

  /**
   * Get buddy by Id
   * @param buddyId
   * @returns {IBuddy}
   */
  getBuddyById(buddyId: string): IBuddy;

  /**
   * Only for Group Chat
   */
  applyBuddyStatus(buddy: IBuddy): void;

  /**
   * Set a callback which will be invoked when a member is added to the room
   */
  onAddMember(callback: Callback): void;

  removeMember(buddy: IBuddy): void;

  containsBuddy(buddy: IBuddy): boolean;

  /**
   * Register a callback which will be invoked when a member is removed
   */
  onMemberRemoved(callback: Callback): void;

  /**
   * Add a message sent
   */
  addMessageSent(message: MessageSent): void;

  /**
   * Add a message sent from another session
   */
  addMessageSentFromAnotherSession(message: MessageSent): void;

  onAddMessageSent(callback: Callback): void;

  onAddMessageSentFromAnotherSession(callback: Callback): void;

  /**
   * Add a message received
   */
  addMessageReceived(message: MessageReceived): void;

  onAddMessageReceived(callback: Callback): void;

  /**
   * Set a callback invoked when a send event is requested
   */
  onSendEvent(callback: Callback): void;

  _sendEvent(event: ChatEvent, callback?: Callback, errorCallback?: Callback): void;

  /**
   * Set a callback invoked when a send message is requested
   */
  onSendMessage(callback: Callback): void;

  /**
   * Send a message to the room
   */
  sendMessage(message: string, messageType?: MessageType): void;

  /**
   * Send the writing status when one-to-one-chat
   */
  sendWritingStatus(value: number, callback?: Callback, errorCallback?: Callback): void;

  /**
   * Add the writing status event of a buddy in this room.
   */
  addWritingStatusEvent(writingStatus: MessageWritingStatus): void;

  /**
   * Set a callback which will be invoked when a buddy of the room change its status
   */
  onBuddyStatusChange(callback: Callback): void;

  /**
   * Set a callback which will be invoked when a buddy of the room change its status
   */
  onRoomStatusChange(callback: Callback): void;

  onBuddyWritingStatus(callback: Callback): void;

  /**
   * Handle the change of a nickname
   */
  _onNicknameChange(nickname: string): void;

  /**
   * Get the current room status
   */
  getRoomStatus(): IBuddyStatus;

  /**
   * Try to update the room status, if is changed, run the callback.
   */
  updateRoomStatus(): void;

  /**
   * Add the nicknames of the buddies inside of the room
   */
  getNicknames(delimiter: string): string ;

  getLastActivity(): number;

  onTriggeredPopup(callback: () => void): void;

  triggerPopup(): void;

  onTriggeredInputFocus(callback: () => void): void;

  triggerInputFocus(): void;

}
