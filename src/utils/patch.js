'use strict'

// This file is now obsolete - it will be removed from v3.6

import Vue from 'vue'

export class Dictionary {
	constructor(initData) {
		for (let key in initData) {
			this[key] = initData[key];
		}
	}
	// properties are dynamic in this class
}

export function arraySizesDiffer(a, b) {
	if (a instanceof Array) {
		if (a.length !== b.length) {
			return true;
		}

		for (let i = 0; i < a.length; i++) {
			if (a[i] instanceof Object && b[i] instanceof Object) {
				if (arraySizesDiffer(a[i], b[i])) {
					return true;
				}
			}
		}
	} else if (a instanceof Object) {
		for (let key in a) {
			if (a[key] instanceof Object && b[key] instanceof Object) {
				if (arraySizesDiffer(a[key], b[key])) {
					return true;
				}
			}
		}
	}
	return false;
}

export function quickPatch(a, b) {
	if (a instanceof Array) {
		for (let i = 0; i < b.length; i++) {
			if (i < a.length) {
				if (a[i] instanceof Object) {
					quickPatch(a[i], b[i]);
				} else {
					a[i] = b[i];
				}
			} else {
				a.push(b[i]);
			}
		}
	} else if (b instanceof Object) {
		for (let key in b) {
			if (a[key] instanceof Object) {
				quickPatch(a[key], b[key]);
			} else {
				a[key] = b[key];
			}
		}
	}
}

export function patch(a, b, skipNonexistentFields = false, fullPath = '') {
	if (a instanceof Array) {
		while (a.length > b.length) {
			a.pop();
		}

		for (let i = 0; i < b.length; i++) {
			if (i < a.length) {
				if (a[i] !== b[i]) {
					if (a[i] && b[i] && a[i] instanceof Object) {
						patch(a[i], b[i], skipNonexistentFields, fullPath + '/' + i);
					} else {
						Vue.set(a, i, b[i]);
						//console.log(`[patch] ${fullPath}/${i} (${typeof b[i]})`);
					}
				}
			} else if (b[i] instanceof Object) {
				a.push(JSON.parse(JSON.stringify(b[i])));
			} else {
				a.push(b[i]);
			}
		}
	} else if (a instanceof Object) {
		for (let key in b) {
			if (skipNonexistentFields && !(key in a)) {
				if (process.env.NODE_ENV !== 'production') {
					console.warn(`[patch] Skipped merge of ${fullPath}/${key} because it does not exist in the source. Value: ${JSON.stringify(b[key])}`);
				}
			} else if (b[key] === null) {
				Vue.set(a, key, null);
			} else {
				if (typeof a[key] === 'boolean' && typeof b[key] === 'number') {
					// RRF may report bools as ints so convert them if necessary
					b[key] = Boolean(b[key]);
				}

				if (a[key] !== undefined && a[key] !== null && typeof a[key] !== typeof b[key] && key !== 'default') {
					if (process.env.NODE_ENV !== 'production') {
						console.warn(`[patch] Skipped merge of ${fullPath}/${key} due to incompatible types ${typeof a[key]} vs ${typeof b[key]}. Value: ${JSON.stringify(b[key])}`);
					}
				} else if (a[key] instanceof Array) {
					patch(a[key], b[key] ? b[key] : [], skipNonexistentFields, fullPath + '/' + key);
				} else if (a[key] instanceof Object) {
					patch(a[key], b[key], skipNonexistentFields && !(a[key] instanceof Dictionary), fullPath + '/' + key);
				} else if (a[key] === null && b[key] instanceof Object) {
					Vue.set(a, key, JSON.parse(JSON.stringify(b[key])));
				} else if (a[key] !== b[key]) {
					Vue.set(a, key, b[key]);
					//console.log(`[patch] ${fullPath}/${key} (${typeof b[key]})`);
				}
			}
		}
	}
}

export default patch
