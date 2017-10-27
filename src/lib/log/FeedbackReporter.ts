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

import {Callback} from "../callbacks/Callback";
import {CallbackManager} from "../callbacks/CallbackManager";

export class FeedbackReporter {

  private mName: string;
  private mEnabled: boolean = false;
  private mOnDebugCbkMgr: CallbackManager;
  private mOnLogCbkMgr: CallbackManager;
  private mOnInfoCbkMgr: CallbackManager;
  private mOnWarningCbkMgr: CallbackManager;
  private mOnErrorCbkMgr: CallbackManager;
  private mContextData: IContextDataFeedbackReporter;

  constructor(name: string) {
    this.mName = name;
    this.mOnDebugCbkMgr = new CallbackManager();
    this.mOnLogCbkMgr = new CallbackManager();
    this.mOnInfoCbkMgr = new CallbackManager();
    this.mOnWarningCbkMgr = new CallbackManager();
    this.mOnErrorCbkMgr = new CallbackManager();
    this.mContextData = {
      extra: {},
      tags: {},
    };
  }

  public isEnabled(): boolean {
    return this.mEnabled;
  }

  public enable(): void {
    this.mEnabled = true;
  }

  public disable(): void {
    this.mEnabled = false;
  }

  public setExtra(key: string, value: any): void {
    this.mContextData.extra[key] = value;
  }

  public setTag(key: string, value: string): void {
    this.mContextData.tags[key] = value;
  }

  public getContextData(): IContextDataFeedbackReporter {
    return this.mContextData;
  }

  public onDebug(callback: Callback): void {
    this.mOnDebugCbkMgr.addCallback(callback);
  }

  public onLog(callback: Callback): void {
    this.mOnLogCbkMgr.addCallback(callback);
  }

  public onInfo(callback: Callback): void {
    this.mOnInfoCbkMgr.addCallback(callback);
  }

  public onWarning(callback: Callback): void {
    this.mOnWarningCbkMgr.addCallback(callback);
  }

  public onError(callback: Callback): void {
    this.mOnErrorCbkMgr.addCallback(callback);
  }

  public getName(): string {
    return this.mName;
  }

  public captureDebug(message: string, ctxtMessage: string) {
    if (!this.mEnabled) {
      return;
    }
    this.mOnDebugCbkMgr.run(message, ctxtMessage);
  }

  public captureLog(message: string, ctxtMessage: string) {
    if (!this.mEnabled) {
      return;
    }
    this.mOnLogCbkMgr.run(message, ctxtMessage);
  }

  public captureInfo(message: string, ctxtMessage: string) {
    if (!this.mEnabled) {
      return;
    }
    this.mOnInfoCbkMgr.run(message, ctxtMessage);
  }

  public captureWarning(message: string, ctxtMessage: string) {
    if (!this.mEnabled) {
      return;
    }
    this.mOnWarningCbkMgr.run(message, ctxtMessage);
  }

  public captureError(message: Error|string, ctxtMessage: string) {
    if (!this.mEnabled) {
      return;
    }
    this.mOnErrorCbkMgr.run(message, ctxtMessage);
  }
}

export interface IContextDataFeedbackReporter {
  tags: {[tag: string]: string};
  extra: {[value: string]: string};
  Message?: string;
}
