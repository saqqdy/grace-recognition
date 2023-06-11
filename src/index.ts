import { inBrowser } from 'js-cool'
import { isChrome } from './utils'

declare global {
	interface Window {
		graceRecognitionReady: boolean
		SpeechRecognition: SpeechRecognition
		webkitSpeechRecognition: SpeechRecognition
	}
}

export interface RecognitionOptions {
	preferTouchEvent: boolean
	lang: 'zh-CN' | string
	interimResults: boolean
	maxAlternatives: number
	continuous: boolean
}

export type RecognitionEventType =
	| 'start'
	| 'audiostart'
	| 'soundstart'
	| 'speechstart'
	| 'result'
	| 'speechend'
	| 'soundend'
	| 'audioend'
	| 'end'

class Recognition {
	recognition: SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
	ready: boolean = window.graceRecognitionReady ?? false
	result = ''
	status: RecognitionEventType = 'end'

	options: RecognitionOptions = {
		preferTouchEvent: false,
		lang: 'zh-CN',
		interimResults: false,
		maxAlternatives: 1,
		continuous: false
	}

	constructor(options: RecognitionOptions) {
		if (!inBrowser) return
		if (
			typeof window.SpeechRecognition === 'undefined' ||
			typeof window.webkitSpeechRecognition === 'undefined'
		) {
			console.error('SpeechRecognition is not supported')
		}

		this.options = Object.assign(this.options, options || {})
		this.recognition.lang = this.options.lang
		this.recognition.interimResults = this.options.interimResults
		this.recognition.maxAlternatives = this.options.maxAlternatives
		this.recognition.continuous = this.options.continuous

		this.bindHandler()

		const promises = []
		!this.ready && promises.push(this.init())
		Promise.all(promises)
	}

	/**
	 * init
	 */
	private async init() {
		if (!isChrome) {
			this.ready = window.graceRecognitionReady = true
			return Promise.resolve(true)
		}

		return new Promise(resolve => {
			const eventName = this.options.preferTouchEvent ? 'touchend' : 'click'
			const handler = (
				event:
					| MouseEvent
					| TouchEvent
					| CompositionEvent
					| FocusEvent
					| InputEvent
					| KeyboardEvent
			) => {
				this.ready = window.graceRecognitionReady = event.isTrusted
				if (this.ready) {
					window.removeEventListener(eventName, handler)
					window.removeEventListener('keypress', handler)
					resolve(true)
				}
			}
			window.addEventListener(eventName, handler)
			window.addEventListener('keypress', handler)
		})
	}

	/**
	 * bind handler
	 */
	public bindHandler() {
		this.recognition.onresult = event => {
			this.status = event.type as RecognitionEventType
			console.log(103, 'onresult', event)
			const result = ([] as any)
				.concat(event.results)
				.map((item: any) => item[0].transcript)
				.join('|') // event.results[0][0].transcript;
			this.result = result
		}

		this.recognition.onspeechend = event => {
			this.status = event.type as RecognitionEventType
			console.log(102, 'onspeechend', event)
			// this.recognition.stop();
		}

		this.recognition.onnomatch = event => {
			this.status = event.type as RecognitionEventType
			console.log(101, 'onnomatch', event)
		}

		this.recognition.onerror = event => {
			this.status = event.type as RecognitionEventType
			console.log(100, 'onerror', event, event.error)
		}
		this.recognition.onaudioend = event => {
			this.status = event.type as RecognitionEventType
			console.log(104, 'onaudioend', event)
		}
		this.recognition.onaudiostart = event => {
			this.status = event.type as RecognitionEventType
			console.log(105, 'onaudiostart', event)
		}
		this.recognition.onend = event => {
			this.status = event.type as RecognitionEventType
			console.log(106, 'onend', event)
		}
		this.recognition.onsoundend = event => {
			this.status = event.type as RecognitionEventType
			console.log(107, 'onsoundend', event)
		}
		this.recognition.onsoundstart = event => {
			this.status = event.type as RecognitionEventType
			console.log(108, 'onsoundstart', event)
		}
		this.recognition.onspeechstart = event => {
			this.status = event.type as RecognitionEventType
			console.log(109, 'onspeechstart', event)
		}
		this.recognition.onstart = event => {
			this.status = event.type as RecognitionEventType
			console.log(110, 'onstart', event)
		}
	}

	/**
	 * get current recognition
	 *
	 * @returns result - recognition: SpeechRecognition
	 */
	// public getCurrentRecognition(): SpeechRecognition | null {
	// 	if (!this.recognition) console.warn('no recognition right now')
	// 	return this.recognition
	// }

	/**
	 * Starts the speech recognition service listening to incoming audio with intent to recognize grammars associated with the current SpeechRecognition.
	 */
	public start() {
		this.recognition.start()
	}

	/**
	 * Stops the speech recognition service from listening to incoming audio, and doesn't attempt to return a SpeechRecognitionResult.
	 */
	public abort() {
		this.recognition.abort()
	}

	/**
	 * Stops the speech recognition service from listening to incoming audio, and attempts to return a SpeechRecognitionResult using the audio captured so far.
	 */
	public stop() {
		this.recognition.stop()
	}
}

export { Recognition as default }
