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

import {Store} from "redux";

import {Callback} from "../lib/callbacks/Callback";
import {CallbackManager} from "../lib/callbacks/CallbackManager";
import {ZxError} from "../lib/error/ZxError";
import {ZxErrorCode} from "../lib/error/ZxErrorCode";
import {IDateProvider} from "../lib/IDateProvider";
import {LogEngine} from "../lib/log/LogEngine";
import {Logger} from "../lib/log/Logger";
import {ChatPluginManager} from "../lib/plugin/ChatPluginManager";
import {StringUtils} from "../lib/StringUtils";
import {Version} from "../lib/Version";
import {IOpenChatState} from "../redux/IOpenChatState";
import {appCtxt} from "../zimbra/zimbraMail/appCtxt";
import {BuddyList} from "./BuddyList";
import {IConnectionManager} from "./connection/IConnectionManager";
import {IUserCapabilities} from "./connection/soap/chat/decoders/SessionRegisteredEventDecoder";
import {AcceptFriendshipEvent} from "./events/chat/AcceptFriendshipEvent";
import {EventSessionRegistered} from "./events/chat/EventSessionRegistered";
import {FriendshipInvitationEvent} from "./events/chat/friendship/FriendshipInvitationEvent";
import {MessageEvent} from "./events/chat/MessageEvent";
import {MessageSentEvent} from "./events/chat/MessageSentEvent";
import {RemoveFriendshipEvent} from "./events/chat/RemoveFriendshipEvent";
import {RenameFriendshipEvent} from "./events/chat/RenameFriendshipEvent";
import {RenameGroupEvent} from "./events/chat/RenameGroupEvent";
import {ResetUserDataEvent} from "./events/chat/ResetUserDataEvent";
import {UnregisterSessionEvent} from "./events/chat/UnregisterSessionEvent";
import {IChatEvent} from "./events/IChatEvent";
import {IEventManager} from "./events/IEventManager";
import {Group} from "./Group";
import {IBuddy} from "./IBuddy";
import {IChatClient} from "./IChatClient";
import {MessageSent} from "./MessageSent";

export class ChatClient implements IChatClient {

  public static PluginName = "Chat Client";

  public Log: Logger;

  private mDateProvider: IDateProvider;
  private mConnectionManager: IConnectionManager;
  private mBuddylist: BuddyList;
  private mOnRegistrationErrorCallbackManager: CallbackManager;
  private mOnServerOnlineCallbackManager: CallbackManager;
  private mOnServerOfflineCallbackManager: CallbackManager;
  private mOn502ErrorCallbackManager: CallbackManager;
  private mOnFriendshipInvitationCallbackManager: CallbackManager;
  private mOnEndProcessResponsesCallbackManager: CallbackManager;
  private mEventManager: IEventManager;
  private mChatClientPluginManager: ChatPluginManager;
  private mStore: Store<IOpenChatState>;
  private mReceivedMessageCallback: (roomId: string, messageSenderId: string, messageContent: string) => void;

  constructor(
    dateProvider: IDateProvider,
    connectionManager: IConnectionManager,
    eventManager: IEventManager,
    chatPluginManager: ChatPluginManager,
    store: Store<IOpenChatState>,
  ) {
    this.Log = LogEngine.getLogger(LogEngine.CHAT);
    this.mDateProvider = dateProvider;
    this.mConnectionManager = connectionManager;
    this.mConnectionManager.onEvent((ev) => this._onStreamEvent(ev as IChatEvent));
    this.mConnectionManager.onEndProcessResponses(() => this._onEndProcessResponses());
    this.mConnectionManager.onBadGatewayError((err) => this._onBadGatewayError(err));
    this.mConnectionManager.onNoSuchChatSession((err) => this._onNoSuchChatSession(err));
    this.mConnectionManager.onHTTPError((err) => this._onHTTPError(err));
    this.mConnectionManager.onNetworkError((err) => this._onNetworkError(err));
    this.mEventManager = eventManager;
    this.mBuddylist = new BuddyList();
    this.mStore = store;
    this.mOnRegistrationErrorCallbackManager = new CallbackManager();
    this.mOnServerOnlineCallbackManager = new CallbackManager();
    this.mOnServerOfflineCallbackManager = new CallbackManager();
    this.mOn502ErrorCallbackManager = new CallbackManager();
    this.mOnFriendshipInvitationCallbackManager = new CallbackManager();
    this.mOnEndProcessResponsesCallbackManager = new CallbackManager();
    this.mChatClientPluginManager = chatPluginManager;
    this.mChatClientPluginManager.switchOn(this);
    this.mChatClientPluginManager.triggerPlugins(ChatClient.PluginName);
  }

  public getPluginManager(): ChatPluginManager {
    return this.mChatClientPluginManager;
  }

  /**
   * Unregister the session and reset the session id.
   */
  public unregisterSession(): void {
    if (this.mStore.getState().sessionInfo.sessionId !== "") {
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
   * Get the Date Provider
   */

  public getDateProvider(): IDateProvider {
    return this.mDateProvider;
  }

  /**
   * Send an event using the connection manager.
   * No one should use the connection manager directly.
   */
  public sendEvent(event: IChatEvent, callback: Callback, errorCallback?: Callback): void {
    if (event.getSender() == null) {
      event.setSender(this.mStore.getState().sessionInfo.username);
    }
    this.mConnectionManager.sendEvent(event, callback, errorCallback);
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
  public deleteFriendship(buddy: IBuddy, callback: (ev: RemoveFriendshipEvent) => void, errorCallback?: () => void) {
    this.sendEvent(
      new RemoveFriendshipEvent(
        buddy.getId(),
        buddy.getNickname(),
        this.mDateProvider.getNow()),
      Callback.fromFunction(callback),
      Callback.fromFunction(errorCallback),
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
      this.mStore.getState().sessionInfo.username,
      this.mDateProvider.getNow(),
    );
    this.sendEvent(event, callback, errorCallback);
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

  public serverOnline(eventSessionRegistered: EventSessionRegistered<IUserCapabilities>) {
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

  // transitory till client removed
  public getConnectionManager(): IConnectionManager {
    return this.mConnectionManager;
  }

  // TODO: find a better implementation
  public onMessageReceived(
    callback: (
      roomId: string,
      messageSenderId: string,
      messageContent: string,
    ) => void,
  ): void {
    this.mReceivedMessageCallback = callback;
  }

  public receivedMessage(
    roomId: string,
    messageSenderId: string,
    messageContent: string,
  ): void {
    this.mReceivedMessageCallback(roomId, messageSenderId, messageContent);
  }

  /**
   * Send a message to a buddy or room.
   */
  private _sendMessage(message: MessageSent): void {
    this.sendEvent(
      new MessageEvent(
        null,
        this.mStore.getState().sessionInfo.username,
        message.getDestination(),
        message.getMessage(),
        message.getType(),
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
    }
    return true;
  }

  private _sendFriendshipCallback(response: {is_valid: boolean}): void {
    const compatVersion = new Version(0, 55, 0);
    const serverVersion = new Version(this.mStore.getState().sessionInfo.serverVersion);
    if (serverVersion.lessThan(compatVersion)
      || serverVersion.equals(compatVersion)) {
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
  private _onStreamEvent(event: IChatEvent): boolean {
    return this.mEventManager.handleEvent(event, this);
  }

  private _onEndProcessResponses(): void {
    this.mOnEndProcessResponsesCallbackManager.run();
  }

  private _onBadGatewayError(error: Error): void {
    this.mOn502ErrorCallbackManager.run(error);
  }

  private _onNoSuchChatSession(error: Error): void {
    this.mConnectionManager.closeStream();
    this.mOnServerOfflineCallbackManager.run(error);
  }

  private _onHTTPError(error: Error): void {
    this.mOnServerOfflineCallbackManager.run(error);
  }

  private _onNetworkError(error: Error): void {
    this.mOnServerOfflineCallbackManager.run(error);
  }
}
