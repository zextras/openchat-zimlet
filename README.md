# OpenChat Zimlet for Zimbra

# Dependencies
- [bowser][3] (MIT)
- [emojione][7] (MIT & Creative Commons Attribution 4.0 International)
- [json3][1] (MIT)
- [html-entities][6] (MIT)
- [json-prune][4] (ISC)
- [stacktrace-js][5] (The Unlicense)
- [xregexp][2] (MIT)
- [jquery-textcomplete][8] (MIT)

[1]: https://www.npmjs.com/package/json3
[2]: https://www.npmjs.com/package/xregexp
[3]: https://www.npmjs.com/package/bowser
[4]: https://www.npmjs.com/package/json-prune
[5]: https://www.npmjs.com/package/stacktrace-js-legacy
[6]: https://www.npmjs.com/package/html-entities
[7]: https://github.com/Ranks/emojione
[8]: https://yuku-t.com/jquery-textcomplete/

# Building from source
Install dependancies
- g++
 yum install gcc-c++ make
- nvm (remove npm if you have issues)
https://github.com/creationix/nvm#install-script

Then in ~/.nvm run `nvm install 6` and `nvm use 6` in the same terminal but in a different folder make a clone of openchat-zimlet.
- git clone https://github.com/ZeXtras/openchat-zimlet
- git submodule init
- git submodule update
- make

You should find the zimlet in:
openchat-zimlet/dist/com_zextras_chat_open.zip
