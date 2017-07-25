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

import {SettingsHandlerInterface} from "./SettingsHandlerInterface";
import {Callback} from "../../lib/callbacks/Callback";
import {SettingsUtils} from "../SettingsUtils";
import {Setting} from "../Setting";
import {AjxSoapDoc} from "../../zimbra/ajax/soap/AjxSoapDoc";
import {AjxCallback} from "../../zimbra/ajax/boot/AjxCallback";
import {appCtxt} from "../../zimbra/zimbraMail/appCtxt";
import {ZmZimbraMail} from "../../zimbra/zimbraMail/core/ZmZimbraMail";
import {ChatZimletBase} from "../../ChatZimletBase";
import {ZmZimletContext} from "../../zimbra/zimbraMail/share/model/ZmZimletContext";

export class PropertiesHandler implements SettingsHandlerInterface {

  private mZimletContext: ChatZimletBase;

  constructor(zimletContext: ChatZimletBase) {
    this.mZimletContext = zimletContext;
  }

  public set(key: string, value: string|number, callback: Callback): void {
    let soapDoc = AjxSoapDoc.create("ModifyPropertiesRequest", "urn:zimbraAccount");
    let props = (<ZmZimletContext>this.mZimletContext.xmlObj()).userProperties;
    let check = this.mZimletContext.checkProperties(props);
    (<ZmZimletContext>this.mZimletContext.xmlObj()).setPropValue(key, value);
    if (!check) {
      return;
    }
    if (typeof check === "string") {
      return this.mZimletContext.displayErrorMessage(<string>check);
    }
    if (typeof this.mZimletContext._propertyEditor !== "undefined") {
      if (!this.mZimletContext._propertyEditor.validateData()) {
        return;
      }
    }
    for (let property of props) {
      let p = soapDoc.set("prop", property.value);
      p.setAttribute("zimlet", <string>this.mZimletContext.xmlObj("name"));
      p.setAttribute("name", property.name);
    }
    let ajxCallback = null;
    if (typeof callback !== "undefined") {
      ajxCallback = new AjxCallback(callback, callback.run);
    }
    let params = {
      soapDoc: soapDoc,
      callback: ajxCallback,
      asyncMode: true,
      sensitive: false,
      noAuthToken: true
    };
    (<ZmZimbraMail>appCtxt.getAppController()).sendRequest(params);
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
      Setting.IM_USR_PREF_URL_IN_CONV,
      Setting.IM_USR_PREF_URL_IN_HIST,
      Setting.IM_USR_PREF_URL_IN_MAIL,
      Setting.IM_USR_PREF_SHOW_DEBUG_INFO,
      Setting.ENABLE_ERROR_REPORT
    ];
  }

  public isSettingHandled(key: string): boolean {
    return SettingsUtils.isSettingHandled(key, this.settingsHandled());
  }

}
