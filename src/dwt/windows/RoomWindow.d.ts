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

import {DwtShell} from "../../zimbra/ajax/dwt/widgets/DwtShell";

import {WindowBase} from "./WindowBase";
import {ZmAppCtxt} from "../../zimbra/zimbraMail/core/ZmAppCtxt";
import {ChatZimletBase} from "../../ChatZimletBase";
import {TimedCallbackFactory} from "../../lib/callbacks/TimedCallbackFactory";
import {Room} from "../../client/Room";
import {NotificationManager} from "../../lib/notifications/NotificationManager";
import {DateProvider} from "../../lib/DateProvider";
import {RoomWindowManager} from "./RoomWindowManager";
import {Callback} from "../../lib/callbacks/Callback";
import {SessionInfoProvider} from "../../client/SessionInfoProvider";
import {ChatPluginManager} from "../../lib/plugin/ChatPluginManager";
import {Conversation} from "../widgets/Conversation";
import {RoomWindowMenuButton} from "./RoomWindowMenuButton";

export declare class RoomWindow extends WindowBase {

  public static AddButtonPlugin: string;
  public static BuddyStatusChangedPlugin: string;

  public _timeoutWrittenStatus: number;
  public room: Room;
  public dateProvider: DateProvider;
  public mainMenuButton: RoomWindowMenuButton;

  constructor(
    shell: DwtShell,
    appCtxt: ZmAppCtxt,
    zimletContext: ChatZimletBase,
    timedCallbackFactory: TimedCallbackFactory,
    room: Room,
    roomManager: RoomWindowManager,
    notificationManager: NotificationManager,
    dateProvider: DateProvider,
    sessionInfoProvider: SessionInfoProvider,
    roomWindowPluginManager: ChatPluginManager
  );

  public getId(): string;
  public getConversation(): Conversation;
  public getPluginManager(): ChatPluginManager;
  public getLastRoomActivity(): number;
  public addTextToInput(text: string): void;
  public focus(): void;
  public _isFocused(): boolean;
  public _sendButtonHandler(): void;
  public _keyboardListener(event: {}): void
  public _dragStart(point: [number, number]): void;
  public _dragEnd(point: [number, number]): void;

  public onStartDrag(callback: Callback): void;
  public onDuringDrag(callback: Callback): void;
  public onDragEnd(callback: Callback): void;
  public onMessageReceived(callback: Callback): void;
  public onWindowOpened(callback: Callback): void;
  public onWindowClosed(callback: Callback): void;
  public getOriginalZIndex(): number;
}
