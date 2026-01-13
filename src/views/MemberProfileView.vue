<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import DashboardLayout from '@/components/DashboardLayout.vue';
import { 
  Button, 
  Card, 
  CardHeader, 
  CardContent, 
  Badge, 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell, 
  Dialog, 
  Input, 
  Label 
} from '@/components/ui';
import { useMemberStore } from '@/stores/memberStore';
import { useTitheStore } from '@/stores/titheStore';
import { 
  ChevronLeft, 
  User, 
  Phone, 
  Calendar, 
  Gem, 
  PlusCircle, 
  History, 
  CheckCircle2 
} from 'lucide-vue-next';
import { format } from 'date-fns';

const route = useRoute();
const router = useRouter();
const memberStore = useMemberStore();
const titheStore = useTitheStore();

const memberId = route.params.id as string;
const member = computed(() => memberStore.getMemberById(memberId));
const titheHistory = computed(() => titheStore.getTithesByMemberId(memberId));

const isTitheModalOpen = ref(false);
const newTithe = ref({
  amount: 0,
  date: format(new Date(), 'yyyy-MM-dd')
});

const handleRegisterTithe = () => {
  if (newTithe.value.amount <= 0) return;
  titheStore.registerTithe({
    memberId: memberId,
    amount: Number(newTithe.value.amount),
    date: newTithe.value.date
  });
  isTitheModalOpen.value = false;
  newTithe.value.amount = 0;
};

const totalGiven = computed(() => {
  return titheHistory.value.reduce((sum, t) => Number(sum) + Number(t.amount), 0);
});

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    maximumFractionDigits: 0
  }).format(val);
};

if (!member.value) {
    router.push('/members');
}
</script>

<template>
  <DashboardLayout v-if="member">
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center gap-4">
        <div class="flex items-center gap-4">
          <Button variant="ghost" size="icon" @click="router.back()" class="rounded-full">
            <ChevronLeft class="h-5 w-5" />
          </Button>
          <div>
            <h1 class="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">{{ member.name }}</h1>
            <p class="text-sm text-muted-foreground">Historique des versements.</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Profile Info -->
        <Card class="lg:col-span-1 border-none shadow-sm h-fit">
          <CardHeader class="pb-2">
            <div class="h-20 w-20 md:h-24 md:w-24 rounded-full bg-amber-100 mx-auto flex items-center justify-center text-amber-700 text-2xl md:text-3xl font-bold border-4 border-white shadow-sm">
              {{ member.name.charAt(0) }}
            </div>
            <div class="text-center mt-4">
               <Badge variant="gold" class="px-4 py-1">{{ member.tribe }}</Badge>
            </div>
          </CardHeader>
          <CardContent class="space-y-4 pt-4">
            <div class="space-y-1">
              <p class="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Informations membres</p>
              <div class="flex items-center gap-3 py-2 border-b border-gray-50">
                <User class="h-4 w-4 text-gray-400" />
                <span class="text-sm">{{ member.age }} ans, {{ member.gender === 'M' ? 'Homme' : 'Femme' }}</span>
              </div>
              <div class="flex items-center gap-3 py-2 border-b border-gray-50">
                <Phone class="h-4 w-4 text-gray-400" />
                <span class="text-sm">{{ member.contact }}</span>
              </div>
              <div class="flex items-center gap-3 py-2 border-b border-gray-50">
                <Calendar class="h-4 w-4 text-gray-400" />
                <span class="text-sm">Inscrit le {{ format(new Date(member.joinedAt), 'dd/MM/yyyy') }}</span>
              </div>
            </div>

            <div class="bg-amber-50 rounded-xl p-4 mt-6">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-semibold text-amber-900 uppercase">Cumul des Dîmes</span>
                <Gem class="h-4 w-4 text-amber-600" />
              </div>
              <p class="text-2xl font-bold text-amber-700 tracking-tight">{{ formatCurrency(totalGiven) }}</p>
            </div>
          </CardContent>
        </Card>

        <!-- Tithe History -->
        <div class="lg:col-span-2 space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 class="text-xl font-bold flex items-center gap-2">
              <History class="h-5 w-5 text-amber-600" />
              Historique
            </h3>
            <Button @click="isTitheModalOpen = true" class="bg-amber-600 hover:bg-amber-700 shadow-sm w-full sm:w-auto">
              <PlusCircle class="mr-2 h-4 w-4" />
              Enregistrer une Dîme
            </Button>
          </div>

          <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="overflow-x-auto">
              <Table class="min-w-[400px]">
                <TableHeader>
                  <TableRow class="bg-gray-50/50">
                    <TableHead>Date</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="tithe in titheHistory" :key="tithe.id">
                    <TableCell class="font-medium text-sm">
                      {{ format(new Date(tithe.date), 'dd MMM yyyy') }}
                    </TableCell>
                    <TableCell class="font-bold text-gray-900">
                      {{ formatCurrency(tithe.amount) }}
                    </TableCell>
                    <TableCell>
                      <div class="flex items-center gap-2 text-emerald-600 text-xs font-semibold py-1 px-2 bg-emerald-50 rounded-full w-fit">
                        <CheckCircle2 class="h-3 w-3" />
                        Validé
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <div v-if="titheHistory.length === 0" class="p-12 text-center text-muted-foreground bg-gray-50/20">
              Aucune dîme enregistrée pour le moment.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Register Tithe Modal -->
    <Dialog 
      :open="isTitheModalOpen" 
      @update:open="isTitheModalOpen = $event"
      title="Enregistrer une dîme"
      description="Saisissez le montant et la date du versement pour ce membre."
    >
      <div class="space-y-4 pt-4">
        <div class="space-y-2">
          <Label for="amount">Montant (FCFA)</Label>
          <div class="relative">
             <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">F</span>
             <Input id="amount" type="number" v-model="newTithe.amount" class="pl-8 text-lg font-bold" />
          </div>
        </div>
        <div class="space-y-2">
          <Label for="date">Date du versement</Label>
          <Input id="date" type="date" v-model="newTithe.date" />
        </div>
        <div class="pt-4 flex justify-end gap-3">
          <Button variant="outline" @click="isTitheModalOpen = false">Annuler</Button>
          <Button class="bg-amber-600 hover:bg-amber-700" @click="handleRegisterTithe">Confirmer le versement</Button>
        </div>
      </div>
    </Dialog>
  </DashboardLayout>
</template>
