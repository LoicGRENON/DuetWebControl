import Vue from "vue";

import BaseFileList from "./BaseFileList.vue";
import EventList from "./EventList.vue";
import FilamentFileList from "./FilamentFileList.vue";
import JobFileList from "./JobFileList.vue";
import MacroFileList from "./MacroFileList.vue";
import MacroList from "./MacroList.vue";
import SystemFileList from "./SystemFileList.vue";

Vue.component("base-file-list", BaseFileList);
Vue.component("event-list", EventList);
Vue.component("filament-file-list", FilamentFileList);
Vue.component("job-file-list", JobFileList);
Vue.component("macro-file-list", MacroFileList);
Vue.component("macro-list", MacroList);
Vue.component("system-file-list", SystemFileList);
