import ComponentsBuild from './components.js'
import { constants } from './constants.js'

export default class TerminalController {
  #usersColors = new Map()
  constructor() {}

  #pickColor() {
    return `#` + ((1 << 24) * Math.random() | 0).toString(16) + '-fg'
  }

  #getUserCollor(userName) {
    if(this.#usersColors.has(userName)) 
      return this.#usersColors.get(userName)

    const color = this.#pickColor() 
    this.#usersColors.set(userName, color)

    return color
  }

  #onInputReceived(eventEmitter) {
    return function() {
      const message = this.getValue()
      eventEmitter.emit(constants.events.app.MESSAGE_RECEIVED, { message, userName: 'Gabriel'})
      eventEmitter.emit(constants.events.app.ACTIVITYLOG_UPDATED, "Gabriel left")
      eventEmitter.emit(constants.events.app.STATUS_UPDATED, ["Gabriel", "João", "Pedro"])
      this.clearValue()
    }
  }

  #onMessageReceived({ screen, chat }) {
    return msg => {
      const { userName, message } = msg
      const color = this.#getUserCollor(userName)
      chat.addItem(`{${color}} {bold}${userName}{/}: ${message}`)
      screen.render()
    }
  }

  #onLogChanged({ activityLog, screen }) {
    return msg => {
      const [userName] = msg.split(/\s/)
      const color = this.#getUserCollor(userName)
      activityLog.addItem(`{${color}} {bold}${msg.toString()}{/}`)
      screen.render()
    }
  }

  #onStatusChanged({ status, screen}) {
    return users => {
      users.forEach(user => {
        const userColor = this.#getUserCollor(user)
        status.addItem(`{${userColor}} {bold}${user}{/}`)
      })
      
      
      screen.render()
    }
  }

  #registerEvents(eventEmitter, components) {
    eventEmitter.on(constants.events.app.MESSAGE_RECEIVED, this.#onMessageReceived(components))
    eventEmitter.on(constants.events.app.ACTIVITYLOG_UPDATED, this.#onLogChanged(components))
    eventEmitter.on(constants.events.app.STATUS_UPDATED, this.#onStatusChanged(components))
  }

  async initalizeTable(eventEmitter) {
    const components = new ComponentsBuild()
      .setScreen({ title: 'HackerChat - Gabriel2'})
      .setLayoutComponent()
      .setInputComponent(this.#onInputReceived(eventEmitter))
      .setChatComponent()
      .setActivityLogComponent()
      .setStatusComponent()
      .build()

    this.#registerEvents(eventEmitter, components) 
    components.input.focus()
    components.screen.render()

  }
}