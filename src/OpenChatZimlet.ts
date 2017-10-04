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

import {ChatZimletBase} from "./ChatZimletBase";
import {ChatConnectionManager} from "./client/connection/ChatConnectionManager";
import {CommandFactory} from "./client/connection/CommandFactory";
import {SoapEventParser} from "./client/connection/soap/chat/SoapEventParser";
import {SoapEventParserUtils} from "./client/connection/soap/chat/SoapEventParserUtils";
import {DosFilter} from "./client/connection/soap/dos/DosFilter";
import {PingManager} from "./client/connection/soap/PingManager";
import {SoapCommands} from "./client/connection/soap/SoapCommands";
import {SoapConnection} from "./client/connection/soap/SoapConnection";
import {SoapRequestFactory} from "./client/connection/soap/SoapRequestFactory";
import {EventManager} from "./client/events/EventManager";
import {HandlerRegister} from "./client/events/HandlerRegister";
import {SessionInfoProvider} from "./client/SessionInfoProvider";
import {TimedCallbackFactory} from "./lib/callbacks/TimedCallbackFactory";
import {DateProvider} from "./lib/DateProvider";
import {LogEngine} from "./lib/log/LogEngine";
import {ChatPluginManager} from "./lib/plugin/ChatPluginManager";
import {StringUtils} from "./lib/StringUtils";
import {HistoryPlugin} from "./plugins/HistoryPlugin";
import {SendMailPlugin} from "./plugins/SendMailPlugin";
import {SettingsManager} from "./settings/SettingsManager";
import {appCtxt} from "./zimbra/zimbraMail/appCtxt";

declare const com_zextras_chat_open: {[label: string]: string};

export class OpenChatZimlet extends ChatZimletBase {

  /**
   * @deprecated
   */
  public static getInstance(): OpenChatZimlet {
    return ChatZimletBase.INSTANCE as OpenChatZimlet;
  }

  constructor() {
    try {
      super();
      this.Log = LogEngine.getLogger(LogEngine.CHAT);
    } catch (err) {
      this.Log = LogEngine.getLogger(LogEngine.CHAT);
      this.Log.err(err, "Error on OpenChatZimlet Construction");
    }
  }

  public init(): void {
    this.Log.debug("OpenChat Mode", "OpenChatZimlet");

    if (ChatZimletBase.alreadyInit) {
      return;
    }

    try {
      ChatZimletBase.alreadyInit = true;
      const timedCallbackFactory: TimedCallbackFactory = new TimedCallbackFactory();
      const dateProvider: DateProvider = new DateProvider();
      const sessionInfoProvider: SessionInfoProvider = new SessionInfoProvider(
        appCtxt.getUsername(),
        appCtxt.getActiveAccount().getDisplayName(),
        ChatZimletBase.getVersion(),
      );

      const settingsManager = new SettingsManager(
        this,
        appCtxt.getSettings(),
        timedCallbackFactory,
      );

      const newParser: SoapEventParser = new SoapEventParser();
      SoapEventParserUtils.PopulateChatSoapEventParser(newParser, dateProvider);

      const soapCommandFactory: CommandFactory = new CommandFactory();
      SoapCommands.registerCommands(soapCommandFactory);

      const connectionManager: ChatConnectionManager = new ChatConnectionManager(
        new SoapConnection(
          new SoapRequestFactory(
            appCtxt.getAppController(),
            sessionInfoProvider,
          ),
          sessionInfoProvider,
          new DosFilter(
            dateProvider,
            timedCallbackFactory,
          ),
          new PingManager(
            timedCallbackFactory,
            sessionInfoProvider,
          ),
        ),
        soapCommandFactory,
        newParser,
      );

      const eventManager: EventManager = new EventManager();
      HandlerRegister.registerHandlers(eventManager, this);

      const chatClientPluginManager = new ChatPluginManager();
      const roomManagerPluginManager = new ChatPluginManager();
      const mainWindowPluginManager = new ChatPluginManager();
      const roomWindowManagerPluginManager = new ChatPluginManager();

      // Open Plugins
      // SendMail Plugin
      SendMailPlugin.plugin(
        roomManagerPluginManager,
        mainWindowPluginManager,
        roomWindowManagerPluginManager,
      );
      // History Plugin
      HistoryPlugin.plugin(
        eventManager,
        mainWindowPluginManager,
        roomWindowManagerPluginManager,
      );

      StringUtils.setTranslationMap(com_zextras_chat_open);

      super.initChatZimlet(
        timedCallbackFactory,
        dateProvider,
        settingsManager,
        sessionInfoProvider,
        connectionManager,
        eventManager,
        roomManagerPluginManager,
        chatClientPluginManager,
        mainWindowPluginManager,
        roomWindowManagerPluginManager,
      );
    } catch (err) {
      ChatZimletBase.alreadyInit = false;
      this.Log.err(err, "Error on ZxChatZimlet Initialization");
    }
  }

  /**
   * @deprecated
   */
  public exportClientErrors(): string {
    return LogEngine.getLogger(LogEngine.CHAT).exportLog();
  }

}

interface OpenChatZimletWindow extends Window {
  // tslint:disable-next-line:ban-types
  com_zextras_chat_open_hdlr: Function;
}

if (
  typeof window !== "undefined"
  && typeof (window as OpenChatZimletWindow).com_zextras_chat_open_hdlr === "undefined"
) {
  (window as OpenChatZimletWindow).com_zextras_chat_open_hdlr = OpenChatZimlet;
}
