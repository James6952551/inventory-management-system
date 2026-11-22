import { Modal } from "@/components/Modal";
import { Category, Store, Supplier } from "@/generated/prisma/client";
import { logReasons } from "@/constants";
import { StockLogWithRelations } from "./stockLog-view";

interface StockLogTableProps {
    stockLogs: StockLogWithRelations[];
    categories: Category[];
    stores: Store[],
}

export default function StockLogTable({ 
    stockLogs, 
    categories,
    stores
} : StockLogTableProps
) {
    return ( 
        <>
            {/* Table displaying data */}
            <table className="w-full">
                <thead className="bg-slate-100">
                    <tr>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400 tracking-wide w-1/12">No</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400 tracking-wide">Product</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400 tracking-wide">SKU</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400 tracking-wide">Category</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400 tracking-wide">Store</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400 tracking-wide">Qty</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400 tracking-wide">Total Price</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400 tracking-wide">Reason</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400 tracking-wide">Notes</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400 tracking-wide">Time</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400 tracking-wide">Date</th>
                    </tr>
                </thead>
                <tbody>
                    {stockLogs && stockLogs.map((stockLog, index) => {         
                        const category = categories.find((category) => {
                            return category.id === stockLog.product.categoryId
                        }) 
                        
                        const store = stores.find((store) => {
                            return store.id === stockLog.storeId
                        }) 

                        const totalPrice = (Math.abs(stockLog.changeAmount * stockLog.product.sellingPrice)).toFixed(2)
                        
                        const time = stockLog.createdAt.toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                        });
                        
                        const date = new Date(stockLog.createdAt)

                        return (
                    <tr key={stockLog.id}>
                        <td className="px-4 py-2 text-sm">{ index + 1 }</td>
                        <td className="px-4 py-2 text-sm">{ stockLog.product.name }</td>
                        <td className="px-4 py-2 text-sm">{ stockLog.product.sku }</td>
                        <td className="px-4 py-2 text-sm">{ category?.name }</td>
                        <td className="px-4 py-2 text-sm">{ store?.name }</td>
                        <td className="px-4 py-2 text-sm">{ stockLog.changeAmount }</td>
                        <td className="px-4 py-2 text-sm">${ totalPrice }</td>
                        <td className="px-4 py-2 text-sm">{ stockLog.reason }</td>
                        <td className="px-4 py-2 text-sm">{ stockLog.notes }</td>
                        <td className="px-4 py-2 text-sm">{ time }</td>
                        <td className="px-4 py-2 text-sm">{ date.toLocaleDateString() }</td>
                    </tr>
                    )})}
                    
                </tbody>
            </table>
        </>
    )
}