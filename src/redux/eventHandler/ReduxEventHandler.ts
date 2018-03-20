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

import {IChatEventHandler} from "../../client/events/handlers/IChatEventHandler";
import {IBasicEvent} from "../../client/events/IBasicEvent";
import {IChatClient} from "../../client/IChatClient";
import {IOpenChatState} from "../IOpenChatState";

export abstract class ReduxEventHandler<T extends IBasicEvent> implements IChatEventHandler<T> {

  protected mStore: Store<IOpenChatState>;

  constructor(store: Store<IOpenChatState>) {
    this.mStore = store;
  }

  public abstract getEventCode(): number;
  public abstract handleEvent(ev: T, client: IChatClient): boolean;

}
