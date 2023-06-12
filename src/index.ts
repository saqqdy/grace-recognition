import { inBrowser } from 'js-cool'
import { isChrome } from './utils'

declare global {
	interface Window {
		graceRecognitionReady: boolean
		SpeechRecognition: SpeechRecognition
		webkitSpeechRecognition: SpeechRecognition
	}
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
	| 'error'
	| 'nomatch'

export interface RecognitionOptions {
	preferTouchEvent: boolean
	lang: 'zh-CN' | string
	interimResults: boolean
	maxAlternatives: number
	continuous: boolean
	onStatusChange?: (status: RecognitionEventType, event?: Event) => void
}

class Recognition {
	recognition: SpeechRecognition = null as unknown as SpeechRecognition
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
		if (typeof window.SpeechRecognition !== 'undefined') {
			this.recognition = new SpeechRecognition()
		} else if (typeof window.webkitSpeechRecognition !== 'undefined') {
			this.recognition = new webkitSpeechRecognition()
		} else {
			console.error('SpeechRecognition is not supported')
			return
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
		this.recognition.onresult = (event: SpeechRecognitionEvent) => {
			this.status = event.type as RecognitionEventType
			const result = ([] as any)
				.concat(event.results)
				.map((item: any) => item[0].transcript)
				.join('|') // event.results[0][0].transcript;
			this.result = result
			this.options.onStatusChange && this.options.onStatusChange('result', event)
		}

		this.recognition.onspeechend = (event: Event) => {
			this.status = event.type as RecognitionEventType
			this.options.onStatusChange && this.options.onStatusChange('speechend', event)
		}

		this.recognition.onnomatch = (event: SpeechRecognitionEvent) => {
			this.status = event.type as RecognitionEventType
			this.options.onStatusChange && this.options.onStatusChange('nomatch', event)
		}

		this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
			this.status = event.type as RecognitionEventType
			this.options.onStatusChange && this.options.onStatusChange('error', event)
		}
		this.recognition.onaudioend = (event: Event) => {
			this.status = event.type as RecognitionEventType
			this.options.onStatusChange && this.options.onStatusChange('audioend', event)
		}
		this.recognition.onaudiostart = (event: Event) => {
			this.status = event.type as RecognitionEventType
			this.options.onStatusChange && this.options.onStatusChange('audiostart', event)
		}
		this.recognition.onend = (event: Event) => {
			this.status = event.type as RecognitionEventType
			this.options.onStatusChange && this.options.onStatusChange('end', event)
		}
		this.recognition.onsoundend = (event: Event) => {
			this.status = event.type as RecognitionEventType
			this.options.onStatusChange && this.options.onStatusChange('soundend', event)
		}
		this.recognition.onsoundstart = (event: Event) => {
			this.status = event.type as RecognitionEventType
			this.options.onStatusChange && this.options.onStatusChange('soundstart', event)
		}
		this.recognition.onspeechstart = (event: Event) => {
			this.status = event.type as RecognitionEventType
			this.options.onStatusChange && this.options.onStatusChange('speechstart', event)
		}
		this.recognition.onstart = (event: Event) => {
			this.status = event.type as RecognitionEventType
			this.options.onStatusChange && this.options.onStatusChange('start', event)
		}
	}

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
