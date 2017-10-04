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
import {DateProvider} from "../lib/DateProvider";
import {ZxError} from "../lib/error/ZxError";
import {ZxErrorCode} from "../lib/error/ZxErrorCode";
import {LogEngine} from "../lib/log/LogEngine";
import {Logger} from "../lib/log/Logger";
import {ChatPluginManager} from "../lib/plugin/ChatPluginManager";
import {StringUtils} from "../lib/StringUtils";
import {Version} from "../lib/Version";
import {appCtxt} from "../zimbra/zimbraMail/appCtxt";
import {BuddyList} from "./BuddyList";
import {IConnectionManager} from "./connection/IConnectionManager";
import {BasicEvent} from "./events/BasicEvent";
import {AcceptFriendshipEvent} from "./events/chat/AcceptFriendshipEvent";
import {EventSessionRegistered} from "./events/chat/EventSessionRegistered";
import {FriendshipInvitationEvent} from "./events/chat/friendship/FriendshipInvitationEvent";
import {MessageAckEvent} from "./events/chat/MessageAckEvent";
import {MessageEvent} from "./events/chat/MessageEvent";
import {MessageSentEvent} from "./events/chat/MessageSentEvent";
import {RegisterSessionEvent} from "./events/chat/RegisterSessionEvent";
import {RemoveFriendshipEvent} from "./events/chat/RemoveFriendshipEvent";
import {RenameFriendshipEvent} from "./events/chat/RenameFriendshipEvent";
import {RenameGroupEvent} from "./events/chat/RenameGroupEvent";
import {ResetUserDataEvent} from "./events/chat/ResetUserDataEvent";
import {SetStatusEvent} from "./events/chat/SetStatusEvent";
import {UnregisterSessionEvent} from "./events/chat/UnregisterSessionEvent";
import {ChatEvent} from "./events/ChatEvent";
import {EventManager} from "./events/EventManager";
import {Group} from "./Group";
import {IBuddy} from "./IBuddy";
import {IBuddyStatus} from "./IBuddyStatus";
import {IChatClient} from "./IChatClient";
import {IUserStatusManager} from "./IUserStatusManager";
import {MessageAckWaiter} from "./MessageAckWaiter";
import {MessageReceived} from "./MessageReceived";
import {MessageSent} from "./MessageSent";
import {RoomManager} from "./RoomManager";
import {SessionInfoProvider} from "./SessionInfoProvider";
import {UserStatusManager} from "./UserStatusManager";

export class ChatClient implements IChatClient {

  public static PluginName = "Chat Client";
  public static StatusSelectedPlugin = "Chat Client Status Selected";
  public static SetStatusesPlugin = "Chat Client Set Statuses";

  public Log: Logger;

  private mSessionInfoProvider: SessionInfoProvider;
  private mZimletVersion: Version;
  private mUsername: string;
  private mDateProvider: DateProvider;
  private mConnectionManager: IConnectionManager;
  private mMessageAckWaiter: MessageAckWaiter;
  private mRoomManager: RoomManager;
  private mBuddylist: BuddyList;
  private mOnStatusChangeCallbackManager: CallbackManager;
  private mOnRegistrationErrorCallbackManager: CallbackManager;
  private mOnServerOnlineCallbackManager: CallbackManager;
  private mOnServerOfflineCallbackManager: CallbackManager;
  private mOn502ErrorCallbackManager: CallbackManager;
  private mOnFriendshipInvitationCallbackManager: CallbackManager;
  private mOnEndProcessResponsesCallbackManager: CallbackManager;
  private mOnUserStatusesReceived: CallbackManager;
  private mEventManager: EventManager;
  private mChatClientPluginManager: ChatPluginManager;
  private mUserStatusManager: IUserStatusManager;

  constructor(
    sessionInfoProvider: SessionInfoProvider,
    dateProvider: DateProvider,
    connectionManager: IConnectionManager,
    eventManager: EventManager,
    roomManager: RoomManager,
    chatPluginManager: ChatPluginManager,
  ) {
    this.Log = LogEngine.getLogger(LogEngine.CHAT);
    this.mSessionInfoProvider = sessionInfoProvider;
    this.mZimletVersion = this.mSessionInfoProvider.getZimletVersion();
    this.mUsername = this.mSessionInfoProvider.getUsername();
    this.mDateProvider = dateProvider;
    this.mConnectionManager = connectionManager;
    this.mConnectionManager.onEvent(new Callback(this, this._onStreamEvent));
    this.mConnectionManager.onEndProcessResponses(new Callback(this, this._onEndProcessResponses));
    this.mConnectionManager.onBadGatewayError(new Callback(this, this._onBadGatewayError));
    this.mConnectionManager.onNoSuchChatSession(new Callback(this, this._onNoSuchChatSession));
    this.mConnectionManager.onHTTPError(new Callback(this, this._onHTTPError));
    this.mConnectionManager.onNetworkError(new Callback(this, this._onNetworkError));
    this.mEventManager = eventManager;
    this.mMessageAckWaiter = new MessageAckWaiter();
    this.mRoomManager = roomManager;
    this.mUserStatusManager = new UserStatusManager();
    this.mBuddylist = new BuddyList();
    this.mBuddylist.onRemoveBuddy(new Callback(this.mRoomManager, this.mRoomManager.removeBuddyFromAllRooms));
    this.mBuddylist.onAddBuddy(new Callback(this.mRoomManager, this.mRoomManager.addBuddyToHisRooms));
    this.mRoomManager.onSendEvent(new Callback(this, this.sendEvent));
    this.mRoomManager.onSendMessage(new Callback(this, this._sendMessage));
    this.mOnStatusChangeCallbackManager = new CallbackManager();
    this.mOnRegistrationErrorCallbackManager = new CallbackManager();
    this.mOnServerOnlineCallbackManager = new CallbackManager();
    this.mOnServerOfflineCallbackManager = new CallbackManager();
    this.mOn502ErrorCallbackManager = new CallbackManager();
    this.mOnFriendshipInvitationCallbackManager = new CallbackManager();
    this.mOnEndProcessResponsesCallbackManager = new CallbackManager();
    this.mOnUserStatusesReceived = new CallbackManager();
    this.mChatClientPluginManager = chatPluginManager;
    this.mChatClientPluginManager.switchOn(this);
    this.mChatClientPluginManager.triggerPlugins(ChatClient.PluginName);
  }

  public getPluginManager(): ChatPluginManager {
    return this.mChatClientPluginManager;
  }

  /**
   * Register the session
   */
  public registerSession(): void {
    this.mSessionInfoProvider.resetSessionId();
    this.getBuddyList().reset();
    this.sendEvent(
      new RegisterSessionEvent(
        this.mSessionInfoProvider.getZimletVersion(),
        this.mDateProvider.getNow(),
      ),
      new Callback(this, this._onStreamEvent),
      new Callback(this, this.registrationError),
    );
  }

  public getSessionInfoProvider(): SessionInfoProvider {
    return this.mSessionInfoProvider;
  }

  /**
   * Unregister the session and reset the session id.
   */
  public unregisterSession(): void {
    if (typeof this.mSessionInfoProvider.getSessionId() !== "undefined") {
      this.sendEvent(
        new UnregisterSessionEvent(this.mDateProvider.getNow()),
        new Callback(this, this._onStreamEvent),
      );
    }
  }

  /**
   * Open the stream to receive events from the server
   */
  public startPing(): void {
    this.mConnectionManager.openStream();
  }

  /**
   * Close the stream to stop to receive events from the server
   */
  public stopPing(): void {
    this.mConnectionManager.closeStream();
  }

  /**
   * Get the buddylist
   */
  public getBuddyList(): BuddyList {
    return this.mBuddylist;
  }

  /**
   * Get the room manager
   */
  public getRoomManager(): RoomManager {
    return this.mRoomManager;
  }

  /**
   * Get the message acknowledge waiter
   */
  public getMessageAckWaiter(): MessageAckWaiter {
    return this.mMessageAckWaiter;
  }

  /**
   * Get the Date Provider
   */

  public getDateProvider(): DateProvider {
    return this.mDateProvider;
  }

  /**
   * Send an event using the connection manager.
   * No one should use the connection manager directly.
   */
  public sendEvent(event: ChatEvent, callback: Callback, errorCallback?: Callback): void {
    this.Log.debug(event, "Send event");
    if (event.getSender() == null) {
      event.setSender(this.mSessionInfoProvider.getUsername());
    }
    this.mConnectionManager.sendEvent(event as BasicEvent, callback, errorCallback);
  }

  /**
   * Notify to the server that a message is correctly received by the client.
   */
  public notifyMessageReceived(messageEvent: MessageReceived, callback?: Callback, errorCallback?: Callback): void {
    const event = new MessageAckEvent(
      messageEvent.getSender().getId(),
      this.mDateProvider.getNow(),
    );
    event.addMessageId(messageEvent.getMessageId());
    this.sendEvent(event, callback, errorCallback);
  }

  /**
   * Send a friendship event
   */
  public sendFriendship(buddyId: string, nickname: string, group: string): void {
    return this.sendEvent(
      new FriendshipInvitationEvent(
        buddyId,
        nickname,
        group,
        this.mDateProvider.getNow(),
      ),
      new Callback(this, this._sendFriendshipCallback),
      new Callback(this, this._sendFriendshipErrorCallback),
    );
  }

  /**
   * Accept a friendship.
   */
  public acceptFriendship(buddy: IBuddy, callback?: Callback, errorCallback?: Callback): void {
    this.sendEvent(
      new AcceptFriendshipEvent(
        buddy.getId(),
        buddy.getNickname(),
        this.mDateProvider.getNow()),
      callback,
      errorCallback,
    );
  }

  /**
   * Delete a friendship.
   * Will remove a buddy from the user buddy list.
   */
  public deleteFriendship(buddy: IBuddy, callback: Callback, errorCallback?: Callback) {
    this.sendEvent(
      new RemoveFriendshipEvent(
        buddy.getId(),
        buddy.getNickname(),
        this.mDateProvider.getNow()),
      callback,
      errorCallback,
    );
  }

  /**
   * Change the nickname of a buddy.
   */
  public changeBuddyNickname(buddy: IBuddy, newNick: string, callback?: Callback, errorCallback?: Callback): void {
    this.sendEvent(
      new RenameFriendshipEvent(
        buddy.getId(),
        newNick,
        buddy.getGroups()[0].getName(),
        this.mDateProvider.getNow()),
      callback,
      errorCallback,
    );
  }

  /**
   * Change the nickname of a buddy.
   */
  public changeBuddyGroup(buddy: IBuddy, group: Group, callback?: Callback, errorCallback?: Callback): void {
    this.sendEvent(
      new RenameFriendshipEvent(buddy.getId(), buddy.getNickname(), group.getName(), this.mDateProvider.getNow()),
      new Callback(this.getBuddyList(), this.getBuddyList().changeBuddyGroup, buddy, [group.getName()], callback),
      errorCallback,
    );
  }

  /**
   * Rename a group
   */
  public renameGroup(oldName: string, newName: string, callback?: Callback, errorCallback?: Callback): void {
    const event = new RenameGroupEvent(
      oldName,
      newName,
      this.mSessionInfoProvider.getUsername(),
      this.mDateProvider.getNow(),
    );
    this.sendEvent(event, callback, errorCallback);
  }

  public getUserStatusManager(): IUserStatusManager {
    return this.mUserStatusManager;
  }

  public setUserStatus(userStatus: IBuddyStatus, callback?: Callback, errorCallback?: Callback): void {
    this.sendEvent(
      new SetStatusEvent(
        `${userStatus.getId()}`,
        this.mDateProvider.getNow(),
        false,
      ),
      callback,
      errorCallback,
    );
  }

  public statusChanged(statusChanged: IBuddyStatus): void {
    this.mRoomManager.statusChanged(statusChanged);
    this.mOnStatusChangeCallbackManager.run(statusChanged);
  }

  /**
   * Reset all informations about the user.
   * This command is useful for testing purpose or in case to clean
   * the user data on the chat database.
   * Seriously, don't use this command unless you know what are doing.
   */
  public resetUser(resetFriends: boolean, callback: Callback, errorCallback: Callback): void {
    this.sendEvent(
      new ResetUserDataEvent(
        resetFriends,
        this.mDateProvider.getNow(),
      ),
      callback,
      errorCallback,
    );
  }

  /**
   * Close the event stream and unregister the session.
   */
  public shutdown(): void {
    this.stopPing();
    this.unregisterSession();
  }

  /**
   * Set the callback that will be invoked when a user change message from another session.
   */
  public onStatusChange(callback: Callback): void {
    return this.mOnStatusChangeCallbackManager.addCallback(callback);
  }

  public onRegistrationError(callback: Callback): void {
    this.mOnRegistrationErrorCallbackManager.addCallback(callback);
  }

  public registrationError(error: ZxError): void {
    this.mOnRegistrationErrorCallbackManager.run(error);
  }
  /**
   * Set the callback called when an error on the Proxy occurs.
   */
  public onProxyError(callback: Callback): void {
    this.mOn502ErrorCallbackManager.addCallback(callback);
  }

  /**
   * Set the callback called when the client establishes a connection with the server,
   * passing to it the server information.
   */
  public onServerOnline(callback: Callback): void {
    this.mOnServerOnlineCallbackManager.addCallback(callback);
  }

  public serverOnline(eventSessionRegistered: EventSessionRegistered) {
    this.mOnServerOnlineCallbackManager.run(eventSessionRegistered);
  }

  /**
   * Set the callback called when the server is offline.
   */
  public onServerOffline(callback: Callback): void {
    this.mOnServerOfflineCallbackManager.addCallback(callback);
  }

  /**
   * Add a callback which will be invoked when a new friendship invitation is received.
   */
  public onFriendshipInvitation(callback: Callback): void {
    this.mOnFriendshipInvitationCallbackManager.addCallback(callback);
  }

  public friendshipInvitationReceived(buddy: IBuddy): void {
    this.mOnFriendshipInvitationCallbackManager.run(buddy);
  }

  public onEndProcessResponses(callback: Callback): void {
    this.mOnEndProcessResponsesCallbackManager.addCallback(callback);
  }

  /**
   * Send a message to a buddy or room.
   */
  private _sendMessage(message: MessageSent): void {
    this.sendEvent(
      new MessageEvent(
        null,
        this.mSessionInfoProvider.getUsername(),
        message.getDestination(),
        message.getMessage(),
        MessageEvent.convertFromMessageType(message.getType()),
        message.getDate(),
        this.mDateProvider.getNow(),
      ),
      new Callback(this, this._sendMessageCallback, message),
    );
  }

  /**
   * Add message to acknowledgeWaiter as message response is received
   */
  private _sendMessageCallback(message: MessageSent, respEvent: MessageSentEvent): boolean {
    if (respEvent != null) {
      message.setId(respEvent.getMessageId());
      this.mMessageAckWaiter.addMessage(message);
    }
    return true;
  }

  private _sendFriendshipCallback(response: {is_valid: boolean}): void {
    const compatVersion = new Version(0, 55, 0);
    if (this.mSessionInfoProvider.getServerVersion().lessThan(compatVersion) || this.mSessionInfoProvider.getServerVersion().equals(compatVersion)) {
      if (!response.is_valid) {
        return this._sendFriendshipErrorCallback(new ZxError());
      }
    }
  }

  private _sendFriendshipErrorCallback(error: ZxError): void {
    if (error.getCode() === ZxErrorCode.INVALID_CHAT_ACCOUNT) {
      const msgDialog = appCtxt.getMsgDialog();
      msgDialog.setTitle(StringUtils.getMessage("err_adding_friend"));
      msgDialog.setMessage(StringUtils.getMessage("account_not_found_on_this_server"));
      msgDialog.popup();
    } else {
      this.Log.err(error, "Error on adding a buddy");
    }
  }

  /**
   * Handle an event received on the stream handled by the connection manager.
   * TODO: ZXCHAT-266 Move the event handling into a event manager as defined into issue
   */
  private _onStreamEvent(event: ChatEvent): boolean {
    return this.mEventManager.handleEvent(event, this);
  }

  private _onEndProcessResponses(): void {
    this.mOnEndProcessResponsesCallbackManager.run();
  }

  private _onBadGatewayError(error: Error): void {
    this.mOn502ErrorCallbackManager.run(error);
  }

  private _onNoSuchChatSession(error: Error): void {
    this.mOnServerOfflineCallbackManager.run(error);
    this.mConnectionManager.closeStream();
    this.registerSession();
  }

  private _onHTTPError(error: Error): void {
    this.mOnServerOfflineCallbackManager.run(error);
  }

  private _onNetworkError(error: Error): void {
    this.mOnServerOfflineCallbackManager.run(error);
  }
}
