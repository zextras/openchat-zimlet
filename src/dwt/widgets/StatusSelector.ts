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

import {Store, Unsubscribe} from "redux";
import {BuddyStatusUtils} from "../../app/conversation/BuddyStatusUtils";
import {BuddyStatus} from "../../client/BuddyStatus";
import {ZimbraUtils} from "../../lib/ZimbraUtils";
import {IUserStatusAction} from "../../redux/action/IUserStatusAction";
import {IOpenChatState, IOpenChatUserStatus} from "../../redux/IOpenChatState";
import {DwtLabel} from "../../zimbra/ajax/dwt/widgets/DwtLabel";
import {DwtMenuItem} from "../../zimbra/ajax/dwt/widgets/DwtMenuItem";
import {DwtToolBar, DwtToolBarButton} from "../../zimbra/ajax/dwt/widgets/DwtToolBar";
import {AjxListener} from "../../zimbra/ajax/events/AjxListener";
import {ZxPopupMenu} from "../windows/WindowBase";

import "./StatusSelector.scss";

export class StatusSelector extends DwtToolBarButton {

  public static _DATA_STATUS: string = "status";

  private menu: ZxPopupMenu;
  private mStore: Store<IOpenChatState>;
  private mUnsubscribe: Unsubscribe;
  // in this field we store the last state of this.mStore.getState().userStatuses
  // and on state changed we will check if the userStatuses have changed
  private mStoreUserStatuses: IOpenChatUserStatus[] = [];

  constructor(
    parent: DwtToolBar,
    store: Store<IOpenChatState>,
  ) {
    super({
      className: "ZToolbarButton ZNewButton",
      parent: parent,
    });
    // TODO: Dirty hack to modify the title label classname
    document.getElementById(
      this.getHTMLElId() + "_title",
    ).className += ` ChatStatusSelectorTitle${!ZimbraUtils.isUniversalUI() ? "-legacy-ui" : "" }`;
    this.mStore = store;
    this.checkState();
    this.mUnsubscribe = this.mStore.subscribe(this.checkState);
    this.dontStealFocus();
    this.setAlign(DwtLabel.ALIGN_LEFT);
  }

  private clear() {
    this.menu = new ZxPopupMenu(this);
    this.setMenu(this.menu);
  }

  private setOptions(userStatuses: IOpenChatUserStatus[]): void {
    for (const userStatus of userStatuses) {
      const item = this.menu.createMenuItem(
        `DwtStatusMenuItem_${BuddyStatus.GetNumberFromType(userStatus.type)}`,
        {
          enabled: true,
          image: BuddyStatus.getCSS(userStatus.type),
          style: DwtMenuItem.RADIO_STYLE,
          text: BuddyStatusUtils.getStatusLabel(userStatus),
        },
      );
      item.setData(StatusSelector._DATA_STATUS, userStatus);
      item.addSelectionListener(new AjxListener(this, this.statusSelected, [userStatus]));
    }
  }

  private setCurrentStatus(userStatus: IOpenChatUserStatus): void {
    this.setText(BuddyStatusUtils.getStatusLabel(userStatus));
    const menuItems: {[id: string]: DwtMenuItem} = this.menu.getMenuItems();
    const results = [];
    for (const itemId in menuItems) {
      if (!menuItems.hasOwnProperty(itemId)) { continue; }
      const itemStatus: IOpenChatUserStatus = menuItems[itemId].getData(StatusSelector._DATA_STATUS);
      results.push(
        menuItems[itemId]._setChecked(
          userStatus.type === itemStatus.type,
          null,
          true,
        ),
      );
    }
  }

  private checkState: () => void = () => {
     // continue only if this.mStore.getState().userStatuses changed or is the first time
     if (this.mStoreUserStatuses !== this.mStore.getState().userStatuses) {
       // compare oldStatuses with newStatuses to verify that user statuses types are changed
       // in case reset Options
       const newUserStatusesLength: number = this.mStore.getState().userStatuses.length;
       if (this.mStoreUserStatuses.length === newUserStatusesLength) {
         for (let index = 0; index < newUserStatusesLength; index++) {
           if (
             typeof this.mStoreUserStatuses[index] === "undefined"
             || typeof this.mStore.getState().userStatuses[index] === "undefined"
             || this.mStoreUserStatuses[index].type !== this.mStore.getState().userStatuses[index].type
           ) {
             this.clear();
             this.setOptions(this.mStore.getState().userStatuses);
             break;
           }
         }
       } else {
         this.clear();
         this.setOptions(this.mStore.getState().userStatuses);
       }
       for (const status of this.mStore.getState().userStatuses) {
         if (status.selected) {
           this.setCurrentStatus(status);
           break;
         }
       }
       this.mStoreUserStatuses = this.mStore.getState().userStatuses;
     }
  }

  // this only trigger store, any change in user status
  // is managed in checkState
  private statusSelected(userStatus: IOpenChatUserStatus): void {
    this.mStore.dispatch<IUserStatusAction>({
      status: userStatus,
      type: "SET_USER_STATUS_SE",
    });
  }

}
