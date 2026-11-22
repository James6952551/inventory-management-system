import { Modal } from "@/components/Modal";
import React, { useState } from "react";
import { CategoryWithRelations } from "./category-view";

interface CategoryTableProps {
    categories: CategoryWithRelations[];
    onUpdate: (id: string, name: string) => Promise<{ success: boolean; error?: string }>;
    onDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export default function CategoryTable({ categories, onUpdate, onDelete } : CategoryTableProps) {
        const [isModalOpen, setIsModalOpen] = useState(false)

        const [isUpdating, setIsUpdating] = useState(false)
        
        const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

        const [isDeleting, setIsDeleting] = useState(false)

        const [error, setErrorMessage] = useState<string | undefined>("")
    
        const [editingCategory, setEditingCategory] = useState<{ id:string, name:string }>({ id: '', name: '' })
        
        const [deletingCategoryId, setDeletingCategoryId] = useState<string>('')

        function handleModalOpen(id: string, name: string) {
            setIsModalOpen(true)
            setEditingCategory({ id, name })
        }

        function handleDeleteModalOpen(id: string) {
            setIsDeleteModalOpen(true)
            setDeletingCategoryId(id)
        }
        
        async function handleUpdate(event: React.SyntheticEvent<HTMLFormElement>) {
            event.preventDefault()
            setIsUpdating(true)

            const result = await onUpdate(editingCategory.id, editingCategory.name)

            if (!result.success) {
                console.error(result.error)
                setErrorMessage(result.error)
            }

            setIsModalOpen(false)
            setIsUpdating(false)
        }

        async function handleDelete() {
            setIsDeleting(true)

            const result = await onDelete(deletingCategoryId)

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
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400 tracking-wide">Category</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400 tracking-wide">Qty</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400 tracking-wide">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {categories && categories.map((category, index) => (
                    <tr key={category.id}>
                        <td className="px-4 py-2 text-sm">{ index + 1 }</td>
                        <td className="px-4 py-2 text-sm">{ category.name }</td>
                        <td className="px-4 py-2 text-sm">{ category.products.length}</td>
                        <td className="px-4 py-2 text-sm space-x-6">
                            <button 
                                onClick={() => handleModalOpen(category.id, category.name)}
                                className="text-xs text-blue-400 tracking-wide hover:underline cursor-pointer"
                            >
                                Edit
                            </button>
                            <button 
                                onClick={(e) => handleDeleteModalOpen(category.id)}
                                className="text-xs text-slate-400 tracking-wide hover:underline cursor-pointer"
                            >
                                Delete
                            </button>
                        </td>
                    </tr>
                    ))}
                    
                </tbody>
            </table>

            {/* Modal for updating category */}
            <Modal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Edit Category"
            >
                <form 
                    onSubmit={handleUpdate} 
                    className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Category Name
                        </label>
                        <input
                            type="text"
                            value={editingCategory?.name}
                            onChange={(e) => setEditingCategory({...editingCategory, name: e.currentTarget.value})}
                            required
                            placeholder="e.g. Electronics, Footwear"
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

            {/* Confirmation modal for deleting category */}
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