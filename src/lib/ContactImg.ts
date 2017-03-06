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

import {AjxDispatcher} from "../zimbra/ajax/boot/AjxDispatcher";
import {ZmContactList} from "../zimbra/zimbraMail/abook/model/ZmContactList";

export class ContactImg {

  public static CONTACT_IMAGE_SIZE_W: number = 128;
  public static CONTACT_IMAGE_SIZE_H: number = 158;
  private imgUrl: string;

  constructor(id: string, imgSize: number = ContactImg.CONTACT_IMAGE_SIZE_W) {
    this.imgUrl = null;
    try {
      let zimbraContact = (<ZmContactList>AjxDispatcher.run("GetContacts")).getContactByEmail(id);
      if (zimbraContact) {
        this.imgUrl = zimbraContact.getImageUrl(
          imgSize,
          imgSize * 1.23
        );
      }
    } catch (ignored) {}
      this.imgUrl = null;
  }

  public getImgUrl(): string {
    return this.imgUrl;
  }

}
