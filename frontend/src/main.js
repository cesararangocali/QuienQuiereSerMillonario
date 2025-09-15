import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import vuetify from './plugins/vuetify';
import i18n from './plugins/i18n';

import './styles.css';

createApp(App)
	.use(createPinia())
	.use(router)
	.use(vuetify)
	.use(i18n)
	.mount('#app');
