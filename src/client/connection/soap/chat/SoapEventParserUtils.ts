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

import {IDateProvider} from "../../../../lib/IDateProvider";

import {BuddyListEventDecoder} from "./decoders/BuddyListEventDecoder";
import {ContactInformationEventDecoder} from "./decoders/ContactInformationEventDecoder";
import {DummyEventDecoder} from "./decoders/DummyEventDecoder";
import {ErrorEventDecoder} from "./decoders/ErrorEventDecoder";
import {FriendBackAddedEventDecoder} from "./decoders/FriendBackAddedEventDecoder";
import {FriendshipEventDecoder} from "./decoders/FriendshipEventDecoder";
import {MessageEventDecoder} from "./decoders/MessageEventDecoder";
import {NewClientVersionEventDecoder} from "./decoders/NewClientVersionEventDecoder";
import {RequiredRegistrationEventDecoder} from "./decoders/RequiredRegistrationEventDecoder";
import {RoomAckReceivedEventDecoder} from "./decoders/RoomAckReceivedEventDecoder";
import {SecretTestEventDecoder} from "./decoders/SecretTestEventDecoder";
import {SessionRegisteredEventDecoder} from "./decoders/SessionRegisteredEventDecoder";
import {ShutdownEventDecoder} from "./decoders/ShutdownEventDecoder";
import {SuperSecretEventDecoder} from "./decoders/SuperSecretEventDecoder";
import {UserStatusesEventDecoder} from "./decoders/UserStatusesEventDecoder";
import {WritingStatusEventDecoder} from "./decoders/WritingStatusEventDecoder";
import {AcceptFriendshipEventEncoder} from "./encoders/AcceptFriendshipEventEncoder";
import {FriendshipEventEncoder} from "./encoders/FriendshipEventEncoder";
import {MessageAckEventEncoder} from "./encoders/MessageAckEventEncoder";
import {PingEventEncoder} from "./encoders/PingEventEncoder";
import {RegisterSessionEventEncoder} from "./encoders/RegisterSessionEventEncoder";
import {RemoveFriendshipEventEncoder} from "./encoders/RemoveFriendshipEventEncoder";
import {RenameFriendshipEventEncoder} from "./encoders/RenameFriendshipEventEncoder";
import {RenameGroupEventEncoder} from "./encoders/RenameGroupEventEncoder";
import {SendMessageEventEncoder} from "./encoders/SendMessageEventEncoder";
import {SetStatusEventEncoder} from "./encoders/SetStatusEventEncoder";
import {UnregisterSessionEventEncoder} from "./encoders/UnregisterSessionEventEncoder";
import {WritingStatusEventEncoder} from "./encoders/WritingStatusEventEncoder";

import {AcceptFriendshipEvent} from "../../../events/chat/AcceptFriendshipEvent";
import {OpenChatEventCode} from "../../../events/chat/OpenChatEventCode";
import {QueryArchiveEvent} from "../../../events/chat/QueryArchiveEvent";
import {RemoveFriendshipEvent} from "../../../events/chat/RemoveFriendshipEvent";
import {RenameFriendshipEvent} from "../../../events/chat/RenameFriendshipEvent";
import {RenameGroupEvent} from "../../../events/chat/RenameGroupEvent";
import {SetStatusEvent} from "../../../events/chat/SetStatusEvent";
import {UnregisterSessionEvent} from "../../../events/chat/UnregisterSessionEvent";
import {IChatEvent} from "../../../events/IChatEvent";
import {IChatEventParser} from "../../../events/parsers/IChatEventParser";
import {ArchiveResultEventDecoder} from "./decoders/ArchiveResultEventDecoder";
import {ArchiveResultFinEventDecoder} from "./decoders/ArchiveResultFinEventDecoder";
import {QueryArchiveEventEncoder} from "./encoders/QueryArchiveEventEncoder";

/**
 * @deprecated
 */
export class SoapEventParserUtils {

  /**
   * @deprecated
   * @param {IChatEventParser<IChatEvent>} parser
   * @param {IDateProvider} dateProvider
   */
  public static PopulateChatSoapEventParser(
    parser: IChatEventParser<IChatEvent>,
    dateProvider: IDateProvider,
  ): void {
    const secretDecoder = new SuperSecretEventDecoder(dateProvider);
    // Add Decoders
    parser.addDecoder(new DummyEventDecoder<AcceptFriendshipEvent>(OpenChatEventCode.ACCEPT_FRIENDSHIP));
    parser.addDecoder(new BuddyListEventDecoder(dateProvider));
    parser.addDecoder(new ContactInformationEventDecoder(dateProvider));
    parser.addDecoder(new ErrorEventDecoder(dateProvider));
    parser.addDecoder(new FriendBackAddedEventDecoder(dateProvider));
    parser.addDecoder(new FriendshipEventDecoder(dateProvider));
    parser.addDecoder(new RoomAckReceivedEventDecoder(dateProvider));
    parser.addDecoder(new MessageEventDecoder(dateProvider, secretDecoder));
    parser.addDecoder(new NewClientVersionEventDecoder(dateProvider));
    parser.addDecoder(new DummyEventDecoder<RemoveFriendshipEvent>(OpenChatEventCode.REMOVE_FRIENDSHIP));
    parser.addDecoder(new DummyEventDecoder<RenameFriendshipEvent>(OpenChatEventCode.RENAME_FRIENDSHIP));
    parser.addDecoder(new DummyEventDecoder<RenameGroupEvent>(OpenChatEventCode.RENAME_GROUP));
    parser.addDecoder(new RequiredRegistrationEventDecoder(dateProvider));
    parser.addDecoder(new DummyEventDecoder<UnregisterSessionEvent>(OpenChatEventCode.UNREGISTER_SESSION));
    parser.addDecoder(new DummyEventDecoder<SetStatusEvent>(OpenChatEventCode.SET_STATUS));
    parser.addDecoder(new ShutdownEventDecoder(dateProvider));
    parser.addDecoder(new UserStatusesEventDecoder(dateProvider));
    parser.addDecoder(new WritingStatusEventDecoder(dateProvider));
    parser.addDecoder(new DummyEventDecoder<QueryArchiveEvent>(OpenChatEventCode.QUERY_ARCHIVE));
    parser.addDecoder(new ArchiveResultEventDecoder(dateProvider, parser));
    parser.addDecoder(new ArchiveResultFinEventDecoder(dateProvider));
    // Secret event, not ready for production
    secretDecoder.addDecoder(new SecretTestEventDecoder());
    // Add Encoders
    parser.addEncoder(new AcceptFriendshipEventEncoder());
    parser.addEncoder(new FriendshipEventEncoder());
    parser.addEncoder(new MessageAckEventEncoder());
    parser.addEncoder(new PingEventEncoder());
    parser.addEncoder(new RemoveFriendshipEventEncoder());
    parser.addEncoder(new RenameFriendshipEventEncoder());
    parser.addEncoder(new RenameGroupEventEncoder());
    parser.addEncoder(new SendMessageEventEncoder());
    parser.addEncoder(new SetStatusEventEncoder());
    parser.addEncoder(new WritingStatusEventEncoder());
    parser.addEncoder(new UnregisterSessionEventEncoder());
    parser.addEncoder(new QueryArchiveEventEncoder());
  }

}
