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

import {Store} from "redux";

import {IMessageUiFactory} from "./app/messageFactory/IMessageUiFactory";

import {appCtxt} from "./zimbra/zimbraMail/appCtxt";

import "./images/emojione.sprites_16.scss";
import "./images/emojione.sprites_32.scss";

// tslint:disable:ordered-imports
import "./app/fontawesome/fa-solid.scss";
import "./app/fontawesome/fontawesome.scss";
// tslint:enable:ordered-imports
import "./app/opensans/OpenSans.scss";

import "./images/com_zextras_chat_open_sprite.scss";

import "./com_zextras_chat_open.scss";

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
import {IZimletBootStrategy} from "./IZimletBootStrategy";
import {Callback} from "./lib/callbacks/Callback";
import {TimedCallbackFactory} from "./lib/callbacks/TimedCallbackFactory";
import {DateProvider} from "./lib/DateProvider";
import {LogEngine} from "./lib/log/LogEngine";
import {ChatPluginManager} from "./lib/plugin/ChatPluginManager";
import {SidebarUtils} from "./lib/SidebarUtils";
import {StringUtils} from "./lib/StringUtils";
import {OpenChatBootStrategy} from "./OpenChatBootStrategy";
import {IOpenChatState} from "./redux/IOpenChatState";
import {IOpenChatUIState} from "./redux/IOpenChatUIState";
import {SettingsManager} from "./settings/SettingsManager";
import {ZimletVersion} from "./ZimletVersion";

declare const com_zextras_chat_open: {[label: string]: string};

export class OpenChatZimlet extends ChatZimletBase<IOpenChatState> {

  private mAlreadyInit: boolean;
  private mMessageUIFactory: IMessageUiFactory<IOpenChatState>;
  private mUIStore: Store<IOpenChatUIState>;

  constructor() {
    try {
      super();
      this.Log = LogEngine.getLogger(LogEngine.CHAT);
      this.mAlreadyInit = false;
    } catch (err) {
      this.Log = LogEngine.getLogger(LogEngine.CHAT);
      this.Log.err(err, "Error on OpenChat Construction");
    }
  }

  public init(): void {
    if (ChatZimletBase.alreadyInit) {
      return;
    }

    try {
      ChatZimletBase.alreadyInit = true;

      this.mTimedCallbackFactory = new TimedCallbackFactory();
      this.mDateProvider = new DateProvider();
      this.mSessionInfoProvider = new SessionInfoProvider(
        appCtxt.getUsername(),
        appCtxt.getActiveAccount().getDisplayName(),
      );

      this.mEventParser = new SoapEventParser();
      this.mEventParser.addEncoder(new RegisterSessionEventEncoder());
      this.mEventParser.addDecoder(new SessionRegisteredEventDecoder<IOpenChatUserCapabilities>(this.mDateProvider));

      this.mSoapCommandFactory = new CommandFactory();
      this.mSoapCommandFactory.addCommand(OpenChatEventCode.REGISTER_SESSION,   Command.REGISTER_SESSION);

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

  /**
   * @deprecated
   */
  public exportClientErrors(): string {
    return LogEngine.getLogger(LogEngine.CHAT).exportLog();

  }

  private onSessionRegistered(ev: EventSessionRegistered<IOpenChatUserCapabilities>) {
    const settingsManager = new SettingsManager(
      this,
      appCtxt.getSettings(),
      this.mTimedCallbackFactory,
    );

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
      settingsManager,
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
      this.mTimedCallbackFactory,
      this.mDateProvider,
      settingsManager,
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

    // this.pAppName = this.createApp("OpenChat", "zimbraIcon", "OpenChat from ZeXtras");
  }

  private onSessionRegistrationFail(...args: any[]) {
    this.Log.err(args, "Error on OpenChat Initialization");
  }

}

interface IOpenChatZimletWindow extends Window {
  com_zextras_chat_open_hdlr: typeof OpenChatZimlet;
}

if (
  typeof window !== "undefined"
  && typeof (window as IOpenChatZimletWindow).com_zextras_chat_open_hdlr === "undefined"
) {
  (window as IOpenChatZimletWindow).com_zextras_chat_open_hdlr = OpenChatZimlet;
  StringUtils.setTranslationMap(com_zextras_chat_open);
}
