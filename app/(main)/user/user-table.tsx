import { Modal } from "@/components/Modal";
import { ProfileInput, StoreInput } from "@/lib/validations";
import React, { useState } from "react";
import { UserWithRelations } from "./user-view";
import { roles } from "@/constants";

interface UserTableProps {
    users: UserWithRelations[];
    onUpdate: (id: string, profileInput: ProfileInput) => Promise<{ success: boolean; error?: string }>;
    onDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export default function StoreTable({ 
    users, 
    onUpdate, 
    onDelete 
} : UserTableProps
) {
        const [isModalOpen, setIsModalOpen] = useState(false)

        const [isUpdating, setIsUpdating] = useState(false)
        
        const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

        const [isDeleting, setIsDeleting] = useState(false)

        const [error, setErrorMessage] = useState<string | undefined>("")
    
        const [editingProfile, setEditingProfile] = useState<({id: string} & ProfileInput) | null>(null)
        
        const [deletingUserId, setDeletingUserId] = useState<string>('')

        function handleModalOpen(id: string, profileInput: ProfileInput) {
            setIsModalOpen(true)
            setEditingProfile({id, ...profileInput})
        }

        function handleDeleteModalOpen(id: string) {
            setIsDeleteModalOpen(true)
            setDeletingUserId(id)
        }
        
        async function handleUpdate(event: React.SyntheticEvent<HTMLFormElement>) {
            event.preventDefault()

            if (!editingProfile) {
                return 
            }    

            setIsUpdating(true)

            const userId = editingProfile.id
            const profileInput = {
                name: editingProfile.name,
                role: editingProfile.role,
                department: editingProfile.department
            }

            const result = await onUpdate(userId, profileInput)

            if (!result.success) {
                console.error(result.error)
                setErrorMessage(result.error)
            }

            setIsModalOpen(false)
            setIsUpdating(false)
        }

        async function handleDelete() {
            setIsDeleting(true)

            const result = await onDelete(deletingUserId)

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
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400 tracking-wide">User</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400 tracking-wide">Role</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400 tracking-wide">Department</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400 tracking-wide">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {users && users.map((user, index) => {
                        const profileInput: ProfileInput = {
                            name: user.name,
                            role: user.profile?.role as "ADMIN" | "MANAGER" | "STAFF",
                            department: user.profile?.department
                        }

                        return (
                    <tr key={user.id}>
                        <td className="px-4 py-2 text-sm">{ index + 1 }</td>
                        <td className="px-4 py-2 text-sm">{ user.name }</td>
                        <td className="px-4 py-2 text-sm">{ user.profile?.role }</td>
                        <td className="px-4 py-2 text-sm">{ user.profile?.department }</td>
                        <td className="px-4 py-2 text-sm space-x-6">
                            <button 
                                onClick={() => handleModalOpen(user.id, profileInput)}
                                className="text-xs text-blue-400 tracking-wide hover:underline cursor-pointer"
                            >
                                Edit
                            </button>
                            <button 
                                onClick={(e) => handleDeleteModalOpen(user.id)}
                                className="text-xs text-slate-400 tracking-wide hover:underline cursor-pointer"
                            >
                                Delete
                            </button>
                        </td>
                    </tr>
                    )})}
                    
                </tbody>
            </table>

            {/* Modal for updating profile */}
            <Modal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Edit Profile"
            >
                <form 
                    onSubmit={handleUpdate} 
                    className="space-y-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            User Name
                        </label>
                        <div className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:border-black">
                            {editingProfile?.name}
                        </div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Role
                        </label>
                        <select
                            value={editingProfile?.role ?? ''}
                            onChange={(e) => {
                                const role = e.currentTarget.value as "ADMIN" | "MANAGER" | "STAFF"
                                setEditingProfile(prev => prev ? { ...prev, role} : null)
                            }}
                            required
                            className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:border-black"
                        >
                            {roles && roles.map((role) => (
                                <option 
                                    key={role}
                                    value={role}
                                >
                                    {role}
                                </option>
                            ))}
                        </select>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Department
                        </label>
                        <input
                            type="text"
                            name="department"
                            value={editingProfile?.department ?? ''}
                            onChange={(e) => {
                                const department = e.currentTarget.value
                                setEditingProfile(prev => prev ? { ...prev, department } : null)
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

            {/* Confirmation modal for deleting user */}
            <Modal 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Delete Store"
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