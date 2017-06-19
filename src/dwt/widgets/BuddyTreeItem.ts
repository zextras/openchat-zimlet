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

import {DwtTreeItem} from "../../zimbra/ajax/dwt/widgets/DwtTreeItem";
import {Buddy} from "../../client/Buddy";
import {ZmAppCtxt} from "../../zimbra/zimbraMail/core/ZmAppCtxt";
import {ChatPluginManager} from "../../lib/plugin/ChatPluginManager";
import {LearningClipUtils} from "../../lib/LearningClipUtils";
import {IdGenerator} from "../IdGenerator";
import {DwtDragSource} from "../../zimbra/ajax/dwt/dnd/DwtDragSource";
import {AjxListener} from "../../zimbra/ajax/events/AjxListener";
import {Dwt} from "../../zimbra/ajax/dwt/core/Dwt";
import {Callback} from "../../lib/callbacks/Callback";
import {CallbackManager} from "../../lib/callbacks/CallbackManager";
import {AjxCallback} from "../../zimbra/ajax/boot/AjxCallback";
import {BuddyStatus} from "../../client/BuddyStatus";
import {BuddyTreeItemActionMenuFactory} from "./BuddyTreeItemActionMenuFactory";
import {DwtSelectionEvent} from "../../zimbra/ajax/dwt/events/DwtSelectionEvent";
import {GroupTreeItem} from "./GroupTreeItem";
import {DwtComposite} from "../../zimbra/ajax/dwt/widgets/DwtComposite";
import {DwtDragEvent} from "../../zimbra/ajax/dwt/dnd/DwtDragEvent";
import {ZmContact} from "../../zimbra/zimbraMail/abook/model/ZmContact";
import {AjxDispatcher} from "../../zimbra/ajax/boot/AjxDispatcher";
import {AjxTemplate} from "../../zimbra/ajax/boot/AjxTemplate";
import {ZimbraUtils} from "../../lib/ZimbraUtils";

export class BuddyTreeItem extends DwtTreeItem {

  public static MAX_LENGTH: number = 200;

  public isBuddyTreeItem: boolean = true;

  private appCtxt: ZmAppCtxt;
  private refBuddy: Buddy;
  private mainWindowPluginManager: ChatPluginManager;
  private hideIfOffline: boolean;
  private historyEnabled: boolean;
  private onDeleteBuddyCallbacks: CallbackManager;
  private onRenameBuddyCallbacks: CallbackManager;
  private onSendInvitationCallbacks: CallbackManager;
  private onAcceptInvitationCallbacks: CallbackManager;

  constructor(parent: GroupTreeItem, buddy: Buddy, appCtxt: ZmAppCtxt, mainWindowPluginManager: ChatPluginManager) {
    super({
      parent: parent,
      text: "",
      selectable: true,
      id: IdGenerator.generateId("ZxChat_BuddyTreeItem_" + (buddy.getId())),
      dndScrollCallback: parent._dndScrollCallback,
      dndScrollId: parent._dndScrollId
    });
    let treeText = buddy.getNickname();
    if (buddy.getNickname().length > 19) {
      treeText = LearningClipUtils.clip(buddy.getNickname(), BuddyTreeItem.MAX_LENGTH, "DwtTreeItem-Text");
    }
    this.refBuddy = buddy;
    this.appCtxt = appCtxt;
    this.mainWindowPluginManager = mainWindowPluginManager;
    this.hideIfOffline = false;
    this.historyEnabled = false;

    // if (ZimbraUtils.isUniversalUI()) {
    //   let iconEl = document.getElementById(`${this.getHTMLElId()}_imageCell`);
    //   if (typeof iconEl !== "undefined") iconEl.className += " BuddyTreeItem-IconImg";
    // }
    this.setImage(this.refBuddy.getStatus().getCSS());
    this.setText(treeText);
    let dragSource = new DwtDragSource(Dwt.DND_DROP_MOVE);
    dragSource.addDragListener(new AjxListener(this, this._dragListener));
    this.setDragSource(dragSource);
    this.refBuddy.onNicknameChange(new Callback(this, this._onNicknameChange));
    this.refBuddy.onStatusChange(new Callback(this, this._onStatusChange));
    this.onDeleteBuddyCallbacks = new CallbackManager();
    this.onRenameBuddyCallbacks = new CallbackManager();
    this.onSendInvitationCallbacks = new CallbackManager();
    this.onAcceptInvitationCallbacks = new CallbackManager();
    this.setToolTipContent(new AjxCallback(this, this._createTooltip));
  }

  public getBuddy(): Buddy {
    return this.refBuddy;
  }

  public showHideOffline(hide: boolean): void {
    this.hideIfOffline = hide;
    this._updateVisibility();
  }

  public isHistoryEnabled(): boolean {
    return this.historyEnabled;
  }

  public _updateVisibility(): void {
    if (this.hideIfOffline && this.refBuddy.getStatus().isOffline()) {
      this.setVisible(false, true, false);
    } else {
      this.setVisible(true, true, false);
    }
  }

  public onAction(ev: DwtSelectionEvent): void {
    if (this.actionMenu == null) {
      this.actionMenu = BuddyTreeItemActionMenuFactory.createMenu(this, this.mainWindowPluginManager);
    }
    this.actionMenu.popup(0, ev.docX, ev.docY, false);
  }

  public onDeleteBuddy(callback: Callback): void {
    this.onDeleteBuddyCallbacks.addCallback(callback);
  }

  private _onNicknameChange(nickname: string): void {
    let treeText = nickname;
    if (nickname.length > 19) {
      treeText = LearningClipUtils.clip(nickname, BuddyTreeItem.MAX_LENGTH, "DwtTreeItem-Text");
    }
    this.setText(treeText);
  }

  private _onStatusChange(buddy: Buddy, status: BuddyStatus): void {
    this.setImage(status.getCSS());
    this._updateVisibility();
  }

  private _onDeleteBuddy(ev: DwtSelectionEvent): void {
    this.onDeleteBuddyCallbacks.run(this.refBuddy);
  }

  public onRenameBuddy(callback: Callback): void {
    this.onRenameBuddyCallbacks.addCallback(callback);
  }

  private _onRenameBuddy(ev: DwtSelectionEvent): void {
    this.onRenameBuddyCallbacks.run(this.refBuddy);
  }

  public onSendInvitation(callback: Callback): void {
    this.onSendInvitationCallbacks.addCallback(callback);
  }

  private _onSendInvitation(ev: DwtSelectionEvent): void {
    this.onSendInvitationCallbacks.run(this.refBuddy);
  }

  public onAcceptInvitation(callback: Callback): void {
    this.onAcceptInvitationCallbacks.addCallback(callback);
  }

  private _onAcceptInvitation(ev: DwtSelectionEvent): void {
    this.onAcceptInvitationCallbacks.run(this.refBuddy);
  }

  private _onBuddyDelete(buddy: Buddy): void {
    let remove = false;
    let ref = <BuddyTreeItem[]>(<GroupTreeItem>this.parent).getChildren();
    for (let i = 0, len = ref.length; i < len; i++) {
      let child: BuddyTreeItem = ref[i];
      if ((typeof child.getBuddy !== "undefined") && child.getBuddy().getId() === this.getBuddy().getId()) {
        remove = true;
      }
    }
    if (remove) {
      (<DwtComposite>this.parent).removeChild(this);
    }
  }

  public _dragListener(ev: DwtDragEvent): void {
    if (ev.action === DwtDragEvent.SET_DATA) {
      ev.doIt = false;
      ev.srcData = this;
    }
  }

  public _initialize(index?: number, realizeDeferred?: boolean, forceNode?: boolean): void {
    super._initialize(index, realizeDeferred, forceNode);
    if (ZimbraUtils.isUniversalUI()) {
      let iconEl = document.getElementById(`${this.getHTMLElId()}_imageCell`);
      if (typeof iconEl !== "undefined") iconEl.className += " BuddyTreeItem-IconImg";
    }
    this._updateVisibility();
  }

  public applyFilter(regex: RegExp): number {
    let itemsShown: number = 0;
    try {
      let result = this.getBuddy().filterTest(regex);
      if (result) {
        itemsShown = 1;
        this.setVisible(true, true, false);
      } else {
        this.setVisible(false, true, false);
      }
      let ref;
      if ((ref = regex.toString()) === "/(?:)/" || ref === "/(?:)/i") {
        this._updateVisibility();
      }
    } catch (error) {
      let err = error;
      // Log.err(err, "BuddyTreeItem.applyFilter");
    }
    return itemsShown;
  }

  public getContact(): ZmContact {
    let contactList = AjxDispatcher.run("GetContacts");
    return contactList.getContactByEmail(this.refBuddy.getId());
  }

  private _createTooltip(callback: AjxCallback): void {
    let expanded = AjxTemplate.expand("com_zextras_chat_open.Widgets#BuddyTreeItemTooltip", {
      buddy: this.getBuddy(),
      contact: this.getContact()
    });
    callback.run(expanded);
  }

}
