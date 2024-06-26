<style>
td.log-cell {
	padding-top: 8px !important;
	padding-bottom: 8px !important;
	height: auto !important;
}

td.title-cell {
	vertical-align: top;
}
</style>

<style scoped>
.message {
	white-space: pre-wrap;
}

th:last-child {
	padding-right: 0 !important;
	width: 1%;
}
</style>

<template>
	<div class="component">
		<v-data-table :headers="headers" :items="events" item-key="date" disable-pagination hide-default-footer
					  :mobile-breakpoint="0" :custom-sort="sort" :sort-by.sync="sortBy" :sort-desc.sync="sortDesc"
					  must-sort class="elevation-3" :class="{ 'empty-table-fix' : !events.length }">

			<template #no-data>
				<v-alert :value="true" type="info" class="text-left ma-0">
					{{ $t("list.eventLog.noEvents") }}
				</v-alert>
			</template>

			<template #header.btn>
				<v-menu offset-y>
					<template #activator="{ on }">
						<v-btn v-on="on" icon>
							<v-icon small>mdi-menu</v-icon>
						</v-btn>
					</template>

					<v-list>
						<v-list-item @click="clearLog">
							<v-icon class="mr-1">mdi-notification-clear-all</v-icon> {{ $t("list.eventLog.clear") }}
						</v-list-item>
						<v-list-item :disabled="!events.length" @click="downloadText">
							<v-icon class="mr-1">mdi-file-download</v-icon> {{ $t("list.eventLog.downloadText") }}
						</v-list-item>
						<v-list-item :disabled="!events.length" @click="downloadCSV">
							<v-icon class="mr-1">mdi-cloud-download</v-icon> {{ $t("list.eventLog.downloadCSV") }}
						</v-list-item>
					</v-list>
				</v-menu>
			</template>

			<template #item="{ item }">
				<tr :class="getClassByEvent(item.type)">
					<td class="log-cell title-cell">
						{{ item.date.toLocaleString() }}
					</td>
					<td class="log-cell content-cell" colspan="2">
						<strong>{{ item.title }}</strong>
						<br v-if="item.title && item.message">
						<span v-if="item.message" class="message" v-html="formatMessage(item.message)"></span>
					</td>
				</tr>
			</template>
		</v-data-table>
	</div>
</template>

<script lang="ts">
import saveAs from "file-saver";
import Vue from "vue";
import { DataTableHeader } from "vuetify";

import i18n from "@/i18n";
import store from "@/store";
import { MachineEvent } from "@/store/machine";
import { LogType } from "@/utils/logging";

export default Vue.extend({
	computed: {
		headers(): Array<DataTableHeader> {
			return [
				{
					text: i18n.t("list.eventLog.date"),
					value: "date",
					width: "15%"
				},
				{
					text: i18n.t("list.eventLog.message"),
					value: "message",
					sortable: false,
					width: "74%"
				},
				{
					text: "",
					value: "btn",
					sortable: false,
					width: "1%"
				}
			]
		},
		sortBy: {
			get(): string { return store.state.machine.cache.sorting.events.column; },
			set(value: string) {
				store.commit("machine/cache/setSorting", {
					table: "events",
					column: value,
					descending: this.sortDesc
				});
			}
		},
		sortDesc: {
			get() { return store.state.machine.cache.sorting.events.descending; },
			set(value) {
				store.commit("machine/cache/setSorting", {
					table: "events",
					column: this.sortBy,
					descending: value
				});
			}
		},
		events(): Array<MachineEvent> { return store.state.machine.events; }
	},
	methods: {
		getHeaderText: (header: { text: string | (() => string) }) => (header.text instanceof (Function)) ? header.text() : header.text,
		getClassByEvent(type: LogType) {
			if (store.state.settings.darkTheme) {
				switch (type) {
					case LogType.success: return "green darken-1";
					case LogType.warning: return "amber darken-1";
					case LogType.error: return "red darken-1";
				}
				return "blue darken-1";
			} else {
				switch (type) {
					case LogType.success: return "green accent-2";
					case LogType.warning: return "amber accent-1";
					case LogType.error: return "red accent-1";
				}
				return "light-blue accent-1";
			}
		},
		formatMessage(message: string | null) {
			if (message === null) {
				return "";
			}

			let result = message.replace(/Error:/g, "<strong>Error:</strong>").replace(/Warning:/g, "<strong>Warning:</strong>");
			if (message.startsWith('{') && message.endsWith('}')) {
				try {
					const json = JSON.parse(message);
					result = JSON.stringify(json, null, 4).replace(/\n/g, "<br>").replace(/ /g, "&nbsp;");
				} catch {
					// unhandled
				}
			}
			return result;
		},
		clearLog() {
			store.commit("machine/clearLog");
		},
		downloadText() {
			let textContent = "";
			for (const e of store.state.machine.events) {
				const title = e.title?.replace(/\n/g, "\r\n") ?? "";
				const message = e.message ? e.message.replace(/\n/g, "\r\n") : "";
				textContent += `${e.date.toLocaleString()}: ${message ? (title + ": " + message) : title}\r\n`;
			}

			const file = new File([textContent], "console.txt", { type: "text/plain;charset=utf-8" });
			saveAs(file);
		},
		downloadCSV() {
			var csvContent = '"date","time","title","message"\r\n';
			for (const e of store.state.machine.events) {
				const title = e.title?.replace(/\n/g, "\r\n") ?? "";
				const message = e.message ? e.message.replace(/"/g, '""').replace(/\n/g, "\r\n") : "";
				csvContent += `"${e.date.toLocaleDateString()}","${e.date.toLocaleTimeString()}","${title}","${message}"\r\n`;
			}

			const file = new File([csvContent], "console.csv", { type: "text/csv;charset=utf-8" });
			saveAs(file);
		},
		sort(items: Array<MachineEvent>, sortBy: Array<keyof MachineEvent>, sortDesc: Array<boolean>) {
			// FIXME This method should not be needed but it appears like Vuetify's default
			// sort algorithm only takes into account times but not dates

			// Sort by datetime - everything else is unsupported
			items.sort((a, b) => {
				if (a.date === b.date) {
					return 0;
				}
				if (a.date === null || a.date === undefined) {
					return -1;
				}
				if (b.date === null || b.date === undefined) {
					return 1;
				}
				return a.date.getTime() - b.date.getTime();
			});

			// Deal with descending order
			if (sortDesc[0]) {
				items.reverse();
			}
			return items;
		}
	}
});
</script>
