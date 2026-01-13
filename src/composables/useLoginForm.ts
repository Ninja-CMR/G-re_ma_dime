import { useForm, useField } from 'vee-validate'
import * as yup from 'yup'
import { useAuthStore } from '@/stores/authStore'
import { toTypedSchema } from '@vee-validate/yup'
import { useRouter } from 'vue-router'

export function useLoginForm() {
    const authStore = useAuthStore()
    const router = useRouter()

    const schema = toTypedSchema(
        yup.object({
            username: yup
                .string()
                .required('Username is required')
                .min(3, 'Username must be at least 3 characters'),
            password: yup
                .string()
                .required('Password is required')
                .min(6, 'Password must be at least 6 characters'),
        })
    )

    const { handleSubmit, errors, isSubmitting } = useForm({
        validationSchema: schema,
    })

    const { value: username } = useField<string>('username')
    const { value: password } = useField<string>('password')

    const onSubmit = handleSubmit(async (values) => {
        try {
            await authStore.login(values as { username: string; password: string })
            router.push('/dashboard')
        } catch (error) {
            console.error('Login failed:', error)
            // Optionally set a form error here if needed
            alert('Identifiants invalides')
        }
    })

    return {
        username,
        password,
        errors,
        isSubmitting,
        onSubmit,
        loading: authStore.loading,
    }
}
