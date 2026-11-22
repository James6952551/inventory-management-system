import Header from "@/components/Header";
import { statsHeaderItems } from "@/constants"
import { getProducts } from "./actions";
import SupplyView from "./product-view";
import { getCategories } from "../category/actions";
import { getSuppliers } from "../supplier/actions";

export const instant = false;

export default async function ProductPage() {
    const products = await getProducts()

    const categories = await getCategories()

    const suppliers = await getSuppliers()

    const suppliersEithPhone = products.filter((product) => {
        return product.name
    })

    const productConfig = statsHeaderItems.find(item => item.pageTitle === "Product")

    // Safe fallback check in case the config is missing
    if (!productConfig) {
        return <div>Configuration not found for Product page.</div>
    }

    const stats = [
        { 
            cardTitle: 'Listed products',
            value: products.length,
            subline: 'Products shown in this view'
        },
        {
            cardTitle: 'Categories represented',
            value: categories.length,
            subline: 'Available categories'
        },
        {
            cardTitle: 'Suppliers represented',
            value: suppliers.length,
            subline: 'Across the listed products'
        }
    ]

    

    return (
        <div className="bg-gray-50 w-full">
            {/* Header */}
            <Header />
            <SupplyView 
                products={products}
                categories={categories}
                suppliers={suppliers}
                productConfig={productConfig}   
                stats={stats} 
            />
            
        </div>
    )
}
         
    
