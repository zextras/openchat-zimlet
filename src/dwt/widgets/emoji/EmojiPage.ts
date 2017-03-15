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

import {DwtComposite} from "../../../zimbra/ajax/dwt/widgets/DwtComposite";
import {EmojiData} from "./EmojiTemplate";
import {Dwt} from "../../../zimbra/ajax/dwt/core/Dwt";
import {DwtToolBar, DwtToolBarButton} from "../../../zimbra/ajax/dwt/widgets/DwtToolBar";
import {ZmZimletBase} from "../../../zimbra/zimbraMail/share/model/ZmZimletBase";
import {EmojiOnePicker} from "./EmojiOnePicker";
import {TimedCallbackFactory} from "../../../lib/callbacks/TimedCallbackFactory";
import {Callback} from "../../../lib/callbacks/Callback";
import {AjxListener} from "../../../zimbra/ajax/events/AjxListener";
import {AjxEnv} from "../../../zimbra/ajax/boot/AjxEnv";
import {DwtEvent} from "../../../zimbra/ajax/dwt/events/DwtEvent";
import {toImage} from "../../../libext/emojione";

export class EmojiPage extends DwtComposite {

  private static sEmojiPerRow: number = 18;

  private mZimlet: ZmZimletBase;
  private mTimedCallbackFactory: TimedCallbackFactory;
  private mEmojis: EmojiData[];
  private mOnSelectionCallback: Callback;

  constructor(
    parent: DwtComposite,
    zimlet: ZmZimletBase,
    timedCallbackFactory: TimedCallbackFactory,
    onSelectionCallback: Callback,
    emojis: EmojiData[]
  ) {
    super({
      parent: parent
    });
    this.mZimlet = zimlet;
    this.mTimedCallbackFactory = timedCallbackFactory;
    this.mEmojis = emojis;
    this.mOnSelectionCallback = onSelectionCallback;

    this.setScrollStyle(Dwt.SCROLL);

    let rows: DwtToolBar[] = [],
      lastFilledRow: number = 0,
      listToDisplay: EmojiData[],
      maxRows: number,
      onSelectionListener: AjxListener = new AjxListener(
        this,
        this.onSelection
      );

    if (AjxEnv.isIE) {
      EmojiPage.sEmojiPerRow = 9; // Override the default value
      listToDisplay = this.mEmojis.slice(0, 72);
      maxRows = 8;
    } else {
      listToDisplay = this.mEmojis;
      maxRows = Math.ceil(this.mEmojis.length / EmojiPage.sEmojiPerRow);
      this.setSize(629, 198);
    }

    for (let i: number = 0; i < maxRows; i += 1) {
      rows.push(new DwtToolBar({parent: this}));
    }

    for (let i: number = 0; i < listToDisplay.length; i += 1) {
      let tmpEmoji: EmojiData = listToDisplay[i],
        rowToPick = Math.floor(i / EmojiPage.sEmojiPerRow),
        button: DwtToolBarButton;
      lastFilledRow = rowToPick;

      button = new DwtToolBarButton({
        parent: rows[rowToPick],
        className: "ZToolbarButton ZxEmojiPickerButton"
      });
      button.setText(tmpEmoji.data);
      button.setData(EmojiOnePicker.KEY_EMOJI_DATA, tmpEmoji.name);
      button.setToolTipContent(tmpEmoji.name, false);
      button.addSelectionListener(onSelectionListener);
    }
  }

  private onSelection(ev: DwtEvent): void {
    if (typeof this.mOnSelectionCallback !== "undefined") {
      this.mOnSelectionCallback.run(ev);
    }
  }
}
