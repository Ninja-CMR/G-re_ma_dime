import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import MembersListView from '../views/MembersListView.vue'
import MemberProfileView from '../views/MemberProfileView.vue'
import ReportsView from '../views/ReportsView.vue'
import SettingsView from '../views/SettingsView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            redirect: '/login',
        },
        {
            path: '/login',
            name: 'login',
            component: LoginView,
        },
        {
            path: '/dashboard',
            name: 'dashboard',
            component: DashboardView,
        },
        {
            path: '/members',
            name: 'members',
            component: MembersListView,
        },
        {
            path: '/members/:id',
            name: 'member-profile',
            component: MemberProfileView,
        },
        {
            path: '/reports',
            name: 'reports',
            component: ReportsView,
        },
        {
            path: '/settings',
            name: 'settings',
            component: SettingsView,
        },
    ],
})

export default router
