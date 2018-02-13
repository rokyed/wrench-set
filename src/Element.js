export class Element {
	/**
	 * config {Object}
	 * config.elementType {String} type of node we are going to be
	 *		default "div"
	 * config.className {String} class names the self element will take
	 * config.renderTo {DOMElement} DOMElement in which to self append
	 */
	constructor (config) {
		this.initialConfig = config
		this._____LISTENERS = []
	}

	initializeElement() {
		this._____ELEMENT = document.createElement(this.initialConfig.elementType || 'div')
		this._____ELEMENT.className = this.initialConfig.className || ''

		this.renderTo(this.initialConfig.renderTo)
	}

	renderTo (domElement) {
		if (!domElement)
			return

		domElement.appendChild(this._____ELEMENT)
	}

	_____EVT_HANDLE (event) {

	}

	_____GET_EVENT_LISTENER (eventName) {
		let listeners = this._____LISTENERS
		let returnObj  = {}

		for (let i = 0; i < listeners.length; i++) {
			if (eventName == listeners[i].eventName) {
				returnObj.listener = listeners[i]
				returnObj.index = i
			}
		}

		if (!returnObj.listener)
			return false

		return returnObj
	}

	_____DETACH_ALL_LISTENERS () {
		let listeners = this._____LISTENERS

		for (let i = 0; i < listeners.length; i++) {
			let listener = listeners[i]

			this._____ELEMENT.removeEventListener(listener.eventName, listener.bindedHandle, ...listener.stdArgs)

		}


	}

	on(eventName, callback, stdArgs) {
		let eventHandler = {
			eventName,
			callback,
			stdArgs,
			bindedHandle = this._____EVT_HANDLE.bind(this)
		}
		this._____ELEMENT.addEventListener(eventName, eventHandler.bindedHandle, ...stdArgs)
		this._____LISTENERS.push(eventHandler)
	}

	un(eventName) {
		let listeners = this._____LISTENERS
		let listenerData = this._____GET_EVENT_LISTENER(eventName)

		if (!listenerData)
			return

		let listener = listenerData.listener

		this._____ELEMENT.removeEventListener(listener.eventName, listener.bindedHandle, ...listener.stdArgs)

		delete listener.bindedHandle

		this._____LISTENERS.splice(listenerData.index, 1)
	}

	destroy () {
		this._____DETACH_ALL_LISTENERS()

		let parentNode = this._____ELEMENT.parentNode

		if (parentNode)
			parentNode.removeChild(this._____ELEMENT)

		delete this._____ELEMENT
	}
}
