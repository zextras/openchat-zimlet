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

import {AllHtmlEntities} from "../libext/html-entities";

export class Message {

  private mId: string;
  private mDate: Date;
  private mMessage: string;
  private mType: "chat" | string;

  constructor(id: string = "", date: Date, message: string = "") {
    this.mId = id;
    this.mDate = date;
    this.mMessage = message;
    this.mType = "chat";
  }

  public setId(id: string): void {
    this.mId = id;
  }

  public setType(type: string): void {
    this.mType = type;
  }

  public getMessageId(): string {
    return this.mId;
  }

  public getMessage(): string {
    return this.mMessage;
  }

  public getHtmlMessage(): string {
    const entities = new AllHtmlEntities();
    //      .replace(/\s/g, "&nbsp;")
    return entities.encode(this.mMessage)
    //      .replace(/([^\s-]{26})([^\s-]{26})/g, '$1&shy;$2')
      .replace(/&NewLine;/g, "<br>")
      .replace(/\n/g, "<br>");
  }

  public getDate(): Date {
    return this.mDate;
  }

  public getType(): string {
    return this.mType;
  }

}
