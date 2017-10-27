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
import {ChatPluginManager} from "../lib/plugin/ChatPluginManager";
import {ChatEvent} from "./events/ChatEvent";
import {IBuddy} from "./IBuddy";
import {IBuddyStatus} from "./IBuddyStatus";
import {IRoom} from "./IRoom";
import {MessageSent} from "./MessageSent";
import {Room} from "./Room";

export class RoomManager {

  public static Plugin = "Room Manager";
  public static StatusSelectedPlugin = "Room Manager Status Selected";
  public static StatusChangedPlugin = "Room Manager Status Changed";
  public static CreateRoomPluginManager = "Room Manager Create Room Plugin Manager";

  private mDateProvider: DateProvider;
  private mRooms: IRoom[];
  private onNewRoomCallbacks: CallbackManager;
  private onSendEventCallbacks: CallbackManager;
  private onSendMessageCallbacks: CallbackManager;
  private mOnChangeStatusCallbacks: CallbackManager;
  private mRoomManagerPluginManager: ChatPluginManager;

  constructor(dateProvider: DateProvider, chatPluginManager: ChatPluginManager) {
    this.mDateProvider = dateProvider;
    this.mRooms = [];
    this.onNewRoomCallbacks = new CallbackManager();
    this.onSendEventCallbacks = new CallbackManager();
    this.onSendMessageCallbacks = new CallbackManager();
    this.mOnChangeStatusCallbacks = new CallbackManager();
    this.mRoomManagerPluginManager = chatPluginManager;
    this.mRoomManagerPluginManager.switchOn(this);
    this.mRoomManagerPluginManager.triggerPlugins(RoomManager.Plugin);
  }

  public getPluginManager(): ChatPluginManager {
    return this.mRoomManagerPluginManager;
  }

  /**
   * Create a room for a user-to-user conversation
   */
  public createRoom(buddyId: string, buddyNickname: string, roomPluginManager: ChatPluginManager): IRoom {
    this.mRoomManagerPluginManager.triggerPlugins(RoomManager.CreateRoomPluginManager, roomPluginManager);
    const newRoom: IRoom = new Room(
      buddyId,
      buddyNickname,
      this.mDateProvider,
      roomPluginManager,
    );
    newRoom.onSendEvent(new Callback(this, this._onSendEvent));
    newRoom.onSendMessage(new Callback(this, this._onSendMessage));
    this.addRoom(newRoom);
    return newRoom;
  }

  /**
   * Add a room to the room list
   */
  public addRoom(room: IRoom): void {
    this.mRooms.push(room);
    this.onNewRoomCallbacks.run(room);
  }

  /**
   * Get a room by Id
   */
  public getRoomById(roomId: string): IRoom {
    for (const room of this.getRooms()) {
      if (room.getId() === roomId) {
        return room;
      }
    }
  }

  public getRooms(): IRoom[] {
    return this.mRooms;
  }

  public statusSelected(status: IBuddyStatus, callback: Callback): void {
    this.mRoomManagerPluginManager.triggerPlugins(RoomManager.StatusSelectedPlugin, status, callback);
  }

  public statusChanged(status: IBuddyStatus) {
    this.mRoomManagerPluginManager.triggerPlugins(RoomManager.StatusChangedPlugin, status);
  }
  /**
   * Remove a room by Id
   */
  public removeRoom(roomId: string): void {
    const idx: number[] = [];
    let index: number = -1;
    for (const room of this.mRooms) {
      index++;
      if (!(roomId === room.getId())) {
        continue;
      }
      idx.push(index);
    }
    idx.reverse();
    for (const tmpIndex of idx) {
      this.mRooms.splice(tmpIndex, 1);
    }
  }

  /**
   * Add a callback which will be invoked when a new room window is added
   */
  public onRoomAdded(callback: Callback): void {
    this.onNewRoomCallbacks.addCallback(callback);
  }

  /**
   * Set a callback which will be called when a send event is requested
   */
  public onSendEvent(callback: Callback): void {
    this.onSendEventCallbacks.addCallback(callback);
  }

  /**
   * Set a callback which will be called when a send message is requested
   */
  public onSendMessage(callback: Callback): void {
    this.onSendMessageCallbacks.addCallback(callback);
  }

  public removeBuddyFromAllRooms(buddy: IBuddy): void {
    for (const room of this.mRooms) {
      if (room.containsBuddy(buddy)) {
        room.removeMember(buddy);
      }
    }
  }

  public addBuddyToHisRooms(buddy: IBuddy): void {
    const room = this.getRoomById(buddy.getId());
    if (room != null) {
      room.addMember(buddy);
    }
  }

  /**
   * Propagate to the callbacks to send an event
   */
  private _onSendEvent(event: ChatEvent, callback: Callback, errorCallback: Callback): void {
    this.onSendEventCallbacks.run(event, callback, errorCallback);
  }

  /**
   * Propagate to the callbacks to send an event
   */
  private _onSendMessage(message: MessageSent): void {
    this.onSendMessageCallbacks.run(message);
  }

}
