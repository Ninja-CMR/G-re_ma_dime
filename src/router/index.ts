import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
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
            redirect: '/dashboard',
        },
        {
            path: '/login',
            name: 'login',
            component: LoginView,
            meta: { guest: true }
        },
        {
            path: '/dashboard',
            name: 'dashboard',
            component: DashboardView,
            meta: { auth: true }
        },
        {
            path: '/members',
            name: 'members',
            component: MembersListView,
            meta: { auth: true }
        },
        {
            path: '/members/:id',
            name: 'member-profile',
            component: MemberProfileView,
            meta: { auth: true }
        },
        {
            path: '/reports',
            name: 'reports',
            component: ReportsView,
            meta: { auth: true }
        },
        {
            path: '/settings',
            name: 'settings',
            component: SettingsView,
            meta: { auth: true }
        },
    ],
})

router.beforeEach((to, _from, next) => {
    const authStore = useAuthStore()

    if (to.meta.auth && !authStore.isAuthenticated) {
        // Protected route but not authenticated
        next({ name: 'login' })
    } else if (to.meta.guest && authStore.isAuthenticated) {
        // Guest route (like login) but already authenticated
        next({ name: 'dashboard' })
    } else {
        next()
    }
})

export default router
