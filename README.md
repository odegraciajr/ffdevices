FFDevices for Node.js
===
List all available media devices on [FFmpeg](https://www.ffmpeg.org/). Supports Windows, OSX and Linux(coming soon)

## Installation

Via npm:

```sh
$ npm install ffdevices --save
```

## Prerequisites

#### FFmpeg
You need to have ffmpeg version >= 2.0.7 for this to work. This is the oldest version I tested but it may work on older version also.

Note: If you downloaded the static build most probably `FFMPEG_PATH` environment variable is not yet set. You have two options:
  1. Find the location of the ffmpeg `bin` directory and add it to your `PATH`.
  2. Set the custom `FFMPEG_PATH` using the [`ffdevices.#ffmpegPath`](#ffmpegPath)

## Usage
```js
var ffdevices = require('ffdevices')

ffdevices.getAll(function(error, devices) {
  if(!error) {
    console.log(devices)
  }
})
```

## .ffmpegPath
You can set custom `FFMPEG_PATH` using `ffdevices.ffmpegPath`

```js
ffdevices.ffmpegPath = 'C:\\ffmpeg\\bin\\ffmpeg.exe' //PATH to the ffmpeg file.

ffdevices.getAll(function(error, devices){
  if(!error) {
    console.log(devices)
  }
})
```
## .gdigrab(Windows only)
[gdigrab](https://ffmpeg.org/ffmpeg-devices.html#gdigrab) is the desktop capturer for windows. By default it is enabled, you can disable it if you don't want to include it. Pass this command before you call `.getAll()`.

```js
ffdevices.gdigrab = false
ffdevices.getAll(...)
```

### Sample Windows result
```
[ { name: 'Desktop Capture',
    type: 'video',
    value: 'desktop',
    deviceType: 'gdigrab',
    os: 'win32' },
  { name: 'Webcam C170',
    type: 'video',
    value: 'Webcam C170',
    deviceType: 'dshow',
    os: 'win32' },
  { name: 'Microphone (2- Webcam C170)',
    type: 'audio',
    value: 'Microphone (2- Webcam C170)',
    deviceType: 'dshow',
    os: 'win32' },
  { name: 'Headset (Voombox-outdoor Hands-Free)',
    type: 'audio',
    value: 'Headset (Voombox-outdoor Hands-Free)',
    deviceType: 'dshow',
    os: 'win32' },
  { name: 'Headset (Bluedio Hands-Free)',
    type: 'audio',
    value: 'Headset (Bluedio Hands-Free)',
    deviceType: 'dshow',
    os: 'win32' } ]
```

### Sample OSX result
```
[ { name: 'Built-in iSight',
    type: 'video',
    value: 'Built-in iSight',
    deviceType: 'avfoundation',
    os: 'darwin' },
  { name: 'Capture screen 0',
    type: 'video',
    value: 'Capture screen 0',
    deviceType: 'avfoundation',
    os: 'darwin' },
  { name: 'Built-in Input',
    type: 'audio',
    value: 'Built-in Input',
    deviceType: 'avfoundation',
    os: 'darwin' } ]
```
## TODO
* Linux support([video4linux2](https://ffmpeg.org/ffmpeg-all.html#video4linux2_002c-v4l2))
* Compatibility test to other platforms and machines.

## Related Package
* [fluent-ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg) - Fluent ffmpeg-API for node.js
