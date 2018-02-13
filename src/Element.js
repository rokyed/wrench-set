export default class Element {
	/**
	 * config {Object}
	 * config.elementType {String} type of node we are going to be
	 *		default "div"
	 * config.className {String} class names the self element will take
	 * config.innerHTML {String} innerHTML that will be applied when element it's initialized
	 * config.renderTo {DOMElement} DOMElement in which to self append
	 * config.xAutoInitElement {Boolean} default false, if true initializeElement won't be called
	 */
	constructor (config) {
		this.initialConfig = config || {}
		this._____LISTENERS = []

		if (!this.initialConfig.xAutoInitElement)
			this.initializeElement()
	}
	/**
	 * returns {undefined} initializes element and sets it's default configs
	 */
	initializeElement() {
		this._____ELEMENT = document.createElement(this.initialConfig.elementType || 'div')
		this._____ELEMENT.className = this.initialConfig.className || ''
		this._____ELEMENT.innerHTML = this.initialConfig.innerHTML || ''

		this.renderTo(this.initialConfig.renderTo)
	}

	/**
	 * returns {DOMElement} the internal element that's initialized
	 */
	element() {
		return this._____ELEMENT
	}

	/**
	 * domElement {DOMElement} target on which we appendChild
	 * returns {undefined} renders the element on whaterver element provided
	 */
	renderTo (domElement) {
		if (!domElement)
			return

		domElement.appendChild(this._____ELEMENT)
	}

	/**
	 * event {Event}
	 * returns {undefined} returns whatever the callback returns
	 */
	_____EVT_HANDLE (event) {
		let listenerCompound = this._____GET_EVENT_LISTENER(event.type)
		let listener = listenerCompound.listener

		event.getTarget = (selector, maximumDepth = 200) => {
			let target = event.target
			let currentDepth = 0

			while (true) {
				if (currentDepth >= maximumDepth)
					break

				let parent = target.parentNode

				if (parent && parent.querySelector && parent.querySelector(selector) === target) {
					break
				} else if (!parent) {
					target = null
					break
				} else {
					target = parent
				}

				currentDepth ++
			}

			return target
		}

		return listener.callback.apply(this, arguments)
	}

	/**
	 * eventName {String}
	 * returns {Object} returns internal reference of the listener
	 */
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

	/**
	 * returns {undefined} detaches all event listeners so it can be GC'd
	 */
	_____DETACH_ALL_LISTENERS () {
		let listeners = this._____LISTENERS

		for (let i = 0; i < listeners.length; i++) {
			let listener = listeners[i]

			this._____ELEMENT.removeEventListener(listener.eventName, listener.bindedHandle, ...listener.stdArgs)

		}
	}

	/**
	 * eventName {String} e.g. "click", "touchstart" all the default events
	 * callback {Function} your callback where you handle your logic
	 * stdArgs {Array} all the standard arguments that follow after callback
	 * returns {undefined} attaches listener to the element
	 */
	on(eventName, callback, stdArgs) {
		stdArgs = stdArgs || []

		let eventHandler = {
			eventName,
			callback,
			stdArgs,
			bindedHandle: this._____EVT_HANDLE.bind(this)
		}
		this._____ELEMENT.addEventListener(eventName, eventHandler.bindedHandle, ...stdArgs)
		this._____LISTENERS.push(eventHandler)
	}

	/**
	 * eventName {String} e.g. "click", "touchstart" all the default events
	 * returns {undefined} detaches listener from the element
	 */
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

	/**
	 * returns {undefined} handles the destruction/removal of listeners and the internal element
	 */
	destroy () {
		this._____DETACH_ALL_LISTENERS()

		let parentNode = this._____ELEMENT.parentNode

		if (parentNode)
			parentNode.removeChild(this._____ELEMENT)

		delete this._____ELEMENT
	}
}
