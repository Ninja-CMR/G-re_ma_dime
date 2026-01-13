<script setup lang="ts">
import { ref } from 'vue'
import { useLoginForm } from '@/composables/useLoginForm'
import { User, Lock, Eye, EyeOff, Loader2 } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardContent from '@/components/ui/CardContent.vue'
import CardFooter from '@/components/ui/CardFooter.vue'
import harvestImage from '@/assets/harvest.png'

const { username, password, errors, isSubmitting, onSubmit, loading } =
  useLoginForm()

const showPassword = ref(false)

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

// Carousel Logic
const messages = [
  'Gérez la croissance de votre communauté',
  'Suivi précis des contributions',
  'Analysez vos données en temps réel',
]
const currentMessageIndex = ref(0)
const CAROUSEL_INTERVAL = 4000

setInterval(() => {
  currentMessageIndex.value = (currentMessageIndex.value + 1) % messages.length
}, CAROUSEL_INTERVAL)
</script>

<template>
  <div class="flex min-h-screen w-full">
    <!-- Left Section (Visual) - Hidden on mobile -->
    <div
      class="hidden lg:flex w-1/2 relative bg-cover bg-center"
      :style="{ backgroundImage: `url(${harvestImage})` }"
    >
      <!-- Overlay -->
      <div
        class="absolute inset-0 bg-gradient-to-t from-black/80 to-black/40"
      ></div>

      <!-- Text Carousel -->
      <div
        class="absolute inset-0 flex flex-col justify-end p-12 text-white z-10"
      >
        <div class="h-24">
            <transition name="fade" mode="out-in">
                <h2 :key="currentMessageIndex" class="text-3xl font-bold leading-tight mb-4">
                    {{ messages[currentMessageIndex] }}
                </h2>
            </transition>
            <p class="text-white/80 text-lg">
                La solution complète pour votre gestion.
            </p>
        </div>
      </div>
    </div>

    <!-- Right Section (Login Form) -->
    <div
      class="w-full lg:w-1/2 flex items-center justify-center bg-white dark:bg-zinc-950 p-8"
    >
      <Card class="w-full max-w-md border-0 shadow-none">
        <CardHeader class="space-y-1 text-center">
          <h1 class="text-3xl font-bold tracking-tight">Bon retour</h1>
          <p class="text-muted-foreground text-sm">
            Entrez vos identifiants pour accéder à votre compte
          </p>
        </CardHeader>
        <CardContent>
          <form @submit.prevent="onSubmit" class="space-y-6">
            <!-- Username Field -->
            <div class="space-y-2">
              <Label class="sr-only" for="username">Nom d'utilisateur</Label>
              <div class="relative">
                <div
                  class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                >
                  <User class="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="username"
                  type="text"
                  placeholder="Nom d'utilisateur"
                  v-model="username"
                  class="pl-10 h-11"
                  :class="{ 'border-destructive': errors.username }"
                />
              </div>
              <p v-if="errors.username" class="text-sm text-destructive">
                {{ errors.username }}
              </p>
            </div>

            <!-- Password Field -->
            <div class="space-y-2">
              <Label class="sr-only" for="password">Mot de passe</Label>
              <div class="relative">
                <div
                  class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                >
                  <Lock class="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Mot de passe"
                  v-model="password"
                  class="pl-10 pr-10 h-11"
                  :class="{ 'border-destructive': errors.password }"
                />
                <button
                  type="button"
                  @click="togglePassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  <Eye v-if="!showPassword" class="h-5 w-5" />
                  <EyeOff v-else class="h-5 w-5" />
                </button>
              </div>
              <p v-if="errors.password" class="text-sm text-destructive">
                {{ errors.password }}
              </p>
            </div>

            <Button
              type="submit"
              size="lg"
              class="w-full transition-all duration-300 hover:scale-[1.01] shadow-sm"
              :disabled="isSubmitting || loading"
            >
              <Loader2
                v-if="isSubmitting || loading"
                class="mr-2 h-4 w-4 animate-spin"
              />
              {{ isSubmitting || loading ? 'Connexion en cours...' : 'Se connecter' }}
            </Button>
          </form>
        </CardContent>
        <CardFooter class="flex flex-col space-y-2 text-center text-sm text-muted-foreground">
            <div class="relative w-full mb-4">
                <div class="absolute inset-0 flex items-center">
                    <span class="w-full border-t" />
                </div>
                <div class="relative flex justify-center text-xs uppercase">
                    <span class="bg-white dark:bg-zinc-950 px-2 text-muted-foreground">Ou continuer avec</span>
                </div>
            </div>
             <p>
                Vous n'avez pas de compte ? 
                <a href="#" class="underline hover:text-primary underline-offset-4">Contactez l'admin</a>
            </p>
        </CardFooter>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
