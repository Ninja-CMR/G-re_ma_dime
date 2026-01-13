<script setup lang="ts">
import { ref, reactive } from 'vue'
import DashboardLayout from '@/components/DashboardLayout.vue'
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardFooter,
  Button, 
  Input, 
  Label, 
  Separator, 
  Switch,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge
} from '@/components/ui'
import { 
  User, 
  Church, 
  Users, 
  Lock, 
  Bell, 
  Globe, 
  Camera,
  ShieldCheck,
  Smartphone,
  CheckCircle2,
  Save,
  LogOut
} from 'lucide-vue-next'
import { useChurchStore } from '@/stores/churchStore'
import { useAuthStore } from '@/stores/authStore'

const churchStore = useChurchStore()
const authStore = useAuthStore()

// Success message state (Simple toast alternative)
const showSuccessToast = ref(false)
const toastMessage = ref('')

const triggerToast = (message: string) => {
    toastMessage.value = message
    showSuccessToast.value = true
    setTimeout(() => {
        showSuccessToast.value = false
    }, 3000)
}

// Local form states
const adminForm = reactive({
    name: authStore.user?.name || 'Admin',
    email: authStore.user?.email || 'admin@geremadime.cm'
})

const churchForm = reactive({ ...churchStore.churchInfo })

const securityForm = reactive({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
})

const notifications = reactive({
    emailReports: true,
    smsAlerts: false,
    newMemberAlerts: true
})

// Actions
const handleSaveProfile = () => {
    triggerToast('Profil mis à jour avec succès !')
}

const handleSaveChurch = () => {
    churchStore.updateChurchInfo(churchForm)
    triggerToast('Informations de l\'église enregistrées !')
}

const handleSaveSecurity = () => {
    if (securityForm.newPassword !== securityForm.confirmPassword) {
        alert('Les mots de passe ne correspondent pas.')
        return
    }
    triggerToast('Mot de passe modifié avec succès !')
    securityForm.currentPassword = ''
    securityForm.newPassword = ''
    securityForm.confirmPassword = ''
}

const handleUpdateTribeManager = (tribe: string, manager: string) => {
    churchStore.updateTribeManager(tribe, manager)
    triggerToast(`Responsable de la tribu ${tribe} mis à jour.`)
}

const handleLogoutDevices = () => {
    triggerToast('Toutes les autres sessions ont été déconnectées.')
}

</script>

<template>
  <DashboardLayout>
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold tracking-tight text-gray-900 font-display">Paramètres</h1>
          <p class="text-muted-foreground mt-1">
            Gérez votre compte, votre assemblée et vos préférences.
          </p>
        </div>
      </div>

      <!-- Success Toast -->
      <Transition
        enter-active-class="transform ease-out duration-300 transition"
        enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
        enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
        leave-active-class="transition ease-in duration-100"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-if="showSuccessToast" class="fixed top-6 right-6 z-50 flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg shadow-lg">
          <CheckCircle2 class="h-5 w-5 text-emerald-500" />
          <span class="font-medium text-sm">{{ toastMessage }}</span>
        </div>
      </Transition>

      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Vertical Tabs -->
        <Tabs default-value="profil" class="w-full">
          <div class="flex flex-col lg:flex-row gap-8">
            <aside class="lg:w-64">
              <TabsList class="flex flex-row lg:flex-col items-stretch lg:items-start h-auto w-full bg-transparent p-0 gap-1 overflow-x-auto">
                <TabsTrigger 
                    value="profil" 
                    class="justify-start gap-3 px-4 py-3 data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700 data-[state=active]:shadow-none hover:bg-gray-100 rounded-lg transition-all"
                >
                  <User class="h-4 w-4" />
                  Profil admin
                </TabsTrigger>
                <TabsTrigger 
                    value="eglise" 
                    class="justify-start gap-3 px-4 py-3 data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700 data-[state=active]:shadow-none hover:bg-gray-100 rounded-lg transition-all"
                >
                  <Church class="h-4 w-4" />
                  Église
                </TabsTrigger>
                <TabsTrigger 
                    value="tribus" 
                    class="justify-start gap-3 px-4 py-3 data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700 data-[state=active]:shadow-none hover:bg-gray-100 rounded-lg transition-all"
                >
                  <Users class="h-4 w-4" />
                  Tribus
                </TabsTrigger>
                <TabsTrigger 
                    value="securite" 
                    class="justify-start gap-3 px-4 py-3 data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700 data-[state=active]:shadow-none hover:bg-gray-100 rounded-lg transition-all"
                >
                  <Lock class="h-4 w-4" />
                  Sécurité
                </TabsTrigger>
              </TabsList>
            </aside>

            <div class="flex-1">
              <!-- Profil Tab -->
              <TabsContent value="profil">
                <Card class="border-none shadow-sm">
                  <CardHeader>
                    <h3 class="text-xl font-bold text-gray-900">Profil de l'administrateur</h3>
                    <p class="text-sm text-muted-foreground">Mettez à jour vos informations personnelles.</p>
                  </CardHeader>
                  <CardContent class="space-y-6">
                    <div class="flex items-center gap-6">
                      <div class="relative group">
                        <div class="h-24 w-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                          <User class="h-12 w-12 text-gray-400" />
                        </div>
                        <button class="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          <Camera class="h-6 w-6" />
                        </button>
                      </div>
                      <div class="space-y-1">
                        <h4 class="font-semibold text-gray-900">{{ adminForm.name }}</h4>
                        <p class="text-sm text-muted-foreground">Administrateur Principal</p>
                        <Button variant="outline" size="sm" class="mt-2 text-xs">Changer la photo</Button>
                      </div>
                    </div>

                    <Separator />

                    <div class="grid gap-4 sm:grid-cols-2">
                      <div class="space-y-2">
                        <Label for="admin-name">Nom complet</Label>
                        <Input id="admin-name" v-model="adminForm.name" placeholder="Votre nom" />
                      </div>
                      <div class="space-y-2">
                        <Label for="admin-email">Adresse e-mail</Label>
                        <Input id="admin-email" v-model="adminForm.email" type="email" placeholder="admin@example.com" />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter class="border-t border-gray-100 bg-gray-50/50 flex justify-end p-6">
                    <Button @click="handleSaveProfile" class="bg-amber-600 hover:bg-amber-700 gap-2">
                      <Save class="h-4 w-4" />
                      Enregistrer les modifications
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <!-- Eglise Tab -->
              <TabsContent value="eglise">
                <Card class="border-none shadow-sm">
                  <CardHeader>
                    <h3 class="text-xl font-bold text-gray-900">Informations de l'Église</h3>
                    <p class="text-sm text-muted-foreground">Ces informations apparaîtront sur les reçus et rapports.</p>
                  </CardHeader>
                  <CardContent class="space-y-6">
                    <div class="grid gap-4 sm:grid-cols-2">
                      <div class="space-y-2">
                        <Label for="church-name">Nom de l'église</Label>
                        <Input id="church-name" v-model="churchForm.name" />
                      </div>
                      <div class="space-y-2">
                        <Label for="church-currency">Devise par défaut</Label>
                        <Input id="church-currency" v-model="churchForm.currency" />
                      </div>
                      <div class="space-y-2 sm:col-span-2">
                        <Label for="church-address">Adresse physique</Label>
                        <Input id="church-address" v-model="churchForm.address" />
                      </div>
                      <div class="space-y-2">
                        <Label for="church-phone">Numéro de téléphone</Label>
                        <Input id="church-phone" v-model="churchForm.phone" />
                      </div>
                      <div class="space-y-2">
                        <Label for="church-email">Email de contact</Label>
                        <Input id="church-email" v-model="churchForm.email" />
                      </div>
                    </div>

                    <Separator />

                    <div class="space-y-4">
                      <h4 class="font-medium text-gray-900">Préférences</h4>
                      <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div class="space-y-0.5">
                          <Label class="text-base">Rapports par email</Label>
                          <p class="text-xs text-muted-foreground">Envoyer un résumé hebdomadaire par mail.</p>
                        </div>
                        <Switch v-model:checked="notifications.emailReports" />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter class="border-t border-gray-100 bg-gray-50/50 flex justify-end p-6">
                    <Button @click="handleSaveChurch" class="bg-amber-600 hover:bg-amber-700 gap-2">
                      <Save class="h-4 w-4" />
                      Mettre à jour l'église
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <!-- Tribus Tab -->
              <TabsContent value="tribus">
                <Card class="border-none shadow-sm">
                  <CardHeader>
                    <h3 class="text-xl font-bold text-gray-900">Gestion des Tribus</h3>
                    <p class="text-sm text-muted-foreground">Assignez des responsables pour chacune des 12 tribus.</p>
                  </CardHeader>
                  <CardContent>
                    <div class="rounded-md border border-gray-100">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Tribu</TableHead>
                            <TableHead>Responsable assigné</TableHead>
                            <TableHead class="text-right">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow v-for="tribu in churchStore.tribes" :key="tribu.tribe">
                            <TableCell class="font-medium">
                                <Badge variant="secondary" class="bg-amber-100 text-amber-700 border-none font-bold">
                                    {{ tribu.tribe }}
                                </Badge>
                            </TableCell>
                            <TableCell>
                              <Input 
                                v-model="tribu.managerName" 
                                class="h-8 max-w-[200px]" 
                                placeholder="Nom du responsable" 
                              />
                            </TableCell>
                            <TableCell class="text-right">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                @click="handleUpdateTribeManager(tribu.tribe, tribu.managerName)"
                                class="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                              >
                                Enregistrer
                              </Button>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <!-- Securite Tab -->
              <TabsContent value="securite">
                <div class="space-y-6">
                  <Card class="border-none shadow-sm">
                    <CardHeader>
                      <h3 class="text-xl font-bold text-gray-900">Changement de mot de passe</h3>
                      <p class="text-sm text-muted-foreground">Assurez la sécurité de votre compte administrateur.</p>
                    </CardHeader>
                    <CardContent class="space-y-4">
                      <div class="space-y-2">
                        <Label for="current-password">Mot de passe actuel</Label>
                        <Input id="current-password" v-model="securityForm.currentPassword" type="password" />
                      </div>
                      <div class="grid gap-4 sm:grid-cols-2">
                        <div class="space-y-2">
                          <Label for="new-password">Nouveau mot de passe</Label>
                          <Input id="new-password" v-model="securityForm.newPassword" type="password" />
                        </div>
                        <div class="space-y-2">
                          <Label for="confirm-password">Confirmer le mot de passe</Label>
                          <Input id="confirm-password" v-model="securityForm.confirmPassword" type="password" />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter class="border-t border-gray-100 bg-gray-50/50 flex justify-end p-6">
                      <Button @click="handleSaveSecurity" class="bg-amber-600 hover:bg-amber-700 gap-2">
                        <ShieldCheck class="h-4 w-4" />
                        Mettre à jour la sécurité
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card class="border-none shadow-sm border-l-4 border-l-rose-500">
                    <CardHeader>
                      <h3 class="text-xl font-bold text-gray-900">Sessions actives</h3>
                      <p class="text-sm text-muted-foreground">Aperçu de vos connexions récentes.</p>
                    </CardHeader>
                    <CardContent class="space-y-4">
                      <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div class="flex items-center gap-4">
                          <div class="p-2 bg-white rounded-md shadow-sm">
                            <Smartphone class="h-5 w-5 text-gray-500" />
                          </div>
                          <div>
                            <p class="text-sm font-semibold text-gray-900">iPhone 13 - Yaoundé, CM</p>
                            <p class="text-xs text-muted-foreground text-emerald-600 font-medium">Session actuelle</p>
                          </div>
                        </div>
                        <Badge class="bg-emerald-100 text-emerald-800 border-none">Actif</Badge>
                      </div>

                      <div class="flex items-center justify-between p-4 border border-gray-100 rounded-lg opacity-60">
                        <div class="flex items-center gap-4">
                          <div class="p-2 bg-gray-100 rounded-md">
                            <Globe class="h-5 w-5 text-gray-500" />
                          </div>
                          <div>
                            <p class="text-sm font-semibold text-gray-900">Chrome sur MacOS - Douala, CM</p>
                            <p class="text-xs text-muted-foreground">Il y a 2 heures</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" class="text-rose-600">Révoquer</Button>
                      </div>

                      <Separator />

                      <Button variant="ghost" @click="handleLogoutDevices" class="text-rose-600 hover:bg-rose-50 w-full justify-start gap-2">
                        <LogOut class="h-4 w-4" />
                        Déconnecter toutes les autres sessions
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  </DashboardLayout>
</template>

<style scoped>
.font-display {
    font-family: 'Inter', sans-serif;
}

/* Custom scrollbar for mobile tabs list */
::-webkit-scrollbar {
  height: 4px;
}
::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
</style>
