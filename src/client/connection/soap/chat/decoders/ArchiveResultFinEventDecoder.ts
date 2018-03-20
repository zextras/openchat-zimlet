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
import {ArchiveCounterEvent} from "../../../../events/chat/ArchiveCounterEvent";
import {ArchiveResultFinEvent} from "../../../../events/chat/ArchiveResultFinEvent";
import {OpenChatEventCode} from "../../../../events/chat/OpenChatEventCode";
import {IChatEvent} from "../../../../events/IChatEvent";
import {ISoapEventObject} from "../SoapEventParser";
import {SoapEventDecoder} from "./SoapEventDecoder";

export class ArchiveResultFinEventDecoder extends SoapEventDecoder<ArchiveResultFinEvent|ArchiveCounterEvent> {

  private static isCounterEvent(ev: IArchiveResultFinObj|IarchiveCountObj): boolean {
    return typeof (ev as IarchiveCountObj).count !== "undefined"
      && typeof (ev as IarchiveCountObj).last_date !== "undefined"
      && (typeof (ev as IArchiveResultFinObj).query_id === "undefined" || (ev as IArchiveResultFinObj).query_id === "");
  }

  private mDateProvider: IDateProvider;

  constructor(dateProvider: IDateProvider) {
    super(OpenChatEventCode.ARCHIVE_RESULT_FIN);
    this.mDateProvider = dateProvider;
  }

  public decodeEvent(
    ev: IArchiveResultFinObj|IarchiveCountObj,
    originEvent?: IChatEvent,
  ): ArchiveResultFinEvent|ArchiveCounterEvent {
    if (ArchiveResultFinEventDecoder.isCounterEvent(ev)) {
      return new ArchiveCounterEvent(
        ev.from,
        (ev as IarchiveCountObj).count,
        new Date((ev as IarchiveCountObj).last_date),
      );
    } else {
      return new ArchiveResultFinEvent(
        ev.from,
        (ev as IArchiveResultFinObj).query_id,
        (ev as IArchiveResultFinObj).first_id,
        (ev as IArchiveResultFinObj).last_id,
        null,
        (ev as IArchiveResultFinObj).count,
        this.mDateProvider.getNow(),
      );
    }
  }

}

interface IarchiveCountObj extends ISoapEventObject {
  from: string;
  last_date: number;
  count: number;
}

interface IArchiveResultFinObj extends ISoapEventObject {
  query_id: string;
  first_id: string;
  from: string;
  last_id: string;
  count: number;
}
