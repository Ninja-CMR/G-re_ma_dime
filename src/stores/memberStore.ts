import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import type { Member } from '../types';
import { supabase } from '../lib/supabase';

const INITIAL_MEMBERS: Member[] = [
    { id: '1', name: 'Jean Dupont', age: 45, gender: 'M', contact: '+237 600000001', monthlyTarget: 50000, joinedAt: '2025-01-10' },
    { id: '2', name: 'Marie Salla', age: 32, gender: 'F', contact: '+237 600000002', monthlyTarget: 75000, joinedAt: '2025-02-15' },
    { id: '3', name: 'Paul Atangana', age: 28, gender: 'M', contact: '+237 600000003', monthlyTarget: 30000, joinedAt: '2025-03-01' },
    { id: '4', name: 'Alice Ngo', age: 24, gender: 'F', contact: '+237 600000004', monthlyTarget: 25000, joinedAt: '2025-03-05' },
    { id: '5', name: 'Bernard Tche', age: 50, gender: 'M', contact: '+237 600000005', monthlyTarget: 100000, joinedAt: '2025-03-10' },
    { id: '6', name: 'Catherine Mvogo', age: 35, gender: 'F', contact: '+237 600000006', monthlyTarget: 40000, joinedAt: '2025-03-15' },
    { id: '7', name: 'Daniel Eboa', age: 41, gender: 'M', contact: '+237 600000007', monthlyTarget: 60000, joinedAt: '2025-03-20' },
    { id: '8', name: 'Esther Biloa', age: 29, gender: 'F', contact: '+237 600000008', monthlyTarget: 35000, joinedAt: '2025-03-25' },
    { id: '9', name: 'Fabrice Kengne', age: 33, gender: 'M', contact: '+237 600000009', monthlyTarget: 55000, joinedAt: '2025-03-30' },
    { id: '10', name: 'Gisèle Abena', age: 27, gender: 'F', contact: '+237 600000010', monthlyTarget: 45000, joinedAt: '2025-04-01' },
];

export const useMemberStore = defineStore('member', () => {
    // Check version for reset
    const APP_VERSION = '2.0';
    const storedVersion = localStorage.getItem('app_version');

    if (storedVersion !== APP_VERSION) {
        localStorage.clear();
        localStorage.setItem('app_version', APP_VERSION);
    }

    const members = ref<Member[]>([]);
    const loading = ref(false);

    async function fetchMembers() {
        loading.value = true;
        try {
            const { data, error } = await supabase
                .from('members')
                .select('*')
                .order('name');

            if (error) throw error;

            if (data && data.length > 0) {
                // Map snake_case from DB to camelCase for app
                members.value = data.map((m: any) => ({
                    id: m.id,
                    name: m.name,
                    age: m.age,
                    gender: m.gender,
                    contact: m.contact,
                    monthlyTarget: m.monthly_target,
                    joinedAt: m.joined_at
                }));
            } else {
                members.value = [];
            }
        } catch (error) {
            console.error('Error fetching members:', error);
        } finally {
            loading.value = false;
        }
    }

    async function seedInitialMembers() {
        loading.value = true;
        try {
            const membersToInsert = INITIAL_MEMBERS.map(m => ({
                id: m.id,
                name: m.name,
                age: m.age,
                gender: m.gender,
                contact: m.contact,
                monthly_target: m.monthlyTarget,
                joined_at: m.joinedAt
            }));

            const { error } = await supabase
                .from('members')
                .insert(membersToInsert);

            if (error) throw error;
            await fetchMembers();
        } catch (error) {
            console.error('Error seeding members:', error);
        } finally {
            loading.value = false;
        }
    }

    async function resetToInitialMembers() {
        loading.value = true;
        try {
            const { error: deleteError } = await supabase
                .from('members')
                .delete()
                .neq('id', '0'); // Delete all

            if (deleteError) throw deleteError;
            await seedInitialMembers();
        } catch (error) {
            console.error('Error resetting members:', error);
        } finally {
            loading.value = false;
        }
    }

    const searchQuery = ref('');
    const currentPage = ref(1);
    const itemsPerPage = ref(10);

    const filteredMembers = computed(() => {
        return members.value.filter(member => {
            return member.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                member.contact.includes(searchQuery.value);
        });
    });

    const paginatedMembers = computed(() => {
        const start = (currentPage.value - 1) * itemsPerPage.value;
        const end = start + itemsPerPage.value;
        return filteredMembers.value.slice(start, end);
    });

    const totalPages = computed(() => Math.ceil(filteredMembers.value.length / itemsPerPage.value));

    function resetPagination() {
        currentPage.value = 1;
    }

    watch([searchQuery, itemsPerPage], () => {
        resetPagination();
    });

    async function addMember(member: Omit<Member, 'id'>) {
        const id = Math.random().toString(36).substring(2, 9);
        const newMember = { ...member, id };

        try {
            const { error } = await supabase
                .from('members')
                .insert({
                    id,
                    name: member.name,
                    age: member.age,
                    gender: member.gender,
                    contact: member.contact,
                    monthly_target: member.monthlyTarget,
                    joined_at: member.joinedAt
                });

            if (error) throw error;
            members.value.push(newMember);
        } catch (error) {
            console.error('Error adding member:', error);
        }

        return newMember;
    }

    function getMemberById(id: string) {
        return members.value.find(m => m.id === id);
    }

    return {
        members,
        loading,
        searchQuery,
        currentPage,
        itemsPerPage,
        filteredMembers,
        paginatedMembers,
        totalPages,
        fetchMembers,
        addMember,
        getMemberById,
        resetPagination,
        resetToInitialMembers,
    };
}, {
    persist: true
});
