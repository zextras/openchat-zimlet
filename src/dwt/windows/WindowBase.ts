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

import {LearningClipUtils} from "../../lib/LearningClipUtils";
import {CallbackManager} from "../../lib/callbacks/CallbackManager";
import {Callback} from "../../lib/callbacks/Callback";
import {IdGenerator} from "../IdGenerator";
import {Version} from "../../lib/Version";
import {ColorFader} from "../../lib/graphic/ColorFader";
import {ColorFaderColor} from "../../lib/graphic/ColorFaderColor";
import {TimedCallback} from "../../lib/callbacks/TimedCallback";
import {DwtControl} from "../../zimbra/ajax/dwt/widgets/DwtControl";
import {Dwt} from "../../zimbra/ajax/dwt/core/Dwt";
import {DwtPoint} from "../../zimbra/ajax/dwt/graphics/DwtPoint";
import {DwtEvent} from "../../zimbra/ajax/dwt/events/DwtEvent";
import {DwtBaseDialog} from "../../zimbra/ajax/dwt/widgets/DwtBaseDialog";
import {DwtComposite} from "../../zimbra/ajax/dwt/widgets/DwtComposite";
import {DwtKeyboardMgr} from "../../zimbra/ajax/dwt/keyboard/DwtKeyboardMgr";
import {FocusKeeper} from "../../lib/FocusKeeper";

export class WindowBase extends DwtBaseDialog {
  public static BTN_CLOSE: string = "close";
  public static BTN_MINIMIZE: string = "minimize";
  public static BTN_MAXIMIZE: string = "maximize";

  public static _MINIMIZE_ICON = "ImgZxChat_minimize";
  public static _EXPAND_ICON = "ImgZxChat_expand";
  public static _CLOSE_ICON = "ImgZxChat_close-legacy";
  public static MAX_TITLE_LENGTH: number = 190;
  public static Z_INDEX: number = 499;

  private static sWindows: WindowBase[] = [];
  public static sMaxZIndex: number = 498;

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
  protected mWindowDiv: HTMLElement;
  protected mIconEl: HTMLElement;
  public mMinimizeIconEl: HTMLElement;
  public mExpandIconEl: HTMLElement;
  public mCloseIconEl: HTMLElement;
  private mMiniContentEl: HTMLElement;
  private mBlinkTitlebarColor: ColorFaderColor;
  private mBlinkTitlebarFontColor: ColorFaderColor;
  protected mLastLoc: DwtPoint = null;

  constructor(parent: DwtComposite,
              elementId: string,
              icon: string,
              title: string,
              controlButtons: string[] = [],
              template: string = "com_zextras_chat_open.Windows#BaseWindow",
              interceptKeyboardMgr: boolean = true) {
    super({
      parent   : parent,
      title    : title,
      className: "DwtBaseDialog",
      mode     : DwtBaseDialog.MODELESS,
      template : template,
      zIndex   : WindowBase.Z_INDEX,
      id       : IdGenerator.generateId(elementId)
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
      this.mWindowDiv.onmouseover = <(ev: MouseEvent) => any> (new Callback(this, this.stopBlink)).toClosure();
    }
    this.addFocusCallback(
      (zIndex: number) => {
        this.setZIndex(zIndex);
      }
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
    let oldIcon: string = this.mIcon;
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
    let visibility: string = (enable) ? Dwt.DISPLAY_BLOCK : Dwt.DISPLAY_NONE;
    if (buttonId === WindowBase.BTN_CLOSE) {
      this.mControlButtons[WindowBase.BTN_CLOSE] = enable;
      if (typeof this.mCloseIconEl !== "undefined" && this.mCloseIconEl !== null) {
        Dwt.setDisplay(this.mCloseIconEl, visibility);
      }
    }
    else if (buttonId === WindowBase.BTN_MINIMIZE) {
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
    if (!this.mEnabled) return;
    this.mMinimized = true;
    Dwt.setDisplay(this.mMinimizeIconEl, Dwt.DISPLAY_NONE);
    Dwt.setDisplay(this.mExpandIconEl, Dwt.DISPLAY_BLOCK);
    Dwt.setDisplay(this._contentEl, Dwt.DISPLAY_NONE);
    Dwt.setDisplay(this.mMiniContentEl, Dwt.DISPLAY_BLOCK);
    this.mOnMinimizeCbkMgr.run(this, save);
  }

  public setExpanded(save: boolean = true): void {
    if (!this.mEnabled) return;
    this.mMinimized = false;
    Dwt.setDisplay(this.mMinimizeIconEl, Dwt.DISPLAY_BLOCK);
    Dwt.setDisplay(this.mExpandIconEl, Dwt.DISPLAY_NONE);
    Dwt.setDisplay(this._contentEl, Dwt.DISPLAY_BLOCK);
    Dwt.setDisplay(this.mMiniContentEl, Dwt.DISPLAY_NONE);
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
      let kbMgr: DwtKeyboardMgr = this._shell.getKeyboardMgr();
      FocusKeeper.storeFocusElement();
      kbMgr.popTabGroup(this._tabGroup);
      FocusKeeper.loadFocusElement();
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
      let kbMgr: DwtKeyboardMgr = this._shell.getKeyboardMgr();
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

  private addMinimizeExpandListener(): void {
    if (typeof this.mMinimizeIconEl !== "undefined") {
      Dwt.setHandler(
        this.mMinimizeIconEl,
        DwtEvent.ONCLICK,
        (new Callback(this, this.minimizeCallback)).toClosure()
      );
    }
    if (typeof this.mExpandIconEl !== "undefined") {
      Dwt.setHandler(
        this.mExpandIconEl,
        DwtEvent.ONCLICK,
        (new Callback(this, this.expandCallback)).toClosure()
      );
    }
  }

  private addCloseListener(): void {
    if (typeof this.mCloseIconEl !== "undefined") {
      Dwt.setHandler(
        this.mCloseIconEl,
        DwtEvent.ONCLICK,
        (new Callback(this, this.closeCallback)).toClosure()
      );
    }
  }

  public _createHtmlFromTemplate(templateId: string, data: {[label: string]: any}): void {
    data["dragId"] = this._dragHandleId;
    data["title"] = this._title;
    data["icon"] = this.mIcon;
    data["minimizeIcon"] = WindowBase._MINIMIZE_ICON;
    data["expandIcon"] = WindowBase._EXPAND_ICON;
    data["closeIcon"] = WindowBase._CLOSE_ICON;
    data["controlsTemplateId"] = this.CONTROLS_TEMPLATE;
    data["cssClassesForWindowDiv"] = "DwtDialog WindowOuterContainer";
    if (Version.isZ8Up()) {
      data["cssClassesForWindowDiv"] += " FixBordersForZ7";
    }
    // expand template
    DwtControl.prototype._createHtmlFromTemplate.call(this, templateId, data);
    // remember elements
    if (typeof document !== "undefined") {
      this.mWindowDiv = document.getElementById(data["id"] + "_windowDiv");
      this._titleBarEl = document.getElementById(data["id"] + "_titlebar");
      this.mIconEl = document.getElementById(data["id"] + "_icon");
      this._titleEl = document.getElementById(data["id"] + "_title");

      this.mMinimizeIconEl = document.getElementById(data["id"] + "_minimizeIcon");
      this.mExpandIconEl = document.getElementById(data["id"] + "_expandIcon");
      this.mCloseIconEl = document.getElementById(data["id"] + "_closeIcon");
      this._contentEl = document.getElementById(data["id"] + "_content");
      this.mMiniContentEl = document.getElementById(data["id"] + "_miniContent");
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

  private fadeTitleToBlinkColor(): void {
    let fader: ColorFader,
      timedCallback: TimedCallback,
      stepCbkMgr: CallbackManager = new CallbackManager(),
      endCbkMgr: CallbackManager = new CallbackManager();

    stepCbkMgr.addCallback(new Callback(
      this,
      this.fadeStepCbk
    ));

    endCbkMgr.addCallback(new Callback(
      this,
      this.fadeTitleToDefaultColor
    ));

    fader = new ColorFader(
      this.mDefaultTitlebarColor,
      this.mBlinkTitlebarColor,
      this.mDefaultTitlebarFontColor,
      this.mBlinkTitlebarFontColor,
      1500,
      stepCbkMgr,
      endCbkMgr
    );

    timedCallback = new TimedCallback(new Callback(
      fader,
      fader.start
    ), 1500, false);

    timedCallback.start();
  }

  private fadeTitleToDefaultColor(): void {
    let fader: ColorFader,
      timedCallback: TimedCallback,
      stepCbkMgr: CallbackManager = new CallbackManager(),
      endCbkMgr: CallbackManager = new CallbackManager();

    stepCbkMgr.addCallback(new Callback(
      this,
      this.fadeStepCbk
    ));

    endCbkMgr.addCallback(new Callback(
      this,
      this.endFadeTitleToDefaultColorCbk
    ));

    fader = new ColorFader(
      this.mBlinkTitlebarColor,
      this.mDefaultTitlebarColor,
      this.mBlinkTitlebarFontColor,
      this.mDefaultTitlebarFontColor,
      1500,
      stepCbkMgr,
      endCbkMgr
    );

    timedCallback = new TimedCallback(new Callback(
      fader,
      fader.start
    ), 1500, false);
    timedCallback.start();
  }

  private fadeStepCbk(color: ColorFaderColor, fontColor: ColorFaderColor): void {}

  private endFadeTitleToDefaultColorCbk(): void {
    if (this.mBlink) {
      this.fadeTitleToBlinkColor();
    }
  }

  public addFocusCallback(callback: Function): void {
    WindowBase.sWindows.push(this);
    WindowBase.sMaxZIndex++;
    WindowBase.addRecursiveFocusCallback(this, callback);
  }

  public static addRecursiveFocusCallback(obj: DwtComposite, callback: Function): void {
    obj.focus = ((obj: DwtComposite, callback: Function) =>
      () => {
        for (let window of WindowBase.sWindows) {
          window.setZIndex(window.getZIndex() - 1);
        }
        callback(WindowBase.sMaxZIndex);
        WindowBase.prototype.focus.call(obj);
      }
    )(obj, callback);
    if (typeof obj.getChildren !== "undefined" && obj.getChildren !== null) {
      for (let child of obj.getChildren()) {
        WindowBase.addRecursiveFocusCallback(child, callback);
      }
    }
  }
}
