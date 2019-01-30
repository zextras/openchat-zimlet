/*
 * Copyright (C) 2019 ZeXtras S.r.l.
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

import "./images/emojione.sprites_16.scss";
import "./images/emojione.sprites_32.scss";

// tslint:disable:ordered-imports
import "./app/fontawesome/fa-solid.scss";
import "./app/fontawesome/fontawesome.scss";
// tslint:enable:ordered-imports
import "./app/opensans/OpenSans.scss";

import "./images/com_zextras_chat_open_sprite.scss";

import "./com_zextras_chat_open.scss";

import {SessionInfoProvider} from "./client/SessionInfoProvider";
import {TimedCallbackFactory} from "./lib/callbacks/TimedCallbackFactory";
import {StringUtils} from "./lib/StringUtils";
import {SettingsManager} from "./settings/SettingsManager";
import {appCtxt} from "./zimbra/zimbraMail/appCtxt";
import {ZmZimletBase} from "./zimbra/zimbraMail/share/model/ZmZimletBase";

declare const com_zextras_chat_open: {[label: string]: string};

export class OpenChatZimletEntryPoint extends ZmZimletBase {

  private appLoader: any = void 0;

  public init(): void {
    import(/* webpackChunkName: "OpenChatZimletLazyLoader" */ "./OpenChatZimletLazyLoader")
      .then(
        (module: {OpenChatZimletLazyLoader: any}) => {
          const mTimedCallbackFactory = new TimedCallbackFactory();
          const settingsManager = new SettingsManager(
            this,
            appCtxt.getSettings(),
            mTimedCallbackFactory,
          );
          const sessionInfoProvider = new SessionInfoProvider(
            appCtxt.getUsername(),
            appCtxt.getActiveAccount().getDisplayName(),
          );

          this.appLoader = new module.OpenChatZimletLazyLoader(
            this,
            mTimedCallbackFactory,
            settingsManager,
            sessionInfoProvider,
          );
        },
      )
      // tslint:disable-next-line:no-string-literal
      ["catch"](
      (err) => {
        // tslint:disable-next-line:no-console
        console.log("Error while loading OpenChat lazy loader.");
      },
    );
  }
}

interface IOpenChatZimletWindow extends Window {
  com_zextras_chat_open_hdlr: typeof OpenChatZimletEntryPoint;
}

if (typeof window !== "undefined"
  && typeof (window as IOpenChatZimletWindow).com_zextras_chat_open_hdlr === "undefined") {
  (window as IOpenChatZimletWindow).com_zextras_chat_open_hdlr = OpenChatZimletEntryPoint;
  StringUtils.setTranslationMap(com_zextras_chat_open);
}
