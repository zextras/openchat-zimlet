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

import {Message} from "../dwt/widgets/Message";
import {Dwt} from "../zimbra/ajax/dwt/core/Dwt";
import {ZmMailMsg} from "../zimbra/zimbraMail/mail/model/ZmMailMsg";
import {ZmObjectHandler} from "../zimbra/zimbraMail/share/model/ZmObjectHandler";
import {ZmObjectManager} from "../zimbra/zimbraMail/share/model/ZmObjectManager";
import {ZmOrganizer} from "../zimbra/zimbraMail/share/model/ZmOrganizer";
import {EmojiOneHandler} from "./handlers/EmojiOneHandler";
import {UrlHandler} from "./handlers/UrlHandler";

export class ObjectHandler extends ZmObjectHandler {

  private static INSTANCE: ObjectHandler;

  private static hasEmojiHandler(manager: ZmObjectManager): boolean {
    return (typeof manager.__hasEmojiHandler !== "undefined" && manager.__hasEmojiHandler);
  }

  private enabledEmojiInConv: boolean;
  private enabledEmojiInHist: boolean;
  private enabledEmojiInMail: boolean;
  private enabledUrlInConv: boolean;
  private enabledUrlInHist: boolean;
  private enabledUrlInMail: boolean;
  private emojiOneHdlr: EmojiOneHandler;
  private urlHdlr: UrlHandler;

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

  public setUrlEnabledInConv(enabled: boolean): void {
    this._getInstance().enabledUrlInConv = enabled;
  }

  public setUrlEnabledInHist(enabled: boolean): void {
    this._getInstance().enabledUrlInHist = enabled;
  }

  public setUrlEnabledInMail(enabled: boolean): void {
    this._getInstance().enabledUrlInMail = enabled;
  }

  public onFindMsgObjects(msg: ZmMailMsg|Message, manager: ZmObjectManager): void {
    const headerElement: HTMLElement = Dwt.getElement("zv__CLV-main__CV__header");
    const mailTitleElement: HTMLElement = Dwt.getElement("zv__CLV-main__CV__header_subject");
    // if ((mailTitleElement != null) && (headerElement != null)) {
    //   if (mailTitleElement.style != null) {
    //     mailTitleElement.style.overflow = "hidden";
    //   }
    //   headerSize = Dwt.getSize(headerElement).x;
    //   if (headerSize > 0) {
    //     Dwt.setSize(mailTitleElement, Dwt.getSize(headerElement).x - 24);
    //   }
    // }
    let addEmojiHandler = false;
    let addUrlHandler = false;
    if (msg instanceof Message) {
      // Is chat message
      this.removeAllHandlersWithType(manager, "url");
      addEmojiHandler = this.enabledEmojiInConv;
      addUrlHandler = this.enabledUrlInConv;
    } else {
      // Is Zimbra Message
      const isChatFolder = (
        (msg as ZmMailMsg).folderId === `${ZmOrganizer.ID_CHATS}`
        || (msg as ZmMailMsg).folderId === ZmOrganizer.ID_CHATS
      );
      if (!!msg && isChatFolder && this.enabledEmojiInHist) {
        addEmojiHandler = true;
      } else {
        addEmojiHandler = !!msg && !isChatFolder && this.enabledEmojiInMail;
      }
      if (!!msg && isChatFolder && this.enabledUrlInHist) {
        addUrlHandler = true;
      } else {
        addUrlHandler = !!msg && !isChatFolder && this.enabledUrlInMail;
      }
    }

    // add handlers and sort
    if (addEmojiHandler && !ObjectHandler.hasEmojiHandler(manager)) {
      this._addEmojiHandlerToManager(manager);
    }
    if (!addEmojiHandler && ObjectHandler.hasEmojiHandler(manager)) {
      this._removeEmojiHandlerToManager(manager);
    }
    if (addUrlHandler) {
      this.removeAllHandlersWithType(manager, "url");
      manager.addHandler(this.urlHdlr );
    }
    manager.sortHandlers();
  }

  private _addEmojiHandlerToManager(manager: ZmObjectManager): void {
    manager.addHandler(this.emojiOneHdlr);
    manager.__hasEmojiHandler = true;
  }

  private _removeEmojiHandlerToManager(manager: ZmObjectManager): void {
    manager.removeHandler(this.emojiOneHdlr);
    manager.__hasEmojiHandler = false;
  }

  private _getInstance(): ObjectHandler {
    if (typeof ObjectHandler.INSTANCE === "undefined") {
      ObjectHandler.INSTANCE = new ObjectHandler();
    }
    return ObjectHandler.INSTANCE;
  }

  private _init(): void {
    const instance = this._getInstance();
    instance.enabledEmojiInConv = true;
    instance.enabledEmojiInHist = true;
    instance.enabledEmojiInMail = true;

    instance.emojiOneHdlr = new EmojiOneHandler();
    instance.urlHdlr = new UrlHandler();
  }

  private removeAllHandlersWithType(manager: ZmObjectManager, type: string): void {
    manager.getHandlers()[type] = [];
  }

}
