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

import {OpenChatEventCode} from "../../../../events/chat/OpenChatEventCode";
import {QueryArchiveEvent} from "../../../../events/chat/QueryArchiveEvent";
import {SoapEventEncoder} from "./SoapEventEncoder";

// tslint:disable:object-literal-key-quotes

export class QueryArchiveEventEncoder extends SoapEventEncoder<QueryArchiveEvent> {

  constructor() {
    super(OpenChatEventCode.QUERY_ARCHIVE);
  }

  protected getEventDetails(ev: QueryArchiveEvent): IQueryArchiveReqObj {
    const req: IQueryArchiveReqObj = {
      "with": ev.getDestinationWithResource(),
    };
    if (typeof ev.getMax() !== "undefined" && ev.getMax() !== null) {
      req.max = ev.getMax();
    }
    if (typeof ev.getBefore() !== "undefined" && ev.getBefore() !== null) {
      req.before = ev.getBefore();
    }
    if (typeof ev.getAfter() !== "undefined" && ev.getAfter() !== null) {
      req.after = ev.getAfter();
    }
    if (typeof ev.getStart() !== "undefined" && ev.getStart() !== null) {
      req.start = ev.getStart();
    }
    if (typeof ev.getEnd() !== "undefined" && ev.getEnd() !== null) {
      req.end = ev.getEnd();
    }
    return req;
  }

}

interface IQueryArchiveReqObj {
  "with": string;
  max?: number;
  before?: string;
  after?: string;
  start?: number;
  end?: number;
}
