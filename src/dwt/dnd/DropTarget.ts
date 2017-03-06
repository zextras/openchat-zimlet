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

import {DwtDropTarget} from "../../zimbra/ajax/dwt/dnd/DwtDropTarget";
import {TransferType} from "./TransferType";

export class DropTarget extends DwtDropTarget {

  private mTypes: TransferType[];

  constructor(types: TransferType[] = []) {
    super([]);
    this.mTypes = [];
    for (let type of types) {
      this.addTransferType(type);
    }
  }

  public addTransferType(transferType: TransferType): void {
    this.mTypes.push(transferType);
    this._types[transferType.getClassName()] = transferType.getConstructor();
  }

  public getTransferTypes(): TransferType[] {
    return this.mTypes;
  }

}
