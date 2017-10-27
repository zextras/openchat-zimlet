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

import {BuddyStatusImp} from "../../client/BuddyStatus";
import {IBuddyStatus} from "../../client/IBuddyStatus";
import {Callback} from "../../lib/callbacks/Callback";
import {CallbackManager} from "../../lib/callbacks/CallbackManager";
import {ZimbraUtils} from "../../lib/ZimbraUtils";
import {DwtLabel} from "../../zimbra/ajax/dwt/widgets/DwtLabel";
import {DwtMenuItem} from "../../zimbra/ajax/dwt/widgets/DwtMenuItem";
import {DwtToolBar, DwtToolBarButton} from "../../zimbra/ajax/dwt/widgets/DwtToolBar";
import {AjxListener} from "../../zimbra/ajax/events/AjxListener";
import {ZxPopupMenu} from "../windows/WindowBase";

export class StatusSelector extends DwtToolBarButton {

  public static _DATA_STATUS: string = "status";

  private menu: ZxPopupMenu;
  private onStatusSelectedCbkMgr: CallbackManager;

   constructor(parent: DwtToolBar) {
    super({
      className: "ZToolbarButton ZNewButton",
      parent: parent,
    });
    // TODO: Dirty hack to modify the title label classname
    document.getElementById(
      this.getHTMLElId() + "_title",
    ).className += ` ChatStatusSelectorTitle${!ZimbraUtils.isUniversalUI() ? "-legacy-ui" : "" }`;
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
    for (const userStatus of userStatuses) {
      const item = this.menu.createMenuItem("DwtStatusMenuItem_" + (userStatus.getId()), {
        enabled: true,
        image: userStatus.getCSS(),
        style: DwtMenuItem.RADIO_STYLE,
        text: userStatus.getMessage(true),
      });
      item.setData(StatusSelector._DATA_STATUS, userStatus);
      item.addSelectionListener(new AjxListener(this, this.statusSelected, [userStatus]));
    }
  }

  public setCurrentStatus(userStatus: IBuddyStatus): void {
    this.setText(userStatus.getMessage(true));
    const menuItems: DwtMenuItem[] = this.menu.getMenuItems();
    const results = [];
    for (const item of menuItems) {
      const itemStatus = item.getData(StatusSelector._DATA_STATUS);
      results.push(item._setChecked(userStatus.getId().toString() === itemStatus.getId(), null, true));
    }
  }

  private statusSelected(userStatus: IBuddyStatus): void {
    this.onStatusSelectedCbkMgr.run(userStatus);
  }

}
