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

export class Command {

  public static UNREGISTER_SESSION   = "unregister_session";
  public static SEND_MESSAGE         = "send_message";
  public static NOTIFY_MSG_RECEIVED  = "notify_msg_received";
  public static REGISTER_SESSION     = "register_session";
  public static ADD_FRIEND           = "add_friend";
  public static ACCEPT_FRIEND        = "accept_friend";
  public static REMOVE_FRIEND        = "remove_friend";
  public static RENAME_FRIEND        = "rename_friend";
  public static RENAME_GROUP         = "rename_group";
  public static SAVE_CONVERSATION    = "chat_window_closed";
  public static SET_STATUS           = "set_user_status";
  public static SET_AUTO_AWAY_STATUS = "set_auto_away";
  public static PING                 = "ev_ping";
  public static RESET_USER           = "reset_user";
  public static NOTIFY_WRITING       = "ping_writing";
  public static QUERY_ARCHIVE        = "query_archive";

}
