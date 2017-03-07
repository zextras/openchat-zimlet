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
    '../../lib/StringUtils'
    '../../lib/callbacks/Callback'
    '../../zimbra/zimbraMail/appCtxt'
    '../../zimbra/ajax/util/AjxText'
    '../../zimbra/ajax/dwt/widgets/DwtComposite'
    '../../zimbra/zimbraMail/share/model/ZmObjectManager'
  ],
  (
    require,
    exports,
    StringUtils_1,
    Callback_1,
    appCtxt_1,
    AjxText_1,
    DwtComposite_1,
    ZmObjectManager_1
  ) ->
    "use strict"
    
    appCtxt = appCtxt_1.appCtxt
    AjxDateFormat = AjxText_1.AjxDateFormat
    DwtComposite = DwtComposite_1.DwtComposite
    ZmObjectManager = ZmObjectManager_1.ZmObjectManager

    StringUtils = StringUtils_1.StringUtils
    Callback = Callback_1.Callback

    class Message extends DwtComposite

      constructor: (parent, message, dateProvider, template = "com_zextras_chat_open.Widgets#Message") ->
        @message = message
        @dateProvider = dateProvider
        @conversation = parent
        @_dateFormatter = AjxDateFormat.getDateTimeInstance(AjxDateFormat.FULL, AjxDateFormat.MEDIUM)
        super({
          parent: parent
          template: template
        })
        @_createHtml()
        msg = @
        setTimeout( # Lazy creation of the object manager
          (new Callback(@, @_delayedCreationFunction, appCtxt, msg)).toClosure()
          100
        )
        @_setAllowSelection()
    #    @setSize(208, Dwt.DEFAULT)

      _delayedCreationFunction: (appCtxt, msg) ->
        try
          manager = msg.getObjectManager()
          # Prevent Com_Zimbra_YMEmoticons adding its handler in ZxChat conversation!!!
          manager.__hasSmileysHandler = true
          appCtxt.notifyZimlets("onFindMsgObjects", [msg, manager])
          manager.setHandlerAttr(
            ZmObjectManager.DATE
            ZmObjectManager.ATTR_CURRENT_DATE
            if msg.message.getDate? then msg.message.getDate() else @dateProvider.getNow() # TODO: investigate why message is only a string
          )
          if manager.processObjectsInNode?
        # Function only available in zimbra > 8 to improve rendering performance
            manager.processObjectsInNode(document, msg._contentEl)
          else
            manager.findObjectsInNode(msg._contentEl)
        catch ignored
        if msg.conversation.scrollToTop? then msg.conversation.scrollToTop()
        for element in msg.getHtmlElement().getElementsByTagName("span")
          if element.id.indexOf(manager._objectIdPrefix) != -1
        # Creating array of event handlers without onselectstart
            events = []
            for string in DwtEvent.MOUSE_EVENTS
              if string != "onselectstart"
                events.push(string)
            msg._setEventHdlrs(events, false)
        null

      ###*
        @param {Date} date
        @return {string}
      ###
      formatDate: (date) ->
        @_dateFormatter.format(date)

      ###*
        Creates the html element of the message composite object
        @param {{}} data
        @protected
      ###
      _createHtml: (data = {}) ->
        data.id = @_htmlElId
        data.date = StringUtils.localizeHour(@message.getDate(), @dateProvider.getNow())
        data.dateTooltip = @formatDate(@message.getDate())
        data.content = @message.getHtmlMessage()
        # Expand template
        DwtComposite.prototype._createHtmlFromTemplate.call(@, @TEMPLATE, data)
        # Remember elements
        @_senderEl = document.getElementById("#{data.id}_sender")
        @_dateEl = document.getElementById("#{data.id}_date")
        @_contentEl = document.getElementById("#{data.id}_content")

      ###*
        @return {ZmObjectManager}
      ###
      getObjectManager: () ->
        if not @_objectManager?
          # Force the creation of the object manager if is does not exists
          @_objectManager = new ZmObjectManager(@)
        @_objectManager

    exports.Message = Message
    return
)
