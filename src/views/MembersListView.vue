<script setup lang="ts">
import { ref, reactive , computed } from 'vue';
import DashboardLayout from '@/components/DashboardLayout.vue';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell, 
  Button, 
  Input, 
  Badge, 
  Select, 
  Dialog 
} from '@/components/ui';
import { useMemberStore } from '@/stores/memberStore';
import { Search, Filter, UserPlus, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-vue-next';
import { TRIBES, type Tribe } from '@/types';
import { format } from 'date-fns';
import { useRouter } from 'vue-router';

const memberStore = useMemberStore();
const router = useRouter();

const isAddModalOpen = ref(false);
const newMember = reactive({
  name: '',
  age: 18,
  gender: 'M' as 'M' | 'F',
  contact: '',
  tribe: 'Juda' as Tribe,
  joinedAt: format(new Date(), 'yyyy-MM-dd')
});

const handleAddMember = () => {
  if (!newMember.name || !newMember.contact) return;
  memberStore.addMember({ ...newMember });
  isAddModalOpen.value = false;
  // Reset
  newMember.name = '';
  newMember.contact = '';
};

const goToProfile = (id: string) => {
  router.push(`/members/${id}`);
};

const tribeOptions = [
  { label: 'Toutes les tribus', value: 'All' },
  ...TRIBES.map(t => ({ label: t, value: t }))
];

const itemsPerPageOptions = [
  { label: '5 par page', value: 5 },
  { label: '10 par page', value: 10 },
  { label: '20 par page', value: 20 },
  { label: '50 par page', value: 50 },
];

const paginationRange = computed(() => {
  const start = (memberStore.currentPage - 1) * memberStore.itemsPerPage + 1;
  const end = Math.min(memberStore.currentPage * memberStore.itemsPerPage, memberStore.filteredMembers.length);
  return { start, end, total: memberStore.filteredMembers.length };
});
</script>

<template>
  <DashboardLayout>
    <div class="space-y-6 md:space-y-8">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">Membres</h1>
          <p class="text-sm md:text-base text-muted-foreground mt-1">Gérez la liste des fidèles et leurs informations.</p>
        </div>
        <Button @click="isAddModalOpen = true" class="bg-amber-600 hover:bg-amber-700 w-full sm:w-auto">
          <UserPlus class="mr-2 h-4 w-4" />
          Nouveau Membre
        </Button>
      </div>

      <div class="flex flex-col lg:flex-row gap-4 lg:items-center justify-between bg-white p-4 rounded-xl shadow-sm">
        <div class="relative w-full lg:w-96">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            v-model="memberStore.searchQuery" 
            placeholder="Rechercher..." 
            class="pl-10 bg-gray-50/50" 
          />
        </div>
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
          <div class="flex items-center gap-2 text-sm text-gray-500 min-w-fit">
            <Filter class="h-4 w-4" />
            Tribu:
          </div>
          <Select 
            v-model="memberStore.tribeFilter" 
            :options="tribeOptions" 
            class="w-full sm:w-48 bg-gray-50/50"
          />
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div class="overflow-x-auto">
          <Table class="min-w-[600px]">
            <TableHeader>
              <TableRow class="bg-gray-50/50">
                <TableHead>Nom</TableHead>
                <TableHead>Tribu</TableHead>
                <TableHead class="hidden md:table-cell">Contact</TableHead>
                <TableHead class="hidden lg:table-cell">Adhésion</TableHead>
                <TableHead class="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow 
                v-for="member in memberStore.paginatedMembers" 
                :key="member.id"
                class="cursor-pointer hover:bg-amber-50/30 transition-colors text-sm"
                @click="goToProfile(member.id)"
              >
                <TableCell>
                  <div class="flex items-center gap-3">
                    <div class="h-8 w-8 shrink-0 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-xs uppercase">
                      {{ member.name.charAt(0) }}
                    </div>
                    <span class="font-semibold truncate max-w-[120px] md:max-w-none">{{ member.name }}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="gold">{{ member.tribe }}</Badge>
                </TableCell>
                <TableCell class="hidden md:table-cell text-gray-600">
                  {{ member.contact }}
                </TableCell>
                <TableCell class="hidden lg:table-cell text-gray-600">
                  {{ format(new Date(member.joinedAt), 'dd/MM/yyyy') }}
                </TableCell>
                <TableCell class="text-right">
                  <Button variant="ghost" size="sm" class="text-amber-600 text-xs">Détails</Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        <div v-if="memberStore.filteredMembers.length === 0" class="p-12 text-center text-muted-foreground">
          Aucun membre trouvé.
        </div>

        <!-- Pagination Footer -->
        <div v-if="memberStore.filteredMembers.length > 0" class="px-6 py-4 border-t border-gray-100 bg-gray-50/30 flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="text-sm text-gray-500">
            Affichage de <span class="font-medium text-gray-900">{{ paginationRange.start }}</span> à 
            <span class="font-medium text-gray-900">{{ paginationRange.end }}</span> sur 
            <span class="font-medium text-gray-900">{{ paginationRange.total }}</span> membres
          </div>

          <div class="flex flex-col sm:flex-row items-center gap-4">
            <div class="flex items-center gap-2">
              <span class="text-xs text-gray-500 whitespace-nowrap">Lignes par page:</span>
              <Select 
                v-model="memberStore.itemsPerPage" 
                :options="itemsPerPageOptions" 
                class="w-28 h-8 text-xs"
              />
            </div>

            <div class="flex items-center gap-1">
              <Button 
                variant="outline" 
                size="sm" 
                class="h-8 w-8 p-0" 
                :disabled="memberStore.currentPage === 1"
                @click="memberStore.currentPage = 1"
              >
                <ChevronsLeft class="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                class="h-8 w-8 p-0" 
                :disabled="memberStore.currentPage === 1"
                @click="memberStore.currentPage--"
              >
                <ChevronLeft class="h-4 w-4" />
              </Button>
              
              <div class="flex items-center px-2 text-sm font-medium text-gray-700">
                Page {{ memberStore.currentPage }} sur {{ memberStore.totalPages }}
              </div>

              <Button 
                variant="outline" 
                size="sm" 
                class="h-8 w-8 p-0" 
                :disabled="memberStore.currentPage === memberStore.totalPages"
                @click="memberStore.currentPage++"
              >
                <ChevronRight class="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                class="h-8 w-8 p-0" 
                :disabled="memberStore.currentPage === memberStore.totalPages"
                @click="memberStore.currentPage = memberStore.totalPages"
              >
                <ChevronsRight class="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Member Modal -->
    <Dialog 
      :open="isAddModalOpen" 
      @update:open="isAddModalOpen = $event"
      title="Ajouter un nouveau membre"
      description="Remplissez les informations ci-dessous pour enregistrer un nouveau membre de la communauté."
    >
      <div class="space-y-4 pt-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="name">Nom complet</Label>
            <Input id="name" v-model="newMember.name" placeholder="Ex: Jean Dupont" />
          </div>
          <div class="space-y-2">
            <Label for="contact">Contact / Téléphone</Label>
            <Input id="contact" v-model="newMember.contact" placeholder="+237 ..." />
          </div>
        </div>
        <div class="grid grid-cols-3 gap-4">
          <div class="space-y-2">
            <Label for="age">Âge</Label>
            <Input id="age" type="number" v-model="newMember.age" />
          </div>
          <div class="space-y-2">
            <Label for="gender">Sexe</Label>
            <Select 
              id="gender" 
              v-model="newMember.gender" 
              :options="[{label: 'Homme', value: 'M'}, {label: 'Femme', value: 'F'}]" 
            />
          </div>
          <div class="space-y-2">
            <Label for="tribe">Tribu</Label>
            <Select 
              id="tribe" 
              v-model="newMember.tribe" 
              :options="TRIBES.map(t => ({ label: t, value: t }))" 
            />
          </div>
        </div>
        <div class="space-y-2">
          <Label for="date">Date d'adhésion</Label>
          <Input id="date" type="date" v-model="newMember.joinedAt" />
        </div>
        <div class="pt-4 flex justify-end gap-3">
          <Button variant="outline" @click="isAddModalOpen = false">Annuler</Button>
          <Button class="bg-amber-600 hover:bg-amber-700" @click="handleAddMember">Enregistrer</Button>
        </div>
      </div>
    </Dialog>
  </DashboardLayout>
</template>
