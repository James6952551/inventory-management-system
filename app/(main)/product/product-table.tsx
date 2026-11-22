import { Modal } from "@/components/Modal";
import { ProductInput } from "@/lib/validations";
import React, { useState } from "react";
import { ProductWithRelations } from "./product-view";
import { Category, Supplier } from "@/generated/prisma/client";

interface ProductTableProps {
    products: ProductWithRelations[];
    categories: Category[];
    suppliers: Supplier[];
    onUpdate: (id: string, productInput: ProductInput) => Promise<{ success: boolean; error?: string }>;
    onDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export default function ProductTable({ products, categories, suppliers, onUpdate, onDelete } : ProductTableProps) {
        const [isModalOpen, setIsModalOpen] = useState(false)

        const [isUpdating, setIsUpdating] = useState(false)
        
        const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

        const [isDeleting, setIsDeleting] = useState(false)

        const [error, setErrorMessage] = useState<string | undefined>("")
    
        const [editingProduct, setEditingProduct] = useState<({id: string} & ProductInput) | null>(null)
        
        const [deletingProductId, setDeletingProductId] = useState<string>('')

        function handleModalOpen(id: string, productInput: ProductInput) {
            setIsModalOpen(true)
            setEditingProduct({id, ...productInput})
        }

        function handleDeleteModalOpen(id: string) {
            setIsDeleteModalOpen(true)
            setDeletingProductId(id)
        }
        
        async function handleUpdate(event: React.SyntheticEvent<HTMLFormElement>) {
            event.preventDefault()

            if (!editingProduct) {
                return 
            }    

            setIsUpdating(true)

            const productId = editingProduct.id
            const productInput = {
                name: editingProduct.name,
                sku: editingProduct.sku,
                costPrice: editingProduct.costPrice,
                sellingPrice: editingProduct.sellingPrice,
                categoryId: editingProduct.categoryId,
                supplierId: editingProduct.supplierId
            }

            const result = await onUpdate(productId, productInput)

            if (!result.success) {
                console.error(result.error)
                setErrorMessage(result.error)
            }

            setIsModalOpen(false)
            setIsUpdating(false)
        }

        async function handleDelete() {
            setIsDeleting(true)

            const result = await onDelete(deletingProductId)

            if (!result.success) {
                console.error(result.error)
                setErrorMessage(result.error)
            }

            setIsDeleteModalOpen(false)
            setIsDeleting(false)
        }

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
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400 tracking-wide">Cost Price</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400 tracking-wide">Selling Price</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400 tracking-wide">Supplier</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400 tracking-wide">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {products && products.map((product, index) => {
                        const productInput = {
                            name: product.name,
                            sku: product.sku,
                            costPrice: product.costPrice,
                            sellingPrice: product.sellingPrice,
                            categoryId: product.categoryId,
                            supplierId: product.supplierId
                            }

                        return (
                    <tr key={product.id}>
                        <td className="px-4 py-2 text-sm">{ index + 1 }</td>
                        <td className="px-4 py-2 text-sm">{ product.name }</td>
                        <td className="px-4 py-2 text-sm">{ product.sku }</td>
                        <td className="px-4 py-2 text-sm">{ product.category.name }</td>
                        <td className="px-4 py-2 text-sm">${ product.costPrice.toFixed(2) }</td>
                        <td className="px-4 py-2 text-sm">${ product.sellingPrice.toFixed(2) }</td>
                        <td className="px-4 py-2 text-sm">{ product.supplier.name }</td>
                        <td className="px-4 py-2 text-sm space-x-6">
                            <button 
                                onClick={() => handleModalOpen(product.id, productInput)}
                                className="text-xs text-blue-400 tracking-wide hover:underline cursor-pointer"
                            >
                                Edit
                            </button>
                            <button 
                                onClick={(e) => handleDeleteModalOpen(product.id)}
                                className="text-xs text-slate-400 tracking-wide hover:underline cursor-pointer"
                            >
                                Delete
                            </button>
                        </td>
                    </tr>
                    )})}
                    
                </tbody>
            </table>

            {/* Modal for updating product */}
            <Modal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Edit Product"
            >
                <form 
                    onSubmit={handleUpdate} 
                    className="space-y-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Product Name
                        </label>
                        <input
                            type="text"
                            value={editingProduct?.name ?? ''}
                            onChange={(e) => {
                                const name = e.currentTarget.value
                                setEditingProduct(prev => prev ? { ...prev, name } : null)
                            }}
                            required
                            placeholder="e.g. Electronics, Footwear"
                            className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:border-black"
                        />
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            SKU
                        </label>
                        <input
                            type="text"
                            name="contactEmail"
                            value={editingProduct?.sku ?? ''}
                            onChange={(e) => {
                                const sku = e.currentTarget.value
                                setEditingProduct(prev => prev ? { ...prev, sku } : null)
                            }}
                            required
                            className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:border-black"
                        />
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Category
                        </label>
                        <select
                            value={editingProduct?.categoryId ?? ''}
                            onChange={(e) => {
                                const categoryId = e.currentTarget.value
                                setEditingProduct(prev => prev ? { ...prev, categoryId } : null)
                            }}
                            required
                            className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:border-black"
                        >
                            {categories && categories.map((category) => (
                                <option 
                                    key={category.id}
                                    value={category.id}>{category.name}</option>
                            ))}
                        </select>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Cost Price
                        </label>
                        <input
                            type="number"
                            name="costPrice"
                            step="0.01"
                            value={editingProduct?.costPrice.toFixed(2) ?? ''}
                            onChange={(e) => {
                                const costPrice = Number(e.currentTarget.value)
                                setEditingProduct(prev => prev ? { ...prev, costPrice } : null)
                            }}
                            required
                            className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:border-black"
                        />
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Selling Price
                        </label>
                        <input
                            type="number"
                            name="sellingPrice"
                            step="0.01"
                            value={editingProduct?.sellingPrice.toFixed(2) ?? ''}
                            onChange={(e) => {
                                const sellingPrice = Number(e.currentTarget.value)
                                setEditingProduct(prev => prev ? { ...prev, sellingPrice } : null)
                            }}
                            required
                            className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:border-black"
                        />
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Supplier
                        </label>
                        <select
                            value={editingProduct?.supplierId ?? ''}
                            onChange={(e) => {
                                const supplierId = e.currentTarget.value
                                setEditingProduct(prev => prev ? { ...prev, supplierId } : null)
                            }}
                            required
                            className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:border-black"
                        >
                            {suppliers && suppliers.map((supplier) => (
                                <option 
                                    key={supplier.id}
                                    value={supplier.id}>{supplier.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isUpdating}
                            className="px-4 py-2 text-sm font-medium bg-blue-700 text-white rounded-lg hover:bg-blue-800 disabled:opacity-50"
                        >
                            {isUpdating? 'Saving...': 'Save Changes'}
                        </button>
                        {error && (
                            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md">
                                {error}
                            </div>
                        )}
                    </div>
                </form>
            </Modal>

            {/* Confirmation modal for deleting product */}
            <Modal 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Delete Category"
            >
                <div className="space-y-4">
                    <div>
                        <p>Are you sure you want to delete ?</p>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={isDeleting}
                            onClick={handleDelete}
                            className="px-4 py-2 text-sm font-medium bg-red-700 text-white rounded-lg hover:bg-red-800 disabled:opacity-50"
                        >
                            {isDeleting? 'Deleting...': 'Delete'}
                        </button>
                        {error && (
                            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md">
                                {error}
                            </div>
                        )}
                    </div>
                </div>
            </Modal>
        </>
    )
}