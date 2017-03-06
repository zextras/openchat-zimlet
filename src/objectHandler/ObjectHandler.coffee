#
# Copyright (C) 2017 ZeXtras S.r.l.
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License
# as published by the Free Software Foundation, version 2 of
# the License.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License.
# If not, see <http://www.gnu.org/licenses/>.
#

define(
  [
    "require",
    "exports",
    "../zimbra/zimbraMail/share/model/ZmObjectHandler",
    "../zimbra/zimbraMail/share/model/ZmOrganizer",
    "../dwt/widgets/Message",
    "./handlers/EmojiOneHandler"
  ],
  (
    require,
    exports,
    ZmObjectHandler_1,
    ZmOrganizer_1,
    Message_1,
    EmojiOneHandler_1
  ) ->
    "use strict"
    
    ZmObjectHandler = ZmObjectHandler_1.ZmObjectHandler
    ZmOrganizer = ZmOrganizer_1.ZmOrganizer
    Message = Message_1.Message
    EmojiOneHandler = EmojiOneHandler_1.EmojiOneHandler

    ###*
      @extends	ZmObjectHandler
    ###
    class ObjectHandler extends ZmObjectHandler

      @INSTANCE = null

      constructor: () ->
        if not ObjectHandler.INSTANCE?
          ObjectHandler.INSTANCE = @
          @_init()

      ###*
        Get the instance of the ObjectHandler.
        @return {ObjectHandler}
      ###
      _getInstance: () ->
        if not ObjectHandler.INSTANCE?
          ObjectHandler.INSTANCE = new ObjectHandler()
        ObjectHandler.INSTANCE

      ###*
        Get the type of the handler.
        @return {string}
      ###
      getTypeName: () ->
        'none'

      ###*
        Initialize the instance of the object handler.
        @private
      ###
      _init: () ->
        instance = @_getInstance()
        instance.enabledEmojiInConv = true
        instance.enabledEmojiInHist = true
        instance.enabledEmojiInMail = true

        instance.emojiOneHdlr = new EmojiOneHandler()

      ###*
        Enable/disable the parsing of the emoji in the chat conversation
        @param {boolean} enabled
      ###
      setEmojiEnabledInConv: (enabled) ->
        @_getInstance().enabledEmojiInConv = enabled

      ###*
        Enable/disable the parsing of the emoji in the mail history of the chat
        @param {boolean} enabled
      ###
      setEmojiEnabledInHist: (enabled) ->
        @_getInstance().enabledEmojiInHist = enabled

      ###*
        Enable/disable the parsing of the emoji in the chat conversation email
        @param {boolean} enabled
      ###
      setEmojiEnabledInMail: (enabled) ->
        @_getInstance().enabledEmojiInMail = enabled

      ###*
        Register the parsers handled by the object manager.
        @param {ZmMailMsg|Message} msg
        @param {ZmObjectManager} manager
      ###
      onFindMsgObjects: (msg, manager) ->
        # Hack for ZXCHAT-331 issue
        headerElement = Dwt.getElement("zv__CLV-main__CV__header")
        mailTitleElement = Dwt.getElement("zv__CLV-main__CV__header_subject")
        if mailTitleElement? and headerElement?
          if mailTitleElement.style? then mailTitleElement.style.overflow = "hidden"
          headerSize = Dwt.getSize(headerElement).x
          if headerSize > 0
            Dwt.setSize(mailTitleElement, Dwt.getSize(headerElement).x - 24)

        # Is zxchat message
        if msg instanceof Message
          if @_getInstance().enabledEmojiInConv
            if not manager.__hasEmojiHandler? or not manager.__hasEmojiHandler
              @_addEmojiHandlerToManager(manager)
          else
            if manager.__hasEmojiHandler? and manager.__hasEmojiHandler
              @_removeEmojiHandlerToManager(manager)
          return

        # Is zimbra message
        isChatFolder = if (msg.folderId == "#{ZmOrganizer.ID_CHATS}" or msg.folderId == ZmOrganizer.ID_CHATS)
          true
        else
          false

        if msg? and isChatFolder and @_getInstance().enabledEmojiInHist
          if not manager.__hasEmojiHandler? or not manager.__hasEmojiHandler
            @_addEmojiHandlerToManager(manager)
        else if msg? and not isChatFolder and @enabledEmojiInMail
          if not manager.__hasEmojiHandler? or not manager.__hasEmojiHandler
            @_addEmojiHandlerToManager(manager)
        else
          if manager.__hasEmojiHandler? and manager.__hasEmojiHandler
            @_removeEmojiHandlerToManager(manager)

      ###*
        @private
      ###
      _addEmojiHandlerToManager: (manager) ->
        manager.addHandler(@_getInstance().emojiOneHdlr)
        manager.sortHandlers()
        manager.__hasEmojiHandler = true

      ###*
        @private
      ###
      _removeEmojiHandlerToManager: (manager) ->
        manager.removeHandler(@_getInstance().emojiOneHdlr)
        manager.sortHandlers()
        manager.__hasEmojiHandler = false

      #
      # Unused functions, left here for reference
      #

      onMsgView: (msg, oldMsg) ->

    #  onFindMsgObjects: (msg, objMgr) ->

      onContactView: (contact, elementId) ->

      onContactEdit: (view, contact, elementId) ->

      initializeToolbar: (app, toolbar, controller, viewId) ->

      onShowView: (view) ->

      onSearch: (queryStr) ->

      onSearchButtonClick: (queryStr) ->

      onKeyPressSearchField: (queryStr) ->

      onParticipantActionMenuInitialized: (controller, actionMenu) ->

      onActionMenuInitialized: (controller, actionMenu) ->

      onMailFlagClick: (items, flagValue) ->

      onTagAction: (items, tag, doTag) ->

      emailErrorCheck: (msg, boolAndErrorMsgArray) ->

      appendExtraSignature: (bufferArray) ->

      onMailConfirm: (confirmView, msg) ->

      onNewChatWidget: (widget) ->

      addCustomMimeHeaders: (customMimeHeaders) ->

      resetToolbarOperations: (parent, num) ->

      appActive: (appName, active) ->

      appLaunch: (appName) ->

      onSelectApp: (id) ->

      onAction: (id, action, currentViewId, lastViewId) ->

    exports.ObjectHandler = ObjectHandler
    return
)
