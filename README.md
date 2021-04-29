# websocket-screenshot-altv Resource
Example alt:V Multiplayer resource for alt-websocket and alt-sceenshot api

This resource will send a screenshot base64 string to the server through the alt-websocket api and will save it into a screenshot directory in the server folder.

### Getting Started
1.
```
Do npm install --save ws in your project
```
2.
```
copy the screenshot-ws directory to ur resources
```
3.
```
write the "screenshot-ws" as a module in ur server.cfg
```

## Example Usage:
```
1. Press the F5-Key ingame
2. You will see a screenshot directory in ur server root and a .txt file in it
3. File name is alt:V Nickname + ISODate components
4. copy the content of the generated file
5. go to https://base64.guru/converter/decode/image/png
6. paste the string and decode it -> voilá your first screenshot made with alt:V
```

## Authors

* ** Alessandro Lion (t4styy)** - *Initial work* - [t4styy](https://github.com/tastydev)
