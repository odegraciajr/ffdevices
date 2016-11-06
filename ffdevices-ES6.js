import {spawn} from 'child_process'
import * as _ from 'lodash'
import split from 'split'

class FFDevices{

  constructor() {
    this._ffmpegPath = 'ffmpeg'
    this._gdigrab = true
    this._platform = process.platform
  }

  // set platform(value) {
  //   this._platform = value
  // }

  set ffmpegPath(value) {
    this._ffmpegPath = value
  }

  set gdigrab(value) {
    this._gdigrab = value
  }

  getAll(callback) {
    if (this._platform === 'darwin') {
      this._getDarwin(callback)
    } else if (this._platform === 'win32') {
      this._getWin32(callback)
    } else { // linux
      console.error('Linux is not yet supported.')
    }
  }
  _getWin32(callback) {
    const engineNamePrefix = '[dshow @'
    const engineAlternateNamePrefix = 'Alternative name'
    let rawDevices = []

    let opts = [
      '-hide_banner',
      '-list_devices', 'true',
      '-f', 'dshow',
      '-i', 'dummy'
    ]

    const proc = spawn(this._ffmpegPath, opts)

    proc.on('error', (err) => {
      let errMsg = 'Unknow error'
      if (err.code === 'ENOENT') {
        errMsg = 'Error: Invalid FFMPEG path. Please check your FFMPEG installation.'
      }

      callback(true, errMsg)
    })

    proc.stderr.pipe(split(/[\r\n]+/)).on('data', (device) => {
      device = device.trim()

      if (device !== null && typeof device !== 'undefined') {
        if (device.substring(0, 8) === engineNamePrefix) {
            // remove [[dshow @ xxxxxxxx] text and trim
          let newDevice = device.replace(/(\[.*?\])/g, '').trim()

            // remove "Alternative nameXXXX"
          if (newDevice.indexOf(engineAlternateNamePrefix) === -1) {
            rawDevices.push(newDevice)
          }
        }
      }
    }).on('close', () => {
      let deviceList = {
        video: [],
        audio: []
      }

      let finalDeviceList = []
      let defaultDevices = []

      if (rawDevices.length) {
        const videoDeviceNamePrefix = 'DirectShow video'
        const audioDeviceNamePrefix = 'DirectShow audio'

        // Search for the index of each devices so that we can group it into video and video category.
        const videoInput = _.findIndex(rawDevices, (item) => item.indexOf(videoDeviceNamePrefix) !== -1)
        const audioInput = _.findIndex(rawDevices, (item) => item.indexOf(audioDeviceNamePrefix) !== -1)

        // videoInput/audioInput +1 so that name(ex. DirectShow audio devices) of will not be included on the array.
        deviceList.video = _.slice(rawDevices, videoInput + 1, audioInput)
        deviceList.audio = _.slice(rawDevices, audioInput + 1, audioInput.lenght)

        if (this._gdigrab) {
          defaultDevices = [
            {name: 'Desktop Capture', type: 'video', value: 'desktop', deviceType: 'gdigrab', os: this._platform}
          ]
        }

        // Add a desktop capture option using. gdigrab https://ffmpeg.org/ffmpeg-devices.html#gdigrab
        _.forEach(deviceList, (arr, type) => {
          _.forEach(arr, (name) => {
            // clean the string
            name = name.replace(/['"]+/g, '')

            // we need to make this as variable to accomodate other OS.
            if (name !== 'Could not enumerate video devices (or none found).' && name !== 'Could not enumerate audio only devices (or none found).') {
              finalDeviceList.push({name: name, type: type, value: name, deviceType: 'dshow', os: this._platform})
            }
          })
        })
        callback(false, defaultDevices.concat(finalDeviceList))
      }
    })
  }

  _getDarwin(callback) {
    const engineNamePrefix = '[AVFoundation'
    let rawDevices = []

    let opts = [
      '-hide_banner',
      '-list_devices', 'true',
      '-f', 'avfoundation',
      '-i', 'dummy'
    ]

    const proc = spawn(this._ffmpegPath, opts)

    proc.on('error', (err) => {
      let errMsg = 'Unknow error'
      if (err.code === 'ENOENT') {
        errMsg = 'Error: Invalid FFMPEG path. Please check your FFMPEG installation.'
      }

      callback(true, errMsg)
    })

    proc.stderr.pipe(split(/[\r\n]+/)).on('data', (device) => {
      device = device.trim()

      if (device !== null && typeof device !== 'undefined') {
        if (device.substring(0, 13) === engineNamePrefix) {
            // remove [[AVFoundation @ xxxxxxxx] text and trim
          let newDevice = device.replace(/(\[.*?\])/g, '').trim()
          rawDevices.push(newDevice)
        }
      }
    }).on('close', () => {
      let deviceList = {
        video: [],
        audio: []
      }

      let finalDeviceList = []
      let defaultDevices = []

      if (rawDevices.length) {
        const videoDeviceNamePrefix = 'AVFoundation video'
        const audioDeviceNamePrefix = 'AVFoundation audio'

        // Search for the index of each devices so that we can group it into video and video category.
        const videoInput = _.findIndex(rawDevices, (item) => item.indexOf(videoDeviceNamePrefix) !== -1)
        const audioInput = _.findIndex(rawDevices, (item) => item.indexOf(audioDeviceNamePrefix) !== -1)

        // videoInput/audioInput +1 so that name(ex. AVFoundation video devices) of will not be included on the array.
        deviceList.video = _.slice(rawDevices, videoInput + 1, audioInput)
        deviceList.audio = _.slice(rawDevices, audioInput + 1, audioInput.lenght)

        _.forEach(deviceList, (arr, type) => {
          _.forEach(arr, (name) => {
            // clean the string
            name = name.replace(/['"]+/g, '')

            // we need to make this as variable to accomodate other OS.
            if (name !== 'Could not enumerate video devices (or none found).' && name !== 'Could not enumerate audio only devices (or none found).') {
              finalDeviceList.push({name: name, type: type, value: name, deviceType: 'avfoundation', os: this._platform})
            }
          })
        })
        callback(false, defaultDevices.concat(finalDeviceList))
      }
    })
  }
}
const ffdevices = new FFDevices()

module.exports = ffdevices
