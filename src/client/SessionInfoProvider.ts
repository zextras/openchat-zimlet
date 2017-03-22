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

import {Version} from "../lib/Version";

export class SessionInfoProvider {

  public static DEFAULT_BRAND_CHAT_NAME: string = "Chat";

  private mUsername: string;
  private mSessionId: string = void 0;
  private mServerVersion: Version = void 0;
  private mChatName: string = SessionInfoProvider.DEFAULT_BRAND_CHAT_NAME;
  private mZimletVerion: Version;
  private mRoomServiceAddress: string;
  private mDisplayName: string;
  private mSessionResponsesReceivedInThisSession: number = 0;

  constructor(username: string, displayName: string, zimletVersion: Version) {
    this.mUsername = username;
    this.mDisplayName = displayName;
    this.mZimletVerion = zimletVersion;
  }

  public getUsername(): string {
    return this.mUsername;
  }

  public getUsernameWithResource(): string {
    if (typeof this.mSessionId !== "undefined") {
      return this.mUsername + "/" + this.mSessionId;
    } else {
      return this.mUsername;
    }
  }

  public setSessionId(sessionId: string): void {
    this.mSessionId = sessionId;
  }

  public getSessionId(): string {
    return this.mSessionId;
  }

  public resetSessionId(): void {
    this.mSessionId = void 0;
  }

  public setServerVersion(version: Version): void {
    this.mServerVersion = version;
  }

  public getServerVersion(): Version {
    return this.mServerVersion;
  }

  public getZimletVersion(): Version {
    return this.mZimletVerion;
  }

  public isGroupSupported(): boolean {
    if (typeof this.mServerVersion !== "undefined") {
      return (this.mServerVersion.moreThan(new Version(1, 1, 0)) || this.mServerVersion.equals(new Version(1, 1, 0)));
    } else {
      return false;
    }
  }

  public setChatName(name: string): void {
    this.mChatName = name;
  }

  public getChatName(): string {
    return this.mChatName;
  }

  public setRoomServiceAddress(roomServiceAddress: string): void {
    this.mRoomServiceAddress = roomServiceAddress;
  }

  public getRoomServiceAddress(): string {
    return this.mRoomServiceAddress;
  }

  public getDisplayName(): string {
    return this.mDisplayName;
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
