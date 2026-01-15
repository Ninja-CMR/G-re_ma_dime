import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
    const user = ref<{ username: string; name?: string; email?: string } | null>(null)
    const isAuthenticated = ref(false)
    const loading = ref(false)

    async function login(credentials: { username: string; password: string }) {
        loading.value = true
        return new Promise<void>((resolve, reject) => {
            setTimeout(() => {
                if (
                    credentials.username === 'user@administrateur' &&
                    credentials.password === 'maisondegloire@237'
                ) {
                    user.value = { username: credentials.username }
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

    return {
        user,
        isAuthenticated,
        loading,
        login,
        logout,
    }
}, {
    persist: true
})
