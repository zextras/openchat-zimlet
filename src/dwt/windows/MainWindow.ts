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
import {SettingsManager, GroupsData} from "../../settings/SettingsManager";
import {CallbackManager} from "../../lib/callbacks/CallbackManager";
import {DwtComposite} from "../../zimbra/ajax/dwt/widgets/DwtComposite";
import {BuddyList} from "../../client/BuddyList";
import {Bowser} from "../../libext/bowser";
import {DwtToolBar} from "../../zimbra/ajax/dwt/widgets/DwtToolBar";
import {Dwt} from "../../zimbra/ajax/dwt/core/Dwt";
import {StatusSelector} from "../widgets/StatusSelector";
import {MainMenuButton} from "../widgets/MainMenuButton";
import {SearchInputField} from "../widgets/SearchInputField";
import {DwtLabel} from "../../zimbra/ajax/dwt/widgets/DwtLabel";
import {BuddyListTree} from "../widgets/BuddyListTree";
import {Callback} from "../../lib/callbacks/Callback";
import {DwtKeyEvent} from "../../zimbra/ajax/dwt/events/DwtKeyEvent";
import {DwtMouseEvent} from "../../zimbra/ajax/dwt/events/DwtMouseEvent";
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
import {Version} from "../../lib/Version";
import {Setting} from "../../settings/Setting";
import {SmoothRoomWindowMover} from "./SmoothRoomWindowMover";
import {DwtPoint} from "../../zimbra/ajax/dwt/graphics/DwtPoint";
import {GroupStats} from "../../client/GroupStats";
import {AjxListener} from "../../zimbra/ajax/events/AjxListener";
import {ChatPluginManager} from "../../lib/plugin/ChatPluginManager";
import {SortFcns} from "../SortFcns";
import {ChatFieldPlugin} from "../../lib/plugin/ChatFieldPlugin";

export class MainWindow extends WindowBase {

  public static ChatImageFieldPlugin = "Main Window Chat Image";
  public static StatusChangedPlugin = "Main Window Status Changed";
  public static SetSortMethodPlugin = "Main Window Set Sort Method";
  public static BrandPlugin = "Main Window Brand";

  public static DEBRAND_ICON   = "ImgZxChat_personalized_brand";
  public static WIDTH: number  = 210 * 1.05;
  public static HEIGHT: number = 340 * 1.25;
  public static RIGHT_PADDING  = 20;
  public static BOTTOM_PADDING  = 28;

  private mAppCtxt: ZmAppCtxt;
  private mSettingsManager: SettingsManager;
  private mBrandIcon: string;
  private mBrandName: string;
  private mContainerView: DwtComposite;
  private mStatusSelector: StatusSelector;
  private mSearchInput: SearchInputField;
  private mBrandLabelForSidebar: DwtLabel;
  private mToolSepSize: number;
  private mOnDock: boolean;
  private mMainMenuButton: MainMenuButton;
  private mBuddyListTree: BuddyListTree;

  private mMainWindowPluginManager: ChatPluginManager;
  private mOnStatusSelectedCallbacks: CallbackManager;
  private mOnAddFriendSelectionCallbacks: CallbackManager;
  private mOnCreateChatRoomSelectionCallbacks: CallbackManager;
  private mOnAddGroupSelectionCallbacks: CallbackManager;
  private mOnSettingsSelectionCallbacks: CallbackManager;
  private mOnBuddySelectedCallbacks: CallbackManager;
  private mOnDeleteBuddyCallbacks: CallbackManager;
  private mOnRenameBuddyCallbacks: CallbackManager;
  private mOnSendInvitationCallbacks: CallbackManager;
  private mOnAcceptInvitationCallbacks: CallbackManager;
  private mOnRenameGroupCallbacks: CallbackManager;
  private mOnDeleteGroupCallbacks: CallbackManager;
  private mOnGroupExpandedOrCollapsedCallbacks: CallbackManager;
  private mOnBuddyDroppedInGroupCallbacks: CallbackManager;
  private mOnContactDroppedInGroupCallbacks: CallbackManager;
  private mOnChangeSidebarOrDockCallbacks: CallbackManager;
  private mOnShowHideOfflineCbkMgr: CallbackManager;
  private mOnSetSortMethodCbkMgr: CallbackManager;
  private Log: Logger;

  constructor(appCtxt: ZmAppCtxt, settingsManager: SettingsManager, buddyList: BuddyList, mainWindowPluginManager: ChatPluginManager) {

    super(
      appCtxt.getShell(),
      "ZxChat_Main_Window",
      MainWindow.DEBRAND_ICON,
      "Chat",
      [WindowBase.BTN_MINIMIZE],
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
    this._titleEl.style.width = "161px";
    this._titleEl.style.cursor = "default";
    this.mOnStatusSelectedCallbacks = new CallbackManager();
    this.mOnAddFriendSelectionCallbacks = new CallbackManager();
    this.mOnCreateChatRoomSelectionCallbacks = new CallbackManager();
    this.mOnAddGroupSelectionCallbacks = new CallbackManager();
    this.mOnSettingsSelectionCallbacks = new CallbackManager();
    this.mOnBuddySelectedCallbacks = new CallbackManager();
    this.mOnDeleteBuddyCallbacks = new CallbackManager();
    this.mOnRenameBuddyCallbacks = new CallbackManager();
    this.mOnSendInvitationCallbacks = new CallbackManager();
    this.mOnAcceptInvitationCallbacks = new CallbackManager();
    this.mOnRenameGroupCallbacks = new CallbackManager();
    this.mOnDeleteGroupCallbacks = new CallbackManager();
    this.mOnGroupExpandedOrCollapsedCallbacks = new CallbackManager();
    this.mOnBuddyDroppedInGroupCallbacks = new CallbackManager();
    this.mOnContactDroppedInGroupCallbacks = new CallbackManager();
    this.mOnChangeSidebarOrDockCallbacks = new CallbackManager();
    this.mOnShowHideOfflineCbkMgr = new CallbackManager();
    this.mOnSetSortMethodCbkMgr = new CallbackManager();
    this.mContainerView = new DwtComposite({parent: this});
    this.mContainerView.setSize(
      Bowser.msie ? MainWindow.WIDTH - 6 : MainWindow.WIDTH - 2,
      MainWindow.HEIGHT - 26
    );

    let toolbar: DwtToolBar = new DwtToolBar({parent: this.mContainerView});
    this.createStatusSelector(toolbar);
    this.createMainMenuButton(toolbar);
    // let separator: DwtControl = new DwtControl({parent: this.mContainerView, className: "horizSep"});
    this.createSearchInput();
    this.createBuddyListTree(buddyList);
    this.createBrandLabelForSidebar();

    // # Size of the toolbar and the separator
    // Resize status selector in toolbar
    let newWidth: number = toolbar.getSize().x - this.mMainMenuButton.getSize().x;
    this.mStatusSelector.setSize(newWidth - 10, Dwt.DEFAULT);
    this.mToolSepSize = toolbar.getSize().y + this.mSearchInput.getSize().y;

    this.setView(this.mContainerView);
    this.onMinimize(new Callback(this, this.handleMinimized, true));
    this.onExpand(new Callback(this, this.handleMinimized, false));
    this.onShowHideOffline(new Callback(this, this.setShowHideOffline));
    this.onSetSortMethod(new Callback(this, this.setSortMethod));
    this.onChangeSidebarOrDock(new Callback(this, this.changeSidebarOrDock));
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

  protected createStatusSelector(toolbar: DwtToolBar): void {
    this.mStatusSelector = new StatusSelector(toolbar);
    this.mStatusSelector.onStatusSelected(new Callback(this, this.statusSelected));
  }

  protected createMainMenuButton(toolbar: DwtToolBar): void {
    this.mMainMenuButton = new MainMenuButton(toolbar, this.mMainWindowPluginManager);
    this.mMainMenuButton.onAddFriendSelection(new Callback(this, this.addFriendOptionSelected));
    this.mMainMenuButton.onAddGroupSelection(new Callback(this, this.addGroupOptionSelected));
    this.mMainMenuButton.onSettingsSelection(new Callback(this, this.settingsOptionSelected));
//    Shouldn't be necessary ?!?
    this.mMainMenuButton.onShowHideOffline(new Callback(this, this.showHideOffline));
    this.mMainMenuButton.onChangeSidebarOrDock(new Callback(this, this.changeSidebarOrDockSelected));
    // To advanced
    // this.mMainMenuButton.onCreateMultiChatRoomSelection(new Callback(this, this.createChatRoomOptionSelected));
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
  }

  protected createSearchInput(): void {
    this.mSearchInput = new SearchInputField(this.mContainerView);
    this.mSearchInput.onChange(new Callback(this, this.onSearchInputChange));
  }

  protected createBrandLabelForSidebar(): void {
    this.mBrandLabelForSidebar = new DwtLabel({parent: this.mContainerView});
    this.mBrandLabelForSidebar.setSize(Dwt.DEFAULT, "20px");
    this.mBrandLabelForSidebar.setText("Chat");
    this.mBrandLabelForSidebar.setImage(MainWindow.DEBRAND_ICON);
  }

  private onSearchInputChange(ev: DwtMouseEvent|DwtKeyEvent, value: string): void {
    this.mBuddyListTree.applyFilter(value);
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

  public getGroupsData(): GroupsData {
    return this.mBuddyListTree.getGroupsData();
  }

  public setGroupsData(data: GroupsData): void {
    return this.mBuddyListTree.setGroupsData(data);
  }

  public setBrandOptions(name: string, icon: string): void {
    this.mBrandIcon = icon;
    this.mBrandName = name;
    this.setIcon(icon);
    this.setTitle(name);
    this.mBrandLabelForSidebar.setText("&nbsp;" + name);
    if (/^Img/g.test(icon)) {
      icon = icon.substr(3);
    }
    this.mBrandLabelForSidebar.setImage(icon);
  }

  public updateMainIcon(): void {
    let groupStats: GroupStats = this.mBuddyListTree.getStatistics();
    if (groupStats.getWaitingForResponseBuddiesCount() > 0) {
      this.setIcon("ImgZxChat_need_response");
      this.mBrandLabelForSidebar.setImage("ZxChat_need_response");
    }
    else {
      this.setBrandOptions(this.mBrandName, this.mBrandIcon);
    }
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

  public onStatusSelected(callback: Callback): void {
    this.mOnStatusSelectedCallbacks.addCallback(callback);
  }

  private statusSelected(status: BuddyStatus): void {
    this.mOnStatusSelectedCallbacks.run(status);
  }

  public onAddFriendOptionSelected(callback: Callback): void {
    this.mOnAddFriendSelectionCallbacks.addCallback(callback);
  }

  private addFriendOptionSelected(): void {
    this.mOnAddFriendSelectionCallbacks.run();
  }

  public onAddGroupOptionSelected(callback: Callback): void {
    this.mOnAddGroupSelectionCallbacks.addCallback(callback);
  }

  private addGroupOptionSelected(): void {
    this.mOnAddGroupSelectionCallbacks.run();
  }

  public onSettingsOptionSelected(callback: Callback): void {
    this.mOnSettingsSelectionCallbacks.addCallback(callback);
  }

  private settingsOptionSelected(): void {
    this.mOnSettingsSelectionCallbacks.run();
  }

  public onShowHideOffline(callback: Callback): void {
    this.mOnShowHideOfflineCbkMgr.addCallback(callback);
  }

  public showHideOffline(hide: boolean): void {
    this.mOnShowHideOfflineCbkMgr.run(hide);
  }

  public onSetSortMethod(callback: Callback): void {
    this.mOnSetSortMethodCbkMgr.addCallback(callback);
  }

  public sortMethodSet(sortMethod: string): void {
    this.mOnSetSortMethodCbkMgr.run(sortMethod);
  }

  public onBuddySelected(callback: Callback): void {
    this.mOnBuddySelectedCallbacks.addCallback(callback);
  }

  private buddySelected(ev: DwtEvent): void {
    this.mOnBuddySelectedCallbacks.run(ev);
  }

  public onChangeSidebarOrDock(callback: Callback): void {
    this.mOnChangeSidebarOrDockCallbacks.addCallback(callback);
  }

  private changeSidebarOrDockSelected(docked: boolean): void {
    this.mOnChangeSidebarOrDockCallbacks.run(docked);
  }

  public onDeleteBuddy(callback: Callback): void {
    this.mOnDeleteBuddyCallbacks.addCallback(callback);
  }

  private deleteBuddy(buddy: Buddy): void {
    this.mOnDeleteBuddyCallbacks.run(buddy);
  }

  public onRenameBuddy(callback: Callback): void {
    this.mOnRenameBuddyCallbacks.addCallback(callback);
  }

  private renameBuddy(buddy: Buddy): void {
    this.mOnRenameBuddyCallbacks.run(buddy);
  }

  public onSendInvitation(callback: Callback): void {
    this.mOnSendInvitationCallbacks.addCallback(callback);
  }

  private inviteBuddy(buddy: Buddy): void {
    this.mOnSendInvitationCallbacks.run(buddy);
  }

  public onAcceptInvitation(callback: Callback): void {
    this.mOnAcceptInvitationCallbacks.addCallback(callback);
  }

  private acceptInvitation(buddy: Buddy): void {
    this.mOnAcceptInvitationCallbacks.run(buddy);
  }

  public onDeleteGroup(callback: Callback): void {
    this.mOnDeleteGroupCallbacks.addCallback(callback);
  }

  private deleteGroup(buddy: Buddy): void {
    this.mOnDeleteGroupCallbacks.run(buddy);
  }

  public onRenameGroup(callback: Callback): void {
    this.mOnRenameGroupCallbacks.addCallback(callback);
  }

  private renameGroup(buddy: Buddy): void {
    this.mOnRenameGroupCallbacks.run(buddy);
  }

  public onGroupExpandedOrCollapsed(callback: Callback): void {
    this.mOnGroupExpandedOrCollapsedCallbacks.addCallback(callback);
  }

  private expandOrCollapseGroup(item: GroupTreeItem, expand: boolean, save: boolean): void {
    this.mOnGroupExpandedOrCollapsedCallbacks.run(item, expand, save);
  }

  public onBuddyDroppedInGroup(callback: Callback): void {
    this.mOnBuddyDroppedInGroupCallbacks.addCallback(callback);
  }

  private buddyDroppedInGroup(buddy: Buddy, group: Group): void {
    this.mOnBuddyDroppedInGroupCallbacks.run(buddy, group);
  }

  public onContactDroppedInGroup(callback: Callback): void {
    this.mOnContactDroppedInGroupCallbacks.addCallback(callback);
  }

  private contactDroppedInGroup(contact: ZmContact, group: Group): void {
    this.mOnContactDroppedInGroupCallbacks.run(contact, group);
  }

  private moveToDock(): void {
    this.mOnDock = true;
    this.mBrandLabelForSidebar.setVisible(false);
    this.handleSidebarResize();
    this.mMainMenuButton.setSwitchOnSidebarStatus(false);
    this.mContainerView.reparent(this);
    this.setView(this.mContainerView);
    this.mContainerView.setSize(
      Bowser.msie ? MainWindow.WIDTH - 6 : MainWindow.WIDTH - 2,
      MainWindow.HEIGHT - 26
    );
    this.mBuddyListTree.setSize(
      Dwt.DEFAULT,
      MainWindow.HEIGHT - this.mToolSepSize - 38
    );
    this.popup();
  }

  private moveToSidebar(): void {
    this.mOnDock = false;
    this.mBrandLabelForSidebar.setVisible(true);
    this.handleSidebarResize();
    this.mMainMenuButton.setSwitchOnSidebarStatus(true);
    let container: HTMLElement = document.getElementById(Constants.ID_SIDEBAR_DIV_CONTAINER);
    //   appTopBarEl: HTMLElement = document.getElementById(Constants.ID_TOP_BAR_DIV),
    //   appToolbarEl: HTMLElement = document.getElementById(Constants.ID_APP_TOOLBAR_DIV),
    //   sHeight: number = Dwt.getBounds(container).height;
    // if (typeof appTopBarEl !== "undefined" && appTopBarEl !== null) {
    //   sHeight -= Dwt.getBounds(appTopBarEl).height;
    // }
    // if (typeof appToolbarEl !== "undefined" && appToolbarEl !== null) {
    //   sHeight -= Dwt.getBounds(appTopBarEl).height;
    // }
    this.mContainerView.reparentHtmlElement(container, 0);
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
    let sHeight: number = height,
      tdElement: HTMLElement = document.getElementById(Constants.ID_SIDEBAR_DIV),
      container: HTMLElement = document.getElementById(Constants.ID_SIDEBAR_DIV_CONTAINER),
      appTopBarEl: HTMLElement = document.getElementById(Constants.ID_TOP_BAR_DIV),
      appToolbarEl: HTMLElement = document.getElementById(Constants.ID_APP_TOOLBAR_DIV);
    if (typeof appTopBarEl !== "undefined" && appTopBarEl !== null) {
      sHeight -= Dwt.getBounds(appTopBarEl).height;
    }
    if (typeof appToolbarEl !== "undefined" && appToolbarEl !== null) {
      sHeight -= Dwt.getBounds(appTopBarEl).height;
    }
    tdElement.className = "";
    if (this.mOnDock) {
      if (typeof tdElement !== "undefined" && tdElement !== null) tdElement.style.width = "1px";
      if (typeof container !== "undefined" && container !== null) container.style.width = "1px";
    }
    else {
      if (Version.isZ8_5Up()) {
        if (typeof tdElement !== "undefined" && tdElement !== null) tdElement.style.width = (width + 10) + "px";
        if (typeof container !== "undefined" && container !== null) container.style.width = (width + 10) + "px";
      }
      else {
        if (typeof tdElement !== "undefined" && tdElement !== null) tdElement.style.width = (width + 8) + "px";
        if (typeof container !== "undefined" && container !== null) container.style.width = width + "px";
      }
      if (typeof container !== "undefined" && container !== null) {
        container.style.paddingLeft = "6px";
        container.style.display = "block";
      }
      if (typeof tdElement !== "undefined" && tdElement !== null) {
        tdElement.style.display = "table-cell";
      }
      this.mContainerView.setSize(
        Bowser.msie ? MainWindow.WIDTH - 6 : MainWindow.WIDTH - 2,
        sHeight
      );
      this.mBuddyListTree.setSize(
        Dwt.DEFAULT,
        sHeight - this.mToolSepSize + 16
      );
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

  private handleMinimized(minimized: boolean, save: boolean = true): void {
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
