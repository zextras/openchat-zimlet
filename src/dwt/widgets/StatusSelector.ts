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
import {Callback} from "../../lib/callbacks/Callback";
import {DwtMenuItem} from "../../zimbra/ajax/dwt/widgets/DwtMenuItem";
import {AjxListener} from "../../zimbra/ajax/events/AjxListener";
import {BuddyStatusImp} from "../../client/BuddyStatus";
import {ZxPopupMenu} from "../windows/WindowBase";
import {IBuddyStatus} from "../../client/IBuddyStatus";

export class StatusSelector extends DwtToolBarButton {

  public static _DATA_STATUS: string = "status";

  private menu: ZxPopupMenu;
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
    this.menu = new ZxPopupMenu(this);
    this.setMenu(this.menu);
  }

  public clear() {
    this.menu = new ZxPopupMenu(this);
    this.setMenu(this.menu);
  }

  public onStatusSelected(callback: Callback): void {
    this.onStatusSelectedCbkMgr.addCallback(callback);
  }

  public setOptionStatuses(userStatuses: IBuddyStatus[]): void {
    for (let userStatus of userStatuses) {
      let item = this.menu.createMenuItem("DwtStatusMenuItem_" + (userStatus.getId()), {
        text: userStatus.getMessage(true),
        style: DwtMenuItem.RADIO_STYLE,
        image: userStatus.getCSS(),
        enabled: true
      });
      item.setData(StatusSelector._DATA_STATUS, userStatus);
      item.addSelectionListener(new AjxListener(this, this.statusSelected, [userStatus]));
    }
  }

  public setCurrentStatus(userStatus: IBuddyStatus): void {
    this.setText(userStatus.getMessage(true));
    let menuItems: DwtMenuItem[] = this.menu.getMenuItems();
    let results = [];
    for (let item of menuItems) {
      let itemStatus = item.getData(StatusSelector._DATA_STATUS);
      results.push(item._setChecked(userStatus.getId().toString() === itemStatus.getId(), null, true));
    }
  }

  private statusSelected(userStatus: IBuddyStatus): void {
    this.onStatusSelectedCbkMgr.run(userStatus);
  }

}
