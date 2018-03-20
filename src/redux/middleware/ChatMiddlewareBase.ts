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

import {IChatClient} from "../../client/IChatClient";
import {IOpenChatState} from "../IOpenChatState";
import {IMiddleware, IOCMiddleware} from "./IMiddleware";

export abstract class ChatMiddlewareBase<S extends IOpenChatState>
  implements IMiddleware<S> {

  public getMiddleware(): IOCMiddleware<S> {
    return (api: MiddlewareAPI<S>) => {
      return (next: Dispatch<S>) => {
        return <A extends Action>(action: A): A => {
          return this.dispatchAction<A>(next, action, api);
        };
      };
    };
  }

  public setClient(client: IChatClient): void {}

  protected abstract dispatchAction<A extends Action>(next: Dispatch<A>, action: A, store: MiddlewareAPI<S>): A;

}
