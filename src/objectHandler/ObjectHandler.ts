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

import {ZmObjectHandler} from "../zimbra/zimbraMail/share/model/ZmObjectHandler";
import {ZmObjectManager} from "../zimbra/zimbraMail/share/model/ZmObjectManager";
import {EmojiOneHandler} from "./handlers/EmojiOneHandler";
import {ZmMailMsg} from "../zimbra/zimbraMail/mail/model/ZmMailMsg";
import {Dwt} from "../zimbra/ajax/dwt/core/Dwt";
import {ZmOrganizer} from "../zimbra/zimbraMail/share/model/ZmOrganizer";
import {Message} from "../dwt/widgets/Message";

export class ObjectHandler extends ZmObjectHandler {

  private static INSTANCE: ObjectHandler;
  private enabledEmojiInConv: boolean;
  private enabledEmojiInHist: boolean;
  private enabledEmojiInMail: boolean;
  private emojiOneHdlr: EmojiOneHandler;

  constructor() {
    super("none");
    if (typeof ObjectHandler.INSTANCE === "undefined") {
      ObjectHandler.INSTANCE = this;
    }
    this._init();
  }

  public setEmojiEnabledInConv(enabled: boolean): void {
    this._getInstance().enabledEmojiInConv = enabled;
  }

  public setEmojiEnabledInHist(enabled: boolean): void {
    this._getInstance().enabledEmojiInHist = enabled;
  }

  public setEmojiEnabledInMail(enabled: boolean): void {
    this._getInstance().enabledEmojiInMail = enabled;
  }

  public onFindMsgObjects(msg: ZmMailMsg, manager: ZmObjectManager): void;
  public onFindMsgObjects(msg: Message, manager: ZmObjectManager): void;
  public onFindMsgObjects(msg: ZmMailMsg|Message, manager: ZmObjectManager): void {
    let headerElement: HTMLElement = Dwt.getElement("zv__CLV-main__CV__header");
    let mailTitleElement: HTMLElement = Dwt.getElement("zv__CLV-main__CV__header_subject");
    // if ((mailTitleElement != null) && (headerElement != null)) {
    //   if (mailTitleElement.style != null) {
    //     mailTitleElement.style.overflow = "hidden";
    //   }
    //   headerSize = Dwt.getSize(headerElement).x;
    //   if (headerSize > 0) {
    //     Dwt.setSize(mailTitleElement, Dwt.getSize(headerElement).x - 24);
    //   }
    // }
    let add = false;
    if (msg instanceof Message) {
      // Is chat message
      add = this.enabledEmojiInConv;
    } else {
      // Is Zimbra Message
      let isChatFolder = ((<ZmMailMsg>msg).folderId === `${ZmOrganizer.ID_CHATS}` || (<ZmMailMsg>msg).folderId === ZmOrganizer.ID_CHATS);
      if (!!msg && isChatFolder && this.enabledEmojiInHist) {
        add = true;
      } else {
        add = !!msg && !isChatFolder && this.enabledEmojiInMail;
      }
    }

    if (add && !ObjectHandler.hasEmojiHandler(manager)) {
      this._addEmojiHandlerToManager(manager);
    }
    if (!add && ObjectHandler.hasEmojiHandler(manager)) {
      this._removeEmojiHandlerToManager(manager);
    }
  }

  private static hasEmojiHandler(manager: ZmObjectManager): boolean {
    return (typeof manager.__hasEmojiHandler !== "undefined" && manager.__hasEmojiHandler);
  }

  private _addEmojiHandlerToManager(manager: ZmObjectManager): void {
    manager.addHandler(this.emojiOneHdlr);
    manager.sortHandlers();
    manager.__hasEmojiHandler = true;
  }

  private _removeEmojiHandlerToManager(manager: ZmObjectManager): void {
    manager.removeHandler(this.emojiOneHdlr);
    manager.sortHandlers();
    manager.__hasEmojiHandler = false;
  }

  private _getInstance(): ObjectHandler {
    if (typeof ObjectHandler.INSTANCE === "undefined") {
      ObjectHandler.INSTANCE = new ObjectHandler();
    }
    return ObjectHandler.INSTANCE;
  }

  private _init(): void {
    let instance = this._getInstance();
    instance.enabledEmojiInConv = true;
    instance.enabledEmojiInHist = true;
    instance.enabledEmojiInMail = true;

    instance.emojiOneHdlr = new EmojiOneHandler();
  }

}
