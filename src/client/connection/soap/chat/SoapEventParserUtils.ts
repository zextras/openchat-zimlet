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

import {SoapEventParser} from "./SoapEventParser";
import {DateProvider} from "../../../../lib/DateProvider";

import {AcceptFriendshipEventDecoder} from "./decoders/AcceptFriendshipEventDecoder";
import {BuddyListEventDecoder} from "./decoders/BuddyListEventDecoder";
import {ContactInformationEventDecoder} from "./decoders/ContactInformationEventDecoder";
import {ErrorEventDecoder} from "./decoders/ErrorEventDecoder";
import {FriendBackAddedEventDecoder} from "./decoders/FriendBackAddedEventDecoder";
import {FriendshipEventDecoder} from "./decoders/FriendshipEventDecoder";
import {MessageAckReceivedEventDecoder} from "./decoders/MessageAckReceivedEventDecoder";
import {MessageEventDecoder} from "./decoders/MessageEventDecoder";
import {NewClientVersionEventDecoder} from "./decoders/NewClientVersionEventDecoder";
import {RemoveFriendshipEventDecoder} from "./decoders/RemoveFriendshipEventDecoder";
import {RenameFriendshipEventDecoder} from "./decoders/RenameFriendshipEventDecoder";
import {RenameGroupEventDecoder} from "./decoders/RenameGroupEventDecoder";
import {RequiredRegistrationEventDecoder} from "./decoders/RequiredRegistrationEventDecoder";
import {SessionRegisteredEventDecoder} from "./decoders/SessionRegisteredEventDecoder";
import {SessionUnregisteredEventDecoder} from "./decoders/SessionUnregisteredEventDecoder";
import {SetStatusEventDecoder} from "./decoders/SetStatusEventDecoder";
import {ShutdownEventDecoder} from "./decoders/ShutdownEventDecoder";
import {UserStatusesEventDecoder} from "./decoders/UserStatusesEventDecoder";
import {WritingStatusEventDecoder} from "./decoders/WritingStatusEventDecoder";
import {SecretTestEventDecoder} from "./decoders/SecretTestEventDecoder";
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
import {WritingStatusEventEncoder} from "./encoders/WritingStatusEventEncoder";
import {UnregisterSessionEventEncoder} from "./encoders/UnregisterSessionEventEncoder";
import {SuperSecretEventDecoder} from "./decoders/SuperSecretEventDecoder";

export class SoapEventParserUtils {

  public static PopulateChatSoapEventParser(
    newParser: SoapEventParser,
    dateProvider: DateProvider
  ): void {
    const secretDecoder = new SuperSecretEventDecoder(dateProvider);
    // Add Decoders
    newParser.addDecoder(new AcceptFriendshipEventDecoder());
    newParser.addDecoder(new BuddyListEventDecoder(dateProvider));
    newParser.addDecoder(new ContactInformationEventDecoder(dateProvider));
    newParser.addDecoder(new ErrorEventDecoder(dateProvider));
    newParser.addDecoder(new FriendBackAddedEventDecoder(dateProvider));
    newParser.addDecoder(new FriendshipEventDecoder(dateProvider));
    newParser.addDecoder(new MessageAckReceivedEventDecoder(dateProvider));
    newParser.addDecoder(new MessageEventDecoder(dateProvider, secretDecoder));
    newParser.addDecoder(new NewClientVersionEventDecoder(dateProvider));
    newParser.addDecoder(new RemoveFriendshipEventDecoder(dateProvider));
    newParser.addDecoder(new RenameFriendshipEventDecoder());
    newParser.addDecoder(new RenameGroupEventDecoder());
    newParser.addDecoder(new RequiredRegistrationEventDecoder(dateProvider));
    newParser.addDecoder(new SessionRegisteredEventDecoder(dateProvider));
    newParser.addDecoder(new SessionUnregisteredEventDecoder());
    newParser.addDecoder(new SetStatusEventDecoder());
    newParser.addDecoder(new ShutdownEventDecoder(dateProvider));
    newParser.addDecoder(new UserStatusesEventDecoder(dateProvider));
    newParser.addDecoder(new WritingStatusEventDecoder(dateProvider));
    // Secret event, not ready for production
    secretDecoder.addDecoder(new SecretTestEventDecoder());
    // Add Encoders
    newParser.addEncoder(new AcceptFriendshipEventEncoder());
    newParser.addEncoder(new FriendshipEventEncoder());
    newParser.addEncoder(new MessageAckEventEncoder());
    newParser.addEncoder(new PingEventEncoder());
    newParser.addEncoder(new RegisterSessionEventEncoder());
    newParser.addEncoder(new RemoveFriendshipEventEncoder());
    newParser.addEncoder(new RenameFriendshipEventEncoder());
    newParser.addEncoder(new RenameGroupEventEncoder());
    newParser.addEncoder(new SendMessageEventEncoder());
    newParser.addEncoder(new SetStatusEventEncoder());
    newParser.addEncoder(new WritingStatusEventEncoder());
    newParser.addEncoder(new UnregisterSessionEventEncoder());
  }

}