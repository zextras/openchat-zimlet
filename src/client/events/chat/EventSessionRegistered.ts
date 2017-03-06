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

import {ChatEvent} from "../ChatEvent";
import {Version} from "../../../lib/Version";
import {RegisterSessionEvent} from "./RegisterSessionEvent";

export class EventSessionRegistered extends ChatEvent {

  public static ID: number = RegisterSessionEvent.ID;

  private mSessionId: string;
  private mServerVersion: Version;
  private mReqZimletVersion: Version;
  private mHistoryEnabled: boolean;
  private mNoBrand: boolean;
  private mVideoChatEnabled: boolean;
  private mSilentErrorReporting: boolean;
  private mRoomServiceAddress: string;

  constructor(
    sessionId: string,
    serverVersion: Version,
    reqZimletVersion: Version,
    historyEnabled: boolean,
    noBrand: boolean,
    videoChatEnabled: boolean,
    silentErrorReportingEnabled: boolean,
    roomServiceAddress: string,
    creationDate: Date
  ) {
    super(EventSessionRegistered.ID, creationDate, true);
    this.mSessionId = sessionId;
    this.mServerVersion = serverVersion;
    this.mReqZimletVersion = reqZimletVersion;
    this.mHistoryEnabled = historyEnabled;
    this.mNoBrand = noBrand;
    this.mVideoChatEnabled = videoChatEnabled;
    this.mSilentErrorReporting = silentErrorReportingEnabled;
    this.mRoomServiceAddress = roomServiceAddress;
  }

  public getSessionId(): string {
    return this.mSessionId;
  }

  public getServerVersion(): Version {
    return this.mServerVersion;
  }

  public getRequiredZimletVersion(): Version {
    return this.mReqZimletVersion;
  }

  public getHistoryEnabled(): boolean {
    return this.mHistoryEnabled;
  }

  public getNoBrand(): boolean {
    return this.mNoBrand;
  }

  public isVideoChatEnabled(): boolean {
    return this.mVideoChatEnabled;
  }

  public isSilentErrorReportingEnabled(): boolean {
    return this.mSilentErrorReporting;
  }

  public getRoomServiceAddress(): string {
    return this.mRoomServiceAddress;
  }
  // Response of the request
  // {
  //   session_id: "2c20d3dc-d984-494c-a0cd-660d8219eb32"
  //   server_version: 1.1
  //   required_zimlet_version: 1.15
  //   history_enabled: true
  //   remove_brand: true
  // }
}