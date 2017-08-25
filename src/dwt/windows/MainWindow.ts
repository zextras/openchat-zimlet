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

import {WindowBase} from "./WindowBase";
import {DwtShell} from "../../zimbra/ajax/dwt/widgets/DwtShell";
import {ZmAppCtxt} from "../../zimbra/zimbraMail/core/ZmAppCtxt";
import {SettingsManager, GroupData} from "../../settings/SettingsManager";
import {DwtComposite} from "../../zimbra/ajax/dwt/widgets/DwtComposite";
import {BuddyList} from "../../client/BuddyList";
import {DwtToolBar} from "../../zimbra/ajax/dwt/widgets/DwtToolBar";
import {Dwt} from "../../zimbra/ajax/dwt/core/Dwt";
import {StatusSelector} from "../widgets/StatusSelector";
import {MainMenuButton} from "../widgets/MainMenuButton";
import {DwtLabel} from "../../zimbra/ajax/dwt/widgets/DwtLabel";
import {BuddyListTree} from "../widgets/BuddyListTree";
import {Callback} from "../../lib/callbacks/Callback";
import {BuddyStatus} from "../../client/BuddyStatus";
import {DwtControlEvent} from "../../zimbra/ajax/dwt/events/DwtControlEvent";
import {LogEngine} from "../../lib/log/LogEngine";
import {Logger} from "../../lib/log/Logger";
import {DwtEvent} from "../../zimbra/ajax/dwt/events/DwtEvent";
import {Buddy} from "../../client/Buddy";
import {GroupTreeItem} from "../widgets/GroupTreeItem";
import {Group} from "../../client/Group";
import {ZmContact} from "../../zimbra/zimbraMail/abook/model/ZmContact";
import {Constants} from "../../Constants";
import {Setting} from "../../settings/Setting";
import {SmoothRoomWindowMover} from "./SmoothRoomWindowMover";
import {DwtPoint} from "../../zimbra/ajax/dwt/graphics/DwtPoint";
import {AjxListener} from "../../zimbra/ajax/events/AjxListener";
import {ChatPluginManager} from "../../lib/plugin/ChatPluginManager";
import {SortFcns} from "../SortFcns";
import {ChatFieldPlugin} from "../../lib/plugin/ChatFieldPlugin";
import {DwtInputField} from "../../zimbra/ajax/dwt/widgets/DwtInputField";
import {DwtButton} from "../../zimbra/ajax/dwt/widgets/DwtButton";
import {ZmMsg} from "../../zimbra/zimbraMail/ZmMsg";
import {ZimbraUtils} from "../../lib/ZimbraUtils";
import {DwtSelectionEvent} from "../../zimbra/ajax/dwt/events/DwtSelectionEvent";
import {appCtxt} from "../../zimbra/zimbraMail/appCtxt";

export class MainWindow extends WindowBase {

  public static ChatImageFieldPlugin = "Main Window Chat Image";
  public static StatusChangedPlugin = "Main Window Status Changed";
  public static SetSortMethodPlugin = "Main Window Set Sort Method";
  public static BrandPlugin = "Main Window Brand";

  public static DEBRAND_ICON   = "ImgZxChat_personalized_brand";
  public static WIDTH: number  = 315;
  public static HEIGHT: number = 446;
  public static RIGHT_PADDING  = 20;
  public static BOTTOM_PADDING  = 28;

  private mAppCtxt: ZmAppCtxt;
  private mSettingsManager: SettingsManager;
  private mBrandIcon: string;
  private mBrandName: string;
  private mContainerView: DwtComposite;
  private mStatusSelector: StatusSelector;
  private mOnDock: boolean;
  private mMainMenuButton: MainMenuButton;
  private mBuddyListTree: BuddyListTree;

  private mMainWindowPluginManager: ChatPluginManager;
  private mOnStatusSelectedCallbacks: ((status: BuddyStatus) => void)[];
  private mOnAddFriendSelectionCallbacks: (() => void)[];
  private mOnAddGroupSelectionCallbacks: (() => void)[];
  private mOnSettingsSelectionCallbacks: (() => void)[];
  private mOnBuddySelectedCallbacks: ((ev: DwtSelectionEvent) => void)[];
  private mOnDeleteBuddyCallbacks: ((buddy: Buddy) => void)[];
  private mOnRenameBuddyCallbacks: ((buddy: Buddy) => void)[];
  private mOnSendInvitationCallbacks: ((buddy: Buddy) => void)[];
  private mOnAcceptInvitationCallbacks: ((buddy: Buddy) => void)[];
  private mOnRenameGroupCallbacks: ((group: Group) => void)[];
  private mOnDeleteGroupCallbacks: ((group: Group) => void)[];
  private mOnGroupExpandedOrCollapsedCallbacks: ((item: GroupTreeItem, expand: boolean, save: boolean) => void)[];
  private mOnBuddyDroppedInGroupCallbacks: ((buddy: Buddy, group: Group) => void)[];
  private mOnContactDroppedInGroupCallbacks: ((contact: ZmContact, group: Group) => void)[];
  private mOnChangeSidebarOrDockCallbacks: ((docked: boolean) => void)[];
  private mOnShowHideOfflineCbkMgr: ((hide: boolean) => void)[];
  private mOnSetSortMethodCbkMgr: ((sortMethod: string) => void)[];
  private Log: Logger;
  private mTitleBar: DwtToolBar;
  private mStatusSelectorToolbar: DwtToolBar;
  private mSearchInput: DwtInputField;
  private mTitleLbl: DwtLabel;
  private mSearchButton: DwtButton;
  private mSearchToolBar: DwtToolBar;

  constructor(appCtxt: ZmAppCtxt, settingsManager: SettingsManager, buddyList: BuddyList, mainWindowPluginManager: ChatPluginManager) {

    super(
      appCtxt.getShell(),
      "ZxChat_Main_Window",
      MainWindow.DEBRAND_ICON,
      "Chat",
      [],
      undefined,
      false
    );
    this.mAppCtxt = appCtxt;
    this.mSettingsManager = settingsManager;
    this.mMainWindowPluginManager = mainWindowPluginManager;
    this.mMainWindowPluginManager.switchOn(this);
    this.mMainWindowPluginManager.registerFieldPlugin(MainWindowSortFunction.FieldName, new MainWindowSortFunction());
    this.mMainWindowPluginManager.setFieldPlugin(MainWindowSortFunction.FieldName, new SortFcns());
    this.mBrandIcon  = MainWindow.DEBRAND_ICON;
    this.mBrandName = "Chat";
    this.Log = LogEngine.getLogger(LogEngine.CHAT);
    this.mOnStatusSelectedCallbacks = [];
    this.mOnAddFriendSelectionCallbacks = [];
    this.mOnAddGroupSelectionCallbacks = [];
    this.mOnSettingsSelectionCallbacks = [];
    this.mOnBuddySelectedCallbacks = [];
    this.mOnDeleteBuddyCallbacks = [];
    this.mOnRenameBuddyCallbacks = [];
    this.mOnSendInvitationCallbacks = [];
    this.mOnAcceptInvitationCallbacks = [];
    this.mOnRenameGroupCallbacks = [];
    this.mOnDeleteGroupCallbacks = [];
    this.mOnGroupExpandedOrCollapsedCallbacks = [];
    this.mOnBuddyDroppedInGroupCallbacks = [];
    this.mOnContactDroppedInGroupCallbacks = [];
    this.mOnChangeSidebarOrDockCallbacks = [];
    this.mOnShowHideOfflineCbkMgr = [];
    this.mOnSetSortMethodCbkMgr = [];
    this.mContainerView = new DwtComposite({ parent: this });
    this.mContainerView.setHandler(
      "onmousedown",
      (ev: DwtEvent) => {
        this.mContainerView.parent.focus();
        return true;
      }
    );
    this.mTitleBar = new DwtToolBar({
      parent: this.mContainerView,
      parentElement: this._titleBarEl,
      className: "ZxChat_TitleBar_Toolbar"
    });
    this.mTitleBar.addListener(DwtEvent.ONCLICK, new AjxListener(this, this.onTitleBarClick));
    this.mTitleBar.setSize(
      `${MainWindow.WIDTH}px`,
      Dwt.DEFAULT
    );
    this.mTitleLbl = new DwtLabel({
      parent: this.mTitleBar,
      className: `WindowBaseTitleBar${ !ZimbraUtils.isUniversalUI() ? "-legacy-ui" : "" }`
    });
    this.mTitleLbl.addListener(DwtEvent.ONCLICK, new AjxListener(this, this.onTitleBarClick));
    this.mTitleLbl.setText("Chat");
    this.mTitleBar.addFiller();
    this.mMainMenuButton  = this.createMainMenuButton(this.mTitleBar, true);
    this.mMainMenuButton.setEnabled(false);
    this.mStatusSelectorToolbar = new DwtToolBar({
      parent: this.mContainerView,
      className: "MainWindowStatusToolbar"
    });
    if (!ZimbraUtils.isUniversalUI()) {
      this.mStatusSelectorToolbar.setSize(
        Dwt.DEFAULT,
        "45px"
      );
    }
    this.mStatusSelector = new StatusSelector(this.mStatusSelectorToolbar);
    this.mStatusSelector.onStatusSelected(new Callback(this, this.statusSelected));
    this.mStatusSelector.setSize(
      `${MainWindow.WIDTH}px`,
      (ZimbraUtils.isUniversalUI()) ? Dwt.DEFAULT : "45px"
    );
    this.mSearchToolBar = new DwtToolBar({
      parent: this.mContainerView,
      className: "ZToolbar ZWidget ZxChat_MainWindowSearchToolBar"
    });
    this.mSearchInput = new DwtInputField({
      parent: this.mSearchToolBar,
      className: `DwtInputField ZxChat_MainWindowSearchInput${ (!ZimbraUtils.isUniversalUI()) ? "-legacy-ui" : "" }`,
      hint: ZmMsg.search
    });
    this.mSearchInput.setHandler(DwtEvent.ONKEYUP, (ev) => this.handleSearchKeyUp(ev));
    this.mSearchButton = new DwtButton({
      parent: this.mSearchToolBar,
      className: `ZToolbarButton ZxChat_MainWindowSearchButton${ (!ZimbraUtils.isUniversalUI()) ? "-legacy-ui" : "" }`
    });
    this.mSearchButton.setImage("Search2");
    this.mSearchButton.addSelectionListener(new AjxListener(this, this.resetSearchField));
    this.mSearchInput.setSize(
      `${MainWindow.WIDTH - this.mSearchButton.getSize().x}px`,
      Dwt.DEFAULT
    );
    this.createBuddyListTree(buddyList);
    this.setView(this.mContainerView);
    this.onMinimize(new Callback(this, this.handleMinimized, true));
    this.onExpand(new Callback(this, this.handleMinimized, false));
    this.onShowHideOffline((hide) => this.setShowHideOffline(hide));
    this.onSetSortMethod((sortMethod) => this.setSortMethod(sortMethod));
    this.onChangeSidebarOrDock((docked) => this.changeSidebarOrDock(docked));
    this.mOnDock = true;
    if (this._titleBarEl.addEventListener) {
      this._titleBarEl.addEventListener(
        "click",
        <(ev: MouseEvent) => any>(new Callback(this, this.titleClickCallback)).toClosure(),
        false
      );
    } else if ((<IE8HtmlElement>this._titleBarEl).attachEvent)  {
      (<IE8HtmlElement>this._titleBarEl).attachEvent("onclick", (new Callback(this, this.titleClickCallback)).toClosure());
    }
    this.mAppCtxt.getShell().addListener(DwtEvent.CONTROL, new AjxListener(this, this.onShellResize));
    this.updateMainIcon();
  }

  public getPluginManager(): ChatPluginManager {
    return this.mMainWindowPluginManager;
  }

  public getBuddyListTree() {
    return this.mBuddyListTree;
  }

  public _createHtmlFromTemplate(templateId: string, data: {[p: string]: any}): void {
    data.doNotRenderTitleBar = true;
    super._createHtmlFromTemplate(templateId, data);
  }

  protected createMainMenuButton(toolbar: DwtToolBar, isPrimary: boolean): MainMenuButton {
    let mainMenuButton = new MainMenuButton(toolbar, this.mMainWindowPluginManager, this.getMainMenuButtonImageStyle(isPrimary));
    mainMenuButton.onAddFriendSelection(new Callback(this, this.addFriendOptionSelected));
    mainMenuButton.onAddGroupSelection(new Callback(this, this.addGroupOptionSelected));
    mainMenuButton.onSettingsSelection(new Callback(this, this.settingsOptionSelected));
//    Shouldn't be necessary ?!?
    mainMenuButton.onShowHideOffline(new Callback(this, this.showHideOffline));
    mainMenuButton.onChangeSidebarOrDock((docked) => this.changeSidebarOrDockSelected(docked));
    return mainMenuButton;
  }

  private getMainMenuButtonImageStyle(primary: boolean) {
    if (ZimbraUtils.isUniversalUI()) {
      return `MoreVertical,color=${primary ? "#b4d7eb" : "#989898"}`;
    } else {
      return `${primary ? "ZxChat_preferences" : "ZxChat_preferences-gray"}`;
    }
  }

  public enableDisableMainMenuButton(enable: boolean): void {
    this.mMainMenuButton.setEnabled(enable);
  }

  protected createBuddyListTree(buddyList: BuddyList): void {
    this.mBuddyListTree = new BuddyListTree(
      this.mContainerView,
      buddyList,
      this.mAppCtxt,
      this.mMainWindowPluginManager.getFieldPlugin(MainWindowSortFunction.FieldName),
      this.mMainWindowPluginManager
    );
    this.mBuddyListTree.onAddBuddy(new Callback(this, this.updateMainIcon));
    this.mBuddyListTree.onBuddyStatusChange(new Callback(this, this.updateMainIcon));
    this.mBuddyListTree.onRenameGroupSelected(new Callback(this, this.renameGroup));
    this.mBuddyListTree.onDeleteGroupSelected(new Callback(this, this.deleteGroup));
    this.mBuddyListTree.onBuddySelected(new Callback(this, this.buddySelected));
    this.mBuddyListTree.onDeleteBuddy(new Callback(this, this.deleteBuddy));
    this.mBuddyListTree.onRemoveBuddy(new Callback(this, this.updateMainIcon));
    this.mBuddyListTree.onRenameBuddy(new Callback(this, this.renameBuddy));
    this.mBuddyListTree.onSendInvitation(new Callback(this, this.inviteBuddy));
    this.mBuddyListTree.onAcceptInvitation(new Callback(this, this.acceptInvitation));
    this.mBuddyListTree.onBuddyDroppedInGroup(new Callback(this, this.buddyDroppedInGroup));
    this.mBuddyListTree.onContactDroppedInGroup(new Callback(this, this.contactDroppedInGroup));
    this.mBuddyListTree.onAddFriendSelection(new Callback(this, this.addFriendOptionSelected));
    this.mBuddyListTree.onGroupExpandCollapse(new Callback(this, this.expandOrCollapseGroup));
    let buddyListHeight = MainWindow.HEIGHT - this.mTitleBar.getSize().y - this.mStatusSelector.getSize().y - this.mSearchInput.getSize().y;
    if (ZimbraUtils.isUniversalUI()) {
      buddyListHeight -= 24;
    } else {
      buddyListHeight -= 3;
    }
    this.mBuddyListTree.setSize(
      `${MainWindow.WIDTH + 1}px`,
      `${buddyListHeight}px`
    );
  }

  public setUserStatuses(statuses: BuddyStatus[]): void {
    this.mStatusSelector.clear();
    this.mStatusSelector.setOptionStatuses(statuses);
  }

  public setCurrentStatus(status: BuddyStatus): void {
    this.mMainWindowPluginManager.triggerPlugins(MainWindow.StatusChangedPlugin, status);
    this.mStatusSelector.setCurrentStatus(status);
  }

  public setSortMethod(sortMethod: string): void {
    this.mMainWindowPluginManager.triggerPlugins(MainWindow.SetSortMethodPlugin, sortMethod);
    this.mBuddyListTree.setSortMethod(sortMethod, this.mMainWindowPluginManager.getFieldPlugin(MainWindowSortFunction.FieldName));
  }

  public setShowHideOffline(hide: boolean): void {
    this.mMainMenuButton.setHideOfflineButtonStatus(hide);
    this.mBuddyListTree.showHideOfflineBuddies(hide);
  }

  public getGroupsData(): GroupData[] {
    return this.mBuddyListTree.getGroupsData();
  }

  public setGroupsData(data: GroupData[]): void {
    return this.mBuddyListTree.setGroupsData(data);
  }

  public setBrandOptions(name: string, icon: string): void {
    this.mBrandIcon = icon;
    this.mBrandName = name;
    this.setTitle(name);
    this.mTitleLbl.setText(name);
  }

  public updateMainIcon(): void {
    this.setBrandOptions(this.mBrandName, this.mBrandIcon);
  }

  public changeSidebarOrDock(docked: boolean): void {
    if (docked) {
      this.moveToDock();
    }
    else {
      this.moveToSidebar();
    }
  }

  public onShellResize(controlEvent: DwtControlEvent): void {
    if (
      typeof controlEvent !== "undefined" && controlEvent !== null &&
      typeof controlEvent.newHeight !== "undefined" && controlEvent.newHeight !== null &&
      typeof controlEvent.newWidth !== "undefined" && controlEvent.newWidth !== null &&
      typeof controlEvent.oldHeight !== "undefined" && controlEvent.oldHeight !== null &&
      typeof controlEvent.oldWidth !== "undefined" && controlEvent.oldWidth !== null
    ) {
      if (controlEvent.newHeight === controlEvent.oldHeight && controlEvent.newWidth === controlEvent.oldWidth) {
        return;
      }
      else {
        if (this.mOnDock) {
          let posPoint = this.getDefaultPosition();
          this.setLocation(posPoint.x, posPoint.y);
        }
        else {
          this.Log.debug(event, "MainWindow.onShellResize");
          this.resizeSidebar(
            this.getBounds().width,
            controlEvent.newHeight
          );
        }
      }
    }
  }

  public popup(): void {
    this.setVisible(true);
    super.popup(this.getDefaultPosition());
    this.mBuddyListTree.setExpanded(true, false);
  }

  public onStatusSelected(cbk: (status: BuddyStatus) => void): void {
    this.mOnStatusSelectedCallbacks.push(cbk);
  }

  private statusSelected(status: BuddyStatus): void {
    for (let cbk of this.mOnStatusSelectedCallbacks) cbk(status);
  }

  public onAddFriendOptionSelected(cbk: () => void): void {
    this.mOnAddFriendSelectionCallbacks.push(cbk);
  }

  private addFriendOptionSelected(): void {
    for (let cbk of this.mOnAddFriendSelectionCallbacks) cbk();
  }

  public onAddGroupOptionSelected(cbk: () => void): void {
    this.mOnAddGroupSelectionCallbacks.push(cbk);
  }

  private addGroupOptionSelected(): void {
    for (let cbk of this.mOnAddGroupSelectionCallbacks) cbk();
  }

  public onSettingsOptionSelected(cbk: () => void): void {
    this.mOnSettingsSelectionCallbacks.push(cbk);
  }

  private settingsOptionSelected(): void {
    for (let cbk of this.mOnSettingsSelectionCallbacks) cbk();
  }

  public onShowHideOffline(cbk: (hide: boolean) => void): void {
    this.mOnShowHideOfflineCbkMgr.push(cbk);
  }

  public showHideOffline(hide: boolean): void {
    for (let cbk of this.mOnShowHideOfflineCbkMgr) cbk(hide);
  }

  public onSetSortMethod(cbk: (sortMethod: string) => void): void {
    this.mOnSetSortMethodCbkMgr.push(cbk);
  }

  public sortMethodSet(sortMethod: string): void {
    for (let cbk of this.mOnSetSortMethodCbkMgr) cbk(sortMethod);
  }

  public onBuddySelected(cbk: (ev: DwtSelectionEvent) => void): void {
    this.mOnBuddySelectedCallbacks.push(cbk);
  }

  private buddySelected(ev: DwtSelectionEvent): void {
    for (let cbk of this.mOnBuddySelectedCallbacks) cbk(ev);
  }

  public onChangeSidebarOrDock(cbk: (docked: boolean) => void): void {
    this.mOnChangeSidebarOrDockCallbacks.push(cbk);
  }

  private changeSidebarOrDockSelected(docked: boolean): void {
    for (let cbk of this.mOnChangeSidebarOrDockCallbacks) cbk(docked);
  }

  public onDeleteBuddy(cbk: (buddy: Buddy) => void): void {
    this.mOnDeleteBuddyCallbacks.push(cbk);
  }

  private deleteBuddy(buddy: Buddy): void {
    for (let cbk of this.mOnDeleteBuddyCallbacks) cbk(buddy);
  }

  public onRenameBuddy(cbk: (buddy: Buddy) => void): void {
    this.mOnRenameBuddyCallbacks.push(cbk);
  }

  private renameBuddy(buddy: Buddy): void {
    for (let cbk of this.mOnRenameBuddyCallbacks) cbk(buddy);
  }

  public onSendInvitation(cbk: (buddy: Buddy) => void): void {
    this.mOnSendInvitationCallbacks.push(cbk);
  }

  private inviteBuddy(buddy: Buddy): void {
    for (let cbk of this.mOnSendInvitationCallbacks) cbk(buddy);
  }

  public onAcceptInvitation(cbk: (buddy: Buddy) => void): void {
    this.mOnAcceptInvitationCallbacks.push(cbk);
  }

  private acceptInvitation(buddy: Buddy): void {
    for (let cbk of this.mOnAcceptInvitationCallbacks) cbk(buddy);
  }

  public onDeleteGroup(cbk: (group: Group) => void): void {
    this.mOnDeleteGroupCallbacks.push(cbk);
  }

  private deleteGroup(group: Group): void {
    for (let cbk of this.mOnDeleteGroupCallbacks) cbk(group);
  }

  public onRenameGroup(cbk: (group: Group) => void): void {
    this.mOnRenameGroupCallbacks.push(cbk);
  }

  private renameGroup(group: Group): void {
    for (let cbk of this.mOnRenameGroupCallbacks) cbk(group);
  }

  public onGroupExpandedOrCollapsed(cbk: (item: GroupTreeItem, expand: boolean, save: boolean) => void): void {
    this.mOnGroupExpandedOrCollapsedCallbacks.push(cbk);
  }

  private expandOrCollapseGroup(item: GroupTreeItem, expand: boolean, save: boolean): void {
    for (let cbk of this.mOnGroupExpandedOrCollapsedCallbacks) cbk(item, expand, save);
  }

  public onBuddyDroppedInGroup(cbk: (buddy: Buddy, group: Group) => void): void {
    this.mOnBuddyDroppedInGroupCallbacks.push(cbk);
  }

  private buddyDroppedInGroup(buddy: Buddy, group: Group): void {
    for (let cbk of this.mOnBuddyDroppedInGroupCallbacks) cbk(buddy, group);
  }

  public onContactDroppedInGroup(cbk: (contact: ZmContact, group: Group) => void): void {
    this.mOnContactDroppedInGroupCallbacks.push(cbk);
  }

  private contactDroppedInGroup(contact: ZmContact, group: Group): void {
    for (let cbk of this.mOnContactDroppedInGroupCallbacks) cbk(contact, group);
  }

  private moveToDock(): void {
    this.mOnDock = true;
    this.handleSidebarResize();
    this.mTitleBar.setSize(
      `${MainWindow.WIDTH}px`,
      Dwt.DEFAULT
    );
    this.mMainMenuButton.reparent(this.mTitleBar);
    this.mMainMenuButton.setSwitchOnSidebarStatus(false);
    this.mMainMenuButton.setImage(this.getMainMenuButtonImageStyle(true));
    this.mStatusSelector.setSize(
      `${MainWindow.WIDTH}px`,
      (ZimbraUtils.isUniversalUI()) ? Dwt.DEFAULT : "45px"
    );
    this.mBuddyListTree.setSize(
      Dwt.DEFAULT,
      `${MainWindow.HEIGHT - 15 - this.mTitleBar.getSize().y - this.mStatusSelectorToolbar.getSize().y - this.mSearchToolBar.getSize().y}px`
    );
    this.mContainerView.setSize(
      Dwt.DEFAULT,
      `${MainWindow.HEIGHT - this.mTitleBar.getSize().y}px`
    );
    this.mContainerView.reparent(this);
    this.setView(this.mContainerView);
    this.popup();
  }

  private moveToSidebar(): void {
    this.mOnDock = false;
    this.handleSidebarResize();
    this.mMainMenuButton.reparent(this.mStatusSelectorToolbar);
    this.mMainMenuButton.setSwitchOnSidebarStatus(true);
    this.mMainMenuButton.setImage(this.getMainMenuButtonImageStyle(false));
    this.mStatusSelector.setSize(
      `${MainWindow.WIDTH - this.mMainMenuButton.getSize().x}px`,
      (ZimbraUtils.isUniversalUI()) ? Dwt.DEFAULT : "45px"
    );
    let container: HTMLElement = document.getElementById(Constants.ID_SIDEBAR_DIV_CONTAINER);
    this.mContainerView.reparentHtmlElement(container, 0);
    this.mBuddyListTree.setSize(
      Dwt.DEFAULT,
      `${appCtxt.getShell().getSize().y - 107 - 15 - this.mTitleBar.getSize().y - this.mStatusSelectorToolbar.getSize().y - this.mSearchToolBar.getSize().y}px`
    );
    this.mContainerView.setSize(
      Dwt.DEFAULT,
      `${appCtxt.getShell().getSize().y - 107}px` // 107 is the Zimbra header (more or less...)
    );
    this.popdown();
    this.setVisible(true);
  }

  private handleSidebarResize(): void {
    this.resizeSidebar(
      this.getBounds().width,
      this.mAppCtxt.getShell().getBounds().height
    );
    this.mAppCtxt.getShell()._currWinSize.x = 0;
    this.mAppCtxt.getShell()._currWinSize.y = 0;
    if (this.mAppCtxt.getShell().isListenerRegistered(DwtEvent.CONTROL)) {
      let controlEvent: DwtControlEvent = DwtShell.controlEvent;
      controlEvent.reset();
      controlEvent.oldWidth = this.mAppCtxt.getShell()._currWinSize.x;
      controlEvent.oldHeight = this.mAppCtxt.getShell()._currWinSize.y;
      this.mAppCtxt.getShell()._currWinSize = Dwt.getWindowSize();
      controlEvent.newWidth = this.mAppCtxt.getShell()._currWinSize.x;
      controlEvent.newHeight = this.mAppCtxt.getShell()._currWinSize.y;
      this.mAppCtxt.getShell().notifyListeners(DwtEvent.CONTROL, controlEvent);
    }
    else {
      this.mAppCtxt.getShell()._currWinSize = Dwt.getWindowSize();
    }
    try {
      this.mAppCtxt.getCalManager().getCalViewController().getViewMgr().getCurrentView().updateTimeIndicator();
    }
    catch (ignore) {}
  }

  private resizeSidebar(width: number, height: number) {
    let tdElement: HTMLElement = document.getElementById(Constants.ID_SIDEBAR_DIV),
      container: HTMLElement = document.getElementById(Constants.ID_SIDEBAR_DIV_CONTAINER);
    tdElement.className = "";
    if (this.mOnDock) {
      if (typeof tdElement !== "undefined" && tdElement !== null) tdElement.style.width = "1px";
      if (typeof container !== "undefined" && container !== null) container.style.width = "1px";
    } else {
      if (typeof container !== "undefined" && container !== null) {
        container.style.paddingLeft = "6px";
        container.style.display = "block";
        container.style.width = `${width + 10}px`;
      }
      if (typeof tdElement !== "undefined" && tdElement !== null) {
        tdElement.style.display = "table-cell";
        tdElement.style.width = `${width + 10}px`;
      }
    }
  }

  private titleClickCallback(): void {
    if (this.isMinimized()) {
      this.setExpanded();
    }
    else {
      this.setMinimized();
    }
  }

  private handleMinimized(minimized: boolean, window: WindowBase, save: boolean = true): void {
    if (typeof this.mSettingsManager !== "undefined" && this.mSettingsManager !== null && save) {
      this.mSettingsManager.set(Setting.IM_USR_PREF_DOCK_UP, !minimized);
    }
    (new SmoothRoomWindowMover(this, this.getDefaultPosition(), 40)).start();
  }

  private getDefaultPosition(): DwtPoint {
    let shellSize: DwtPoint = this.mAppCtxt.getShell().getSize(),
      roomSize = this.getSize();
    return new DwtPoint(
      shellSize.x - roomSize.x - MainWindow.RIGHT_PADDING,
    shellSize.y - roomSize.y
    );
  }

  public triggerSortGroups(): void {
    this.mBuddyListTree.triggerSortGroups();
  }

  // Don't drag me! >:(
  public _initializeDragging(): void {}

  private resetSearchField(): void {
    this.mSearchInput.setValue("");
    this.mBuddyListTree.applyFilter("");
    this.mSearchButton.setImage("Search2");
  }

  private handleSearchKeyUp(ev: DwtEvent): boolean {
    const value: string = this.mSearchInput.getValue();
    this.mBuddyListTree.applyFilter(value);
    this.mSearchButton.setImage(value === "" ? "Search2" : "Close");
    return true;
  }

}

export class MainWindowSortFunction implements ChatFieldPlugin {

  public static FieldName = "Main Window Sort Function";

  private mSortFcns: SortFcns;

  public setField(sortFcns: SortFcns): void {
    this.mSortFcns = sortFcns;
  }

  public getField(): SortFcns {
    return this.mSortFcns;
  }
}

interface IE8HtmlElement extends HTMLElement {
  attachEvent(ev: string, hdlr: () => any): void;
}
