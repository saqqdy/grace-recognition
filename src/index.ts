import { extend } from 'js-cool'
import { inBrowser, isChrome } from './utils'

declare global {
	interface Window {
		graceRecognitionReady: boolean
	}
}

export interface SpeechOptions {
	preferTouchEvent: boolean
	voiceFilter: ((voice: SpeechSynthesisVoice) => boolean) | null
	lang: 'zh-CN' | string
	pitch: number
	rate: number
	volume: number
}

export type UtterOptions = Partial<
	Pick<
		SpeechSynthesisUtterance,
		| 'lang'
		| 'onboundary'
		| 'onend'
		| 'onerror'
		| 'onmark'
		| 'onpause'
		| 'onresume'
		| 'onstart'
		| 'pitch'
		| 'rate'
		| 'text'
		| 'voice'
		| 'volume'
	>
>

export interface Effect {
	key: symbol
	content: string
	utterOptions: UtterOptions
}

class Recognitioner {
	speech: SpeechSynthesis = window.speechSynthesis
	effects: Effect[] = []
	utter: SpeechSynthesisUtterance | null = null
	voice: SpeechSynthesisVoice | undefined = undefined
	ready: boolean = window.graceRecognitionReady ?? false
	options: SpeechOptions = {
		preferTouchEvent: false,
		voiceFilter: null,
		lang: 'zh-CN',
		pitch: 1,
		rate: 1,
		volume: 1
	}

	constructor(options: Partial<SpeechOptions> = {}) {
		if (!inBrowser) return
		if (typeof window.speechSynthesis === 'undefined') {
			console.error('speechSynthesis is not supported')
			return
		}

		this.options = extend(true, this.options, options) as unknown as SpeechOptions

		const promises = []
		!this.ready && promises.push(this.init())
		!this.voice && promises.push(this.getVoice())
		Promise.all(promises).then(() => {
			this.recognitioning()
		})
	}

	/**
	 * init
	 */
	private async init() {
		if (!isChrome) {
			this.ready = window.graceRecognitionReady = true
			return Promise.resolve(true)
		}

		return new Promise((resolve, reject) => {
			const handler = () => {
				this.speech.recognition(new SpeechSynthesisUtterance(''))
				this.ready = window.graceRecognitionReady = this.speech.recognitioning || this.speech.pending
				window.removeEventListener('click', handler)
				window.removeEventListener('keypress', handler)
				if (this.ready) resolve(true)
				else reject(new Error('init error'))
			}
			window.addEventListener('click', handler)
			window.addEventListener('keypress', handler)
		})
	}

	/**
	 * get voice
	 *
	 * @returns result voice: SpeechSynthesisVoice
	 */
	public async getVoice(): Promise<SpeechSynthesisVoice | undefined> {
		if (this.voice) return this.voice

		let voices = this.speech.getVoices()
		if (!voices || !voices.length) {
			await new Promise(resolve =>
				this.speech.addEventListener('voiceschanged', resolve, { once: true })
			)
			voices = this.speech.getVoices()
		}

		voices = voices.sort((a, b) => {
			const nameA = a.name.toUpperCase()
			const nameB = b.name.toUpperCase()
			if (nameA < nameB) return -1
			else if (nameA === nameB) return 0
			return 1
		})

		this.voice = this.options.voiceFilter
			? voices.find(this.options.voiceFilter)
			: voices.find(({ lang, localService }) => localService && lang === this.options.lang) ||
			  voices.find(({ lang }) => lang === this.options.lang)
		return this.voice
	}

	/**
	 * get current utter
	 *
	 * @returns result - utter: SpeechSynthesisUtterance
	 */
	public getCurrentUtter(): SpeechSynthesisUtterance | null {
		if (!this.utter) console.warn('no utter right now')
		return this.utter
	}

	/**
	 * recognition
	 *
	 * @param content - recognition text
	 * @param utterOptions - utter options: UtterOptions
	 * @returns result - effectKey: symbol
	 */
	public recognition(content: string, utterOptions: UtterOptions = {}): Effect['key'] {
		const effect = {
			key: Symbol('SpeechKey#effect'),
			content,
			utterOptions
		}
		this.effects.push(effect)

		this.recognitioning()

		return effect.key
	}

	/**
	 * do recognitioning
	 */
	recognitioning() {
		if (!this.ready || !this.voice) return
		for (const { content, utterOptions } of this.effects) {
			this.utter = new SpeechSynthesisUtterance(content)
			let action: keyof UtterOptions
			for (action in utterOptions) {
				this.utter[action] = utterOptions[action] as never
			}
			this.utter.voice = this.voice
			this.utter.pitch = this.options.pitch
			this.utter.rate = this.options.rate
			this.utter.volume = this.options.volume
			this.speech.recognition(this.utter)
		}
		this.effects = []
		this.utter = null
	}

	/**
	 * Remove unconsumed recognition
	 *
	 * @param effectKey - key of effect
	 * @returns result - cancellation result true=Cancellation success false=Broadcast content not found or broadcast consumed
	 */
	public remove(effectKey: Effect['key']): boolean {
		const index = this.effects.findIndex(({ key }) => key === effectKey)
		if (index > -1) {
			this.effects.splice(index, 1)
			return true
		}
		return false
	}

	/**
	 * Forced cancellation of all broadcasts, and immediate cancellation of those being broadcast
	 */
	public cancel() {
		this.speech.cancel()
	}

	/**
	 * Suspension of all broadcasts and immediate cancellation of those being broadcast
	 */
	public pause() {
		this.speech.pause()
	}

	/**
	 * Resume all broadcasts and immediately cancel those being broadcast
	 */
	public resume() {
		this.speech.resume()
	}
}

export { Recognitioner as default }
