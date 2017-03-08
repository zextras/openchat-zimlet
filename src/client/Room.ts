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

import {BuddyStatusType} from "./BuddyStatusType";
import {CallbackManager} from "../lib/callbacks/CallbackManager";
import {BuddyStatus} from "./BuddyStatus";
import {DateProvider} from "../lib/DateProvider";
import {Buddy} from "./Buddy";
import {Callback} from "../lib/callbacks/Callback";
import {MessageSent} from "./MessageSent";
import {Message} from "./Message";
import {MessageReceived} from "./MessageReceived";
import {ChatEvent} from "./events/ChatEvent";
import {WritingStatusEvent} from "./events/chat/WritingStatusEvent";
import {StringUtils} from "../lib/StringUtils";
import {Logger} from "../lib/log/Logger";
import {MessageWritingStatus} from "./MessageWritingStatus";
import {MessageType} from "./events/chat/MessageEvent";
import {ChatPluginManager} from "../lib/plugin/ChatPluginManager";

export class Room {

  public static Plugin = "Room";
  public static MessageSentPlugin = "Room Message Sent";
  public static MessageSentFromAnotherSessionPlugin = "Room Message Sent From Another Session";
  public static MessageReceivedPlugin = "Room Message Received";
  public static WritingStatusPlugin = "Room Writing Status Plugin";

  public static FORMAT_PLAIN: string = "plain";
  public static FORMAT_HTML: string = "html";

  private id: string;
  private title: string;
  private mDateProvider: DateProvider;
  private mLastActivity: number = 0;
  private members: Buddy[];
  // private jingleSession: any;
  // private videoChatEnabled: boolean;
  // private featureCallsSupported: boolean;
  private roomStatus: BuddyStatus;
  private mOfflineMessage: string;
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
  // private onNewJingleSessionCallbacks: CallbackManager;
  // private onStartJingleSessionCallbacks: CallbackManager;
  // private onEnableDisableCallsFeatureCallbacks: CallbackManager;
  // private onEnableDisableVideoChatCallbacks: CallbackManager;
  private onTriggeredPopupCallbacks: CallbackManager;
  private mRoomPluginManager: ChatPluginManager;
  protected Log: Logger;

  constructor(
    id: string,
    title: string,
    dateProvider: DateProvider,
    roomPluginManager: ChatPluginManager
  ) {
    this.id = id;
    this.title = title;
    this.mDateProvider = dateProvider;
    this.members = [];
    // this.jingleSession = null;
    // this.videoChatEnabled = true;
    // this.featureCallsSupported = false;
    this.roomStatus = new BuddyStatus(BuddyStatusType.OFFLINE, "Offline", 0);
    this.onTitleChangeCallbacks = new CallbackManager();
    this.onAddMemberCallbacks = new CallbackManager();
    this.onAddMember(new Callback(this, this.updateRoomStatus));
    this.onRemovedMemberCallbacks = new CallbackManager();
    this.onMemberRemoved(new Callback(this, this.updateRoomStatus));
    this.onSendEventCallbacks = new CallbackManager();
    this.onSendMessageCallbacks = new CallbackManager();
    this.onSendMessage(new Callback(this, this.addMessageSent));
    this.onAddMessageReceivedCallbacks = new CallbackManager();
    this.onAddMessageSentCallbacks = new CallbackManager();
    this.onAddMessageSentFromAnotherSessionCallbacks = new CallbackManager();
    this.onBuddyStatusChangeCallbacks = new CallbackManager();
    this.onBuddyStatusChange(new Callback(this, this.updateRoomStatus));
    this.onRoomStatusChangeCallbacks = new CallbackManager();
    this.onBuddyWritingStatusCallbacks = new CallbackManager();
    // this.onNewJingleSessionCallbacks = new CallbackManager();
    // this.onStartJingleSessionCallbacks = new CallbackManager();
    // this.onEnableDisableCallsFeatureCallbacks = new CallbackManager();
    // this.onEnableDisableVideoChatCallbacks = new CallbackManager();
    this.onTriggeredPopupCallbacks = new CallbackManager();
    this.setOfflineMessage(StringUtils.getMessage("user_offline_messages_will_be_delivered"));
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
  public getMembers(): Buddy[] {
    return this.members;
  }

  /**
   * Add a member to the group
   */
  public addMember(buddy: Buddy): void {
    this.members.push(buddy);
    buddy.onStatusChange(new Callback(this, this._onBuddyStatusChange));
    buddy.onNicknameChange(new Callback(this, this._onNicknameChange));
    this.onAddMemberCallbacks.run(buddy);
  }

  /**
   * Get buddy by Id
   * @param buddyId
   * @returns {Buddy}
   */
  public getBuddyById(buddyId: string): Buddy {
    for (let intBuddy of this.members) {
      if (buddyId === intBuddy.getId()) {
        return intBuddy;
      }
    }
  }

  /**
   * Only for Group Chat
   */
  public applyBuddyStatus(buddy: Buddy): void {
    for (let intBuddy of this.members) {
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

  public removeMember(buddy: Buddy): void {
    let idx: number[] = [];
    let index: number = -1;
    for (let intBuddy of this.members) {
      index++;
      if (!(buddy.getId() === intBuddy.getId())) {
        continue;
      }
      idx.push(index);
    }
    idx.reverse();
    for (let tmpIndex of idx) {
      let spliced = this.members.splice(tmpIndex, 1);
      this.onRemovedMemberCallbacks.run(spliced);
    }
  };

  public containsBuddy(buddy: Buddy): boolean {
    for (let intBuddy of this.members) {
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
  public addMessageSentFromAnotherSession(message: MessageSent) {
    this.getPluginManager().triggerPlugins(Room.MessageSentFromAnotherSessionPlugin, message);
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
  public addMessageReceived(message: MessageReceived): void {
    this.getPluginManager().triggerPlugins(Room.MessageReceivedPlugin, message);
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

  public _sendEvent(event: ChatEvent, callback?: Callback, errorCallback?: Callback): void {
    this.onSendEventCallbacks.run(event, callback, errorCallback);
  }

  /**
   * Set a callback invoked when a send message is requested
   */
  public onSendMessage(callback: Callback) {
    this.onSendMessageCallbacks.addCallback(callback);
  };

  /**
   * Send a message to the room
   */
  public sendMessage(message: string, messageType: MessageType = MessageType.CHAT): void {
    let msgObj = new MessageSent(null, this.getId(), this.mDateProvider.getNow(), message);
    this.getPluginManager().triggerPlugins(Room.MessageSentPlugin, msgObj);
    this.onSendMessageCallbacks.run(msgObj, messageType);
  }

  /**
   * Send the writing status when one-to-one-chat
   */
  public sendWritingStatus(value: number, callback?: Callback, errorCallback?: Callback): void {
    // if (!this.isGroupChat()) {
      for (let member of this.members) {
        let event = new WritingStatusEvent(null, member.getId(), this.mDateProvider.getNow(), this.mDateProvider.getNow(), value);
        this._sendEvent(event, callback, errorCallback);
      }
    // }
  }

  /**
   Add the writing status event of a buddy in this room.
   */
  public addWritingStatusEvent(writingStatus: MessageWritingStatus): void {
    this.getPluginManager().triggerPlugins(Room.WritingStatusPlugin, writingStatus);
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
   * Manage the status change of a buddy
   */
  private _onBuddyStatusChange(buddy: Buddy, status: BuddyStatus): void {
    this.onBuddyStatusChangeCallbacks.run(buddy, status);
  }

  /**
   * Set a callback which will be invoked when a buddy of the room change its status
   */
  public onRoomStatusChange(callback: Callback): void {
    this.onRoomStatusChangeCallbacks.addCallback(callback);
  }

  /**
   * Manage the status change of a buddy
   */
  private _onRoomStatusChange(status: BuddyStatus): void {
    this.onRoomStatusChangeCallbacks.run(status);
  }
  //
  // public onNewJingleSession(callback: Callback): void {
  //   this.onNewJingleSessionCallbacks.addCallback(callback);
  // }

  public onBuddyWritingStatus(callback: Callback): void {
    this.onBuddyWritingStatusCallbacks.addCallback(callback);
  }

  /**
   * Handle the change of a nickname
   */
  protected _onNicknameChange(nickname: string): void {
    if (this.members.length === 1) {
      this.setTitle(nickname);
    }
  }
  //
  // /**
  //  * Set a callback which will be invoked when a new jingle session is created.
  //  */
  // public onStartJingleSession(callback: Callback): void {
  //   this.onStartJingleSessionCallbacks.addCallback(callback);
  // }
  //
  // private _onStartJingleSession(isInitiator) {
  //   this.onStartJingleSessionCallbacks.run(this, isInitiator);
  // }
  //
  // /**
  //  * Start a jingle session
  //  */
  // public startJingleSession(isInitiator: boolean = false): void {
  //   if (this.jingleSession == null) {
  //     this._onStartJingleSession(isInitiator);
  //   } else {
  //     this.Log.debug(this.jingleSession, "Jingle session already exists");
  //   }
  // }
  //
  // /**
  //  * Add a jingle session to the room
  //  */
  // public addJingleSession(jingleSession: JingleSession): void {
  //   this.jingleSession = jingleSession;
  //   this.onNewJingleSessionCallbacks.run(jingleSession);
  // };
  //
  // /**
  //  * Remove the jingle session associated to the room
  //  */
  // public removeJingleSession(): void {
  //   this.jingleSession = null;
  // }
  //
  // public getJingleSession(): JingleSession {
  //   return this.jingleSession;
  // }
  //
  // public getJingleSessionId(): string {
  //   return this.jingleSession.getId();
  // }

  /**
   * Get the current room status
   */
  public getRoomStatus(): BuddyStatus {
    return this.roomStatus;
  }

  /**
   * Get the status of the room, the status is based on the 'best' status of
   * the room members.
   */
  private _calculateRoomStatus(): BuddyStatus {
    let bestStatus = new BuddyStatus(BuddyStatusType.OFFLINE, "Offline", 0);
    for (let buddy of this.members) {
      if (buddy.getStatus().isMoreAvailableThan(bestStatus)) {
        bestStatus = buddy.getStatus();
      }
    }
    return bestStatus;
  }

  /**
   * Try to update the room status, if is changed, run the callback.
   */
  public updateRoomStatus(): void {
    let oldStatusType = this.roomStatus.getType();
    let newStatus = this._calculateRoomStatus();
    if (oldStatusType !== newStatus.getType()) {
      this.roomStatus = newStatus;
      this._onRoomStatusChange(this.roomStatus);
    }
  }
  //
  // /**
  //  * Enable or disable the call support on the rooms.
  //  */
  // public enableCallSupport(enabled: boolean): void {
  //   this.featureCallsSupported = enabled;
  //   this.onEnableDisableCallsFeatureCallbacks.run(enabled);
  // }
  //
  // /**
  //  * Enable or disable the call support on the rooms.
  //  */
  // public enableVideoChat(enabled: boolean): void {
  //   this.videoChatEnabled = enabled;
  //   this.onEnableDisableVideoChatCallbacks.run(this.videoChatEnabled);
  // }
  //
  // /**
  //  * Set a callback which will be invoked when the calls feature is enabled or disabled.
  //  */
  // public onEnableDisableCallsFeature(callback: Callback): void {
  //   this.onEnableDisableCallsFeatureCallbacks.addCallback(callback);
  // }
  //
  // /**
  //  * Set a callback which will be invoked when the calls feature is enabled or disabled.
  //  */
  // public onEnableDisableVideoChat(callback: Callback) {
  //   this.onEnableDisableVideoChatCallbacks.addCallback(callback);
  // }

  /**
   * Add the nicknames of the buddies inside of the room
   */
  public getNicknames(delimiter: string = ", "): string {
    const buddies = [];
    for (let buddy of this.members) {
      buddies.push(buddy.getNickname());
    }
    return buddies.join(delimiter);
  }

  private setLastActivity(message: Message) {
    if ((typeof message.getDate !== "undefined") && message.getDate().getMilliseconds() > this.mLastActivity) {
      this.mLastActivity = message.getDate().getMilliseconds();
    }
  }

  public getLastActivity(): number  {
    return this.mLastActivity;
  }
  //
  // public isVideoChatEnabled(): boolean {
  //   return this.videoChatEnabled;
  // }
  //
  // public isFeatureCallsSupported(): boolean {
  //   return this.featureCallsSupported;
  // }

  public onTriggeredPopup(callback: Callback): void {
    this.onTriggeredPopupCallbacks.addCallback(callback);
  }

  public triggerPopup(): void {
    this.onTriggeredPopupCallbacks.run();
  }
  public getOfflineMessage(): string {
    return this.mOfflineMessage;
    // return StringUtils.getMessage("user_offline_messages_will_be_delivered");
  }

  public setOfflineMessage(message: string): void {
    this.mOfflineMessage = message;
  }


}