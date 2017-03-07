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

import {toImage} from "../../../libext/emojione";

import {DwtToolBarButton, DwtToolBarButtonParams} from "../../../zimbra/ajax/dwt/widgets/DwtToolBar";
import {ZmZimletBase} from "../../../zimbra/zimbraMail/share/model/ZmZimletBase";
import {DwtButton} from "../../../zimbra/ajax/dwt/widgets/DwtButton";
import {TimedCallbackFactory} from "../../../lib/callbacks/TimedCallbackFactory";
import {EmojiOnePicker} from "./EmojiOnePicker";
import {Callback} from "../../../lib/callbacks/Callback";
import {DwtMenu} from "../../../zimbra/ajax/dwt/widgets/DwtMenu";
import {DwtSelectionEvent} from "../../../zimbra/ajax/dwt/events/DwtSelectionEvent";
import {ZmMsg} from "../../../zimbra/zimbraMail/ZmMsg";
import {AjxListener} from "../../../zimbra/ajax/events/AjxListener";
import {FocusKeeper} from "../../../lib/FocusKeeper";
import {DwtKeyMap} from "../../../zimbra/ajax/dwt/keyboard/DwtKeyMap";

export class EmojiOnePickerButton extends DwtToolBarButton {

  private mPopAbove: boolean;
  private mZimlet: ZmZimletBase;
  private mTimedCallbackFactory: TimedCallbackFactory;
  private mOnEmojiSelectedCallback: Callback;

  constructor(
    params: EmojiOnePickerButtonParams,
    zimlet: ZmZimletBase,
    timedCallbackFactory: TimedCallbackFactory,
    onEmojiSelectedCallback: Callback,
    popAbove: boolean = false
  ) {
    if (typeof params === "undefined") { return; }
    params.className = "ZxChat_Button ZToolbarButton";
    params.actionTiming = DwtButton.ACTION_MOUSEUP;
    super(params);
    this.mPopAbove = popAbove;
    this.mZimlet = zimlet;
    this.mOnEmojiSelectedCallback = new Callback(this, this.onEmojiSelected, onEmojiSelectedCallback);
    this.mTimedCallbackFactory = timedCallbackFactory;

    this.setEmoji(EmojiOnePicker.getDefaultEmoji());
    this.setToolTipContent(ZmMsg.emoticons, false);
    this.dontStealFocus();

    this.addSelectionListener(
      new AjxListener(this, this.handleKeyAction, [DwtKeyMap.SUBMENU, undefined])
    );

    // Defer the creation of the emoji menu creation.
    //   This operation is cpu-heavy, so we can't freeze the window
    //   creator beacuse of the emoji.

    timedCallbackFactory.createTimedCallback(
      new Callback(this, this.setEmojiPickerMenu),
      10
    ).start();
  }

  public setEmoji(emoji: string): void {
    this.setData(EmojiOnePicker.KEY_EMOJI_DATA, emoji);
    this.setText(toImage(emoji));
  }

  public popup(menu: DwtMenu): void {
    FocusKeeper.storeFocusElement();
    this.setEmojiPickerMenu();
    this.getMenu().parent = this; // Really dirty hack, it is necessary to move the menu over the button.
    super.popup();
  }

  private onEmojiSelected(callback: Callback, ev: DwtSelectionEvent, emoji: string): void {
    if (typeof emoji !== "undefined") {
      this.btnLsnr(callback, ev, emoji);
    }
  }

  private setEmojiPickerMenu(): void {
    if (typeof EmojiOnePicker.getInstance() === "undefined") {
      let picker: EmojiOnePicker = new EmojiOnePicker(
        this,
        this.mZimlet,
        this.mTimedCallbackFactory,
        true
      );
    }
    let menu: DwtMenu = EmojiOnePicker.getInstance().getMenu(this.mOnEmojiSelectedCallback);
    // menu.reparent(this);
    this.setMenu(
      EmojiOnePicker.getInstance().getMenu(this.mOnEmojiSelectedCallback),
      false,
      false,
      this.mPopAbove,
      false
    );
  }

  private btnLsnr(callback: Callback, ev: DwtSelectionEvent, emoji?: string): void {
    let tmpEmoji: string = emoji;
    if (typeof emoji === "undefined") {
      tmpEmoji = this.getData(EmojiOnePicker.KEY_EMOJI_DATA);
    }
    if (typeof tmpEmoji !== "undefined") {
      this.setEmoji(tmpEmoji);
      if (typeof callback !== "undefined") {
        callback.run(ev, tmpEmoji);
      }
      this.getMenu().popdown();
      FocusKeeper.loadFocusElement();
    }
  }

}

export interface EmojiOnePickerButtonParams extends DwtToolBarButtonParams {}
