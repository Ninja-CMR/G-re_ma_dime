import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import type { Member, Tribe } from '../types';

export const useMemberStore = defineStore('member', () => {
    const members = ref<Member[]>([
        { id: '1', name: 'Jean Dupont', age: 45, gender: 'M', contact: '+237 600000001', tribe: 'Juda', joinedAt: '2025-01-10' },
        { id: '2', name: 'Marie Salla', age: 32, gender: 'F', contact: '+237 600000002', tribe: 'Benjamin', joinedAt: '2025-02-15' },
        { id: '3', name: 'Paul Atangana', age: 28, gender: 'M', contact: '+237 600000003', tribe: 'Lévi', joinedAt: '2025-03-01' },
        { id: '4', name: 'Alice Ngo', age: 24, gender: 'F', contact: '+237 600000004', tribe: 'Ruben', joinedAt: '2025-03-05' },
        { id: '5', name: 'Bernard Tche', age: 50, gender: 'M', contact: '+237 600000005', tribe: 'Siméon', joinedAt: '2025-03-10' },
        { id: '6', name: 'Catherine Mvogo', age: 35, gender: 'F', contact: '+237 600000006', tribe: 'Zabulon', joinedAt: '2025-03-15' },
        { id: '7', name: 'Daniel Eboa', age: 41, gender: 'M', contact: '+237 600000007', tribe: 'Issacar', joinedAt: '2025-03-20' },
        { id: '8', name: 'Esther Biloa', age: 29, gender: 'F', contact: '+237 600000008', tribe: 'Dan', joinedAt: '2025-03-25' },
        { id: '9', name: 'Fabrice Kengne', age: 33, gender: 'M', contact: '+237 600000009', tribe: 'Gad', joinedAt: '2025-03-30' },
        { id: '10', name: 'Gisèle Abena', age: 27, gender: 'F', contact: '+237 600000010', tribe: 'Aser', joinedAt: '2025-04-01' },
        { id: '11', name: 'Hervé Nana', age: 38, gender: 'M', contact: '+237 600000011', tribe: 'Nephthali', joinedAt: '2025-04-05' },
        { id: '12', name: 'Irène Ngono', age: 45, gender: 'F', contact: '+237 600000012', tribe: 'Joseph', joinedAt: '2025-04-10' },
        { id: '13', name: 'Joseph Mballa', age: 55, gender: 'M', contact: '+237 600000013', tribe: 'Joseph', joinedAt: '2025-04-15' },
        { id: '14', name: 'Kévin Foko', age: 22, gender: 'M', contact: '+237 600000014', tribe: 'Benjamin', joinedAt: '2025-04-20' },
        { id: '15', name: 'Léa Bella', age: 31, gender: 'F', contact: '+237 600000015', tribe: 'Juda', joinedAt: '2025-04-25' },
    ]);

    const searchQuery = ref('');
    const tribeFilter = ref<Tribe | 'All'>('All');
    const currentPage = ref(1);
    const itemsPerPage = ref(10);

    const filteredMembers = computed(() => {
        return members.value.filter(member => {
            const matchesSearch = member.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                member.contact.includes(searchQuery.value);
            const matchesTribe = tribeFilter.value === 'All' || member.tribe === tribeFilter.value;
            return matchesSearch && matchesTribe;
        });
    });

    const paginatedMembers = computed(() => {
        const start = (currentPage.value - 1) * itemsPerPage.value;
        const end = start + itemsPerPage.value;
        return filteredMembers.value.slice(start, end);
    });

    const totalPages = computed(() => Math.ceil(filteredMembers.value.length / itemsPerPage.value));

    // Reset pagination when filters change
    function resetPagination() {
        currentPage.value = 1;
    }

    // Watch for filter changes to reset page
    watch([searchQuery, tribeFilter, itemsPerPage], () => {
        resetPagination();
    });

    function addMember(member: Omit<Member, 'id'>) {
        const newMember = {
            ...member,
            id: Math.random().toString(36).substring(2, 9),
        };
        members.value.push(newMember);
        return newMember;
    }

    function getMemberById(id: string) {
        return members.value.find(m => m.id === id);
    }

    return {
        members,
        searchQuery,
        tribeFilter,
        currentPage,
        itemsPerPage,
        filteredMembers,
        paginatedMembers,
        totalPages,
        addMember,
        getMemberById,
        resetPagination,
    };
}, {
    persist: true
});
