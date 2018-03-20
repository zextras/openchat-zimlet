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

import {BuddyStatusType} from "./BuddyStatusType";

export interface IBuddyStatus {

  /** Compare the types between the status instance and another status */
  sameType(other: IBuddyStatus): boolean;

  /** Stringify the status object into a human-readable format */
  toString(): string;

  /** Compare the equality between the status instance and another status */
  equals(other: IBuddyStatus): boolean;

  /** Compare the status priority between another status.
   * Lowest priority is considered more important
   */
  isMoreAvailableThan(other: IBuddyStatus): boolean;

  /** Get the priority of the status */
  getStatusPriority(): number;

  /** Get status message label, this tag is used to be translated */
  getMessageLabel(returnReal?: boolean): string;

  /** Get the status message */
  getMessage(returnReal?: boolean): string;

  /** Get if the user which have this status can chat. (Based on status type) */
  canChat(): boolean;

  /** Get the status type */
  getType(): BuddyStatusType;

  /** Return the status ID */
  getId(): number;

  /** Get if the status represent an "Online" status */
  isOnline(): boolean;

  /** Get if the status represent an "Offline" status */
  isOffline(): boolean;

  /** Get if the status represent a particular status */
  isAvailable(): boolean;
  isBusy(): boolean;
  isAway(): boolean;
  isInvited(): boolean;
  isWaitingForResponse(): boolean;
}
