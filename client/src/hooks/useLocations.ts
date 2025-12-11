import { useDistrict } from './useDistrict';
import { useTribute } from './useTribute';

export const useLocations = () => {
    const district = useDistrict();
    const tribute = useTribute();

    return {
        districts: district.districts,
        tributes: tribute.tributes,
        
        loading: district.isLoading || tribute.isLoading,
        
        createDistrict: district.createDistrict,
        updateDistrict: district.updateDistrict,
        deleteDistrict: district.deleteDistrict,
        

        createTribute: tribute.createTribute,
        updateTribute: tribute.updateTribute,
        deleteTribute: tribute.deleteTribute,
        
        getDistrictName: (id: number) => 
            district.districts.find(d => d.id === id)?.name || '',
        
        getTributeName: (id: number) => 
            tribute.tributes.find(t => t.id === id)?.name || '',
    };
};