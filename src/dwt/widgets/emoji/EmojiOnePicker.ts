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
import {IdGenerator} from "../../IdGenerator";
import {ZmZimletBase} from "../../../zimbra/zimbraMail/share/model/ZmZimletBase";
import {EmojiPage} from "./EmojiPage";
import {EmojiTemplate, EmojiData} from "./EmojiTemplate";
import {TimedCallbackFactory} from "../../../lib/callbacks/TimedCallbackFactory";
import {Callback} from "../../../lib/callbacks/Callback";
import {DwtToolBar, DwtToolBarButton} from "../../../zimbra/ajax/dwt/widgets/DwtToolBar";
import {AjxListener} from "../../../zimbra/ajax/events/AjxListener";
import {DwtSelectionEvent} from "../../../zimbra/ajax/dwt/events/DwtSelectionEvent";
import {AjxEnv} from "../../../zimbra/ajax/boot/AjxEnv";
import {DwtPoint} from "../../../zimbra/ajax/dwt/graphics/DwtPoint";
import {Version} from "../../../lib/Version";

export class EmojiOnePicker extends DwtComposite {

  public static KEY_EMOJI_DATA: string = "emoji";

  private static sInstance: EmojiOnePicker = void 0;

  public static sIeImagesAlreadyLoaded: boolean = false;

  private static sEmojiSize: number = 18;
  private static sWidth: number = 621;
  private static sHeight: number = 270;

  private mAsyncLoading: boolean;
  private mMenu: DwtMenu;
  private mZimlet: ZmZimletBase;
  private mEmojiPages: {[pageName: string]: EmojiPage};
  private mPageButtons: {[pageName: string]: DwtToolBarButton};
  private mCurrentPage: EmojiPage;

  public mOnEmojiSelectedCbk: Callback = void 0;

  public static getInstance(): EmojiOnePicker {
    return this.sInstance;
  }

  constructor(
    parent: DwtControl,
    zimlet: ZmZimletBase,
    timedCallbackFactory: TimedCallbackFactory,
    asyncLoading: boolean = true
  ) {
    super({parent: new DwtMenu({
      parent: parent,
      style: DwtMenu.GENERIC_WIDGET_STYLE,
      id: IdGenerator.generateId("Emoticon_Action_Menu")
    })});
    this.mMenu = <DwtMenu>this.parent;

    if (Version.isZ8_6Up()) {
      // Hack for issue ZXCHAT-499
      // DwtMenu does not return the correct size in Zimbra 8.6,
      // will work as usual if the menu is popped up under the button
      // WARNING: Do not remove this function!
      this.mMenu.getSize = (getFromStyle?: boolean) => {
        return new DwtPoint(642, 247);
      };
    }

    this.mAsyncLoading = asyncLoading;
    this.mZimlet = zimlet;
    this.mEmojiPages = {};
    this.mPageButtons = {};

    if (AjxEnv.isIE) {

      let page = new EmojiPage(
        this,
        zimlet,
        timedCallbackFactory,
        new Callback(this, this.onEmojiSelected),
        EmojiTemplate.DATA_SPRITES[0]
      );
      page.setVisible(true);
      this.mEmojiPages[EmojiOnePicker.getDefaultEmoji().name] = page;

    } else {

      let tabBar: DwtToolBar = new DwtToolBar({parent: this, id: "EmojiOnePickerToolbar"}),
        separator: DwtControl,
        isFirst: boolean = true,
        pageSelectionLsnr: AjxListener = new AjxListener(this, this.onPageSelected);

      separator = new DwtControl({parent: this, className: "horizSep"});
      this.mAsyncLoading = false;

      for (let i: number = 0; i < EmojiTemplate.NAMES.length; i += 1) {
        let pageIcon: string = EmojiTemplate.NAMES[i],
          page: EmojiPage,
          pageButton: DwtToolBarButton = new DwtToolBarButton({
            parent: tabBar,
            style: ((!isFirst) ? "border-left-width:0;" : ""),
            className: "ZxChat_Button"
          });
        pageButton.setText(EmojiTemplate.NAMES_DATA_SPRITE[i]);
        pageButton.setToolTipContent(pageIcon, false);
        pageButton.setSelected(isFirst);
        pageButton.setData(EmojiOnePicker.KEY_EMOJI_DATA, pageIcon);
        pageButton.addSelectionListener(pageSelectionLsnr);
        this.mPageButtons[pageIcon] = pageButton;

        page = new EmojiPage(
          this,
          zimlet,
          timedCallbackFactory,
          new Callback(this, this.onEmojiSelected),
          EmojiTemplate.DATA_SPRITES[i],
        );
        page.setVisible(isFirst);
        this.mEmojiPages[pageIcon] = page;

        if (isFirst) {
          isFirst = false;
          this.mCurrentPage = page;
        }
      }
      EmojiOnePicker.sIeImagesAlreadyLoaded = true;
    }

    if (typeof EmojiOnePicker.sInstance === "undefined") {
      EmojiOnePicker.sInstance = this;
    }
  }

  public getMenu(callback: Callback): DwtMenu {
    this.mOnEmojiSelectedCbk = callback;
    return this.mMenu;
  }

  public static getDefaultEmoji(): EmojiData {
    return { name: ":grinning:", data: "<span class='emojione emojione-1f600' title=':grinning:'>:grinning:</span>" };
  }

  private onEmojiSelected(ev: DwtSelectionEvent): void {
    let emoji: string = ev.dwtObj.getData(EmojiOnePicker.KEY_EMOJI_DATA);
    if (typeof emoji === "undefined") { return; }
    if (typeof this.mOnEmojiSelectedCbk !== "undefined") {
      this.mOnEmojiSelectedCbk.run(ev, emoji);
    }
  }

  public onPageSelected(ev: DwtSelectionEvent): void {
    let selectedPageName: string = ev.dwtObj.getData(EmojiOnePicker.KEY_EMOJI_DATA);
    if (typeof selectedPageName === "undefined" || !this.mEmojiPages.hasOwnProperty(selectedPageName)) {
      return;
    }
    for (let pageName in this.mPageButtons) {
      if (!this.mPageButtons.hasOwnProperty(pageName)) { continue; }
      if (pageName === selectedPageName) { continue; }
      let button: DwtToolBarButton = this.mPageButtons[pageName];
      button.setSelected(false);
    }
    let page: EmojiPage = this.mEmojiPages[selectedPageName];
    (<DwtToolBarButton>ev.dwtObj).setSelected(true);

    this.mCurrentPage.setVisible(false);
    page.setVisible(true);
    this.mCurrentPage = page;
  }

}
