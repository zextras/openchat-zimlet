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

import {IMessageUiFactory} from "../../app/messageFactory/IMessageUiFactory";
import {ISessionInfoProvider} from "../../client/ISessionInfoProvider";
import {TimedCallbackFactory} from "../../lib/callbacks/TimedCallbackFactory";
import {DateProvider} from "../../lib/DateProvider";
import {NotificationManager} from "../../lib/notifications/NotificationManager";
import {ChatPluginManager} from "../../lib/plugin/ChatPluginManager";
import {IOpenChatState} from "../../redux/IOpenChatState";
import {DwtShell} from "../../zimbra/ajax/dwt/widgets/DwtShell";
import {RoomWindowType} from "./RoomWindow";

export interface IRoomWindowFactory {

  createRoomWindow(
    shell: DwtShell,
    timedCallbackFactory: TimedCallbackFactory,
    roomJid: string,
    notificationManager: NotificationManager,
    dateProvider: DateProvider,
    sessionInfoProvider: ISessionInfoProvider,
    roomWindowPluginManager: ChatPluginManager,
    popupLocked: boolean,
    messageUiFactory: IMessageUiFactory<IOpenChatState>,
  ): RoomWindowType;

}
