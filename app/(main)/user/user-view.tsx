'use client';

import { Modal } from "@/components/Modal";
import StatsHeader from "@/components/StatsHeader";
import { useState } from "react";
import { deleteUser, getUsers, updateProfile } from "./actions";
import UserTable from "./user-table";

export type UserWithRelations = Awaited<ReturnType<typeof getUsers>>[number]

interface UserViewProps {
    users: UserWithRelations[],
    userConfig: { 
        pageTitle: string,
        buttonText: string,
        subline: string
    },
    stats: { 
        cardTitle: string,
        value: number | string,
        subline: string
    }[],
}

export default function StoreView({ 
    users, 
    userConfig, 
    stats
} : UserViewProps
) {
    const [isModalOpen, setIsModalOpen] = useState(false)

    const [searchKey, setSearchKey] = useState("")

    const [selectedRole, setSelectedRole] = useState("")

    const [showEntry, setShowEntry] = useState('10')
    
    const filteredRecords = () => {
        let roleFiltered: UserWithRelations[] = users

        // filter the records based on role
        if (selectedRole) {
            roleFiltered = users.filter((user) => {
                return user.profile?.role === selectedRole
            })
        }

        // filter the records based on search key
        const filtered = roleFiltered.filter((user) => {
            const lowerCaseName = user.name.toLowerCase()
            const lowerCaseSearchKey = searchKey.toLowerCase()
            return lowerCaseName.includes(lowerCaseSearchKey)
        })

        // restrict the entry number 
        const usersCopy = Array.from(filtered)
        usersCopy.length = Number(showEntry)

        return usersCopy
    }       

    return ( 
        <>
            {/* Stats Header */}
            <StatsHeader 
                pageTitle={userConfig?.pageTitle}
                subline={userConfig?.subline}
                stats={stats}
            />
            <div className="px-8">
                <div className="bg-white rounded-2xl p-6 shadow-sm space-y-2">
                        <div className="flex items-center justify-between">
                            <p className="font-bold tracking-wide">Workspace users</p>
                            <div className="flex items-center gap-6">
                                <input
                                    type="text"
                                    placeholder="Search user name"
                                    onChange={((e) => { setSearchKey(e.currentTarget.value) })}
                                    className="bg-slate-100 rounded-md py-2 px-4 focus:outline-none w-full sm:w-80 md:w-96 lg:w-[420px]"
                                />
                                <select 
                                    onChange={(e) => { setSelectedRole(e.currentTarget.value) }}
                                    className="p-2 rounded border border-gray-300 focus:outline-none focus:border-black w-full"
                                >
                                    <option value="">All roles</option>
                                    <option value="ADMIN">Admin</option>
                                    <option value="MANAGER">Manager</option>
                                    <option value="STAFF">Staff</option>
                                </select>
                                <p>
                                    Show 
                                    <input 
                                        type="number" 
                                        min="1" 
                                        defaultValue="10" 
                                        onChange={((e) => { setShowEntry(e.currentTarget.value) })}
                                        className="border border-gray-300 focus:outline-none focus:border-black w-16" 
                                    /> 
                                    entries
                                </p>
                                <p className="whitespace-nowrap">{users.length} items</p>
                            </div>
                        </div>
                        {/* Main table */}
                        <UserTable 
                            users={filteredRecords()}
                            onUpdate={updateProfile}
                            onDelete={deleteUser}
                        />                    
                </div>
            </div>        
        </>
    )
}