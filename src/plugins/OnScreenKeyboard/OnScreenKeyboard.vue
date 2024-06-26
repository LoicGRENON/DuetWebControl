<style>
.simple-keyboard {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	z-index: 9999;
}

.simple-keyboard.dark {
	background-color: #1E1E1E;
	border-radius: 0;
	border-bottom-right-radius: 5px;
	border-bottom-left-radius: 5px;
}

.simple-keyboard.dark .hg-button {
	height: 50px;
	display: flex;
	justify-content: center;
	align-items: center;
	background: #1E1E1E;
	color: white;
}

.simple-keyboard.dark .hg-button:active {
	background: #1c4995;
	color: white;
}
</style>

<template>
	<div ref="keyboard" v-if="input" class="simple-keyboard" @click.stop.prevent=""></div>
</template>

<script lang="ts">
import Keyboard from "simple-keyboard";
import "simple-keyboard/build/css/index.css";
import Vue from "vue";

import store from "@/store";

export default Vue.extend({
	data() {
		return {
			input: null as HTMLInputElement | HTMLTextAreaElement | null,
			keyboard: null as any
		}
	},
	mounted() {
		store.commit("oskEnabled");
		window.addEventListener("focusin", this.inputFocused);
		window.addEventListener("click", this.globalClick);
	},
	beforeDestroy() {
		window.removeEventListener("focusin", this.inputFocused);
		window.removeEventListener("click", this.globalClick);
	},
	methods: {
		inputFocused(e: Event) {
			if (e.target !== this.input && (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
				this.input = e.target;
				this.$nextTick(function() {
					// Create a new keyboard instance
					if (!this.keyboard) {
						this.keyboard = new Keyboard({
							mergeDisplay: true,
							display: {
								"{enter}": "enter"
							},
							onChange: this.updateValue,
							onKeyPress: this.onKeyPress,
							newLineOnEnter: e.target instanceof HTMLTextAreaElement,
							tabCharOnTab: e.target instanceof HTMLTextAreaElement,
							theme: store.state.settings.darkTheme ? "hg-theme-default dark" : "hg-theme-default"
						});
					}
					this.keyboard.setInput((e.target as HTMLInputElement | HTMLTextAreaElement).value);

					if (e.target instanceof HTMLInputElement && e.target.type === "number") {
						// Show numpad for numeric inputs and clear previous input
						this.keyboard.setOptions({
							layout: {
								default: [
									"{numpad1} {numpad2} {numpad3}",
									"{numpad4} {numpad5} {numpad6}",
									"{numpad7} {numpad8} {numpad9}",
									"{bksp} {numpad0} {enter}"
								]
							}
						});
						this.keyboard.setInput("");
					}

					// Add some space at the bottom so the keyboard does not cover inputs 
					store.commit("setBottomMargin", (this.$refs.keyboard as HTMLElement).offsetHeight);
				});
			}
		},
		globalClick() {
			if (document.activeElement !== this.input) {
				// Hide the keyboard when a user clicks/taps outside the keyboard and selected input
				this.hide();
			}
		},
		hide() {
			this.input = null;
			this.keyboard = null;
			store.commit("setBottomMargin", 0);
		},
		onInput(e: Event) {
			this.keyboard.setInput((e.target as HTMLInputElement | HTMLTextAreaElement).value);
		},
		updateValue(value: string) {
			if (this.input != null) {
				this.input.value = value;
				const ie = new Event("input", {
					bubbles: true,
					cancelable: true,
				});
				this.input.dispatchEvent(ie);
				const ce = new Event("change", {
					bubbles: true,
					cancelable: true,
				});
				this.input.dispatchEvent(ce);
			}
		},
		onKeyPress(button: string) {
			if (button === "{shift}" || button === "{lock}") {
				// Deal with shift/caps lock
				const currentLayout = this.keyboard.options.layoutName;
				this.keyboard.setOptions({
					layoutName: (currentLayout === "default") ? "shift" : "default"
				});
			} else if (button === "{enter}") {
				if (this.input instanceof HTMLInputElement) {
					// Emulate keydown, keypress, keyup in the right order
					const kde = new KeyboardEvent("keydown", {
						bubbles: true,
						cancelable: true,
						keyCode: 13
					});
					this.input.dispatchEvent(kde);

					const kpe = new KeyboardEvent("keypress", {
						bubbles: true,
						cancelable: true,
						keyCode: 13
					});
					this.input.dispatchEvent(kpe);

					const kue = new KeyboardEvent("keyup", {
						bubbles: true,
						cancelable: true,
						keyCode: 13
					});
					this.input.dispatchEvent(kue);

					// Wait a moment before closing the keyboard, else bad touch events may be invoked
					setTimeout(this.hide.bind(this), 500);
				} else if (this.input instanceof HTMLTextAreaElement) {
					// Focus textarea again to keep the cursor visible
					this.input.focus();
				}
			}
		}
	}
});
</script>
