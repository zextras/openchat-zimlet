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
import {TestConnectionManager} from "../client/connection/test/TestConnectionManager";
import {IOpenChatState} from "../redux/IOpenChatState";

export class WindowTestInstrumentation {
  public static install(
    connectionManager: TestConnectionManager,
    store: Store<IOpenChatState>,
  ): void {
    if (typeof (window as InstrumentedWindow).OpenChatTest !== "undefined") {
      throw new Error("Window already instrumented by the OpenChat.");
    }
    (window as InstrumentedWindow).OpenChatTest = {
      connectionManager: connectionManager,
      resetLocalStorage: WindowTestInstrumentation.resetLocalStorage,
      store: store,
    };
  }
  public static uninstall(): void {
    (window as InstrumentedWindow).OpenChatTest = null;
    delete (window as InstrumentedWindow).OpenChatTest;
  }

  private static resetLocalStorage(): void {
    localStorage.removeItem("openchat-store");
    localStorage.removeItem("openchat-ui-store");
  }
}

interface InstrumentedWindow extends Window {
  OpenChatTest: {
    connectionManager: TestConnectionManager,
    resetLocalStorage: () => void,
    store: Store<IOpenChatState>,
  };
}
