<style scoped>
@media screen and (max-width: 600px) {
	.large-font-height {
		height: 35px;
	}

	.large-font {
		font-size: 30px;
	}
}

@media screen and (min-width: 601px) {
	.large-font-height {
		height: 55px;
	}

	.large-font {
		font-size: 50px;
	}
}
</style>

<template>
	<v-card class="py-0">
		<v-card-title class="py-2">
			<strong>
				{{ machinePosition ? $t("panel.status.machinePosition") : $t("panel.status.toolPosition") }}
			</strong>
		</v-card-title>
		<v-card-text>
			<v-row align-content="center" no-gutters :class="{ 'large-font' : !machinePosition }">
				<v-col v-for="axis in visibleAxes" :key="axis.letter" class="d-flex flex-column align-center">
					<div :class="{ 'large-font-height' : !machinePosition }">
						{{ axis.letter }}
					</div>
					<div>
						{{ $displayAxisPosition(axis, machinePosition) }}
					</div>
				</v-col>
			</v-row>
		</v-card-text>
	</v-card>
</template>

<script lang="ts">
import { Axis } from "@duet3d/objectmodel";
import Vue from "vue";

import store from "@/store";

export default Vue.extend({
	props: {
		machinePosition: {
			type: Boolean,
			required: true
		}
	},
	computed: {
		visibleAxes(): Array<Axis> {
			return store.state.machine.model.move.axes.filter(axis => axis.visible);
		}
	}
});
</script>

