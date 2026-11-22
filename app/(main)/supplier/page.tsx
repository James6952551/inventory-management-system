import Header from "@/components/Header";
import { statsHeaderItems } from "@/constants"
import { getSuppliers } from "./actions";
import SupplyView from "./supplier-view";

export const instant = false;

export default async function CategoryPage() {
    const suppliers = await getSuppliers()

    const suppliersEithPhone = suppliers.filter((supplier) => {
        return supplier.phone
    })

    const supplierConfig = statsHeaderItems.find(item => item.pageTitle === "Supplier")

    // Safe fallback check in case the config is missing
    if (!supplierConfig) {
        return <div>Configuration not found for Supplier page.</div>
    }

    const stats = [
        { 
            cardTitle: 'Total Active Suppliers',
            value: suppliers.length,
            subline: 'Suppliers shown in this view'
        },
    ]

    

    return (
        <div className="bg-gray-50 w-full">
            {/* Header */}
            <Header />
            <SupplyView 
                suppliers={suppliers}
                supplierConfig={supplierConfig}   
                stats={stats} 
            />
            
        </div>
    )
}
         
    
