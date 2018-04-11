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
import {MessageEvent} from "../../../client/events/chat/MessageEvent";
import {MessageSentEvent} from "../../../client/events/chat/MessageSentEvent";
import {Callback} from "../../../lib/callbacks/Callback";
import {IDateProvider} from "../../../lib/IDateProvider";
import {IAddMessageToRoomAction} from "../../action/IAddMessageToRoomAction";
import {ISetLastUserMessageAction} from "../../action/ISetLastUserMessageAction";
import {ISetMessageIdAction} from "../../action/ISetMessageIdAction";
import {
  IOpenChatMessage,
  IOpenChatState,
  IOpenChatTextMessage,
} from "../../IOpenChatState";
import {ChatMiddlewareBase} from "../ChatMiddlewareBase";

export class SendMessageEventMiddleware extends ChatMiddlewareBase<IOpenChatState> {

  private mConnectionManager: IConnectionManager;
  private mDateProvider: IDateProvider;

  constructor(connectionManager: IConnectionManager, dateProvider: IDateProvider) {
    super();
    this.mConnectionManager = connectionManager;
    this.mDateProvider = dateProvider;
  }

  protected dispatchAction<A extends Action>(next: Dispatch<A>, action: A, store: MiddlewareAPI<IOpenChatState>): A {
    switch (action.type) {
      case "SEND_MESSAGE_TO_ROOM": {
        const act: IAddMessageToRoomAction<IOpenChatMessage> =
          action as Action as IAddMessageToRoomAction<IOpenChatMessage>;
        const state: IOpenChatState = store.getState();

        this.mConnectionManager.sendEvent(
          new MessageEvent(
            act.message.id,
            `${state.sessionInfo.username}/${state.sessionInfo.sessionId}`,
            act.message.destination,
            (act.message as IOpenChatTextMessage).content,
            state.rooms[act.jid].roomType,
            act.message.date,
            this.mDateProvider.getNow(),
          ),
          new Callback(null, this.onMessageIdReceived(act, store)),
          Callback.NOOP,
        );
        break;
      }
      default: {}
    }
    return next(action);
  }

  private onMessageIdReceived = (
    act: IAddMessageToRoomAction<IOpenChatMessage>,
    store: MiddlewareAPI<IOpenChatState>,
  ) => {
    return (respEvent: MessageSentEvent) => {
      store.dispatch<ISetMessageIdAction>({
        newDate: respEvent.getCreationDate(),
        newId: respEvent.getMessageId(),
        oldId: act.message.id,
        roomJid: act.message.destination,
        type: "SET_MESSAGE_ID",
      });
      store.dispatch<ISetLastUserMessageAction>({
        buddyJid: act.message.destination,
        received: {
          date: respEvent.getCreationDate(),
          id: respEvent.getMessageId(),
        },
        type: "SET_LAST_USER_MESSAGES",
      });
    };
  }

}
