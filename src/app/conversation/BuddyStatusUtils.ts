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

import {BuddyStatusType} from "../../client/BuddyStatusType";
import {StringUtils} from "../../lib/StringUtils";
import {IOpenChatBuddy, IOpenChatBuddyStatus} from "../../redux/IOpenChatState";

export class BuddyStatusUtils {

  public static DefaultState: IOpenChatBuddyStatus = {
    message: "Offline",
    resource: "default",
    type: BuddyStatusType.OFFLINE,
  };

  public static getStatusLabel(status: IOpenChatBuddyStatus): string {
    let propertyKey: string;
    switch (status.type) {
      case BuddyStatusType.ONLINE:        propertyKey = "st_available"; break;
      case BuddyStatusType.BUSY:          propertyKey = "st_busy";      break;
      case BuddyStatusType.AWAY:          propertyKey = "st_away";      break;
      case BuddyStatusType.NEED_RESPONSE: propertyKey = "pending";   break;
      case BuddyStatusType.INVITED:       propertyKey = "waiting_for_response";   break;
      case BuddyStatusType.UNREACHABLE:   propertyKey = "st_unreachable";   break;
      case BuddyStatusType.OFFLINE:       propertyKey = "st_offline";   break;
      case BuddyStatusType.INVISIBLE:     propertyKey = "st_invisible"; break;
      default:                            propertyKey = "st_offline";
    }
    return StringUtils.getMessage(propertyKey);
  }

  public static getBestStatus(buddy: IOpenChatBuddy): IOpenChatBuddyStatus {
    let bestStatus: IOpenChatBuddyStatus = BuddyStatusUtils.DefaultState;
    for (const resource in buddy.statuses) {
      if (!buddy.statuses.hasOwnProperty(resource)) { continue; }
      if (
        BuddyStatusUtils.getStatusPriority(buddy.statuses[resource]) <= BuddyStatusUtils.getStatusPriority(bestStatus)
      ) {
        bestStatus = buddy.statuses[resource];
      }
    }
    return bestStatus;
  }

  public static getStatusPriority(status: IOpenChatBuddyStatus): number {
    switch (status.type) {
      case BuddyStatusType.ONLINE:        return 0;
      case BuddyStatusType.BUSY:          return 1;
      case BuddyStatusType.AWAY:          return 2;
      case BuddyStatusType.NEED_RESPONSE: return 3;
      case BuddyStatusType.INVITED:       return 4;
      case BuddyStatusType.UNREACHABLE:   return 5;
      case BuddyStatusType.OFFLINE:       return 6;
      case BuddyStatusType.INVISIBLE:     return 7;
      default:                            return 10;
    }
  }

  public static buddyStatusTypeToColor(status: IOpenChatBuddyStatus): string {
    switch (status.type) {
      case BuddyStatusType.ONLINE:
        return "#8DC53E";
      case BuddyStatusType.BUSY:
        return "#F52B23";
      case BuddyStatusType.AWAY:
        return "#F5A623";
      case BuddyStatusType.OFFLINE:
      case BuddyStatusType.NEED_RESPONSE:
      case BuddyStatusType.INVITED:
      case BuddyStatusType.INVISIBLE:
      case BuddyStatusType.UNREACHABLE:
        return "#B1B1B1";
    }
  }

}
