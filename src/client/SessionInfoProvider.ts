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

import {ISessionInfoProvider} from "./ISessionInfoProvider";

/**
 * @deprecated
 */
export class SessionInfoProvider implements ISessionInfoProvider {

  private mUsername: string;
  private mSessionId: string = undefined;
  private mDisplayName: string;
  private mSessionResponsesReceivedInThisSession: number = 0;

  constructor(username: string, displayName: string) {
    this.mUsername = username;
    this.mDisplayName = displayName;
  }

  public getUsername(): string {
    return this.mUsername;
  }

  public getDisplayName(): string {
    return this.mDisplayName;
  }

  /**
   * @deprecated
   * @param {string} sessionId
   */
  public setSessionId(sessionId: string): void {
    this.mSessionId = sessionId;
  }

  /**
   * @deprecated
   * @return {string}
   */
  public getSessionId(): string {
    return this.mSessionId;
  }

  /**
   * @deprecated
   */
  public resetSessionId(): void {
    this.mSessionId = undefined;
  }

  public addEventsReceived(responses: number): void {
    this.mSessionResponsesReceivedInThisSession += responses;
  }

  public getSessionResponsesReceived(): number {
    return this.mSessionResponsesReceivedInThisSession;
  }

  public resetSessionResponsesReceived(): void {
    this.mSessionResponsesReceivedInThisSession = 0;
  }

}
