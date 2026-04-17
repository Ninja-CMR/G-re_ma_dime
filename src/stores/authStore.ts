import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
    const user = ref<{ username: string; name?: string; email?: string } | null>(null)
    const isAuthenticated = ref(false)
    const loading = ref(false)

    // Default credentials that can be updated and are persisted
    const savedCredentials = ref({
        username: 'user@administrateur',
        password: 'maisondegloire@237'
    })

    async function login(credentials: { username: string; password: string }) {
        loading.value = true
        return new Promise<void>((resolve, reject) => {
            setTimeout(() => {
                if (
                    credentials.username === savedCredentials.value.username &&
                    credentials.password === savedCredentials.value.password
                ) {
                    // Initialize user object with current info or defaults
                    user.value = {
                        username: savedCredentials.value.username,
                        name: user.value?.name || 'Administrateur',
                        email: user.value?.email || savedCredentials.value.username
                    }
                    isAuthenticated.value = true
                    loading.value = false
                    resolve()
                } else {
                    loading.value = false
                    reject(new Error('Identifiants invalides'))
                }
            }, 1000)
        })
    }

    function logout() {
        user.value = null
        isAuthenticated.value = false
    }

    function updateProfile(data: { name?: string; email?: string; username?: string }) {
        if (user.value) {
            user.value = { ...user.value, ...data }
            if (data.username) {
                savedCredentials.value.username = data.username
            }
        }
    }

    function updatePassword(newPassword: string) {
        savedCredentials.value.password = newPassword
    }

    return {
        user,
        isAuthenticated,
        loading,
        login,
        logout,
        updateProfile,
        updatePassword,
        savedCredentials
    }
}, {
    persist: true
})
