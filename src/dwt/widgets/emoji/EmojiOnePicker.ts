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
import {Bowser} from "../../../libext/bowser";
import {DwtSelectionEvent} from "../../../zimbra/ajax/dwt/events/DwtSelectionEvent";
import {DwtPoint} from "../../../zimbra/ajax/dwt/graphics/DwtPoint";
import {DwtComposite} from "../../../zimbra/ajax/dwt/widgets/DwtComposite";
import {DwtControl} from "../../../zimbra/ajax/dwt/widgets/DwtControl";
import {DwtMenu} from "../../../zimbra/ajax/dwt/widgets/DwtMenu";
import {DwtTabView, DwtTabViewPage} from "../../../zimbra/ajax/dwt/widgets/DwtTabView";
import {DwtToolBar, DwtToolBarButton} from "../../../zimbra/ajax/dwt/widgets/DwtToolBar";
import {AjxListener} from "../../../zimbra/ajax/events/AjxListener";
import {EmojiTemplate, IEmojiData} from "./EmojiTemplate";

import "./EmojiOnePicker.scss";

export class EmojiOnePicker extends DwtMenu {

  public static KEY_EMOJI_DATA: string = "emoji";

  public static getInstance(): EmojiOnePicker {
    return this.sInstance;
  }

  public static getDefaultEmoji(): IEmojiData {
    return EmojiTemplate.DATA_SPRITES[0][0];
  }

  private static sInstance: EmojiOnePicker = void 0;
  private static sEmojiPerRow: number = 10;
  private static hEmojiToolBarBtn: number = 20;
  private static wEmojiToolBarBtn: number = 40;

  private static createEmojiTabPage(
    emojiTabView: DwtTabView,
    emojiData: IEmojiData[],
    selectionListner: AjxListener,
  ): DwtTabViewPage {
    const emojiTab = new DwtTabViewPage(emojiTabView);
    const maxToolbarCount = Math.ceil(emojiData.length / EmojiOnePicker.sEmojiPerRow);
    for (let toolbarIdx: number = 0; toolbarIdx < maxToolbarCount; toolbarIdx += 1) {
      EmojiOnePicker.populateEmojiRow(
        new DwtToolBar({
          parent: emojiTab,
        }),
        emojiData.slice(
          toolbarIdx * EmojiOnePicker.sEmojiPerRow,
          (toolbarIdx * EmojiOnePicker.sEmojiPerRow) + EmojiOnePicker.sEmojiPerRow,
        ),
        selectionListner,
      );
    }
    emojiTab.showMe = () => {
      emojiTab.setSize(
        `${EmojiOnePicker.wEmojiToolBarBtn * EmojiOnePicker.sEmojiPerRow + 15}px`, // 15 is the scrollbar
        `${EmojiOnePicker.hEmojiToolBarBtn * 5}px`,
      );
    };
    return emojiTab;
  }

  private static populateEmojiRow(
    dwtToolBar: DwtToolBar,
    emojisToAdd: IEmojiData[],
    selectionListner: AjxListener,
  ): void {
    for (const emojiData of emojisToAdd) {
      if (typeof emojiData === "undefined") { continue; }
      const button = new DwtToolBarButton({
        className: `EmojiOnePickerToolbarButton${ !ZimbraUtils.isUniversalUI() ? "-legacy-ui" : "" }`,
        parent: dwtToolBar,
        style: "width: 30px",
      });
      button.setText(emojiData.data.replace(/emojione/g, "emojione_16"));
      button.setData(EmojiOnePicker.KEY_EMOJI_DATA, emojiData);
      button.setToolTipContent(emojiData.name, false);
      button.addSelectionListener(selectionListner);
    }
  }

  private mOnEmojiSelectedCbk: Callback = void 0;

  constructor(
    parent: DwtControl,
  ) {
    super({
      parent: parent,
      style: DwtMenu.GENERIC_WIDGET_STYLE,
    });

    const emojiTabView = new DwtTabView({parent: this});
    // Fix for Zimbra 7
    if (typeof (emojiTabView as ExtendedDwtTabView).isStyle === "undefined") {
      (emojiTabView as ExtendedDwtTabView).isStyle = () => undefined;
    }
    let pageIdx: number = -1;
    const selectionListener = new AjxListener(
      this,
      this.onEmojiSelected,
    );
    for (const emojiName of EmojiTemplate.NAMES) {
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
        EmojiTemplate.NAMES_DATA_SPRITE[pageIdx].replace(/emojione/g, "emojione_16"),
        EmojiOnePicker.createEmojiTabPage(
          emojiTabView,
          EmojiTemplate.DATA_SPRITES[pageIdx],
          selectionListener,
        ),
      );
    }
    emojiTabView.setSize(
      `${EmojiOnePicker.wEmojiToolBarBtn * EmojiOnePicker.sEmojiPerRow + 15}px`, // 15 is the scrollbar
      `${EmojiOnePicker.hEmojiToolBarBtn * 5 + 31}px`,
    );
    emojiTabView.switchToTab(1);

    this.resetSize();

    if (typeof EmojiOnePicker.sInstance === "undefined") {
      EmojiOnePicker.sInstance = this;
    }
  }

  public getSize(getFromStyle?: boolean): DwtPoint {
    return new DwtPoint(
      (EmojiTemplate.NAMES.length * 48) + 30,
      (EmojiOnePicker.hEmojiToolBarBtn * 5) + 31,
    );
  }

  public getMenu(parent: DwtComposite, callback: Callback): DwtMenu {
    this.mOnEmojiSelectedCbk = callback;
    // this.reparent(parent); // Reparenting done right does not work... :/
    return this;
  }

  public popup(delay: number, x: number, y: number, kbGenereated?: boolean): void {
    super.popup(delay, x, y, kbGenereated);
    this.setZIndex(501);
    // Fix for Zimbra 7, not necessary in 8+
    this.resetSize();
  }

  private resetSize(): void {
    const wSize: number = (EmojiTemplate.NAMES.length * 48) + (Bowser.msie ? 45 : 31);
    const hSize: number = (EmojiOnePicker.hEmojiToolBarBtn * 5) + (Bowser.msie ? 30 : 25);
    this.setSize(
      `${wSize}px`,
      `${hSize + 5}px`,
    );
  }

  private onEmojiSelected(ev: DwtSelectionEvent): void {
    const emoji: IEmojiData = ev.dwtObj.getData(EmojiOnePicker.KEY_EMOJI_DATA);
    if (typeof emoji === "undefined") { return; }
    if (typeof this.mOnEmojiSelectedCbk !== "undefined") {
      // emoji is a IEmojiData not DwtControl
      this.mOnEmojiSelectedCbk.run(ev, emoji);
    }
  }

}

// tslint:disable-next-line
class ExtendedDwtTabView extends DwtTabView {
  public isStyle: () => void;
}
