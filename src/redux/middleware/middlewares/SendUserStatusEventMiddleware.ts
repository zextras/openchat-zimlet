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

import {Action, Dispatch, MiddlewareAPI} from "redux";

import {IConnectionManager} from "../../../client/connection/IConnectionManager";
import {Callback} from "../../../lib/callbacks/Callback";
import {IDateProvider} from "../../../lib/IDateProvider";
import {ISettingsManager} from "../../../settings/ISettingsManager";
import {Setting} from "../../../settings/Setting";
import {ChatMiddlewareBase} from "../ChatMiddlewareBase";

import {BuddyStatus} from "../../../client/BuddyStatus";
import {SetStatusEvent} from "../../../client/events/chat/SetStatusEvent";
import {IUserStatusAction} from "../../action/IUserStatusAction";
import {IOpenChatState} from "../../IOpenChatState";

export class SendUserStatusEventMiddleware extends ChatMiddlewareBase<IOpenChatState> {

  private mConnectionManager: IConnectionManager;
  private mDateProvider: IDateProvider;
  private mSettingsManager: ISettingsManager;

  constructor(connectionManager: IConnectionManager, dateProvider: IDateProvider, settingsManager: ISettingsManager) {
    super();
    this.mConnectionManager = connectionManager;
    this.mDateProvider = dateProvider;
    this.mSettingsManager = settingsManager;
  }

  protected dispatchAction<A extends Action>(next: Dispatch<A>, action: A, store: MiddlewareAPI<IOpenChatState>): A {
    switch (action.type) {
      case "SET_USER_STATUS_SE": {
        const userStatusAction: IUserStatusAction = action as Action as IUserStatusAction;
        const statusId: number = BuddyStatus.GetNumberFromType(userStatusAction.status.type);
        this.mSettingsManager.set(Setting.IM_USR_PREF_LAST_STATUS, `${statusId}`);
        this.mConnectionManager.sendEvent(
          new SetStatusEvent(
            `${statusId}`,
            this.mDateProvider.getNow(),
          ),
          Callback.NOOP,
          Callback.NOOP,
        );
        break;
      }
      default: {
        // Do nothing;
      }
    }
    return next(action);
    // Add here the send event after actions
  }

}
