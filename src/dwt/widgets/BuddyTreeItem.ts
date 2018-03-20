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

import {BuddyStatus} from "../../client/BuddyStatus";
import {IBuddy} from "../../client/IBuddy";
import {IBuddyStatus} from "../../client/IBuddyStatus";
import {Callback} from "../../lib/callbacks/Callback";
import {CallbackManager} from "../../lib/callbacks/CallbackManager";
import {LearningClipUtils} from "../../lib/LearningClipUtils";
import {ChatPluginManager} from "../../lib/plugin/ChatPluginManager";
import {ZimbraUtils} from "../../lib/ZimbraUtils";
import {AjxCallback} from "../../zimbra/ajax/boot/AjxCallback";
import {AjxDispatcher} from "../../zimbra/ajax/boot/AjxDispatcher";
import {AjxTemplate} from "../../zimbra/ajax/boot/AjxTemplate";
import {Dwt} from "../../zimbra/ajax/dwt/core/Dwt";
import {DwtDragEvent} from "../../zimbra/ajax/dwt/dnd/DwtDragEvent";
import {DwtDragSource} from "../../zimbra/ajax/dwt/dnd/DwtDragSource";
import {DwtSelectionEvent} from "../../zimbra/ajax/dwt/events/DwtSelectionEvent";
import {DwtComposite} from "../../zimbra/ajax/dwt/widgets/DwtComposite";
import {DwtTreeItem} from "../../zimbra/ajax/dwt/widgets/DwtTreeItem";
import {AjxListener} from "../../zimbra/ajax/events/AjxListener";
import {ZmContact} from "../../zimbra/zimbraMail/abook/model/ZmContact";
import {ZmAppCtxt} from "../../zimbra/zimbraMail/core/ZmAppCtxt";
import {IdGenerator} from "../IdGenerator";
import {BuddyTreeItemActionMenuFactory} from "./BuddyTreeItemActionMenuFactory";
import {IDwtChatTreeItem} from "./DwtChatTreeItem";
import {GroupTreeItem} from "./GroupTreeItem";

import "./BuddyTreeItem.scss";

export class BuddyTreeItem extends DwtTreeItem implements IDwtChatTreeItem {

  public static MAX_LENGTH: number = ZimbraUtils.isUniversalUI() ? 200 : 133;

  private appCtxt: ZmAppCtxt;
  private refBuddy: IBuddy;
  private mainWindowPluginManager: ChatPluginManager;
  private hideIfOffline: boolean;
  private historyEnabled: boolean;
  private onDeleteBuddyCallbacks: CallbackManager;
  private onRenameBuddyCallbacks: CallbackManager;
  private onSendInvitationCallbacks: CallbackManager;
  private onAcceptInvitationCallbacks: CallbackManager;
  private refBuddyId: string;

  constructor(parent: GroupTreeItem, buddy: IBuddy, appCtxt: ZmAppCtxt, mainWindowPluginManager: ChatPluginManager) {
    super({
      dndScrollCallback: parent._dndScrollCallback,
      dndScrollId: parent._dndScrollId,
      id: IdGenerator.generateId("ZxChat_BuddyTreeItem_" + (buddy.getId())),
      parent: parent,
      selectable: true,
      text: "",
    });
    let treeText = buddy.getNickname();
    if (buddy.getNickname().length > 19) {
      treeText = LearningClipUtils.clip(buddy.getNickname(), BuddyTreeItem.MAX_LENGTH, "DwtTreeItem-Text");
    }
    this.refBuddy = buddy;
    this.refBuddyId = buddy.getId();
    this.appCtxt = appCtxt;
    this.mainWindowPluginManager = mainWindowPluginManager;
    this.hideIfOffline = false;
    this.historyEnabled = false;

    this._treeItemExtraImgClass = "ZxChat_BuddyTreeItem-ExtraImg";
    this.setImage(BuddyStatus.getCSS(this.refBuddy.getStatus().getType()));
    this.setText(treeText);
    const dragSource = new DwtDragSource(Dwt.DND_DROP_MOVE);
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

  public isGroupTreeItem(): boolean {
    return false;
  }

  public isBuddyTreeItem(): boolean {
    return true;
  }

  public getBuddy(): IBuddy {
    return this.refBuddy;
  }

  public getId(): string {
    return this.refBuddyId;
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

  public _onDeleteBuddy(ev: DwtSelectionEvent): void {
    this.onDeleteBuddyCallbacks.run(this.refBuddy);
  }

  public onRenameBuddy(callback: Callback): void {
    this.onRenameBuddyCallbacks.addCallback(callback);
  }

  public _onRenameBuddy(ev: DwtSelectionEvent): void {
    this.onRenameBuddyCallbacks.run(this.refBuddy);
  }

  public onSendInvitation(callback: Callback): void {
    this.onSendInvitationCallbacks.addCallback(callback);
  }

  public _onSendInvitation(ev: DwtSelectionEvent): void {
    this.onSendInvitationCallbacks.run(this.refBuddy);
  }

  public onAcceptInvitation(callback: Callback): void {
    this.onAcceptInvitationCallbacks.addCallback(callback);
  }

  public _onAcceptInvitation(ev: DwtSelectionEvent): void {
    this.onAcceptInvitationCallbacks.run(this.refBuddy);
  }

  public _dragListener(ev: DwtDragEvent): void {
    if (ev.action === DwtDragEvent.SET_DATA) {
      ev.doIt = false;
      ev.srcData = this;
    }
  }

  public _initialize(index?: number, realizeDeferred?: boolean, forceNode?: boolean): void {
    super._initialize(index, realizeDeferred, forceNode);
    this._updateVisibility();
  }

  public applyFilter(regex: RegExp): number {
    let itemsShown: number = 0;
    try {
      const result = this.getBuddy().filterTest(regex);
      if (result) {
        itemsShown = 1;
        this.setVisible(true, true, false);
      } else {
        this.setVisible(false, true, false);
      }
      const ref = regex.toString();
      if (ref === "/(?:)/" || ref === "/(?:)/i") {
        this._updateVisibility();
      }
    } catch (error) {
      const err = error;
      // Log.err(err, "BuddyTreeItem.applyFilter");
    }
    return itemsShown;
  }

  public getContact(): ZmContact {
    const contactList = AjxDispatcher.run("GetContacts");
    return contactList.getContactByEmail(this.refBuddy.getId());
  }

  private _onNicknameChange(nickname: string): void {
    let treeText = nickname;
    if (nickname.length > 19) {
      treeText = LearningClipUtils.clip(nickname, BuddyTreeItem.MAX_LENGTH, "DwtTreeItem-Text");
    }
    this.setText(treeText);
  }

  private _onStatusChange(buddy: IBuddy, status: IBuddyStatus): void {
    this.setImage(BuddyStatus.getCSS(status.getType()));
    this._updateVisibility();
  }

  private _onBuddyDelete(buddy: IBuddy): void {
    let remove = false;
    const ref = (this.parent as GroupTreeItem).getChildren() as BuddyTreeItem[];
    for (let i = 0, len = ref.length; i < len; i++) {
      const child: BuddyTreeItem = ref[i];
      if ((typeof child.getBuddy !== "undefined") && child.getBuddy().getId() === this.getBuddy().getId()) {
        remove = true;
      }
    }
    if (remove) {
      (this.parent as DwtComposite).removeChild(this);
    }
  }

  private _createTooltip(callback: AjxCallback): void {
    const expanded = AjxTemplate.expand("com_zextras_chat_open.Widgets#BuddyTreeItemTooltip", {
      buddy: this.getBuddy(),
      contact: this.getContact(),
      cssStatus: BuddyStatus.getCSS(this.getBuddy().getStatus().getType()),
    });
    callback.run(expanded);
  }

}
