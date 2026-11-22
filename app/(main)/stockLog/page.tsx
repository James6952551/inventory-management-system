import Header from "@/components/Header";
import { statsHeaderItems } from "@/constants"
import StockLogView from "./stockLog-view";
import { getSuppliers } from "../supplier/actions";
import { getProducts } from "../product/actions";
import { getCategories } from "../category/actions";
import { getStores } from "../store/actions";
import { getStockLogs } from "./actions";

export const instant = false;

export default async function ProductPage() {
    const stockLogs = await getStockLogs()

    const categories = await getCategories()

    const stores = await getStores()

    const totalInbound = stockLogs.reduce((totalValue, currentValue) => {
        if (currentValue.reason === "RESTOCK") {
            return totalValue + currentValue.changeAmount
        }
        return totalValue
    }, 0)

    const totalOutbound = stockLogs.reduce((totalValue, currentValue) => {
        if (currentValue.reason === "SALE") {
            return totalValue + currentValue.changeAmount
        }
        return totalValue
    }, 0)

    const stockLogConfig = statsHeaderItems.find(item => item.pageTitle === "Stock Log")

    // Safe fallback check in case the config is missing
    if (!stockLogConfig) {
        return <div>Configuration not found for Stock Log page.</div>
    }   

    const stats = [
        { 
            cardTitle: 'Total Logged Events',
            value: stockLogs.length,
            subline: 'Entries shown in this view'
        },
        {
            cardTitle: 'Inbound Units',
            value: `+${totalInbound}`,
            subline: 'Total positive stock added this period'
        },
        {
            cardTitle: 'Outbound Units',
            value: `${totalOutbound}`,
            subline: 'Total negative stock sold'
        }
    ]

    return (
        <div className="bg-gray-50 w-full">
            {/* Header */}
            <Header />
            <StockLogView 
                stockLogs={stockLogs}
                categories={categories}
                stores={stores}
                stockLogConfig={stockLogConfig} 
                stats={stats}  
            />
            
        </div>
    )
}
         
    
