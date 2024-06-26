<style scoped>
span {
	border-radius: 5px;
}
</style>

<template>
	<span class="px-2 subtitle-2" :class="statusClass">
		{{ statusText }}
	</span>
</template>

<script lang="ts">
import { MachineMode, MachineStatus } from "@duet3d/objectmodel";
import Vue from "vue";

import store from "@/store";

export default Vue.extend({
	computed: {
		statusText(): string {
			let type: string = store.state.machine.model.state.status;
			if (!store.state.machine.model.state.status) {
				type = "unknown";
			} else if (store.state.machine.model.state.status === MachineStatus.processing && store.state.machine.model.state.machineMode === MachineMode.fff) {
				type = "printing";
			}
			return this.$t(`generic.status.${type}`);
		},
		statusClass() {
			const darkTheme = store.state.settings.darkTheme, status = store.state.machine.model.state.status;
			switch (status) {
				case MachineStatus.disconnected: return darkTheme ? "red darken-2 white--text" : "red darken-1 white--text";
				case MachineStatus.starting: return darkTheme ? "light-blue darken-3" : "light-blue accent-1";
				case MachineStatus.updating: return darkTheme ? "blue darken-3" : "blue lighten-3";
				case MachineStatus.off: return darkTheme ? "red darken-2 white--text" : "red darken-1 white--text";
				case MachineStatus.halted: return "red white--text";
				case MachineStatus.pausing: return darkTheme ? "yellow darken-3" : "orange accent-2";
				case MachineStatus.paused: return darkTheme ? "orange darken-2" : "yellow lighten-1";
				case MachineStatus.resuming: return darkTheme ? "yellow darken-3" : "orange accent-2";
				case MachineStatus.cancelling: return "red white--text";
				case MachineStatus.processing: return "green white--text";
				case MachineStatus.simulating: return darkTheme ? "light-blue darken-3" : "light-blue accent-1";
				case MachineStatus.busy: return darkTheme ? "amber darken-2 white--text" : "amber white--text";
				case MachineStatus.changingTool: return darkTheme ? "grey darken-3" : "blue lighten-5";
				case MachineStatus.idle: return darkTheme ? "light-green darken-3" : "light-green lighten-4";
				default: 
					const _exhaustiveCheck: never = status;
					return "red white--text";
			}
		}
	}
});
</script>
