import Header from "@/components/Header";
import { statsHeaderItems } from "@/constants"
import { getStores } from "./actions";
import SupplyView from "./store-view";

export const instant = false;

export default async function CategoryPage() {
    const stores = await getStores()

    const storesWithAddress = stores.filter((store) => {
        return store.address
    })

    const storeConfig = statsHeaderItems.find(item => item.pageTitle === "Store")

    // Safe fallback check in case the config is missing
    if (!storeConfig) {
        return <div>Configuration not found for Store page.</div>
    }

    const stats = [
        { 
            cardTitle: 'Total Active Locations',
            value: stores.length,
            subline: 'Stores shown in this view'
        },
        {
            cardTitle: 'Primary Hub',
            value: stores[0].name,
            subline: 'Main warehouse'
        },
    ]

    

    return (
        <div className="bg-gray-50 w-full">
            {/* Header */}
            <Header />
            <SupplyView 
                stores={stores}
                storeConfig={storeConfig}   
                stats={stats} 
            />
            
        </div>
    )
}
         
    
