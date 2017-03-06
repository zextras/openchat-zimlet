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
  public static DEFAULT_BRAND_CHAT_ICON: string = "ImgZxChat_personalized_brand";

  public static DEFAULT_CHAT_NAME: string = "ZeXtras Chat";
  public static DEFAULT_CHAT_ICON: string = "ImgZxChat_icon";

  private mUsername: string;
  private mSessionId: string = void 0;
  private mVideoCallSupported: boolean = false;
  private mServerVersion: Version = void 0;
  private mHistoryEnabled: boolean = false;
  private mRemoveBrand: boolean = false;
  private mChatName: string = SessionInfoProvider.DEFAULT_BRAND_CHAT_NAME;
  private mChatIcon: string = SessionInfoProvider.DEFAULT_BRAND_CHAT_ICON;
  private mEnableSilentErrorReporting: boolean = false;
  private mZimletVerion: Version;
  private mRoomServiceAddress: string;
  private mDisplayName: string;

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

  // public setVideoCallSupport(enabled: boolean): void {
  //   this.mVideoCallSupported = enabled;
  // }
  //
  // public isVideoCallSupported(): boolean {
  //   return this.mVideoCallSupported;
  // }
  //
  // public isCallSupported(): boolean {
  //   if (typeof this.mServerVersion !== "undefined") {
  //     return (this.mServerVersion.moreThan(new Version(2, 0, 0)) || this.mServerVersion.equals(new Version(2, 0, 0)));
  //   } else {
  //     return false;
  //   }
  // }

  // public setHistoryEnabled(enabled: boolean) {
  //   this.mHistoryEnabled = enabled;
  // }
  //
  // public isHistoryEnabled(): boolean {
  //   return this.mHistoryEnabled;
  // }

  public isGroupSupported(): boolean {
    if (typeof this.mServerVersion !== "undefined") {
      return (this.mServerVersion.moreThan(new Version(1, 1, 0)) || this.mServerVersion.equals(new Version(1, 1, 0)));
    } else {
      return false;
    }
  }

  public setReBranded(remove: boolean): void {
    this.mRemoveBrand = remove;
  }

  public isReBranded(): boolean {
    return this.mRemoveBrand;
  }

  public setChatName(name: string): void {
    this.mChatName = name;
  }

  public getChatName(): string {
    if (this.mRemoveBrand) {
      return this.mChatName;
    } else {
      return SessionInfoProvider.DEFAULT_CHAT_NAME;
    }
  }

  public setChatIcon(icon: string): void {
    this.mChatIcon = icon;
  }

  public getChatIcon(): string {
    if (this.mRemoveBrand) {
      return this.mChatIcon;
    } else {
      return SessionInfoProvider.DEFAULT_CHAT_ICON;
    }
  }

  public enableSilentErrorReporting(enable: boolean): void {
    this.mEnableSilentErrorReporting = enable;
  }

  public isSilentErrorReportingEnabled(): boolean {
    return this.mEnableSilentErrorReporting;
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

}
