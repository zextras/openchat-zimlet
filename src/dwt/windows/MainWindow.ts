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

import {BuddyList} from "../../client/BuddyList";
import {Group} from "../../client/Group";
import {IBuddy} from "../../client/IBuddy";
import {IBuddyStatus} from "../../client/IBuddyStatus";
import {Constants} from "../../Constants";
import {Callback} from "../../lib/callbacks/Callback";
import {LogEngine} from "../../lib/log/LogEngine";
import {Logger} from "../../lib/log/Logger";
import {IChatFieldPlugin} from "../../lib/plugin/ChatFieldPlugin";
import {ChatPluginManager} from "../../lib/plugin/ChatPluginManager";
import {ZimbraUtils} from "../../lib/ZimbraUtils";
import {Setting} from "../../settings/Setting";
import {IGroupData, SettingsManager} from "../../settings/SettingsManager";
import {Dwt} from "../../zimbra/ajax/dwt/core/Dwt";
import {DwtControlEvent} from "../../zimbra/ajax/dwt/events/DwtControlEvent";
import {DwtEvent} from "../../zimbra/ajax/dwt/events/DwtEvent";
import {DwtSelectionEvent} from "../../zimbra/ajax/dwt/events/DwtSelectionEvent";
import {DwtPoint} from "../../zimbra/ajax/dwt/graphics/DwtPoint";
import {DwtButton} from "../../zimbra/ajax/dwt/widgets/DwtButton";
import {DwtComposite} from "../../zimbra/ajax/dwt/widgets/DwtComposite";
import {DwtInputField} from "../../zimbra/ajax/dwt/widgets/DwtInputField";
import {DwtLabel} from "../../zimbra/ajax/dwt/widgets/DwtLabel";
import {DwtShell} from "../../zimbra/ajax/dwt/widgets/DwtShell";
import {DwtToolBar, DwtToolBarButton} from "../../zimbra/ajax/dwt/widgets/DwtToolBar";
import {AjxListener} from "../../zimbra/ajax/events/AjxListener";
import {ZmContact} from "../../zimbra/zimbraMail/abook/model/ZmContact";
import {ZmAppCtxt} from "../../zimbra/zimbraMail/core/ZmAppCtxt";
import {ZmMsg} from "../../zimbra/zimbraMail/ZmMsg";
import {SortFcns} from "../SortFcns";
import {BuddyListTree} from "../widgets/BuddyListTree";
import {GroupTreeItem} from "../widgets/GroupTreeItem";
import {MainMenuButton} from "../widgets/MainMenuButton";
import {StatusSelector} from "../widgets/StatusSelector";
import {SmoothRoomWindowMover} from "./SmoothRoomWindowMover";
import {WindowBase} from "./WindowBase";

export class MainWindow extends WindowBase {

  public static ChatImageFieldPlugin = "Main Window Chat Image";
  public static StatusChangedPlugin = "Main Window Status Changed";
  public static SetSortMethodPlugin = "Main Window Set Sort Method";
  public static BrandPlugin = "Main Window Brand";

  public static DEBRAND_ICON   = "ImgZxChat_personalized_brand";

  public static WIDTH: number  = ZimbraUtils.isUniversalUI() ? 315 : 210;
  public static HEIGHT: number = ZimbraUtils.isUniversalUI() ? 446 : 340;
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
  private mOnStatusSelectedCallbacks: Array<(status: IBuddyStatus) => void>;
  private mOnAddFriendSelectionCallbacks: Array<() => void>;
  private mOnAddGroupSelectionCallbacks: Array<() => void>;
  private mOnSettingsSelectionCallbacks: Array<() => void>;
  private mOnBuddySelectedCallbacks: Array<(ev: DwtSelectionEvent) => void>;
  private mOnDeleteBuddyCallbacks: Array<(buddy: IBuddy) => void>;
  private mOnRenameBuddyCallbacks: Array<(buddy: IBuddy) => void>;
  private mOnSendInvitationCallbacks: Array<(buddy: IBuddy) => void>;
  private mOnAcceptInvitationCallbacks: Array<(buddy: IBuddy) => void>;
  private mOnRenameGroupCallbacks: Array<(group: Group) => void>;
  private mOnDeleteGroupCallbacks: Array<(group: Group) => void>;
  private mOnGroupExpandedOrCollapsedCallbacks: Array<(item: GroupTreeItem, expand: boolean, save: boolean) => void>;
  private mOnBuddyDroppedInGroupCallbacks: Array<(buddy: IBuddy, group: Group) => void>;
  private mOnContactDroppedInGroupCallbacks: Array<(contact: ZmContact, group: Group) => void>;
  private mOnChangeSidebarOrDockCallbacks: Array<(docked: boolean) => void>;
  private mOnShowHideOfflineCbkMgr: Array<(hide: boolean) => void>;
  private mOnSetSortMethodCbkMgr: Array<(sortMethod: string) => void>;
  private Log: Logger;
  private mTitleBar: DwtToolBar;
  private mStatusSelectorToolbar: DwtToolBar;
  private mSearchInput: DwtInputField;
  private mTitleLbl: DwtLabel;
  private mSearchButton: DwtButton;
  private mSearchToolBar: DwtToolBar;
  private mTitleExpandBar: DwtToolBar;

  constructor(
    appCtxt: ZmAppCtxt,
    settingsManager: SettingsManager,
    buddyList: BuddyList,
    mainWindowPluginManager: ChatPluginManager,
  ) {

    super(
      appCtxt.getShell(),
      "ZxChat_Main_Window",
      MainWindow.DEBRAND_ICON,
      "Chat",
      [],
      undefined,
      false,
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
      },
    );
    // Start
    this.mTitleBar = new DwtToolBar({
      className: "ZxChat_TitleBar_Toolbar",
      parent: this.mContainerView,
      parentElement: (this._titleBarEl.children[0] as HTMLElement),
    });
    this.mTitleBar.setSize(
      `${MainWindow.WIDTH}px`,
      Dwt.DEFAULT,
    );
    this.mTitleExpandBar = new DwtToolBar({
      className: "ZxChat_TitleBar_Toolbar",
      parent: this.mTitleBar,
    });
    this.mTitleLbl = new DwtLabel({
      className: `WindowBaseTitleBar${ ZimbraUtils.isUniversalUI() ? "" : "-legacy-ui" }`,
      parent: this.mTitleExpandBar,
    });
    this.mTitleLbl.setText("Chat");
    this.mTitleExpandBar.addFiller();
    this.mMainMenuButton  = this.createMainMenuButton(this.mTitleBar, true);
    this.mMainMenuButton.setEnabled(false);
    this.mTitleExpandBar.setSize(this.mTitleBar.getSize().x - this.mMainMenuButton.getSize().x - 5, Dwt.DEFAULT);
    this.mStatusSelectorToolbar = new DwtToolBar({
      className: "MainWindowStatusToolbar",
      parent: this.mContainerView,
    });
    // if (!ZimbraUtils.isUniversalUI()) {
    //   this.mStatusSelectorToolbar.setSize(
    //     Dwt.DEFAULT,
    //     "45px"
    //   );
    // }
    this.mStatusSelector = new StatusSelector(this.mStatusSelectorToolbar);
    this.mStatusSelector.onStatusSelected(new Callback(this, this.statusSelected));
    this.mStatusSelector.setSize(
      `${MainWindow.WIDTH}px`,
      (ZimbraUtils.isUniversalUI()) ? Dwt.DEFAULT : "32px",
    );
    this.mSearchToolBar = new DwtToolBar({
      className: `ZToolbar ZWidget ZxChat_MainWindowSearchToolBar${(ZimbraUtils.isUniversalUI()) ? "" : "-legacy-ui"}`,
      parent: this.mContainerView,
    });
    this.mSearchInput = new DwtInputField({
      className: `DwtInputField ZxChat_MainWindowSearchInput${ (ZimbraUtils.isUniversalUI()) ? "" : "-legacy-ui" }`,
      hint: ZmMsg.search,
      parent: this.mSearchToolBar,
    });
    this.mSearchInput.setHandler(DwtEvent.ONKEYUP, (ev) => this.handleSearchKeyUp(ev));
    this.mSearchButton = new DwtToolBarButton({
      className: `ZToolbarButton ZxChat_MainWindowSearchButton${ (ZimbraUtils.isUniversalUI()) ? "" : "-legacy-ui" }`,
      parent: this.mSearchToolBar,
    });
    this.mSearchButton.setImage("Search2");
    this.mSearchButton.addSelectionListener(new AjxListener(this, this.resetSearchField));
    this.mSearchInput.setSize(
      `${MainWindow.WIDTH - (ZimbraUtils.isUniversalUI() ? this.mSearchButton.getSize().x : 29)}px`,
      Dwt.DEFAULT,
    );
    this.createBuddyListTree(buddyList);
    this.mContainerView.setSize(
      Dwt.DEFAULT,
      `${MainWindow.HEIGHT - this.mTitleBar.getSize().y - (ZimbraUtils.isUniversalUI() ? 0 : 2)}px`,
    );
    this.setView(this.mContainerView);
    this.onMinimize(new Callback(this, this.handleMinimized, true));
    this.onExpand(new Callback(this, this.handleMinimized, false));
    this.onShowHideOffline((hide) => this.setShowHideOffline(hide));
    this.onSetSortMethod((sortMethod) => this.setSortMethod(sortMethod));
    this.onChangeSidebarOrDock((docked) => this.changeSidebarOrDock(docked));
    this.mOnDock = true;
    if (this.mTitleExpandBar.getHtmlElement().addEventListener) {
      this.mTitleExpandBar.getHtmlElement().addEventListener(
        "click",
        (new Callback(this, this.titleClickCallback)).toClosure() as (ev: MouseEvent) => any,
        false,
      );
    } else if ((this.mTitleExpandBar.getHtmlElement() as IE8HtmlElement).attachEvent)  {
      (this.mTitleExpandBar.getHtmlElement() as IE8HtmlElement).attachEvent(
        "onclick",
        (new Callback(this, this.titleClickCallback)).toClosure(),
      );
    }
    this.mAppCtxt.getShell().addListener(DwtEvent.CONTROL, new AjxListener(this, this.onShellResize));
    this.updateMainIcon();
    this.handleSidebarResize();
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

  public enableDisableMainMenuButton(enable: boolean): void {
    this.mMainMenuButton.setEnabled(enable);
  }

  public setUserStatuses(userStatuses: IBuddyStatus[]): void {
    this.mStatusSelector.clear();
    this.mStatusSelector.setOptionStatuses(userStatuses);
  }

  public setCurrentStatus(userStatus: IBuddyStatus): void {
    this.mMainWindowPluginManager.triggerPlugins(MainWindow.StatusChangedPlugin, userStatus);
    this.mStatusSelector.setCurrentStatus(userStatus);
  }

  public setSortMethod(sortMethod: string): void {
    this.mMainWindowPluginManager.triggerPlugins(MainWindow.SetSortMethodPlugin, sortMethod);
    this.mBuddyListTree.setSortMethod(
      sortMethod,
      this.mMainWindowPluginManager.getFieldPlugin(MainWindowSortFunction.FieldName),
    );
  }

  public setShowHideOffline(hide: boolean): void {
    this.mMainMenuButton.setHideOfflineButtonStatus(hide);
    this.mBuddyListTree.showHideOfflineBuddies(hide);
  }

  public getGroupsData(): IGroupData[] {
    return this.mBuddyListTree.getGroupsData();
  }

  public setGroupsData(data: IGroupData[]): void {
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
    } else {
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
      } else {
        if (this.mOnDock) {
          const posPoint = this.getDefaultPosition();
          this.setLocation(posPoint.x, posPoint.y);
        } else {
          this.Log.debug(controlEvent, "MainWindow.onShellResize");
          this.resizeSidebar(
            this.getBounds().width,
            controlEvent.newHeight,
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

  public onStatusSelected(cbk: (status: IBuddyStatus) => void): void {
    this.mOnStatusSelectedCallbacks.push(cbk);
  }

  public onAddFriendOptionSelected(cbk: () => void): void {
    this.mOnAddFriendSelectionCallbacks.push(cbk);
  }

  public onAddGroupOptionSelected(cbk: () => void): void {
    this.mOnAddGroupSelectionCallbacks.push(cbk);
  }

  public onSettingsOptionSelected(cbk: () => void): void {
    this.mOnSettingsSelectionCallbacks.push(cbk);
  }

  public onShowHideOffline(cbk: (hide: boolean) => void): void {
    this.mOnShowHideOfflineCbkMgr.push(cbk);
  }

  public showHideOffline(hide: boolean): void {
    for (const cbk of this.mOnShowHideOfflineCbkMgr) { cbk(hide); }
  }

  public onSetSortMethod(cbk: (sortMethod: string) => void): void {
    this.mOnSetSortMethodCbkMgr.push(cbk);
  }

  public sortMethodSet(sortMethod: string): void {
    for (const cbk of this.mOnSetSortMethodCbkMgr) { cbk(sortMethod); }
  }

  public onBuddySelected(cbk: (ev: DwtSelectionEvent) => void): void {
    this.mOnBuddySelectedCallbacks.push(cbk);
  }

  public onChangeSidebarOrDock(cbk: (docked: boolean) => void): void {
    this.mOnChangeSidebarOrDockCallbacks.push(cbk);
  }

  public onDeleteBuddy(cbk: (buddy: IBuddy) => void): void {
    this.mOnDeleteBuddyCallbacks.push(cbk);
  }

  public onRenameBuddy(cbk: (buddy: IBuddy) => void): void {
    this.mOnRenameBuddyCallbacks.push(cbk);
  }

  public onSendInvitation(cbk: (buddy: IBuddy) => void): void {
    this.mOnSendInvitationCallbacks.push(cbk);
  }

  public onAcceptInvitation(cbk: (buddy: IBuddy) => void): void {
    this.mOnAcceptInvitationCallbacks.push(cbk);
  }

  public onDeleteGroup(cbk: (group: Group) => void): void {
    this.mOnDeleteGroupCallbacks.push(cbk);
  }

  public onRenameGroup(cbk: (group: Group) => void): void {
    this.mOnRenameGroupCallbacks.push(cbk);
  }

  public onGroupExpandedOrCollapsed(cbk: (item: GroupTreeItem, expand: boolean, save: boolean) => void): void {
    this.mOnGroupExpandedOrCollapsedCallbacks.push(cbk);
  }

  public onBuddyDroppedInGroup(cbk: (buddy: IBuddy, group: Group) => void): void {
    this.mOnBuddyDroppedInGroupCallbacks.push(cbk);
  }

  public onContactDroppedInGroup(cbk: (contact: ZmContact, group: Group) => void): void {
    this.mOnContactDroppedInGroupCallbacks.push(cbk);
  }

  public triggerSortGroups(): void {
    this.mBuddyListTree.triggerSortGroups();
  }

  // Don't drag me! >:(
  public _initializeDragging(): void { return; }

  private createBuddyListTree(buddyList: BuddyList): void {
    this.mBuddyListTree = new BuddyListTree(
      this.mContainerView,
      buddyList,
      this.mAppCtxt,
      this.mMainWindowPluginManager.getFieldPlugin(MainWindowSortFunction.FieldName),
      this.mMainWindowPluginManager,
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
    let buddyListHeight = MainWindow.HEIGHT
      - this.mTitleBar.getSize().y
      - this.mStatusSelectorToolbar.getSize().y
      - this.mSearchToolBar.getSize().y;
    // - (ZimbraUtils.isUniversalUI() ? 15 : 7)
    if (ZimbraUtils.isUniversalUI()) {
      buddyListHeight -= 15;
    } else {
      buddyListHeight -= 7;
    }
    this.mBuddyListTree.setSize(
      `${MainWindow.WIDTH + 2}px`,
      `${buddyListHeight}px`,
    );
  }

  private createMainMenuButton(toolbar: DwtToolBar, isPrimary: boolean): MainMenuButton {
    const mainMenuButton = new MainMenuButton(
      toolbar,
      this.mMainWindowPluginManager,
      this.getMainMenuButtonImageStyle(isPrimary),
    );
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

  private statusSelected(status: IBuddyStatus): void {
    for (const cbk of this.mOnStatusSelectedCallbacks) { cbk(status); }
  }

  private addFriendOptionSelected(): void {
    for (const cbk of this.mOnAddFriendSelectionCallbacks) { cbk(); }
  }

  private addGroupOptionSelected(): void {
    for (const cbk of this.mOnAddGroupSelectionCallbacks) { cbk(); }
  }

  private settingsOptionSelected(): void {
    for (const cbk of this.mOnSettingsSelectionCallbacks) { cbk(); }
  }

  private buddySelected(ev: DwtSelectionEvent): void {
    for (const cbk of this.mOnBuddySelectedCallbacks) { cbk(ev); }
  }

  private changeSidebarOrDockSelected(docked: boolean): void {
    for (const cbk of this.mOnChangeSidebarOrDockCallbacks) { cbk(docked); }
  }

  private deleteBuddy(buddy: IBuddy): void {
    for (const cbk of this.mOnDeleteBuddyCallbacks) { cbk(buddy); }
  }

  private renameBuddy(buddy: IBuddy): void {
    for (const cbk of this.mOnRenameBuddyCallbacks) { cbk(buddy); }
  }

  private inviteBuddy(buddy: IBuddy): void {
    for (const cbk of this.mOnSendInvitationCallbacks) { cbk(buddy); }
  }

  private acceptInvitation(buddy: IBuddy): void {
    for (const cbk of this.mOnAcceptInvitationCallbacks) { cbk(buddy); }
  }

  private deleteGroup(group: Group): void {
    for (const cbk of this.mOnDeleteGroupCallbacks) { cbk(group); }
  }

  private renameGroup(group: Group): void {
    for (const cbk of this.mOnRenameGroupCallbacks) { cbk(group); }
  }

  private expandOrCollapseGroup(item: GroupTreeItem, expand: boolean, save: boolean): void {
    for (const cbk of this.mOnGroupExpandedOrCollapsedCallbacks) { cbk(item, expand, save); }
  }

  private buddyDroppedInGroup(buddy: IBuddy, group: Group): void {
    for (const cbk of this.mOnBuddyDroppedInGroupCallbacks) { cbk(buddy, group); }
  }

  private contactDroppedInGroup(contact: ZmContact, group: Group): void {
    for (const cbk of this.mOnContactDroppedInGroupCallbacks) { cbk(contact, group); }
  }

  private moveToDock(): void {
    if (this.mOnDock) { return; }
    this.mOnDock = true;
    this.handleSidebarResize();
    this.mTitleBar.setSize(
      `${MainWindow.WIDTH}px`,
      Dwt.DEFAULT,
    );
    this.mMainMenuButton.reparent(this.mTitleBar);
    this.mMainMenuButton.setSwitchOnSidebarStatus(false);
    this.mMainMenuButton.setImage(this.getMainMenuButtonImageStyle(true));
    this.mStatusSelector.setSize(
      `${MainWindow.WIDTH}px`,
      (ZimbraUtils.isUniversalUI()) ? Dwt.DEFAULT : "32px",
    );
    this.mBuddyListTree.setSize(
      (ZimbraUtils.isUniversalUI()) ? Dwt.DEFAULT : "212px", // problem with DwtTree border
      `${MainWindow.HEIGHT
        - (ZimbraUtils.isUniversalUI() ? 15 : 7)
        - this.mTitleBar.getSize().y
        - this.mStatusSelectorToolbar.getSize().y
        - this.mSearchToolBar.getSize().y}px`,
    );
    this.mContainerView.setSize(
      Dwt.DEFAULT,
      `${MainWindow.HEIGHT - this.mTitleBar.getSize().y - (ZimbraUtils.isUniversalUI() ? 0 : 2)}px`,
    );
    this.mContainerView.reparent(this);
    this.setView(this.mContainerView);
    this.popup();
  }

  private moveToSidebar(): void {
    if (!this.mOnDock) { return; }
    this.mOnDock = false;
    this.handleSidebarResize();
    this.mStatusSelector.setSize(
      `${MainWindow.WIDTH - this.mMainMenuButton.getSize().x - (ZimbraUtils.isUniversalUI() ? 0 : 4)}px`,
      (ZimbraUtils.isUniversalUI()) ? Dwt.DEFAULT : "32px",
    );
    this.mMainMenuButton.reparent(this.mStatusSelectorToolbar);
    this.mMainMenuButton.setSwitchOnSidebarStatus(true);
    this.mMainMenuButton.setImage(this.getMainMenuButtonImageStyle(false));
    const container: HTMLElement = document.getElementById(Constants.ID_SIDEBAR_DIV_CONTAINER);
    this.mContainerView.reparentHtmlElement(container, 0);
    this.mBuddyListTree.setSize(
      (ZimbraUtils.isUniversalUI()) ? Dwt.DEFAULT : "213px", // problem with DwtTree border
      `${this.mAppCtxt.getShell().getSize().y
        - 117
        - this.mStatusSelectorToolbar.getSize().y
        - this.mSearchToolBar.getSize().y}px`,
    );
    this.mContainerView.setSize(
      Dwt.DEFAULT,
      `${this.mAppCtxt.getShell().getSize().y - 107}px`, // 107 is the Zimbra header (more or less...)
    );
    this.popdown();
    this.setVisible(true);
  }

  private handleSidebarResize(): void {
    this.resizeSidebar(
      this.getBounds().width,
      this.mAppCtxt.getShell().getBounds().height,
    );
    this.mAppCtxt.getShell()._currWinSize.x = 0;
    this.mAppCtxt.getShell()._currWinSize.y = 0;
    if (this.mAppCtxt.getShell().isListenerRegistered(DwtEvent.CONTROL)) {
      const controlEvent: DwtControlEvent = DwtShell.controlEvent;
      controlEvent.reset();
      controlEvent.oldWidth = this.mAppCtxt.getShell()._currWinSize.x;
      controlEvent.oldHeight = this.mAppCtxt.getShell()._currWinSize.y;
      this.mAppCtxt.getShell()._currWinSize = Dwt.getWindowSize();
      controlEvent.newWidth = this.mAppCtxt.getShell()._currWinSize.x;
      controlEvent.newHeight = this.mAppCtxt.getShell()._currWinSize.y;
      this.mAppCtxt.getShell().notifyListeners(DwtEvent.CONTROL, controlEvent);
    } else {
      this.mAppCtxt.getShell()._currWinSize = Dwt.getWindowSize();
    }
    try {
      this.mAppCtxt.getCalManager().getCalViewController().getViewMgr().getCurrentView().updateTimeIndicator();
    } catch (ignore) {}
  }

  private resizeSidebar(width: number, height: number) {
    const tdElement: HTMLElement = document.getElementById(Constants.ID_SIDEBAR_DIV);
    const container: HTMLElement = document.getElementById(Constants.ID_SIDEBAR_DIV_CONTAINER);
    tdElement.className = "";
    if (this.mOnDock) {
      if (typeof tdElement !== "undefined" && tdElement !== null) { tdElement.style.width = "1px"; }
      if (typeof container !== "undefined" && container !== null) { container.style.width = "1px"; }
    } else {
      if (typeof container !== "undefined" && container !== null) {
        container.style.paddingLeft = "6px";
        container.style.display = "block";
        container.style.width = `${(ZimbraUtils.isUniversalUI()) ? width + 10 : width + 2}px`;
        if (!ZimbraUtils.isUniversalUI()) {
          container.style.borderLeft = "1px #e5e5e5 solid";
        }
      }
      if (typeof tdElement !== "undefined" && tdElement !== null) {
        tdElement.style.display = "table-cell";
        tdElement.style.width = `${width + 10}px`;
      }
    }
  }

  private titleClickCallback(ev: IMouseEventWithPath): void {
    if (this.isMinimized()) {
      this.setExpanded();
    } else {
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
    const shellSize: DwtPoint = this.mAppCtxt.getShell().getSize();
    const roomSize = this.getSize();
    return new DwtPoint(
      shellSize.x - roomSize.x - MainWindow.RIGHT_PADDING,
    shellSize.y - roomSize.y,
    );
  }

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

// tslint:disable-next-line
export class MainWindowSortFunction implements IChatFieldPlugin {

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
interface IMouseEventWithPath extends MouseEvent {
  path?: HTMLElement[];
}
