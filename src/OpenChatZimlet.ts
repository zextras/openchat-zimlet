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
import {LogEngine} from "./lib/log/LogEngine";
import {appCtxt} from "./zimbra/zimbraMail/appCtxt";
import {TimedCallbackFactory} from "./lib/callbacks/TimedCallbackFactory";
import {DateProvider} from "./lib/DateProvider";
import {SessionInfoProvider} from "./client/SessionInfoProvider";
import {SoapEventParser} from "./client/connection/soap/chat/SoapEventParser";
import {PingManagerImp} from "./client/connection/soap/PingManagerImp";
import {ChatConnectionManager} from "./client/connection/ChatConnectionManager";
import {DosFilterImp} from "./client/connection/soap/dos/DosFilterImp";
import {SoapRequestFactory} from "./client/connection/soap/SoapRequestFactory";
import {SoapConnection} from "./client/connection/soap/SoapConnection";
import {SoapEventParserUtils} from "./client/connection/soap/chat/SoapEventParserUtils";
import {EventManager} from "./client/events/EventManager";
import {SettingsManager} from "./settings/SettingsManager";
import {HandlerRegister} from "./client/events/HandlerRegister";
import {ChatPluginManager} from "./lib/plugin/ChatPluginManager";
import {CommandFactory} from "./client/connection/CommandFactory";
import {SoapCommands} from "./client/connection/soap/SoapCommands";
import {HistoryPlugin} from "./plugins/HistoryPlugin";
import {SendMailPlugin} from "./plugins/SendMailPlugin";
import {StringUtils} from "./lib/StringUtils";

declare const com_zextras_chat_open: {[label: string]: string};

export class OpenChatZimlet extends ChatZimletBase {

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
      let timedCallbackFactory: TimedCallbackFactory = new TimedCallbackFactory();
      let dateProvider: DateProvider = new DateProvider();
      let sessionInfoProvider: SessionInfoProvider = new SessionInfoProvider(
        appCtxt.getUsername(),
        appCtxt.getActiveAccount().getDisplayName(),
        ChatZimletBase.getVersion()
      );

      let settingsManager = new SettingsManager(
        this,
        appCtxt.getSettings(),
        timedCallbackFactory
      );

      let newParser: SoapEventParser = new SoapEventParser();
      SoapEventParserUtils.PopulateChatSoapEventParser(newParser, dateProvider);

      let soapCommandFactory: CommandFactory = new CommandFactory();
      SoapCommands.registerCommands(soapCommandFactory);

      let connectionManager: ChatConnectionManager = new ChatConnectionManager(
        new SoapConnection(
          new SoapRequestFactory(
            appCtxt.getAppController(),
            sessionInfoProvider
          ),
          sessionInfoProvider,
          new DosFilterImp(
            dateProvider,
            timedCallbackFactory
          ),
          new PingManagerImp(
            timedCallbackFactory,
            sessionInfoProvider
          )
        ),
        soapCommandFactory,
        newParser
      );

      let eventManager: EventManager = new EventManager();
      HandlerRegister.registerHandlers(eventManager, this);


      let chatClientPluginManager = new ChatPluginManager();
      let roomManagerPluginManager = new ChatPluginManager();
      let mainWindowPluginManager = new ChatPluginManager();
      let roomWindowManagerPluginManager = new ChatPluginManager();

      // Open Plugins
      // SendMail Plugin
      SendMailPlugin.plugin(
        roomManagerPluginManager,
        mainWindowPluginManager,
        roomWindowManagerPluginManager
      );
      // History Plugin
      HistoryPlugin.plugin(
        eventManager,
        mainWindowPluginManager,
        roomWindowManagerPluginManager
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
        roomWindowManagerPluginManager
      );
    } catch (err) {
      ChatZimletBase.alreadyInit = false;
      this.Log.err(err, "Error on ZxChatZimlet Initialization");
    }
  }

  /**
   * @deprecated
   */
  public static getInstance(): OpenChatZimlet {
    return <OpenChatZimlet>ChatZimletBase.INSTANCE;
  }

  /**
   * @deprecated
   */
  public exportClientErrors(): string {
    return LogEngine.getLogger(LogEngine.CHAT).exportLog();
  }

}

interface OpenChatZimletWindow extends Window {
  com_zextras_chat_open_hdlr: Function;
}

if (typeof window !== "undefined" && typeof (<OpenChatZimletWindow>window).com_zextras_chat_open_hdlr === "undefined") {
  (<OpenChatZimletWindow>window).com_zextras_chat_open_hdlr = OpenChatZimlet;
}
