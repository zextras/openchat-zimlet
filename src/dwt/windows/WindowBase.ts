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

import {Callback} from "../../lib/callbacks/Callback";
import {CallbackManager} from "../../lib/callbacks/CallbackManager";
import {TimedCallback} from "../../lib/callbacks/TimedCallback";
import {ColorFader} from "../../lib/graphic/ColorFader";
import {ColorFaderColor} from "../../lib/graphic/ColorFaderColor";
import {LearningClipUtils} from "../../lib/LearningClipUtils";
import {Version} from "../../lib/Version";
import {ZimbraUtils} from "../../lib/ZimbraUtils";
import {Dwt} from "../../zimbra/ajax/dwt/core/Dwt";
import {DwtEvent} from "../../zimbra/ajax/dwt/events/DwtEvent";
import {DwtPoint} from "../../zimbra/ajax/dwt/graphics/DwtPoint";
import {DwtKeyboardMgr} from "../../zimbra/ajax/dwt/keyboard/DwtKeyboardMgr";
import {DwtTabGroup} from "../../zimbra/ajax/dwt/keyboard/DwtTabGroup";
import {DwtBaseDialog} from "../../zimbra/ajax/dwt/widgets/DwtBaseDialog";
import {DwtComposite} from "../../zimbra/ajax/dwt/widgets/DwtComposite";
import {DwtControl} from "../../zimbra/ajax/dwt/widgets/DwtControl";
import {ZmPopupMenu} from "../../zimbra/zimbraMail/share/view/ZmPopupMenu";
import {IdGenerator} from "../IdGenerator";

import "./WindowBase.scss";

export class WindowBase extends DwtBaseDialog {
  public static BTN_CLOSE: string = "close";
  public static BTN_MINIMIZE: string = "minimize";
  public static BTN_MAXIMIZE: string = "maximize";

  public static _MINIMIZE_ICON = "ImgZxChat_resize-in";
  public static _EXPAND_ICON = "ImgZxChat_resize-out";
  public static _CLOSE_ICON = "ImgZxChat_close";
  public static MAX_TITLE_LENGTH: number = ZimbraUtils.isUniversalUI() ? 190 : 148;
  public static Z_INDEX: number = 499;

  public static sMaxZIndex: number = 498;
  private static sWindows: WindowBase[] = [];

  private mControlButtons: {[id: string]: boolean} = {};
  private mMinimized: boolean = false;
  private mOnCloseCbkMgr: CallbackManager = new CallbackManager();
  private mOnMinimizeCbkMgr: CallbackManager = new CallbackManager();
  private mOnExpandCbkMgr: CallbackManager = new CallbackManager();
  private mDefaultTitlebarColor: ColorFaderColor = ColorFaderColor.fromHEX("#007cc3");
  private mDefaultTitlebarFontColor: ColorFaderColor = ColorFaderColor.WHITE;
  private mBlink: boolean = false;
  private mEnabled: boolean = true;
  private mIcon: string;
  private mInterceptKeyboardMgr: boolean;
  private mWindowDiv: HTMLElement;
  private mIconEl: HTMLElement;
  private mMinimizeIconEl: HTMLElement;
  private mExpandIconEl: HTMLElement;
  private mCloseIconEl: HTMLElement;
  private mMiniContentEl: HTMLElement;
  private mBlinkTitlebarColor: ColorFaderColor;
  private mBlinkTitlebarFontColor: ColorFaderColor;
  private mLastLoc: DwtPoint = null;

  constructor(parent: DwtComposite,
              elementId: string,
              icon: string,
              title: string,
              controlButtons: string[] = [],
              template: string = "com_zextras_chat_open.Windows#BaseWindow",
              interceptKeyboardMgr: boolean = true) {
    super({
      className: "DwtBaseDialog",
      id       : IdGenerator.generateId(elementId),
      mode     : DwtBaseDialog.MODELESS,
      parent   : parent,
      template : template,
      title    : title,
      zIndex   : WindowBase.Z_INDEX,
    });
    this.mIcon = icon;
    this.mInterceptKeyboardMgr = interceptKeyboardMgr;
    this.mBlinkTitlebarColor = ColorFaderColor.GREEN;
    this.mBlinkTitlebarFontColor = ColorFaderColor.WHITE;
    this.addMinimizeExpandListener();
    this.addCloseListener();
    let i: number;
    for (i = 0; i < controlButtons.length; i++) {
      this.mControlButtons[controlButtons[i]] = true;
      this.enableControlButton(controlButtons[i], true);
    }
    if (typeof this.mWindowDiv !== "undefined" && this.mWindowDiv !== null) {
      this.mWindowDiv.onmouseover = (new Callback(this, this.stopBlink)).toClosure() as (ev: MouseEvent) => any;
    }
    this.addFocusCallback(
      (zIndex: number) => {
        if (this.isPoppedUp()) {
          this.setZIndex(zIndex);
        }
      },
    );
  }

  public startBlinkTitle(): void {
    if (!this.mBlink) {
      this.mBlink = true;
      this.fadeTitleToBlinkColor();
    }
  }

  public stopBlink(): void {
    this.mBlink = false;
  }

  public setIcon(icon: string): void {
    const oldIcon: string = this.mIcon;
    this.mIcon = icon;
    if (typeof this.mIconEl !== "undefined" && this.mIconEl !== null) {
      Dwt.delClass(this.mIconEl, oldIcon, this.mIcon);
    }
  }

  public setTitle(title: string): void {
    let roomTitle: string = title;
    if (title.length > 18) {
      roomTitle = LearningClipUtils.clip(title, WindowBase.MAX_TITLE_LENGTH, "DwtDialogTitle ZxChatWindowTitle");
    }
    if (typeof this._titleEl !== "undefined" && this._titleEl !== null) {
      this._titleEl.innerHTML = roomTitle;
    }
  }

  public enableControlButton(buttonId: string, enable: boolean = true): void {
    const visibility: string = (enable) ? Dwt.DISPLAY_BLOCK : Dwt.DISPLAY_NONE;
    if (buttonId === WindowBase.BTN_CLOSE) {
      this.mControlButtons[WindowBase.BTN_CLOSE] = enable;
      if (typeof this.mCloseIconEl !== "undefined" && this.mCloseIconEl !== null) {
        Dwt.setDisplay(this.mCloseIconEl, visibility);
      }
    } else if (buttonId === WindowBase.BTN_MINIMIZE) {
      this.mControlButtons[WindowBase.BTN_MINIMIZE] = enable;
      this.mControlButtons[WindowBase.BTN_MAXIMIZE] = enable;
      if (typeof this.mMinimizeIconEl !== "undefined" && this.mMinimizeIconEl !== null) {
        Dwt.setDisplay(this.mMinimizeIconEl, visibility);
      }
    }
  }

  public disableControlButton(buttonId: string): void {
    this.enableControlButton(buttonId, false);
  }

  public onClose(cbk: Callback): void {
    this.mOnCloseCbkMgr.addCallback(cbk);
  }

  public onMinimize(cbk: Callback): void {
    this.mOnMinimizeCbkMgr.addCallback(cbk);
  }

  public onExpand(cbk: Callback): void {
    this.mOnExpandCbkMgr.addCallback(cbk);
  }

  public setMinimized(save: boolean = true): void {
    if (!this.mEnabled || this.mMinimized) { return; }
    this.mMinimized = true;
    if (this.mMinimizeIconEl !== null) { Dwt.setDisplay(this.mMinimizeIconEl, Dwt.DISPLAY_NONE); }
    if (this.mExpandIconEl !== null) { Dwt.setDisplay(this.mExpandIconEl, Dwt.DISPLAY_BLOCK); }
    if (this._contentEl !== null) { Dwt.setDisplay(this._contentEl, Dwt.DISPLAY_NONE); }
    if (this.mMiniContentEl !== null) { Dwt.setDisplay(this.mMiniContentEl, Dwt.DISPLAY_BLOCK); }
    this.mOnMinimizeCbkMgr.run(this, save);
  }

  public setExpanded(save: boolean = true): void {
    if (!this.mEnabled || !this.mMinimized) { return; }
    this.mMinimized = false;
    if (this.mMinimizeIconEl !== null) { Dwt.setDisplay(this.mMinimizeIconEl, Dwt.DISPLAY_BLOCK); }
    if (this.mExpandIconEl !== null) { Dwt.setDisplay(this.mExpandIconEl, Dwt.DISPLAY_NONE); }
    if (this._contentEl !== null) { Dwt.setDisplay(this._contentEl, Dwt.DISPLAY_BLOCK); }
    if (this.mMiniContentEl !== null) { Dwt.setDisplay(this.mMiniContentEl, Dwt.DISPLAY_NONE); }
    this.mOnExpandCbkMgr.run(this, save);
  }

  public isMinimized(): boolean {
    return this.mMinimized;
  }

  public setTitleBarColor(color: string, fontColor: string): void {
    if (typeof this._titleBarEl !== "undefined" && this._titleBarEl !== null) {
      this._titleBarEl.style.backgroundColor = color;
      this._titleEl.style.color = fontColor;
    }
  }

  public popup(loc?: DwtPoint): void {
    if (typeof loc === "undefined" && this.mLastLoc !== null) {
      loc = this.mLastLoc;
    } else {
      this.mLastLoc = loc;
    }
    super.popup(loc);
    // Avoid to catch Zimbra Keybindings
    if (this.isPoppedUp() && !this.mInterceptKeyboardMgr) {
      const kbMgr: DwtKeyboardMgr = this._shell.getKeyboardMgr();
      const tabGroup: DwtTabGroup = kbMgr.__tabGrpStack.pop();
      tabGroup.removeFocusChangeListener(kbMgr.__tabGroupChangeListenerObj);
      kbMgr.popTabGroup(this._tabGroup);
      kbMgr.popDefaultHandler();
    }
    // Avoid to catch the Zimbra Focus
    if (this.isPoppedUp()) {
      this._shell._veilOverlay.activeDialogs.pop();
    }
  }

  public popdown(): void {
    this.mLastLoc = this.getLocation();
    // Restore the keyboard manager to avoid errors during the popdown()
    if (this.isPoppedUp() && !this.mInterceptKeyboardMgr) {
      const kbMgr: DwtKeyboardMgr = this._shell.getKeyboardMgr();
      kbMgr.pushTabGroup(this._tabGroup);
      kbMgr.pushDefaultHandler(this);
    }
    // Restore the dialog position into the shell's activeDialogs array to avoid errors during the popdown()
    if (this.isPoppedUp()) {
      this._shell._veilOverlay.activeDialogs.push(this);
    }
    super.popdown();
  }

  public setLastLocation(loc: DwtPoint): void {
    this.mLastLoc = loc;
  }

  public setView(newView: DwtControl): void {
    super.setView(newView);
  }

  public setMiniView(newView: DwtControl): void {
    if (typeof newView !== "undefined" && typeof this.mMiniContentEl !== "undefined" && this.mMiniContentEl !== null) {
      this.mMiniContentEl.appendChild(newView.getHtmlElement());
    }
  }

  public setEnabled(enabled: boolean): void {
    this.mEnabled = enabled;
  }

  public isEnabled(): boolean {
    return this.mEnabled;
  }

  public _createHtmlFromTemplate(templateId: string, data: {[label: string]: any}): void {
    data.dragId = this._dragHandleId;
    data.title = this._title;
    data.icon = this.mIcon;
    data.minimizeIcon = WindowBase._MINIMIZE_ICON;
    data.expandIcon = WindowBase._EXPAND_ICON;
    data.closeIcon = WindowBase._CLOSE_ICON;
    data.controlsTemplateId = this.CONTROLS_TEMPLATE;
    data.cssClassesForWindowDiv = "DwtDialog WindowOuterContainer";
    data.legacy = ZimbraUtils.isUniversalUI() ? "" : "_legacy";
    if (Version.isZ8Up()) {
      data.cssClassesForWindowDiv += " FixBordersForZ7";
    }
    // expand template
    DwtControl.prototype._createHtmlFromTemplate.call(this, templateId, data);
    // remember elements
    if (typeof document !== "undefined") {
      this.mWindowDiv = document.getElementById(data.id + "_windowDiv");
      this._titleBarEl = document.getElementById(data.id + "_titlebar");
      this.mIconEl = document.getElementById(data.id + "_icon");
      this._titleEl = document.getElementById(data.id + "_title");

      this.mMinimizeIconEl = document.getElementById(data.id + "_minimizeIcon");
      this.mExpandIconEl = document.getElementById(data.id + "_expandIcon");
      this.mCloseIconEl = document.getElementById(data.id + "_closeIcon");
      this._contentEl = document.getElementById(data.id + "_content");
      this.mMiniContentEl = document.getElementById(data.id + "_miniContent");
    }
    this.setContent(this._getContentHtml());
  }

  protected onTitleBarClick(ev: DwtEvent): void {
    if (this.mMinimized) {
      this.expandCallback(ev);
    } else {
      this.minimizeCallback(ev);
    }
  }

  protected closeCallback(ev: any): void {
    if (typeof ev !== "undefined") {
      if (typeof ev.stopPropagation !== "undefined") {
        ev.stopPropagation();
      }
      ev.cancelBubble = true;
    }
    this.popdown();
    this.mOnCloseCbkMgr.run();
  }

  private addMinimizeExpandListener(): void {
    if (typeof this.mMinimizeIconEl !== "undefined" && this.mMinimizeIconEl !== null) {
      Dwt.setHandler(
        this.mMinimizeIconEl,
        DwtEvent.ONCLICK,
        (new Callback(this, this.minimizeCallback)).toClosure(),
      );
    }
    if (typeof this.mExpandIconEl !== "undefined" && this.mExpandIconEl !== null) {
      Dwt.setHandler(
        this.mExpandIconEl,
        DwtEvent.ONCLICK,
        (new Callback(this, this.expandCallback)).toClosure(),
      );
    }
  }

  private addCloseListener(): void {
    if (typeof this.mCloseIconEl !== "undefined" && this.mCloseIconEl !== null) {
      Dwt.setHandler(
        this.mCloseIconEl,
        DwtEvent.ONCLICK,
        (new Callback(this, this.closeCallback)).toClosure(),
      );
    }
  }

  private minimizeCallback(ev: any): void {
    if (typeof ev !== "undefined") {
      if (typeof ev.stopPropagation !== "undefined") {
        ev.stopPropagation();
      }
      ev.cancelBubble = true;
    }
    this.setMinimized();
  }

  private expandCallback(ev: any): void {
    if (typeof ev !== "undefined") {
      if (typeof ev.stopPropagation !== "undefined") {
        ev.stopPropagation();
      }
      ev.cancelBubble = true;
    }
    this.setExpanded();
  }

  private fadeTitleToBlinkColor(): void {
    let fader: ColorFader;
    let timedCallback: TimedCallback;
    const stepCbkMgr: CallbackManager = new CallbackManager();
    const endCbkMgr: CallbackManager = new CallbackManager();

    stepCbkMgr.addCallback(new Callback(
      this,
      this.fadeStepCbk,
    ));

    endCbkMgr.addCallback(new Callback(
      this,
      this.fadeTitleToDefaultColor,
    ));

    fader = new ColorFader(
      this.mDefaultTitlebarColor,
      this.mBlinkTitlebarColor,
      this.mDefaultTitlebarFontColor,
      this.mBlinkTitlebarFontColor,
      1500,
      stepCbkMgr,
      endCbkMgr,
    );

    timedCallback = new TimedCallback(new Callback(
      fader,
      fader.start,
    ), 1500, false);

    timedCallback.start();
  }

  private fadeTitleToDefaultColor(): void {
    let fader: ColorFader;
    let timedCallback: TimedCallback;
    const stepCbkMgr: CallbackManager = new CallbackManager();
    const endCbkMgr: CallbackManager = new CallbackManager();

    stepCbkMgr.addCallback(new Callback(
      this,
      this.fadeStepCbk,
    ));

    endCbkMgr.addCallback(new Callback(
      this,
      this.endFadeTitleToDefaultColorCbk,
    ));

    fader = new ColorFader(
      this.mBlinkTitlebarColor,
      this.mDefaultTitlebarColor,
      this.mBlinkTitlebarFontColor,
      this.mDefaultTitlebarFontColor,
      1500,
      stepCbkMgr,
      endCbkMgr,
    );

    timedCallback = new TimedCallback(new Callback(
      fader,
      fader.start,
    ), 1500, false);
    timedCallback.start();
  }

  private fadeStepCbk(color: ColorFaderColor, fontColor: ColorFaderColor): void { return; }

  private endFadeTitleToDefaultColorCbk(): void {
    if (this.mBlink) {
      this.fadeTitleToBlinkColor();
    }
  }

  private addFocusCallback(callback: (...args: any[]) => void): void {
    WindowBase.sWindows.push(this);
    WindowBase.addRecursiveFocusCallback(this, callback);
  }

  // tslint:disable-next-line
  private static addRecursiveFocusCallback(obj: DwtComposite, cbk: (...args: any[]) => void): void {
    obj.focus = ((object: DwtComposite, callback: (...args: any[]) => void) =>
      () => {
        for (const wnd of WindowBase.sWindows) {
          if (wnd.isPoppedUp()) {
            wnd.setZIndex(WindowBase.Z_INDEX);
          }
        }
        callback(WindowBase.Z_INDEX + 1);
        WindowBase.prototype.focus.call(object);
      }
    )(obj, cbk);
    if (typeof obj.getChildren !== "undefined" && obj.getChildren !== null) {
      for (const child of obj.getChildren()) {
        WindowBase.addRecursiveFocusCallback(child, cbk);
      }
    }
  }
}

// tslint:disable-next-line
export class ZxPopupMenu extends ZmPopupMenu {

  public popup(delay: number, x: number, y: number, kbGenereated?: boolean) {
    super.popup(delay, x, y, kbGenereated);
    // this.setZIndex(Math.max(this.getZIndex(), WindowBase.sMaxZIndex + 1));
  }

}
