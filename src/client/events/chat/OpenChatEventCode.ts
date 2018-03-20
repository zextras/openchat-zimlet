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

export enum OpenChatEventCode {

  MESSAGE               = 1, // Used also for MessageSent
  FRIENDSHIP            = 2,
  USER_STATUSES         = 3,
  CONTACT_INFORMATION   = 4,
  REQUIRED_REGISTRATION = 5,
  BROADCAST_MESSAGE     = 6,
  BUDDY_LIST            = 7,
  TIMEOUT               = 8,
  WRITING_STATUS        = 9,
  ROOM_ACK              = 10, // Used also for MessageAckReceived
  FRIEND_BACK_ADDED     = 11,
  NEW_CLIENT_VERSION    = 12,
  SHUTDOWN              = 13,
  ERROR                 = 14,
  PING                  = 15,
  REGISTER_SESSION      = 16,
  UNREGISTER_SESSION    = 18,
  RESET_USER_DATA       = 20,
  ACCEPT_FRIENDSHIP     = 21,
  REMOVE_FRIENDSHIP     = 22,
  RENAME_FRIENDSHIP     = 23,
  RENAME_GROUP          = 24,
  SET_STATUS            = 26,
  SECRET_TEST           = 30,
  // History related events
  ARCHIVE_RESULT        = 49,
  ARCHIVE_RESULT_FIN    = 50,
  QUERY_ARCHIVE         = 51,
  ARCHIVE_COUNTER       = 52,
  // Capabilities
  USER_CAPABILITIES     = 54,

}
