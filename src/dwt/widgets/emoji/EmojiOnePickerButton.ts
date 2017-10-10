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

import {DwtToolBarButton, DwtToolBarButtonParams} from "../../../zimbra/ajax/dwt/widgets/DwtToolBar";
import {EmojiOnePicker} from "./EmojiOnePicker";
import {Callback} from "../../../lib/callbacks/Callback";
import {DwtMenu} from "../../../zimbra/ajax/dwt/widgets/DwtMenu";
import {DwtSelectionEvent} from "../../../zimbra/ajax/dwt/events/DwtSelectionEvent";
import {ZmMsg} from "../../../zimbra/zimbraMail/ZmMsg";
import {AjxListener} from "../../../zimbra/ajax/events/AjxListener";
import {FocusKeeper} from "../../../lib/FocusKeeper";
import {DwtKeyMap} from "../../../zimbra/ajax/dwt/keyboard/DwtKeyMap";
import {ZimbraUtils} from "../../../lib/ZimbraUtils";
import {EmojiData} from "./EmojiTemplate";

export class EmojiOnePickerButton extends DwtToolBarButton {

  private mPopAbove: boolean;
  private mOnEmojiSelectedCallback: Callback;

  constructor(
    params: EmojiOnePickerButtonParams,
    onEmojiSelectedCallback: Callback,
    popAbove: boolean = false
  ) {
    if (typeof params === "undefined") { return; }
    params.className = `ZToolbarButton EmojiPickerButton${ !ZimbraUtils.isUniversalUI() ? "-legacy-ui" : "" }`;
    // params.actionTiming = DwtButton.ACTION_MOUSEUP;
    super(params);
    this.mPopAbove = popAbove;
    this.mOnEmojiSelectedCallback = new Callback(this, this.onEmojiSelected, onEmojiSelectedCallback);

    this.setEmoji(EmojiOnePicker.getDefaultEmoji());
    this.setToolTipContent(ZmMsg.emoticons, false);
    this.dontStealFocus();
    this.setEmojiPickerMenu();

    // Change following AjxListener in order to change button behaviour that add current emoji to inputfield
    //   Also uncomment "this.setEmoji(tmpEmoji);" in pickerListener;
    this.addSelectionListener(
      new AjxListener(this, this.popup)
      // new AjxListener(this, this.buttonListener, onEmojiSelectedCallback)
    );
  }

  public popup(menu: DwtMenu): void {
    FocusKeeper.storeFocusElement();
    this.setEmojiPickerMenu();
    this.getMenu().parent = this; // Really dirty hack, it is necessary to move the menu over the button.
    super.popup();
  }

  private setEmoji(emoji: EmojiData): void {
    this.setData(EmojiOnePicker.KEY_EMOJI_DATA, emoji.name);
    this.setText(emoji.data);
  }

  private onEmojiSelected(callback: Callback, ev: DwtSelectionEvent, emojiData: EmojiData): void {
    if (typeof emojiData !== "undefined") {
      this.pickerListener(callback, ev, emojiData);
    }
  }

  private setEmojiPickerMenu(): void {
    if (typeof EmojiOnePicker.getInstance() === "undefined") {
      let picker: EmojiOnePicker = new EmojiOnePicker(this);
    }
    this.setMenu(
      EmojiOnePicker.getInstance().getMenu(
        this,
        this.mOnEmojiSelectedCallback
      ),
      false,
      false,
      this.mPopAbove,
      false
    );
  }

  private buttonListener(callback: Callback, ev: DwtSelectionEvent): void {
    if (typeof callback !== "undefined") {
      callback.run(
        ev,
        {name: this.getData(EmojiOnePicker.KEY_EMOJI_DATA), data: this.getText()}
      );
    }
  }

  private pickerListener(callback: Callback, ev: DwtSelectionEvent, emoji: EmojiData): void {
    let tmpEmoji: EmojiData = emoji;
    if (typeof emoji === "undefined") {
      tmpEmoji = {
        name: this.getData(EmojiOnePicker.KEY_EMOJI_DATA),
        data: this.getText()
      };
    }
    if (typeof tmpEmoji !== "undefined") {
      if (typeof callback !== "undefined") {
        callback.run(ev, tmpEmoji);
      }
      // this.setEmoji(tmpEmoji);
      this.getMenu().popdown();
      FocusKeeper.loadFocusElement();
    }
  }

}

export interface EmojiOnePickerButtonParams extends DwtToolBarButtonParams {}
