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

import {Callback} from "../../../lib/callbacks/Callback";
import {ZimbraUtils} from "../../../lib/ZimbraUtils";
import {DwtSelectionEvent} from "../../../zimbra/ajax/dwt/events/DwtSelectionEvent";
import {DwtMenu} from "../../../zimbra/ajax/dwt/widgets/DwtMenu";
import {DwtToolBarButton, DwtToolBarButtonParams} from "../../../zimbra/ajax/dwt/widgets/DwtToolBar";
import {AjxListener} from "../../../zimbra/ajax/events/AjxListener";
import {ZmMsg} from "../../../zimbra/zimbraMail/ZmMsg";
import {EmojiOnePicker} from "./EmojiOnePicker";
import {IEmojiData} from "./EmojiTemplate";

import "./EmojiOnePickerButton.scss";

export class EmojiOnePickerButton extends DwtToolBarButton {

  private mPopAbove: boolean;
  private mOnEmojiSelectedCallback: Callback;

  constructor(
    params: IEmojiOnePickerButtonParams,
    onEmojiSelectedCallback: Callback,
    popAbove: boolean = false,
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
      new AjxListener(this, this.popup),
      // new AjxListener(this, this.buttonListener, onEmojiSelectedCallback)
    );
  }

  public popup(menu: DwtMenu): void {
    this.setEmojiPickerMenu();
    this.getMenu().parent = this; // Really dirty hack, it is necessary to move the menu over the button.
    super.popup();
  }

  private setEmoji(emoji: IEmojiData): void {
    this.setData(EmojiOnePicker.KEY_EMOJI_DATA, emoji.name);
    this.setText(emoji.data.replace(/emojione/g, "emojione_16"));
  }

  private onEmojiSelected(callback: Callback, ev: DwtSelectionEvent, emojiData: IEmojiData): void {
    if (typeof emojiData !== "undefined") {
      this.pickerListener(callback, ev, emojiData);
    }
  }

  private setEmojiPickerMenu(): void {
    if (typeof EmojiOnePicker.getInstance() === "undefined") {
      const picker: EmojiOnePicker = new EmojiOnePicker(this);
    }
    this.setMenu(
      EmojiOnePicker.getInstance().getMenu(
        this,
        this.mOnEmojiSelectedCallback,
      ),
      false,
      false,
      this.mPopAbove,
      false,
    );
  }

  private buttonListener(callback: Callback, ev: DwtSelectionEvent): void {
    if (typeof callback !== "undefined") {
      callback.run(
        ev,
        {name: this.getData(EmojiOnePicker.KEY_EMOJI_DATA), data: this.getText()},
      );
    }
  }

  private pickerListener(callback: Callback, ev: DwtSelectionEvent, emoji: IEmojiData): void {
    let tmpEmoji: IEmojiData = emoji;
    if (typeof emoji === "undefined") {
      tmpEmoji = {
        data: this.getText(),
        name: this.getData(EmojiOnePicker.KEY_EMOJI_DATA),
      };
    }
    if (typeof tmpEmoji !== "undefined") {
      this.getMenu().popdown();
      if (typeof callback !== "undefined") {
        callback.run(ev, tmpEmoji);
      }
      // this.setEmoji(tmpEmoji);
    }
  }

}

export interface IEmojiOnePickerButtonParams extends DwtToolBarButtonParams {}
