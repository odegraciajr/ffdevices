'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _child_process = require('child_process');

var _lodash = require('lodash');

var _ = _interopRequireWildcard(_lodash);

var _split = require('split');

var _split2 = _interopRequireDefault(_split);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FFDevices = function () {
  function FFDevices() {
    _classCallCheck(this, FFDevices);

    this._ffmpegPath = 'ffmpeg';
    this._gdigrab = true;
    this._platform = process.platform;
  }

  // set platform(value) {
  //   this._platform = value
  // }

  _createClass(FFDevices, [{
    key: 'getAll',
    value: function getAll(callback) {
      if (this._platform === 'darwin') {
        this._getDarwin(callback);
      } else if (this._platform === 'win32') {
        this._getWin32(callback);
      } else {
        // linux
        console.error('Linux is not yet supported.');
      }
    }
  }, {
    key: '_getWin32',
    value: function _getWin32(callback) {
      var _this = this;

      var engineNamePrefix = '[dshow @';
      var engineAlternateNamePrefix = 'Alternative name';
      var rawDevices = [];

      var opts = ['-hide_banner', '-list_devices', 'true', '-f', 'dshow', '-i', 'dummy'];

      var proc = (0, _child_process.spawn)(this._ffmpegPath, opts);

      proc.on('error', function (err) {
        var errMsg = 'Unknow error';
        if (err.code === 'ENOENT') {
          errMsg = 'Error: Invalid FFMPEG path. Please check your FFMPEG installation.';
        }

        callback(true, errMsg);
      });

      proc.stderr.pipe((0, _split2.default)(/[\r\n]+/)).on('data', function (device) {
        device = device.trim();

        if (device !== null && typeof device !== 'undefined') {
          if (device.substring(0, 8) === engineNamePrefix) {
            // remove [[dshow @ xxxxxxxx] text and trim
            var newDevice = device.replace(/(\[.*?\])/g, '').trim();

            // remove "Alternative nameXXXX"
            if (newDevice.indexOf(engineAlternateNamePrefix) === -1) {
              rawDevices.push(newDevice);
            }
          }
        }
      }).on('close', function () {
        var deviceList = {
          video: [],
          audio: []
        };

        var finalDeviceList = [];
        var defaultDevices = [];

        if (rawDevices.length) {
          (function () {
            var videoDeviceNamePrefix = 'DirectShow video';
            var audioDeviceNamePrefix = 'DirectShow audio';

            // Search for the index of each devices so that we can group it into video and video category.
            var videoInput = _.findIndex(rawDevices, function (item) {
              return item.indexOf(videoDeviceNamePrefix) !== -1;
            });
            var audioInput = _.findIndex(rawDevices, function (item) {
              return item.indexOf(audioDeviceNamePrefix) !== -1;
            });

            // videoInput/audioInput +1 so that name(ex. DirectShow audio devices) of will not be included on the array.
            deviceList.video = _.slice(rawDevices, videoInput + 1, audioInput);
            deviceList.audio = _.slice(rawDevices, audioInput + 1, audioInput.lenght);

            if (_this._gdigrab) {
              defaultDevices = [{ name: 'Desktop Capture', type: 'video', value: 'desktop', deviceType: 'gdigrab', os: _this._platform }];
            }

            // Add a desktop capture option using. gdigrab https://ffmpeg.org/ffmpeg-devices.html#gdigrab
            _.forEach(deviceList, function (arr, type) {
              _.forEach(arr, function (name) {
                // clean the string
                name = name.replace(/['"]+/g, '');

                // we need to make this as variable to accomodate other OS.
                if (name !== 'Could not enumerate video devices (or none found).' && name !== 'Could not enumerate audio only devices (or none found).') {
                  finalDeviceList.push({ name: name, type: type, value: name, deviceType: 'dshow', os: _this._platform });
                }
              });
            });
            callback(false, defaultDevices.concat(finalDeviceList));
          })();
        }
      });
    }
  }, {
    key: '_getDarwin',
    value: function _getDarwin(callback) {
      var _this2 = this;

      var engineNamePrefix = '[AVFoundation';
      var rawDevices = [];

      var opts = ['-hide_banner', '-list_devices', 'true', '-f', 'avfoundation', '-i', 'dummy'];

      var proc = (0, _child_process.spawn)(this._ffmpegPath, opts);

      proc.on('error', function (err) {
        var errMsg = 'Unknow error';
        if (err.code === 'ENOENT') {
          errMsg = 'Error: Invalid FFMPEG path. Please check your FFMPEG installation.';
        }

        callback(true, errMsg);
      });

      proc.stderr.pipe((0, _split2.default)(/[\r\n]+/)).on('data', function (device) {
        device = device.trim();

        if (device !== null && typeof device !== 'undefined') {
          if (device.substring(0, 13) === engineNamePrefix) {
            // remove [[AVFoundation @ xxxxxxxx] text and trim
            var newDevice = device.replace(/(\[.*?\])/g, '').trim();
            rawDevices.push(newDevice);
          }
        }
      }).on('close', function () {
        var deviceList = {
          video: [],
          audio: []
        };

        var finalDeviceList = [];
        var defaultDevices = [];

        if (rawDevices.length) {
          (function () {
            var videoDeviceNamePrefix = 'AVFoundation video';
            var audioDeviceNamePrefix = 'AVFoundation audio';

            // Search for the index of each devices so that we can group it into video and video category.
            var videoInput = _.findIndex(rawDevices, function (item) {
              return item.indexOf(videoDeviceNamePrefix) !== -1;
            });
            var audioInput = _.findIndex(rawDevices, function (item) {
              return item.indexOf(audioDeviceNamePrefix) !== -1;
            });

            // videoInput/audioInput +1 so that name(ex. AVFoundation video devices) of will not be included on the array.
            deviceList.video = _.slice(rawDevices, videoInput + 1, audioInput);
            deviceList.audio = _.slice(rawDevices, audioInput + 1, audioInput.lenght);

            _.forEach(deviceList, function (arr, type) {
              _.forEach(arr, function (name) {
                // clean the string
                name = name.replace(/['"]+/g, '');

                // we need to make this as variable to accomodate other OS.
                if (name !== 'Could not enumerate video devices (or none found).' && name !== 'Could not enumerate audio only devices (or none found).') {
                  finalDeviceList.push({ name: name, type: type, value: name, deviceType: 'avfoundation', os: _this2._platform });
                }
              });
            });
            callback(false, defaultDevices.concat(finalDeviceList));
          })();
        }
      });
    }
  }, {
    key: 'ffmpegPath',
    set: function set(value) {
      this._ffmpegPath = value;
    }
  }, {
    key: 'gdigrab',
    set: function set(value) {
      this._gdigrab = value;
    }
  }]);

  return FFDevices;
}();

var ffdevices = new FFDevices();

module.exports = ffdevices;
