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

import {IDateProvider} from "../../../../../lib/IDateProvider";
import {ArchiveResultEvent} from "../../../../events/chat/ArchiveResultEvent";
import {OpenChatEventCode} from "../../../../events/chat/OpenChatEventCode";
import {IChatEvent} from "../../../../events/IChatEvent";
import {IChatEventParser} from "../../../../events/parsers/IChatEventParser";
import {ISoapEventObject} from "../SoapEventParser";
import {SoapEventDecoder} from "./SoapEventDecoder";

export class ArchiveResultEventDecoder extends SoapEventDecoder<ArchiveResultEvent<IChatEvent>> {
  private mDateProvider: IDateProvider;
  private mParser: IChatEventParser<IChatEvent>;

  constructor(dateProvider: IDateProvider, parser: IChatEventParser<IChatEvent>) {
    super(OpenChatEventCode.ARCHIVE_RESULT);
    this.mDateProvider = dateProvider;
    this.mParser = parser;
  }

  public decodeEvent(ev: IArchiveResultObj, originEvent?: IChatEvent): ArchiveResultEvent<IChatEvent> {
    const originalEvent = this.mParser.decodeEvent(originEvent, ev.original_message);
    return new ArchiveResultEvent<typeof originalEvent>(
      ev.from,
      ev.to,
      ev.query_id,
      originalEvent,
      this.mDateProvider.getNow(),
    );
  }

}

export interface IArchiveResultObj extends ISoapEventObject {
  id: string;
  from: string;
  to: string;
  query_id: string;
  original_message: ISoapEventObject;
}
