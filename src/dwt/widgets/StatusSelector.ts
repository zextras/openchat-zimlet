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

import {DwtToolBar, DwtToolBarButton} from "../../zimbra/ajax/dwt/widgets/DwtToolBar";
import {ZimbraUtils} from "../../lib/ZimbraUtils";
import {CallbackManager} from "../../lib/callbacks/CallbackManager";
import {DwtLabel} from "../../zimbra/ajax/dwt/widgets/DwtLabel";
import {ZmPopupMenu} from "../../zimbra/zimbraMail/share/view/ZmPopupMenu";
import {Callback} from "../../lib/callbacks/Callback";
import {DwtMenuItem} from "../../zimbra/ajax/dwt/widgets/DwtMenuItem";
import {AjxListener} from "../../zimbra/ajax/events/AjxListener";
import {BuddyStatus} from "../../client/BuddyStatus";

export class StatusSelector extends DwtToolBarButton {

  public static _DATA_STATUS: string = "status";

  private menu: ZmPopupMenu;
  private onStatusSelectedCbkMgr: CallbackManager;

  constructor(parent: DwtToolBar) {
    super({
      parent: parent,
      className: "ZToolbarButton ZNewButton"
    });
    // TODO: Dirty hack to modify the title label classname
    document.getElementById(this.getHTMLElId() + "_title").className += ` ChatStatusSelectorTitle${!ZimbraUtils.isUniversalUI() ? "-legacy-ui" : "" }`;
    this.dontStealFocus();
    this.onStatusSelectedCbkMgr = new CallbackManager();
    this.setAlign(DwtLabel.ALIGN_LEFT);
    this.menu = new ZmPopupMenu(this);
    this.setMenu(this.menu);
  }

  public clear() {
    this.menu = new ZmPopupMenu(this);
    this.setMenu(this.menu);
  }

  public onStatusSelected(callback: Callback): void {
    this.onStatusSelectedCbkMgr.addCallback(callback);
  }

  public setOptionStatuses(statuses: BuddyStatus[]): void {
    for (let status of statuses) {
      let item = this.menu.createMenuItem("DwtStatusMenuItem_" + (status.getId()), {
        text: status.getMessage(true),
        style: DwtMenuItem.RADIO_STYLE,
        image: status.getCSS(),
        enabled: true
      });
      item.setData(StatusSelector._DATA_STATUS, status);
      item.addSelectionListener(new AjxListener(this, this._statusSelected, [status]));
    }
  }

  public setCurrentStatus(status: BuddyStatus): void {
    this.setText(status.getMessage(true));
    let menuItems: DwtMenuItem[] = this.menu.getMenuItems();
    let results = [];
    for (let item of menuItems) {
      let itemStatus = item.getData(StatusSelector._DATA_STATUS);
      results.push(item._setChecked(status.getId().toString() === itemStatus.getId(), null, true));
    }
  }

  public _statusSelected(status: BuddyStatus): void {
    // Log.debug(status, "Status Changed");
    this.onStatusSelectedCbkMgr.run(status);
  }

}
