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

import {JSON3 as JSON} from "../libext/json3";

import {applyMiddleware, combineReducers, createStore, Reducer, Store} from "redux";

import {IOpenChatState} from "./IOpenChatState";
import {IStoreFactory} from "./IStoreFactory";
import {IMiddlewareFactory} from "./middleware/IMiddlewareFactory";
import {OpenChatInitialState} from "./OpenChatInitialState";
import {buddyListReducer} from "./reducer/buddyListReducer";
import {roomAcksReducer} from "./reducer/roomAcksReducer";
import {roomsReducer} from "./reducer/roomsReducer";
import {sessionInfoReducer} from "./reducer/sessionInfoReducer";
import {userStatusesReducer} from "./reducer/userStatusesReducer";
import {Throttler} from "./Throttler";

export class OpenChatStoreFactory implements IStoreFactory<IOpenChatState> {

  private static sLocalStorageKey: string = "openchat-store";

  private static LoadFromLocalStorage(): IOpenChatState {
    try {
      const state: string = localStorage.getItem(OpenChatStoreFactory.sLocalStorageKey);
      if (state === null) {
        return undefined;
      }
      return JSON.parse(state) as IOpenChatState;
    } catch (err) {
      return undefined;
    }
  }

  private static SaveIntoLocalStorage(state: IOpenChatState): void {
    try {
      const stateStr: string = JSON.stringify(state);
      localStorage.setItem(
        OpenChatStoreFactory.sLocalStorageKey,
        stateStr,
      );
    } catch (err) {
    }
  }

  private mUseLocalStorage: boolean;

  constructor(useLocalStorage: boolean) {
    this.mUseLocalStorage = useLocalStorage;
  }

  public createStore(middlewareFactory: IMiddlewareFactory): Store<IOpenChatState> {
    const openChatStore: Store<IOpenChatState> = createStore<IOpenChatState>(
      combineReducers({
        buddyList: buddyListReducer,
        roomAcks: roomAcksReducer,
        rooms: roomsReducer,
        sessionInfo: sessionInfoReducer,
        userStatuses: userStatusesReducer,
      }) as Reducer<IOpenChatState>,
      (this.mUseLocalStorage) ? OpenChatStoreFactory.LoadFromLocalStorage() : OpenChatInitialState,
      applyMiddleware(
        ...middlewareFactory.getMiddlewares(),
      ),
    );

    if (this.mUseLocalStorage) {
      openChatStore.subscribe(Throttler.throttle(1000, ((s) => () => {
        OpenChatStoreFactory.SaveIntoLocalStorage(s.getState());
        // tslint:disable-next-line
        console.log("OpenChat State stored");
      })(openChatStore)));
    }

    return openChatStore;
  }

}
