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

import {IBuddy} from "./IBuddy";
import {Message} from "./Message";

export class MessageWritingStatus extends Message {

  private mSender: IBuddy;
  private mWritingValue: number;

  constructor(sender: IBuddy, date: Date, value: number) {
    super("", date, `${value}`);
    this.mSender = sender;
    this.mWritingValue = value;
  }

  public getValue(): number {
    return this.mWritingValue;
  }

  public getSender(): IBuddy {
    return this.mSender;
  }

}