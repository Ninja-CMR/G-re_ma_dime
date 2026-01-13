import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface TribeManager {
    tribe: string;
    managerName: string;
}

export const useChurchStore = defineStore('church', () => {
    const churchInfo = ref({
        name: 'Gère ma Dîme Centra',
        logo: '',
        currency: 'XAF',
        address: 'Yaoundé, Cameroun',
        phone: '+237 600 000 000',
        email: 'contact@geremadime.cm'
    });

    const tribes = ref<TribeManager[]>([
        { tribe: 'Juda', managerName: 'Jean Dupont' },
        { tribe: 'Benjamin', managerName: 'Marie Salla' },
        { tribe: 'Lévi', managerName: 'Paul Atangana' },
        { tribe: 'Ruben', managerName: 'Alice Ngo' },
        { tribe: 'Siméon', managerName: 'Bernard Tche' },
        { tribe: 'Zabulon', managerName: 'Catherine Mvogo' },
        { tribe: 'Issacar', managerName: 'Daniel Eboa' },
        { tribe: 'Dan', managerName: 'Esther Biloa' },
        { tribe: 'Gad', managerName: 'Fabrice Kengne' },
        { tribe: 'Aser', managerName: 'Gisèle Abena' },
        { tribe: 'Nephthali', managerName: 'Hervé Nana' },
        { tribe: 'Joseph', managerName: 'Irène Ngono' },
    ]);

    function updateChurchInfo(newInfo: Partial<typeof churchInfo.value>) {
        churchInfo.value = { ...churchInfo.value, ...newInfo };
    }

    function updateTribeManager(tribe: string, managerName: string) {
        const index = tribes.value.findIndex(t => t.tribe === tribe);
        if (index !== -1) {
            tribes.value[index].managerName = managerName;
        }
    }

    return {
        churchInfo,
        tribes,
        updateChurchInfo,
        updateTribeManager
    };
}, {
    persist: true
});
