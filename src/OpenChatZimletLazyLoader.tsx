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

import {h, render} from "preact";
import {Store} from "redux";

import {IMessageUiFactory} from "./app/messageFactory/IMessageUiFactory";
import {MessageUiFactory} from "./app/messageFactory/MessageUiFactory";
import {ChatZimletBase} from "./ChatZimletBase";
import {ChatConnectionManager} from "./client/connection/ChatConnectionManager";
import {CommandFactory} from "./client/connection/CommandFactory";
import {SessionRegisteredEventDecoder} from "./client/connection/soap/chat/decoders/SessionRegisteredEventDecoder";
import {RegisterSessionEventEncoder} from "./client/connection/soap/chat/encoders/RegisterSessionEventEncoder";
import {SoapEventParser} from "./client/connection/soap/chat/SoapEventParser";
import {Command} from "./client/connection/soap/Command";
import {DosFilter} from "./client/connection/soap/dos/DosFilter";
import {PingManager} from "./client/connection/soap/PingManager";
import {SoapConnection} from "./client/connection/soap/SoapConnection";
import {SoapRequestFactory} from "./client/connection/soap/SoapRequestFactory";
import {EventSessionRegistered} from "./client/events/chat/EventSessionRegistered";
import {IOpenChatUserCapabilities} from "./client/events/chat/IOpenChatUserCapabilities";
import {OpenChatEventCode} from "./client/events/chat/OpenChatEventCode";
import {RegisterSessionEvent} from "./client/events/chat/RegisterSessionEvent";
import {EventManager} from "./client/events/EventManager";
import {IEventManager} from "./client/events/IEventManager";
import {SessionInfoProvider} from "./client/SessionInfoProvider";
import {I18nStoreFactory} from "./i18n/zimlet/I18nStoreFactory";
import {IZimletBootStrategy} from "./IZimletBootStrategy";
import {Callback} from "./lib/callbacks/Callback";
import {TimedCallbackFactory} from "./lib/callbacks/TimedCallbackFactory";
import {DateProvider} from "./lib/DateProvider";
import {ChatPluginManager} from "./lib/plugin/ChatPluginManager";
import {SidebarUtils} from "./lib/SidebarUtils";
import {StringUtils} from "./lib/StringUtils";
import {OpenChatBootStrategy} from "./OpenChatBootStrategy";
import {OpenChatZimletEntryPoint} from "./OpenChatZimletEntryPoint";
import {IOpenChatState} from "./redux/IOpenChatState";
import {IOpenChatUIState} from "./redux/IOpenChatUIState";
import {SettingsManager} from "./settings/SettingsManager";
import {appCtxt} from "./zimbra/zimbraMail/appCtxt";
import {ZmSetting} from "./zimbra/zimbraMail/share/model/ZmSetting";
import {ZimletVersion} from "./ZimletVersion";

declare const com_zextras_chat_open: {[label: string]: string};

export class OpenChatZimletLazyLoader extends ChatZimletBase<IOpenChatState> {

  private mMessageUIFactory: IMessageUiFactory<IOpenChatState>;
  private mUIStore: Store<IOpenChatUIState>;

  constructor(
    entry: OpenChatZimletEntryPoint,
    timedCallbackFactory: TimedCallbackFactory,
    settingsManager: SettingsManager,
    sessionInfoProvider: SessionInfoProvider,
    ) {
    super();
    try {
      if (ChatZimletBase.alreadyInit) {
        return;
      }
      ChatZimletBase.alreadyInit = true;
      this.mEntry = entry;
      this.mTimedCallbackFactory = timedCallbackFactory;
      this.mSettingsManager = settingsManager;
      this.mDateProvider = new DateProvider();
      this.mSessionInfoProvider = sessionInfoProvider;
      this.mSoapCommandFactory = new CommandFactory();
      this.mSoapCommandFactory.addCommand(OpenChatEventCode.REGISTER_SESSION,   Command.REGISTER_SESSION);
      this.mEventParser = new SoapEventParser();
      this.mEventParser.addEncoder(new RegisterSessionEventEncoder());
      this.mEventParser.addDecoder(new SessionRegisteredEventDecoder<IOpenChatUserCapabilities>(this.mDateProvider));

      this.mConnectionManager = new ChatConnectionManager(
        new SoapConnection(
          new SoapRequestFactory(
            appCtxt.getAppController(),
            this.mSessionInfoProvider,
          ),
          this.mSessionInfoProvider,
          new DosFilter(
            this.mDateProvider,
            this.mTimedCallbackFactory,
          ),
          new PingManager(
            this.mTimedCallbackFactory,
            this.mSessionInfoProvider,
          ),
        ),
        this.mSoapCommandFactory,
        this.mEventParser,
        this.mSessionInfoProvider,
      );

      this.mConnectionManager.sendEvent(
        new RegisterSessionEvent(
          ZimletVersion.getVersion(),
          this.mDateProvider.getNow(),
        ),
        new Callback(this, this.onSessionRegistered),
        new Callback(this, this.onSessionRegistrationFail),
      );
    } catch (err) {
      ChatZimletBase.alreadyInit = false;
      this.Log.err(err, "Error on OpenChat Initialization");
    }
  }

  private onSessionRegistered(ev: EventSessionRegistered<IOpenChatUserCapabilities>) {
    this.mMessageUIFactory = new MessageUiFactory();

    const chatClientPluginManager = new ChatPluginManager();
    const mainWindowPluginManager = new ChatPluginManager();
    const roomWindowManagerPluginManager = new ChatPluginManager();

    this.Log.debug("OpenChat", "Chat Mode");
    const zStrategy: IZimletBootStrategy = new OpenChatBootStrategy(
      ev.getCapabilities(),
      this.mDateProvider,
      this.mConnectionManager,
      this.mSessionInfoProvider,
      this.mSettingsManager,
      mainWindowPluginManager,
      roomWindowManagerPluginManager,
      ev.getServerVersion(),
    );
    zStrategy.configureCommandFactory(this.mSoapCommandFactory);
    zStrategy.configureEventParser(this.mEventParser);
    zStrategy.configureMessageUiFactory(this.mMessageUIFactory);

    // Init stores
    this.mStore = zStrategy.getStore();

    const eventManager: IEventManager = new EventManager();
    zStrategy.configureEventManager(eventManager, this.mStore, this.mUIStore);
    // HandlerRegister.registerHandlers(eventManager, this);

    zStrategy.initStore(
      this.mStore,
      {
        away: StringUtils.getMessage("st_away"),
        busy: StringUtils.getMessage("st_busy"),
        invisible: StringUtils.getMessage("st_invisible"),
        online: StringUtils.getMessage("st_available"),
      },
    );

    zStrategy.installLegacyPlugins(
      this.mStore,
      this.mUIStore,
    );

    super.initChatZimlet(
      (new I18nStoreFactory(
        com_zextras_chat_open,
        appCtxt.get(ZmSetting.LOCALE_NAME),
      )).createStore(),
      this.mTimedCallbackFactory,
      this.mDateProvider,
      this.mSettingsManager,
      this.mSessionInfoProvider,
      this.mConnectionManager,
      eventManager,
      chatClientPluginManager,
      mainWindowPluginManager,
      roomWindowManagerPluginManager,
      new SidebarUtils(),
      this.mStore,
      zStrategy.getRoomWindowFactory(),
      this.mMessageUIFactory,
    );

    zStrategy.configureClientInMiddlewares(this.getClient());
    eventManager.handleEvent(ev, this.getClient());
  }

  private onSessionRegistrationFail(...args: any[]) {
    this.Log.err(args, "Error on OpenChat Initialization");
  }

}
