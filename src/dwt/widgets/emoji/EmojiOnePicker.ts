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
import {DwtControl} from "../../../zimbra/ajax/dwt/widgets/DwtControl";
import {DwtMenu} from "../../../zimbra/ajax/dwt/widgets/DwtMenu";
import {EmojiTemplate, EmojiData} from "./EmojiTemplate";
import {Callback} from "../../../lib/callbacks/Callback";
import {DwtToolBarButton, DwtToolBar} from "../../../zimbra/ajax/dwt/widgets/DwtToolBar";
import {DwtSelectionEvent} from "../../../zimbra/ajax/dwt/events/DwtSelectionEvent";
import {DwtTabView, DwtTabViewPage} from "../../../zimbra/ajax/dwt/widgets/DwtTabView";
import {AjxListener} from "../../../zimbra/ajax/events/AjxListener";
import {DwtPoint} from "../../../zimbra/ajax/dwt/graphics/DwtPoint";
import {AjxCallback} from "../../../zimbra/ajax/boot/AjxCallback";
import {ZimbraUtils} from "../../../lib/ZimbraUtils";

export class EmojiOnePicker extends DwtMenu {

  public static KEY_EMOJI_DATA: string = "emoji";

  private static sInstance: EmojiOnePicker = void 0;
  private static sEmojiPerRow: number = 10;
  private static hEmojiToolBarBtn: number = 26;
  private static wEmojiToolBarBtn: number = 36;

  private mOnEmojiSelectedCbk: Callback = void 0;

  public static getInstance(): EmojiOnePicker {
    return this.sInstance;
  }

  constructor(
    parent: DwtControl
  ) {
    super({
      parent: parent,
      style: DwtMenu.GENERIC_WIDGET_STYLE
    });

    let emojiTabView = new DwtTabView({parent: this});
    let pageIdx: number = -1;
    let selectionListener = new AjxListener(
      this,
      this.onEmojiSelected
    );
    for (let emojiName of EmojiTemplate.NAMES) {
      pageIdx++;
      // TODO: There are some issue on deferred tab view initialization
      // emojiTabView.addTab(
      //   EmojiTemplate.NAMES_DATA_SPRITE[pageIdx],
      //   new AjxCallback(
      //     this,
      //     EmojiOnePicker.createEmojiTabPage,
      //     [
      //       emojiTabView,
      //       EmojiTemplate.DATA_SPRITES[pageIdx],
      //       selectionListener
      //     ]
      //   )
      // );
      emojiTabView.addTab(
        EmojiTemplate.NAMES_DATA_SPRITE[pageIdx],
        EmojiOnePicker.createEmojiTabPage(
          emojiTabView,
          EmojiTemplate.DATA_SPRITES[pageIdx],
          selectionListener
        )
      );
    }

    let wSize: number = (EmojiTemplate.NAMES.length * 48) + 20;
    let hSize: number = (EmojiOnePicker.hEmojiToolBarBtn * 5) + 40;
    this.setSize(
      `${wSize}px`,
      `${hSize + 5}px`
    );

    if (typeof EmojiOnePicker.sInstance === "undefined") {
      EmojiOnePicker.sInstance = this;
    }
  }

  public getSize(getFromStyle?: boolean): DwtPoint {
    return new DwtPoint(
      (EmojiTemplate.NAMES.length * 48) + 30,
      (EmojiOnePicker.hEmojiToolBarBtn * 5) + 30
    );
  }

  public getMenu(parent: DwtComposite, callback: Callback): DwtMenu {
    this.mOnEmojiSelectedCbk = callback;
    // this.reparent(parent); // Reparenting done right does not work... :/
    return this;
  }

  public static getDefaultEmoji(): EmojiData {
    return EmojiTemplate.DATA_SPRITES[0][0];
  }

  private onEmojiSelected(ev: DwtSelectionEvent): void {
    let emoji: string = ev.dwtObj.getData(EmojiOnePicker.KEY_EMOJI_DATA);
    if (typeof emoji === "undefined") { return; }
    if (typeof this.mOnEmojiSelectedCbk !== "undefined") {
      this.mOnEmojiSelectedCbk.run(ev, emoji);
    }
  }

  private static createEmojiTabPage(emojiTabView: DwtTabView, emojiData: EmojiData[], selectionListner: AjxListener): DwtTabViewPage {
    let emojiTab = new DwtTabViewPage(emojiTabView);
    let maxToolbarCount = Math.ceil(emojiData.length / EmojiOnePicker.sEmojiPerRow);
    for (let toolbarIdx: number = 0; toolbarIdx < maxToolbarCount; toolbarIdx += 1) {
      EmojiOnePicker.populateEmojiRow(
        new DwtToolBar({
          parent: emojiTab
        }),
        emojiData.slice(toolbarIdx * EmojiOnePicker.sEmojiPerRow, (toolbarIdx * EmojiOnePicker.sEmojiPerRow) + EmojiOnePicker.sEmojiPerRow),
        selectionListner
      );
    }
    emojiTab.setSize(
      `${EmojiOnePicker.wEmojiToolBarBtn * EmojiOnePicker.sEmojiPerRow}px`,
      `${EmojiOnePicker.hEmojiToolBarBtn * 5}px`
    );
    return emojiTab;
  }

  private static populateEmojiRow(dwtToolBar: DwtToolBar, emojisToAdd: EmojiData[], selectionListner: AjxListener): void {
    for (let emojiData of emojisToAdd) {
      let button = new DwtToolBarButton({
        parent: dwtToolBar,
        className: `EmojiOnePickerToolbarButton${ !ZimbraUtils.isUniversalUI() ? "-legacy-ui" : "" }`
      });
      button.setText(emojiData.data);
      button.setData(EmojiOnePicker.KEY_EMOJI_DATA, emojiData.name);
      button.setToolTipContent(emojiData.name, false);
      button.addSelectionListener(selectionListner);
    }
  }

}
