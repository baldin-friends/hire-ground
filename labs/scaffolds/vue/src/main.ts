import { createApp, defineComponent, h } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import Apply from './Apply.vue';
import JobList from './JobList.vue';
import './styles.css';

const NotFound = defineComponent({ render: () => h('h1', 'Page not found') });

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', component: JobList },
        { path: '/apply/:slug', component: Apply, props: true },
        { path: '/:pathMatch(.*)*', component: NotFound },
    ],
});

createApp(App).use(router).mount('#app');
