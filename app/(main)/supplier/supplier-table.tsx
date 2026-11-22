import { Modal } from "@/components/Modal";
import { Supplier } from "@/generated/prisma/client"
import { SupplierInput } from "@/lib/validations";
import React, { useState } from "react";

interface SupplierTableProps {
    suppliers: Supplier[];
    onUpdate: (id: string, supplierInput: SupplierInput) => Promise<{ success: boolean; error?: string }>;
    onDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export default function SupplierTable({ suppliers, onUpdate, onDelete } : SupplierTableProps) {
        const [isModalOpen, setIsModalOpen] = useState(false)

        const [isUpdating, setIsUpdating] = useState(false)
        
        const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

        const [isDeleting, setIsDeleting] = useState(false)

        const [error, setErrorMessage] = useState<string | undefined>("")
    
        const [editingSupplier, setEditingSupplier] = useState<({id: string} & SupplierInput) | null>(null)
        
        const [deletingSupplierId, setDeletingSupplierId] = useState<string>('')

        function handleModalOpen(id: string, supplierInput: SupplierInput) {
            setIsModalOpen(true)
            setEditingSupplier({id, ...supplierInput})
        }

        function handleDeleteModalOpen(id: string) {
            setIsDeleteModalOpen(true)
            setDeletingSupplierId(id)
        }
        
        async function handleUpdate(event: React.SyntheticEvent<HTMLFormElement>) {
            event.preventDefault()

            if (!editingSupplier) {
                return 
            }    

            setIsUpdating(true)

            const supplierId = editingSupplier.id
            const supplierInput = {
                name: editingSupplier.name,
                contactEmail: editingSupplier.contactEmail,
                phone: editingSupplier.phone,
                address: editingSupplier.address
            }

            const result = await onUpdate(supplierId, supplierInput)

            if (!result.success) {
                console.error(result.error)
                setErrorMessage(result.error)
            }

            setIsModalOpen(false)
            setIsUpdating(false)
        }

        async function handleDelete() {
            setIsDeleting(true)

            const result = await onDelete(deletingSupplierId)

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
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400 tracking-wide">Supplier</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400 tracking-wide">Email</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400 tracking-wide">Phone</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400 tracking-wide">Address</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400 tracking-wide">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {suppliers && suppliers.map((supplier, index) => {
                        const supplierInput = {
                            name: supplier.name,
                            contactEmail: supplier.contactEmail,
                            phone: supplier.phone,
                            address: supplier.address
                        }

                        return (
                    <tr key={supplier.id}>
                        <td className="px-4 py-2 text-sm">{ index + 1 }</td>
                        <td className="px-4 py-2 text-sm">{ supplier.name }</td>
                        <td className="px-4 py-2 text-sm">{ supplier.contactEmail }</td>
                        <td className="px-4 py-2 text-sm">{ supplier.phone }</td>
                        <td className="px-4 py-2 text-sm">{ supplier.address }</td>
                        <td className="px-4 py-2 text-sm space-x-6">
                            <button 
                                onClick={() => handleModalOpen(supplier.id, supplierInput)}
                                className="text-xs text-blue-400 tracking-wide hover:underline cursor-pointer"
                            >
                                Edit
                            </button>
                            <button 
                                onClick={(e) => handleDeleteModalOpen(supplier.id)}
                                className="text-xs text-slate-400 tracking-wide hover:underline cursor-pointer"
                            >
                                Delete
                            </button>
                        </td>
                    </tr>
                    )})}
                    
                </tbody>
            </table>

            {/* Modal for updating supplier */}
            <Modal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Edit Category"
            >
                <form 
                    onSubmit={handleUpdate} 
                    className="space-y-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Supplier Name
                        </label>
                        <input
                            type="text"
                            value={editingSupplier?.name ?? ''}
                            onChange={(e) => {
                                const name = e.currentTarget.value
                                setEditingSupplier(prev => prev ? { ...prev, name } : null)
                            }}
                            required
                            placeholder="e.g. Electronics, Footwear"
                            className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:border-black"
                        />
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Contact Email
                        </label>
                        <input
                            type="text"
                            name="contactEmail"
                            value={editingSupplier?.contactEmail ?? ''}
                            onChange={(e) => {
                                const contactEmail = e.currentTarget.value
                                setEditingSupplier(prev => prev ? { ...prev, contactEmail } : null)
                            }}
                            required
                            className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:border-black"
                        /><label className="block text-sm font-medium text-slate-700 mb-1">
                            Phone (Optional)
                        </label>
                        <input
                            type="text"
                            name="phone"
                            value={editingSupplier?.phone ?? ''}
                            onChange={(e) => {
                                const phone = e.currentTarget.value
                                setEditingSupplier(prev => prev ? { ...prev, phone } : null)
                            }}
                            className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:border-black"
                        /><label className="block text-sm font-medium text-slate-700 mb-1">
                            Address (Optional)
                        </label>
                        <input
                            type="text"
                            name="address"
                            value={editingSupplier?.address ?? ''}
                            onChange={(e) => {
                                const address = e.currentTarget.value
                                setEditingSupplier(prev => prev ? { ...prev, address } : null)
                            }}
                            className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:border-black"
                        />
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

            {/* Confirmation modal for deleting supplier */}
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