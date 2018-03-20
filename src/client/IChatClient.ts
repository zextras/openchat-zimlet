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
import {ZxError} from "../lib/error/ZxError";
import {IDateProvider} from "../lib/IDateProvider";
import {Logger} from "../lib/log/Logger";
import {ChatPluginManager} from "../lib/plugin/ChatPluginManager";
import {BuddyList} from "./BuddyList";
import {IConnectionManager} from "./connection/IConnectionManager";
import {IUserCapabilities} from "./connection/soap/chat/decoders/SessionRegisteredEventDecoder";
import {EventSessionRegistered} from "./events/chat/EventSessionRegistered";
import {RemoveFriendshipEvent} from "./events/chat/RemoveFriendshipEvent";
import {IChatEvent} from "./events/IChatEvent";
import {Group} from "./Group";
import {IBuddy} from "./IBuddy";
import {IRoomManager} from "./IRoomManager";
import {ISessionInfoProvider} from "./ISessionInfoProvider";

export interface IChatClient {

  Log: Logger;

  getPluginManager(): ChatPluginManager;
  /**
   * Register the session
   */
  // registerSession(): void;
  // getSessionInfoProvider(): ISessionInfoProvider;
  /**
   * Unregister the session and reset the session id.
   */
  unregisterSession(): void;
  /**
   * Open the stream to receive events from the server
   */
  startPing(): void;
  /**
   * Close the stream to stop to receive events from the server
   */
  stopPing(): void;
  /**
   * Get the buddylist
   */
  getBuddyList(): BuddyList;
  /**
   * Get the room manager
   */
  getRoomManager(): IRoomManager;
  /**
   * Get the Date Provider
   */
  getDateProvider(): IDateProvider;
  /**
   * Send an event using the connection manager.
   * No one should use the connection manager directly.
   */
  sendEvent(event: IChatEvent, callback: Callback, errorCallback?: Callback): void;
  /**
   * Send a friendship event
   */
  sendFriendship(buddyId: string, nickname: string, group: string): void;
  /**
   * Accept a friendship.
   */
  acceptFriendship(buddy: IBuddy, callback?: Callback, errorCallback?: Callback): void;
  /**
   * Delete a friendship.
   * Will remove a buddy from the user buddy list.
   */
  deleteFriendship(buddy: IBuddy, callback: (ev: RemoveFriendshipEvent) => void, errorCallback?: () => void): void;
  /**
   * Change the nickname of a buddy.
   */
  changeBuddyNickname(buddy: IBuddy, newNick: string, callback?: Callback, errorCallback?: Callback): void;
  /**
   * Change the nickname of a buddy.
   */
  changeBuddyGroup(buddy: IBuddy, group: Group, callback?: Callback, errorCallback?: Callback): void;
  /**
   * Rename a group
   */
  renameGroup(oldName: string, newName: string, callback?: Callback, errorCallback?: Callback): void;

  /**
   * Reset all informations about the user.
   * This command is useful for testing purpose or in case to clean
   * the user data on the chat database.
   * Seriously, don't use this command unless you know what are doing.
   */
  resetUser(resetFriends: boolean, callback: Callback, errorCallback: Callback): void;
  /**
   * Close the event stream and unregister the session.
   */
  shutdown(): void;
  onRegistrationError(callback: Callback): void;
  registrationError(error: ZxError): void;
  /**
   * Set the callback called when an error on the Proxy occurs.
   */
  onProxyError(callback: Callback): void;
  /**
   * Set the callback called when the client establishes a connection with the server,
   * passing to it the server information.
   */
  onServerOnline(callback: Callback): void;
  serverOnline(eventSessionRegistered: EventSessionRegistered<IUserCapabilities>): void;
  /**
   * Set the callback called when the server is offline.
   */
  onServerOffline(callback: Callback): void;
  /**
   * Add a callback which will be invoked when a new friendship invitation is received.
   */
  onFriendshipInvitation(callback: Callback): void;
  friendshipInvitationReceived(buddy: IBuddy): void;
  onEndProcessResponses(callback: Callback): void;
  getConnectionManager(): IConnectionManager;
  onMessageReceived(
    callback: (
      roomId: string,
      messageSenderId: string,
      messageContent: string,
    ) => void,
  ): void;
  receivedMessage(
    roomWindowId: string,
    messageSenderId: string,
    messageContent: string,
  ): void;

}
