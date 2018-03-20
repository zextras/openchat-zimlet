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
import {CallbackManager} from "../lib/callbacks/CallbackManager";
import {IDateProvider} from "../lib/IDateProvider";
import {ChatPluginManager} from "../lib/plugin/ChatPluginManager";
import {BuddyStatus} from "./BuddyStatus";
import {BuddyStatusType} from "./BuddyStatusType";
import {WritingStatusEvent} from "./events/chat/WritingStatusEvent";
import {IChatEvent} from "./events/IChatEvent";
import {IBuddy} from "./IBuddy";
import {IBuddyStatus} from "./IBuddyStatus";
import {IRoom} from "./IRoom";
import {Message} from "./Message";
import {MessageReceived} from "./MessageReceived";
import {MessageSent} from "./MessageSent";
import {MessageWritingStatus} from "./MessageWritingStatus";

import {Store} from "redux";
import {IOpenChatState} from "../redux/IOpenChatState";

export class Room implements IRoom {

  // public static Plugin = "IRoom";
  public static MessageSentPlugin = "Room Message Sent";
  public static MessageSentFromAnotherSessionPlugin = "Room Message Sent From Another Session";
  public static MessageReceivedPlugin = "Room Message Received";
  public static WritingStatusPlugin = "Room Writing Status Plugin";

  private id: string;
  private title: string;
  private mDateProvider: IDateProvider;
  private mLastActivity: number = 0;
  private members: IBuddy[];
  private mRoomStatus: IBuddyStatus;
  private onTitleChangeCallbacks: CallbackManager;
  private onAddMemberCallbacks: CallbackManager;
  private onRemovedMemberCallbacks: CallbackManager;
  private onSendEventCallbacks: CallbackManager;
  private onSendMessageCallbacks: CallbackManager;
  private onAddMessageReceivedCallbacks: CallbackManager;
  private onAddMessageSentCallbacks: CallbackManager;
  private onAddMessageSentFromAnotherSessionCallbacks: CallbackManager;
  private onBuddyStatusChangeCallbacks: CallbackManager;
  private onRoomStatusChangeCallbacks: CallbackManager;
  private onBuddyWritingStatusCallbacks: CallbackManager;
  private mTriggerPopupCallbacks: Array<() => void> = [];
  private mTriggerInputFocusCallbacks: Array<() => void> = [];
  private mRoomPluginManager: ChatPluginManager;
  private mStore: Store<IOpenChatState>;

  constructor(
    id: string,
    title: string,
    dateProvider: IDateProvider,
    roomPluginManager: ChatPluginManager,
    store: Store<IOpenChatState>,
  ) {
    this.id = id;
    this.title = title;
    this.mDateProvider = dateProvider;
    this.mStore = store;
    this.members = [];
    this.mRoomStatus = new BuddyStatus(BuddyStatusType.OFFLINE, "Offline", 0);
    this.onTitleChangeCallbacks = new CallbackManager();
    this.onAddMemberCallbacks = new CallbackManager();
    this.onAddMember(new Callback(this, this.updateRoomStatus));
    this.onRemovedMemberCallbacks = new CallbackManager();
    this.onMemberRemoved(new Callback(this, this.updateRoomStatus));
    this.onSendEventCallbacks = new CallbackManager();
    this.onSendMessageCallbacks = new CallbackManager();
    if (typeof this.mStore === "undefined") {
      this.onSendMessage(new Callback(this, this.addMessageSent));
    }
    this.onAddMessageReceivedCallbacks = new CallbackManager();
    this.onAddMessageSentCallbacks = new CallbackManager();
    this.onAddMessageSentFromAnotherSessionCallbacks = new CallbackManager();
    this.onBuddyStatusChangeCallbacks = new CallbackManager();
    this.onBuddyStatusChange(new Callback(this, this.updateRoomStatus));
    this.onRoomStatusChangeCallbacks = new CallbackManager();
    this.onBuddyWritingStatusCallbacks = new CallbackManager();
    this.mRoomPluginManager = roomPluginManager;
    this.mRoomPluginManager.switchOn(this);
  }

  public getPluginManager(): ChatPluginManager {
    return this.mRoomPluginManager;
  }

  /**
   * Get the room id
   */
  public getId(): string {
    return this.id;
  }

  /**
   * Get the room title
   */
  public getTitle() {
    return this.title;
  }

  public getStore(): Store<IOpenChatState> {
    return this.mStore;
  }

  /**
   * Set the room title
   */
  public setTitle(title: string): void {
    this.title = title;
    this.onTitleChangeCallbacks.run(this.title);
  }

  /**
   * Set a callback which will be invoked when the title of the room is changed.
   */
  public onTitleChange(callback: Callback): void {
    this.onTitleChangeCallbacks.addCallback(callback);
  }

  /**
   * Get the members of the room
   */
  public getMembers(): IBuddy[] {
    return this.members;
  }

  /**
   * Add a member to the group
   */
  public addMember(buddy: IBuddy): void {
    this.members.push(buddy);
    buddy.onStatusChange(new Callback(this, this._onBuddyStatusChange));
    buddy.onNicknameChange(new Callback(this, this._onNicknameChange));
    this.onAddMemberCallbacks.run(buddy);
  }

  /**
   * Get buddy by Id
   * @param buddyId
   * @returns {IBuddy}
   */
  public getBuddyById(buddyId: string): IBuddy {
    for (const intBuddy of this.members) {
      if (buddyId === intBuddy.getId()) {
        return intBuddy;
      }
    }
  }

  /**
   * Only for Group Chat
   */
  public applyBuddyStatus(buddy: IBuddy): void {
    for (const intBuddy of this.members) {
      if (buddy.getId() === intBuddy.getId()) {
        intBuddy.setStatus(buddy.getStatus());
      }
    }
  }

  /**
   * Set a callback which will be invoked when a member is added to the room
   */
  public onAddMember(callback: Callback): void {
    this.onAddMemberCallbacks.addCallback(callback);
  }

  public removeMember(buddy: IBuddy): void {
    const idx: number[] = [];
    let index: number = -1;
    for (const intBuddy of this.members) {
      index++;
      if (!(buddy.getId() === intBuddy.getId())) {
        continue;
      }
      idx.push(index);
    }
    idx.reverse();
    for (const tmpIndex of idx) {
      const spliced = this.members.splice(tmpIndex, 1);
      this.onRemovedMemberCallbacks.run(spliced);
    }
  }

  public containsBuddy(buddy: IBuddy): boolean {
    for (const intBuddy of this.members) {
      if (buddy.getId() === intBuddy.getId()) {
        return true;
      }
    }
    return false;
  }

  /**
   * Register a callback which will be invoked when a member is removed
   */
  public onMemberRemoved(callback: Callback): void {
    return this.onRemovedMemberCallbacks.addCallback(callback);
  }

  /**
   * Add a message sent
   */
  public addMessageSent(message: MessageSent): void {
    this.setLastActivity(message);
    this.onAddMessageSentCallbacks.run(message);
  }

  /**
   * Add a message sent from another session
   */
  public addMessageSentFromAnotherSession(message: MessageSent, index?: number) {
    // this.getPluginManager().triggerPlugins(Room.MessageSentFromAnotherSessionPlugin, message, index);
    this.setLastActivity(message);
    this.onAddMessageSentFromAnotherSessionCallbacks.run(message);
  }

  public onAddMessageSent(callback: Callback): void {
    this.onAddMessageSentCallbacks.addCallback(callback);
  }

  public onAddMessageSentFromAnotherSession(callback: Callback): void {
    this.onAddMessageSentFromAnotherSessionCallbacks.addCallback(callback);
  }

  /**
   * Add a message received
   */
  public addMessageReceived(message: MessageReceived, index?: number): void {
    // this.getPluginManager().triggerPlugins(Room.MessageReceivedPlugin, message, index);
    this.setLastActivity(message);
    this.onAddMessageReceivedCallbacks.run(message);
  }

  public onAddMessageReceived(callback: Callback): void {
    this.onAddMessageReceivedCallbacks.addCallback(callback);
  }

  /**
   * Set a callback invoked when a send event is requested
   */
  public onSendEvent(callback: Callback): void {
    this.onSendEventCallbacks.addCallback(callback);
  }

  public _sendEvent(event: IChatEvent, callback?: Callback, errorCallback?: Callback): void {
    this.onSendEventCallbacks.run(event, callback, errorCallback);
  }

  /**
   * Set a callback invoked when a send message is requested
   */
  public onSendMessage(callback: Callback) {
    this.onSendMessageCallbacks.addCallback(callback);
  }

  /**
   * Send a message to the room
   */
  public sendMessage(message: string): void {
    const tempMessageId: string = Math.random().toString(36).substring(2, 10);
    const msgObj = new MessageSent(tempMessageId, this.getId(), this.mDateProvider.getNow(), message);
    msgObj.setDelivered();
    // this.getPluginManager().triggerPlugins(Room.MessageSentPlugin, msgObj);
    this.onSendMessageCallbacks.run(msgObj);
  }

  /**
   * Send the writing status when one-to-one-chat
   */
  public sendWritingStatus(value: number, callback?: Callback, errorCallback?: Callback): void {
    // if (!this.isGroupChat()) {
      for (const member of this.members) {
        const event = new WritingStatusEvent(
          null,
          member.getId(),
          this.mDateProvider.getNow(),
          this.mDateProvider.getNow(),
          value,
        );
        this._sendEvent(event, callback, errorCallback);
      }
    // }
  }

  /**
   * Add the writing status event of a buddy in this room.
   */
  public addWritingStatusEvent(writingStatus: MessageWritingStatus): void {
    // this.getPluginManager().triggerPlugins(Room.WritingStatusPlugin, writingStatus);
    this.setLastActivity(writingStatus);
    this.onBuddyWritingStatusCallbacks.run(writingStatus);
  }

  /**
   * Set a callback which will be invoked when a buddy of the room change its status
   */

  public onBuddyStatusChange(callback: Callback): void {
    this.onBuddyStatusChangeCallbacks.addCallback(callback);
  }

  /**
   * Set a callback which will be invoked when a buddy of the room change its status
   */
  public onRoomStatusChange(callback: Callback): void {
    this.onRoomStatusChangeCallbacks.addCallback(callback);
  }

  public onBuddyWritingStatus(callback: Callback): void {
    this.onBuddyWritingStatusCallbacks.addCallback(callback);
  }

  /**
   * Handle the change of a nickname
   */
  public _onNicknameChange(nickname: string): void {
    if (this.members.length === 1) {
      this.setTitle(nickname);
    }
  }

  /**
   * Get the current room status
   */
  public getRoomStatus(): IBuddyStatus {
    return this.mRoomStatus;
  }

  /**
   * Try to update the room status, if is changed, run the callback.
   */
  public updateRoomStatus(): void {
    const oldStatusType = this.mRoomStatus.getType();
    const newStatus = this._calculateRoomStatus();
    if (oldStatusType !== newStatus.getType()) {
      this.mRoomStatus = newStatus;
      this._onRoomStatusChange(this.mRoomStatus);
    }
  }

  /**
   * Add the nicknames of the buddies inside of the room
   */
  public getNicknames(delimiter: string = ", "): string {
    const buddies = [];
    for (const buddy of this.members) {
      buddies.push(buddy.getNickname());
    }
    return buddies.join(delimiter);
  }

  public getLastActivity(): number  {
    return this.mLastActivity;
  }

  public onTriggeredPopup(callback: () => void): void {
      this.mTriggerPopupCallbacks.push(callback);
  }

  public triggerPopup(): void {
    for (const callback of this.mTriggerPopupCallbacks) {
      callback();
    }
  }

  public onTriggeredInputFocus(callback: () => void): void {
      this.mTriggerInputFocusCallbacks.push(callback);
  }

  public triggerInputFocus(): void {
    for (const callback of this.mTriggerInputFocusCallbacks) {
      callback();
    }
  }

  /**
   * Manage the status change of a buddy
   */
  private _onBuddyStatusChange(buddy: IBuddy, status: IBuddyStatus): void {
    this.onBuddyStatusChangeCallbacks.run(buddy, status);
  }

  /**
   * Manage the status change of a buddy
   */
  private _onRoomStatusChange(status: IBuddyStatus): void {
    this.onRoomStatusChangeCallbacks.run(status);
  }

  /**
   * Get the status of the room, the status is based on the 'best' status of
   * the room members.
   */
  private _calculateRoomStatus(): IBuddyStatus {
    let bestStatus: IBuddyStatus = new BuddyStatus(BuddyStatusType.OFFLINE, "Offline", 0);
    for (const buddy of this.members) {
      if (buddy.getStatus().isMoreAvailableThan(bestStatus)) {
        bestStatus = buddy.getStatus();
      }
    }
    return bestStatus;
  }

  private setLastActivity(message: Message) {
    if ((typeof message.getDate !== "undefined") && message.getDate().getMilliseconds() > this.mLastActivity) {
      this.mLastActivity = message.getDate().getMilliseconds();
    }
  }

}
