import Header from "@/components/Header";
import { statsHeaderItems } from "@/constants"
import { getStoreStocks } from "./actions";
import StockView from "./stock-view";
import { getSuppliers } from "../supplier/actions";
import { getProducts } from "../product/actions";
import { getCategories } from "../category/actions";
import { getStores } from "../store/actions";

export const instant = false;

export default async function ProductPage() {
    const storeStocks = await getStoreStocks()

    const products = await getProducts()

    const categories = await getCategories()

    const stores = await getStores()

    const suppliers = await getSuppliers()

    const stockConfig = statsHeaderItems.find(item => item.pageTitle === "Stock")

    // Safe fallback check in case the config is missing
    if (!stockConfig) {
        return <div>Configuration not found for Stock page.</div>
    }   

    return (
        <div className="bg-gray-50 w-full">
            {/* Header */}
            <Header />
            <StockView 
                storeStocks={storeStocks}
                products={products}
                categories={categories}
                stores={stores}
                suppliers={suppliers}
                stockConfig={stockConfig}   
            />
            
        </div>
    )
}
         
    
