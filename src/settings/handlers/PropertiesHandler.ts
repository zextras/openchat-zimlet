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

import {Callback} from "../../lib/callbacks/Callback";
import {AjxCallback} from "../../zimbra/ajax/boot/AjxCallback";
import {AjxSoapDoc} from "../../zimbra/ajax/soap/AjxSoapDoc";
import {appCtxt} from "../../zimbra/zimbraMail/appCtxt";
import {ZmZimbraMail} from "../../zimbra/zimbraMail/core/ZmZimbraMail";
import {ZmZimletBase} from "../../zimbra/zimbraMail/share/model/ZmZimletBase";
import {ZmZimletContext} from "../../zimbra/zimbraMail/share/model/ZmZimletContext";
import {Setting} from "../Setting";
import {SettingsUtils} from "../SettingsUtils";
import {ISettingsHandlerInterface} from "./SettingsHandlerInterface";

export class PropertiesHandler implements ISettingsHandlerInterface {

  private mZimletContext: ZmZimletBase;

  constructor(zimletContext: ZmZimletBase) {
    this.mZimletContext = zimletContext;
  }

  public set(key: string, value: string|number, callback: Callback): void {
    const soapDoc = AjxSoapDoc.create("ModifyPropertiesRequest", "urn:zimbraAccount");
    const props = (this.mZimletContext.xmlObj() as ZmZimletContext).userProperties;
    const check = this.mZimletContext.checkProperties(props);
    (this.mZimletContext.xmlObj() as ZmZimletContext).setPropValue(key, value);
    if (!check) {
      return;
    }
    if (typeof check === "string") {
      return this.mZimletContext.displayErrorMessage(check as string);
    }
    if (typeof this.mZimletContext._propertyEditor !== "undefined") {
      if (!this.mZimletContext._propertyEditor.validateData()) {
        return;
      }
    }
    for (const property of props) {
      const p = soapDoc.set("prop", property.value);
      p.setAttribute("zimlet", this.mZimletContext.xmlObj("name") as string);
      p.setAttribute("name", property.name);
    }
    let ajxCallback = null;
    if (typeof callback !== "undefined") {
      ajxCallback = new AjxCallback(callback, callback.run);
    }
    const params = {
      asyncMode: true,
      callback: ajxCallback,
      noAuthToken: true,
      sensitive: false,
      soapDoc: soapDoc,
    };
    (appCtxt.getAppController() as ZmZimbraMail).sendRequest(params);
    if (typeof this.mZimletContext._dlg_propertyEditor !== "undefined") {
      this.mZimletContext._dlg_propertyEditor.popdown();
      this.mZimletContext._dlg_propertyEditor.dispose();
      this.mZimletContext._propertyEditor = null;
      this.mZimletContext._dlg_propertyEditor = null;
    }
  }

  public get(key: string): any {
    return this.mZimletContext.getUserProperty(key);
  }

  public settingsHandled(): string[] {
    return [
      Setting.IM_USR_PREF_DOCK,
      Setting.IM_USR_PREF_DOCK_UP,
      Setting.IM_USR_PREF_EMOJI_IN_CONV,
      Setting.IM_USR_PREF_EMOJI_IN_HIST,
      Setting.IM_USR_PREF_EMOJI_IN_MAIL,
      Setting.IM_USR_PREF_LAST_STATUS,
      Setting.IM_USR_PREF_URL_IN_CONV,
      Setting.IM_USR_PREF_URL_IN_HIST,
      Setting.IM_USR_PREF_URL_IN_MAIL,
      Setting.IM_USR_PREF_SHOW_DEBUG_INFO,
      Setting.ENABLE_ERROR_REPORT,
    ];
  }

  public isSettingHandled(key: string): boolean {
    return SettingsUtils.isSettingHandled(key, this.settingsHandled());
  }

}
