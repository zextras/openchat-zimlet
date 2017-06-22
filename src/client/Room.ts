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

import {BuddyStatus} from "./BuddyStatus";
import {Buddy} from "./Buddy";
import {Callback} from "../lib/callbacks/Callback";
import {MessageSent} from "./MessageSent";
import {Message} from "./Message";
import {MessageReceived} from "./MessageReceived";
import {ChatEvent} from "./events/ChatEvent";
import {MessageWritingStatus} from "./MessageWritingStatus";
import {MessageType} from "./events/chat/MessageEvent";
import {ChatPluginManager} from "../lib/plugin/ChatPluginManager";

export interface Room {

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
  getMembers(): Buddy[];

  /**
   * Add a member to the group
   */
  addMember(buddy: Buddy): void;

  /**
   * Get buddy by Id
   * @param buddyId
   * @returns {Buddy}
   */
  getBuddyById(buddyId: string): Buddy;

  /**
   * Only for Group Chat
   */
  applyBuddyStatus(buddy: Buddy): void;

  /**
   * Set a callback which will be invoked when a member is added to the room
   */
  onAddMember(callback: Callback): void;

  removeMember(buddy: Buddy): void;

  containsBuddy(buddy: Buddy): boolean;

  /**
   * Register a callback which will be invoked when a member is removed
   */
  onMemberRemoved(callback: Callback): void

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
   Add the writing status event of a buddy in this room.
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
  getRoomStatus(): BuddyStatus;

  /**
   * Try to update the room status, if is changed, run the callback.
   */
  updateRoomStatus(): void;

  /**
   * Add the nicknames of the buddies inside of the room
   */
  getNicknames(delimiter: string): string ;

  getLastActivity(): number;

  onTriggeredPopup(callback: Callback): void;

  triggerPopup(): void;

  getOfflineMessage(): string;

  setOfflineMessage(message: string): void;

}