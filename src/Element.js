/**
 * @kind class
 * @name Element
 * @public
 * @param {Object} config
 * @param {string} [config.elementType="div"] type of node we are going to be
 * @param {string} config.className class names the self element will take
 * @param {string} config.innerHTML HTML that will be applied when element it's initialized
 * @param {DOMElement} [config.renderTo=null] element on which to render, if not provided, you have to call renderTo manually to render on element
 * @param {boolean} [config.xAutoInitElement=false] if true initializeElement won't be called
 * @returns {Object} this
 * @example
 *
 * import wrenchSet from 'wrench-set'
 *
 * class MyClass extends wrenchSet.Element {
 *     constructor() {
 *         super({
 *             className: "my-CSS-Class",
 *             elementType: "span",
 *             innerHTML: "Hi it's me :) <b class='my-button'><i>XOX</i></b>",
 *             renderTo: document.body
 *         })
 *
 *         this.on('click', this.onClick.bind(this))
 *     }
 *
 *     onClick (e) {
 *         if (e.getTarget('.my-button'))
 *             console.log('do something')
 *     }
 * }
 *
 * let myInstance = new MyClass()
 */
export default class Element {
	constructor (config) {
		this.initialConfig = config || {}
		this._____LISTENERS = []

		if (!this.initialConfig.xAutoInitElement)
			this.initializeElement()

		return this
	}
	/**
	 * initializes the DOMElement and renders it to the renderTo config provided
	 * @public
	 * @returns {undefined} initializes element and sets it's default configs
	 */
	initializeElement() {
		this._____ELEMENT = document.createElement(this.initialConfig.elementType || 'div')
		this._____ELEMENT.className = this.initialConfig.className || ''
		this._____ELEMENT.innerHTML = this.initialConfig.innerHTML || ''

		this.renderTo(this.initialConfig.renderTo)
	}

	/**
	 * returns the DOMElement for direct access
	 * @public
	 * @returns {DOMElement}
	 */
	getElement() {
		return this._____ELEMENT
	}

	/**
	 * @param {DOMElement} domElement target on which we appendChild
	 * @returns {undefined} renders the element on whaterver element provided
	 */
	renderTo (domElement) {
		if (!domElement)
			return

		domElement.appendChild(this._____ELEMENT)
	}

	/**
	 * it's a handle that wraps the event in order to add functionalities like e.getTarget(selector)
	 * @private
	 * @param {Event} event
	 * @returns {undefined} returns whatever the callback returns
	 */
	_____EVT_HANDLE (event) {
		let listenerCompound = this._____GET_EVENT_LISTENER(event.type)
		let listener = listenerCompound.listener

		event.getTarget = (selector, maximumDepth = 200) => {
			let target = event.target
			let currentDepth = 0

			while (true) {
				if (currentDepth >= maximumDepth) {
					target = null
					break
				}

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

		let response = listener.callback.apply(this, arguments)

		delete event.getTarget

		return response
	}

	/**
	 * fetches event listener index and reference by the name
	 * @private
	 * @param {string} eventName
	 * @returns {Object|boolean}
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
	 * detaches all the event listeners attached to the element
	 * @private
	 * @returns {undefined}
	 */
	_____DETACH_ALL_LISTENERS () {
		let listeners = this._____LISTENERS

		for (let i = 0; i < listeners.length; i++) {
			let listener = listeners[i]

			this._____ELEMENT.removeEventListener(listener.eventName, listener.bindedHandle, ...listener.stdArgs)

		}
	}

	/**
	 * attaches event listener to element, it wraps the event and adds functionalities
	 * @public
	 * @param {string} eventName e.g. "click", "touchstart" all the default events
	 * @param {Function} callback your callback where you handle your logic **check event.* for more details on the event parameter in the callback**
	 * @param {Array} [stdArgs=[]] all the standard arguments that follow after callback
	 * @returns {undefined}
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
	 * detaches event listener from element
	 * @public
	 * @param {string} eventName e.g. "click", "touchstart" all the default events
	 * @returns {undefined}
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
	 * if destroy() was called it will return true
	 * @public
	 * @returns {boolean}
	 */
	isDestroyed() {
		return !! this._____DESTROYED
	}

	/**
	 * handles the destruction/removal of listeners and the internal element
	 * adds destroyed propery
	 * @public
	 * @returns {undefined}
	 */
	destroy () {
		if (this._____DESTROYED)
			return

		this._____DETACH_ALL_LISTENERS()

		let parentNode = this._____ELEMENT.parentNode

		if (parentNode)
			parentNode.removeChild(this._____ELEMENT)

		delete this._____ELEMENT

		this._____DESTROYED = true
	}
}

/**
 * similar to DOMElement.querySelector but instead of propagating from parent to child, it propagates from child to parent
 *
 * @typedef {Function} event.getTarget
 * @param {string} selector Valid CSS selector
 * @returns {DOMElement|null}
 * @example
 *
 * ...
 * this.on('mousedown', this.onMouseDown.bind(this))
 * ...
 *
 * ...
 * onMouseDown(e) {
 *     let cssSelector = '.cls-x'
 *     let myButton = e.getTarget(cssSelector)
 *
 *     if (myButton)
 *         myButton.classList.add('pressed')
 * }
 * ...
 */
