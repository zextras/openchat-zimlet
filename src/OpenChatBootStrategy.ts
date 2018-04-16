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
import {BuddyStatusType} from "./client/BuddyStatusType";
import {IConnectionManager} from "./client/connection/IConnectionManager";
import {IOpenChatUserCapabilities} from "./client/events/chat/IOpenChatUserCapabilities";
import {IChatEvent} from "./client/events/IChatEvent";
import {IEventManager} from "./client/events/IEventManager";
import {IChatEventParser} from "./client/events/parsers/IChatEventParser";
import {IChatClient} from "./client/IChatClient";
import {ISessionInfoProvider} from "./client/ISessionInfoProvider";
import {IRoomWindowFactory} from "./dwt/windows/IRoomWindowFactory";
import {RoomWindowFactory} from "./dwt/windows/RoomWindowFactory";
import {IZimletBootStrategy} from "./IZimletBootStrategy";
import {IDateProvider} from "./lib/IDateProvider";
import {ChatPluginManager} from "./lib/plugin/ChatPluginManager";
import {Version} from "./lib/Version";
import {IUserStatusAction} from "./redux/action/IUserStatusAction";
import {IOpenChatState} from "./redux/IOpenChatState";
import {IOpenChatUIState} from "./redux/IOpenChatUIState";
import {IStoreFactory} from "./redux/IStoreFactory";
import {IMiddlewareFactory} from "./redux/middleware/IMiddlewareFactory";
import {OpenChatMiddlewareFactory} from "./redux/middleware/OpenChatMiddlewareFactory";
import {OpenChatStoreFactory} from "./redux/OpenChatStoreFactory";
import {ISettingsManager} from "./settings/ISettingsManager";

import {ICommandFactory} from "./client/connection/ICommandFactory";
import {Command} from "./client/connection/soap/Command";

import {AcceptFriendshipEventEncoder} from "./client/connection/soap/chat/encoders/AcceptFriendshipEventEncoder";
import {FriendshipEventEncoder} from "./client/connection/soap/chat/encoders/FriendshipEventEncoder";
import {MessageAckEventEncoder} from "./client/connection/soap/chat/encoders/MessageAckEventEncoder";
import {PingEventEncoder} from "./client/connection/soap/chat/encoders/PingEventEncoder";
import {QueryArchiveEventEncoder} from "./client/connection/soap/chat/encoders/QueryArchiveEventEncoder";
import {RemoveFriendshipEventEncoder} from "./client/connection/soap/chat/encoders/RemoveFriendshipEventEncoder";
import {RenameFriendshipEventEncoder} from "./client/connection/soap/chat/encoders/RenameFriendshipEventEncoder";
import {RenameGroupEventEncoder} from "./client/connection/soap/chat/encoders/RenameGroupEventEncoder";
import {SendMessageEventEncoder} from "./client/connection/soap/chat/encoders/SendMessageEventEncoder";
import {SetStatusEventEncoder} from "./client/connection/soap/chat/encoders/SetStatusEventEncoder";
import {UnregisterSessionEventEncoder} from "./client/connection/soap/chat/encoders/UnregisterSessionEventEncoder";
import {WritingStatusEventEncoder} from "./client/connection/soap/chat/encoders/WritingStatusEventEncoder";
import {AcceptFriendshipEvent} from "./client/events/chat/AcceptFriendshipEvent";
import {OpenChatEventCode} from "./client/events/chat/OpenChatEventCode";
import {QueryArchiveEvent} from "./client/events/chat/QueryArchiveEvent";
import {RemoveFriendshipEvent} from "./client/events/chat/RemoveFriendshipEvent";
import {RenameFriendshipEvent} from "./client/events/chat/RenameFriendshipEvent";
import {RenameGroupEvent} from "./client/events/chat/RenameGroupEvent";
import {SetStatusEvent} from "./client/events/chat/SetStatusEvent";
import {UnregisterSessionEvent} from "./client/events/chat/UnregisterSessionEvent";

import {ArchiveResultEventDecoder} from "./client/connection/soap/chat/decoders/ArchiveResultEventDecoder";
import {ArchiveResultFinEventDecoder} from "./client/connection/soap/chat/decoders/ArchiveResultFinEventDecoder";
import {BuddyListEventDecoder} from "./client/connection/soap/chat/decoders/BuddyListEventDecoder";
import {ContactInformationEventDecoder} from "./client/connection/soap/chat/decoders/ContactInformationEventDecoder";
import {DummyEventDecoder} from "./client/connection/soap/chat/decoders/DummyEventDecoder";
import {ErrorEventDecoder} from "./client/connection/soap/chat/decoders/ErrorEventDecoder";
import {FriendBackAddedEventDecoder} from "./client/connection/soap/chat/decoders/FriendBackAddedEventDecoder";
import {FriendshipEventDecoder} from "./client/connection/soap/chat/decoders/FriendshipEventDecoder";
import {LastMessageInfoEventDecoder} from "./client/connection/soap/chat/decoders/LastMessageInfoEventDecoder";
import {
  Legacy2ContactInformationEventDecoder,
} from "./client/connection/soap/chat/decoders/legacy/2/Legacy2ContactInformationEventDecoder";
import {MessageEventDecoder} from "./client/connection/soap/chat/decoders/MessageEventDecoder";
import {NewClientVersionEventDecoder} from "./client/connection/soap/chat/decoders/NewClientVersionEventDecoder";
import {
  RequiredRegistrationEventDecoder,
} from "./client/connection/soap/chat/decoders/RequiredRegistrationEventDecoder";
import {RoomAckReceivedEventDecoder} from "./client/connection/soap/chat/decoders/RoomAckReceivedEventDecoder";
import {SecretTestEventDecoder} from "./client/connection/soap/chat/decoders/SecretTestEventDecoder";
import {ShutdownEventDecoder} from "./client/connection/soap/chat/decoders/ShutdownEventDecoder";
import {SuperSecretEventDecoder} from "./client/connection/soap/chat/decoders/SuperSecretEventDecoder";
import {UserStatusesEventDecoder} from "./client/connection/soap/chat/decoders/UserStatusesEventDecoder";
import {WritingStatusEventDecoder} from "./client/connection/soap/chat/decoders/WritingStatusEventDecoder";

import {TextMessageUiFactoryPlugin} from "./app/messageFactory/TextMessageUiFactoryPlugin";
import {FriendshipInvitationEvent} from "./client/events/chat/friendship/FriendshipInvitationEvent";
import {ArchiveResultEventHandler} from "./client/events/handlers/ArchiveResultEventHandler";
import {BroadcastMessageEventHandler} from "./client/events/handlers/BroadcastMessageEventHandler";
import {BuddyListEventHandler} from "./client/events/handlers/BuddyListEventHandler";
import {ContactInformationEventHandler} from "./client/events/handlers/ContactInformationEventHandler";
import {ErrorEventHandler} from "./client/events/handlers/ErrorEventHandler";
import {FriendBackAddedEventHandler} from "./client/events/handlers/FriendBackAddedEventHandler";
import {FriendshipAcceptedHandler} from "./client/events/handlers/friendship/FriendshipAcceptedHandler";
import {FriendshipBlockedHandler} from "./client/events/handlers/friendship/FriendshipBlockedHandler";
import {FriendshipDeniedHandler} from "./client/events/handlers/friendship/FriendshipDeniedHandler";
import {FriendshipInvitationHandler} from "./client/events/handlers/friendship/FriendshipInvitationHandler";
import {FriendshipRemovedHandler} from "./client/events/handlers/friendship/FriendshipRemovedHandler";
import {FriendshipRenameHandler} from "./client/events/handlers/friendship/FriendshipRenameHandler";
import {FriendshipEventHandler} from "./client/events/handlers/FriendshipEventHandler";
import {MessageEventHandler} from "./client/events/handlers/MessageEventHandler";
import {NewClientVersionEventHandler} from "./client/events/handlers/NewClientVersionEventHandler";
import {ShutdownEventHandler} from "./client/events/handlers/ShutdownEventHandler";
import {SuperSecretEventHandler} from "./client/events/handlers/SuperSecretEventHandler";
import {TimeoutEventHandler} from "./client/events/handlers/TimeoutEventHandler";
import {
  Legacy2RoomAckReceivedReduxEventHandler,
} from "./redux/eventHandler/legacy/2/Legacy2RoomAckReceivedReduxEventHandler";

import {Legacy2MessageEventDecoder} from "./client/connection/soap/chat/decoders/legacy/2/Legacy2MessageEventDecoder";
import {
  Legacy2RoomAckReceivedEventDecoder,
} from "./client/connection/soap/chat/decoders/legacy/2/Legacy2RoomAckReceivedEventDecoder";
import {
  Legacy2MessageAckEventEncoder,
} from "./client/connection/soap/chat/encoders/legacy/2/Legacy2MessageAckEventEncoder";
import {ArchiveResultFinEventHandler} from "./client/events/handlers/ArchiveResultFinEventHandler";
import {ArchiveCountReduxEventHandler} from "./redux/eventHandler/ArchiveCountReduxEventHandler";
import {BroadcastMessageReduxEventHandler} from "./redux/eventHandler/BroadcastMessageReduxEventHandler";
import {BuddyListReduxEventHandler} from "./redux/eventHandler/BuddyListReduxEventHandler";
import {ContactInformationReduxEventHandler} from "./redux/eventHandler/ContactInformationReduxEventHandler";
import {ErrorReduxEventHandler} from "./redux/eventHandler/ErrorReduxEventHandler";
import {FriendBackAddedReduxEventHandler} from "./redux/eventHandler/FriendBackAddedReduxEventHandler";
import {FriendshipReduxEventHandler} from "./redux/eventHandler/FriendshipReduxEventHandler";
import {MessageReduxEventHandler} from "./redux/eventHandler/MessageReduxEventHandler";
import {NewClientVersionReduxEventHandler} from "./redux/eventHandler/NewClientVersionReduxEventHandler";
import {RequiredRegistrationReduxEventHandler} from "./redux/eventHandler/RequiredRegistrationReduxEventHandler";
import {RoomAckReceivedReduxEventHandler} from "./redux/eventHandler/RoomAckReceivedReduxEventHandler";
import {
  SessionRegisteredHistoryEnabledReduxEventHandler,
} from "./redux/eventHandler/SessionRegisteredHistoryEnabledReduxEventHandler";
import {SessionRegisteredReduxEventHandler} from "./redux/eventHandler/SessionRegisteredReduxEventHandler";
import {ShutdownReduxEventHandler} from "./redux/eventHandler/ShutdownReduxEventHandler";
import {SuperSecretReduxEventHandler} from "./redux/eventHandler/SuperSecretReduxEventHandler";
import {TimeoutReduxEventHandler} from "./redux/eventHandler/TimeoutReduxEventHandler";
import {UnregisterSessionReduxEventHandler} from "./redux/eventHandler/UnregisterSessionReduxEventHandler";
import {UserCapabilitiesReduxEventHandler} from "./redux/eventHandler/UserCapabilitiesReduxEventHandler";
import {WritingStatusReduxEventHandler} from "./redux/eventHandler/WritingStatusReduxEventHandler";

import {SendMailPlugin} from "./plugins/SendMailPlugin";
import {LastMessageInfoReduxEventHandler} from "./redux/eventHandler/LastMessageInfoReduxEventHandler";

export class OpenChatBootStrategy implements IZimletBootStrategy {
  private mCapabilities: IOpenChatUserCapabilities;
  private mSessionInfoProvider: ISessionInfoProvider;
  private mDateProvider: IDateProvider;

  private mMainWindowPluginManager: ChatPluginManager;
  private mRoomWindowManagerPluginManager: ChatPluginManager;
  private mConnectionManager: IConnectionManager;
  private mMiddlewareFactory: IMiddlewareFactory;
  private mStore: Store<IOpenChatState>;
  private mRoomWindowFactory: IRoomWindowFactory;
  private mServerVersion: Version;

  constructor(
    capabilities: IOpenChatUserCapabilities,
    dateProvider: IDateProvider,
    connectionManager: IConnectionManager,
    sessionInfoProvider: ISessionInfoProvider,
    settingsManager: ISettingsManager,
    mainWindowPluginManager: ChatPluginManager,
    roomWindowManagerPluginManager: ChatPluginManager,
    serverVersion: Version,
  ) {
    this.mCapabilities = capabilities;
    this.mDateProvider = dateProvider;
    this.mConnectionManager = connectionManager;
    this.mSessionInfoProvider = sessionInfoProvider;
    this.mMainWindowPluginManager = mainWindowPluginManager;
    this.mRoomWindowManagerPluginManager = roomWindowManagerPluginManager;
    this.mMiddlewareFactory = new OpenChatMiddlewareFactory(
      connectionManager,
      dateProvider,
      settingsManager,
      sessionInfoProvider,
      serverVersion,
    );
    this.mServerVersion = serverVersion;
  }

  public configureCommandFactory(cf: ICommandFactory): void {
    cf.addCommand(OpenChatEventCode.MESSAGE, Command.SEND_MESSAGE);
    cf.addSpecialCommand(
      OpenChatEventCode.FRIENDSHIP,
      FriendshipInvitationEvent.getCommandFromFriendshipEvent,
    );
    cf.addCommand(OpenChatEventCode.WRITING_STATUS,     Command.NOTIFY_WRITING);
    cf.addCommand(OpenChatEventCode.ROOM_ACK,           Command.NOTIFY_MSG_RECEIVED);
    cf.addCommand(OpenChatEventCode.PING,               Command.PING);
    cf.addCommand(OpenChatEventCode.REGISTER_SESSION,   Command.REGISTER_SESSION);
    cf.addCommand(OpenChatEventCode.UNREGISTER_SESSION, Command.UNREGISTER_SESSION);
    cf.addCommand(OpenChatEventCode.ACCEPT_FRIENDSHIP,  Command.ACCEPT_FRIEND);
    cf.addCommand(OpenChatEventCode.REMOVE_FRIENDSHIP,  Command.REMOVE_FRIEND);
    cf.addCommand(OpenChatEventCode.RENAME_FRIENDSHIP,  Command.RENAME_FRIEND);
    cf.addCommand(OpenChatEventCode.RENAME_GROUP,       Command.RENAME_GROUP); // Buddy list group
    cf.addCommand(OpenChatEventCode.QUERY_ARCHIVE,      Command.QUERY_ARCHIVE);

    cf.addSpecialCommand(OpenChatEventCode.SET_STATUS, SetStatusEvent.getCommandFromSetStatusEvent);
  }

  public configureEventParser(
    ep: IChatEventParser<IChatEvent>,
  ): void {
    const secretDecoder = new SuperSecretEventDecoder(this.mDateProvider);
    // Add Decoders
    ep.addDecoder(new DummyEventDecoder<AcceptFriendshipEvent>(OpenChatEventCode.ACCEPT_FRIENDSHIP));
    ep.addDecoder(new BuddyListEventDecoder(this.mDateProvider));
    if (this.mServerVersion.lessThan(new Version (2, 2))) {
      ep.addDecoder(new Legacy2ContactInformationEventDecoder(this.mDateProvider));
      ep.addDecoder(new Legacy2MessageEventDecoder(this.mDateProvider, secretDecoder));
      ep.addDecoder(new Legacy2RoomAckReceivedEventDecoder(this.mDateProvider));
      ep.addEncoder(new Legacy2MessageAckEventEncoder());
    } else {
      ep.addDecoder(new ContactInformationEventDecoder(this.mDateProvider));
      ep.addDecoder(new MessageEventDecoder(this.mDateProvider, secretDecoder));
      ep.addDecoder(new RoomAckReceivedEventDecoder(this.mDateProvider));
      ep.addEncoder(new MessageAckEventEncoder());
    }
    ep.addDecoder(new ErrorEventDecoder(this.mDateProvider));
    ep.addDecoder(new FriendBackAddedEventDecoder<IOpenChatUserCapabilities>(this.mDateProvider));
    ep.addDecoder(new FriendshipEventDecoder(this.mDateProvider));
    ep.addDecoder(new NewClientVersionEventDecoder(this.mDateProvider));
    ep.addDecoder(new DummyEventDecoder<RemoveFriendshipEvent>(OpenChatEventCode.REMOVE_FRIENDSHIP));
    ep.addDecoder(new DummyEventDecoder<RenameFriendshipEvent>(OpenChatEventCode.RENAME_FRIENDSHIP));
    ep.addDecoder(new DummyEventDecoder<RenameGroupEvent>(OpenChatEventCode.RENAME_GROUP));
    ep.addDecoder(new RequiredRegistrationEventDecoder(this.mDateProvider));
    ep.addDecoder(new DummyEventDecoder<UnregisterSessionEvent>(OpenChatEventCode.UNREGISTER_SESSION));
    ep.addDecoder(new DummyEventDecoder<SetStatusEvent>(OpenChatEventCode.SET_STATUS));
    ep.addDecoder(new ShutdownEventDecoder(this.mDateProvider));
    ep.addDecoder(new UserStatusesEventDecoder(this.mDateProvider));
    ep.addDecoder(new WritingStatusEventDecoder(this.mDateProvider));
    ep.addDecoder(new DummyEventDecoder<QueryArchiveEvent>(OpenChatEventCode.QUERY_ARCHIVE));
    ep.addDecoder(new ArchiveResultEventDecoder(this.mDateProvider, ep));
    ep.addDecoder(new ArchiveResultFinEventDecoder(this.mDateProvider));
    ep.addDecoder(new LastMessageInfoEventDecoder(this.mDateProvider));
    // Secret event, not ready for production
    secretDecoder.addDecoder(new SecretTestEventDecoder());
    // Add Encoders
    ep.addEncoder(new AcceptFriendshipEventEncoder());
    ep.addEncoder(new FriendshipEventEncoder());
    ep.addEncoder(new PingEventEncoder());
    ep.addEncoder(new RemoveFriendshipEventEncoder());
    ep.addEncoder(new RenameFriendshipEventEncoder());
    ep.addEncoder(new RenameGroupEventEncoder());
    ep.addEncoder(new SendMessageEventEncoder());
    ep.addEncoder(new WritingStatusEventEncoder());
    ep.addEncoder(new UnregisterSessionEventEncoder());
    ep.addEncoder(new QueryArchiveEventEncoder());
    // Specialized encoders for OpenChat
    ep.addEncoder(new SetStatusEventEncoder());
  }

  public configureEventManager(
    em: IEventManager,
    store: Store<IOpenChatState>,
    uiStore: Store<IOpenChatUIState>,
  ): void {
    if (this.mServerVersion.lessThan(new Version(2, 2))) {
      em.addEventHandler(new Legacy2RoomAckReceivedReduxEventHandler(store));
    } else {
      em.addEventHandler(new RoomAckReceivedReduxEventHandler(store));
    }

    em.addEventHandler(new MessageEventHandler(store));
    em.addEventHandler(new FriendshipEventHandler(
      new FriendshipAcceptedHandler(),
      new FriendshipBlockedHandler(),
      new FriendshipDeniedHandler(),
      new FriendshipInvitationHandler(),
      new FriendshipRemovedHandler(),
      new FriendshipRenameHandler(),
      ),
    );
    // Capabilities
    em.addEventHandler(new UserCapabilitiesReduxEventHandler(store));
    em.addEventHandler(new ContactInformationEventHandler(store));
    em.addEventHandler(new BroadcastMessageEventHandler());
    em.addEventHandler(new BuddyListEventHandler());
    em.addEventHandler(new TimeoutEventHandler());
    em.addEventHandler(new FriendBackAddedEventHandler());
    em.addEventHandler(new NewClientVersionEventHandler());
    em.addEventHandler(new ShutdownEventHandler());
    em.addEventHandler(new ErrorEventHandler());
    em.addEventHandler(new SuperSecretEventHandler());
    em.addEventHandler(new ArchiveResultEventHandler(em));

    em.addEventHandler(new BroadcastMessageReduxEventHandler(store));
    em.addEventHandler(new BuddyListReduxEventHandler(store));
    em.addEventHandler(new ContactInformationReduxEventHandler(store));
    em.addEventHandler(new ErrorReduxEventHandler(store));
    em.addEventHandler(new FriendBackAddedReduxEventHandler(store));
    em.addEventHandler(new FriendshipReduxEventHandler(store));
    em.addEventHandler(new MessageReduxEventHandler(store));
    em.addEventHandler(new NewClientVersionReduxEventHandler(store));
    em.addEventHandler(new RequiredRegistrationReduxEventHandler(
      store,
      this.mConnectionManager,
    ));
    em.addEventHandler(new SessionRegisteredHistoryEnabledReduxEventHandler(store));
    em.addEventHandler(new SessionRegisteredReduxEventHandler(
      store,
      this.mConnectionManager,
      this.mSessionInfoProvider,
    ));
    em.addEventHandler(new ShutdownReduxEventHandler(store));
    em.addEventHandler(new SuperSecretReduxEventHandler(store));
    em.addEventHandler(new TimeoutReduxEventHandler(store));
    em.addEventHandler(new UnregisterSessionReduxEventHandler(store));
    em.addEventHandler(new WritingStatusReduxEventHandler(store));
    em.addEventHandler(new ArchiveResultFinEventHandler(store));
    // em.addEventHandler(new ArchiveCountReduxEventHandler(store));
    em.addEventHandler(new LastMessageInfoReduxEventHandler(store));
  }

  public configureMessageUiFactory(muif: IMessageUiFactory<IOpenChatState>): void {
    muif.addPlugin(new TextMessageUiFactoryPlugin());
  }

  public getStore(): Store<IOpenChatState> {
    if (typeof this.mStore === "undefined") {
      const storeFactory: IStoreFactory<IOpenChatState> = new OpenChatStoreFactory(false);
      this.mStore = storeFactory.createStore(this.mMiddlewareFactory);
      // (window as IWindowWithStore).debugStore = this.mStore;
    }
    return this.mStore;
  }

  public getUIStore(): Store<IOpenChatUIState> { return undefined; }

  public getRoomWindowFactory(): IRoomWindowFactory {
    if (typeof this.mRoomWindowFactory === "undefined") {
      this.mRoomWindowFactory = new RoomWindowFactory(this.getStore());
    }
    return this.mRoomWindowFactory;
  }

  public initStore(
    store: Store<IOpenChatState>,
    statusLabels: {
      away: string,
      busy: string,
      invisible: string,
      online: string,
    },
  ): void {
    store.dispatch<IUserStatusAction>(
      {status: {
          message: statusLabels.online,
          resource: "",
          selected: false,
          type: BuddyStatusType.ONLINE,
        }, type: "ADD_USER_STATUS"},
    );
    store.dispatch<IUserStatusAction>(
      {status: {
          message: statusLabels.busy,
          resource: "",
          selected: false,
          type: BuddyStatusType.BUSY,
        }, type: "ADD_USER_STATUS"},
    );
    store.dispatch<IUserStatusAction>(
      {status: {
          message: statusLabels.away,
          resource: "",
          selected: false,
          type: BuddyStatusType.AWAY,
        }, type: "ADD_USER_STATUS"},
    );
    store.dispatch<IUserStatusAction>(
      {status: {
          message: statusLabels.invisible,
          resource: "",
          selected: true,
          type: BuddyStatusType.INVISIBLE,
        }, type: "ADD_USER_STATUS"},
    );
  }

  public configureClientInMiddlewares(
    client: IChatClient,
  ): void {
    this.mMiddlewareFactory.setClient(client);
  }

  /**
   * @deprecated
   */
  public installLegacyPlugins(
    store: Store<IOpenChatState>,
    uiStore: Store<IOpenChatUIState>,
  ): void {
    // Send Conversation by mail
    SendMailPlugin.install(
      this.mMainWindowPluginManager,
      this.mRoomWindowManagerPluginManager,
      store,
    );
  }
}

// interface IWindowWithStore extends Window {
//   debugStore: Store<IOpenChatState>;
// }
