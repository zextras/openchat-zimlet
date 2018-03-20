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

import {Dispatch, Middleware, MiddlewareAPI} from "redux";
import {IOpenChatState} from "../IOpenChatState";

export interface IMiddleware<S extends IOpenChatState> {

  getMiddleware(): IOCMiddleware<S>;

}

export interface IOCMiddleware<S extends IOpenChatState> extends Middleware {
  (api: MiddlewareAPI<S>): (next: Dispatch<S>) => Dispatch<S>;
}
