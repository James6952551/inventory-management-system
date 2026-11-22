import Header from "@/components/Header";
import { statsHeaderItems } from "@/constants"
import { getUsers } from "./actions";
import SupplyView from "./user-view";

export const instant = false;

export default async function UserPage() {
    const users = await getUsers()

    const admin = users.filter((user) => {
        return user.profile?.role === "ADMIN"
    })

    const userConfig = statsHeaderItems.find(item => item.pageTitle === "User")

    // Safe fallback check in case the config is missing
    if (!userConfig) {
        return <div>Configuration not found for User page.</div>
    }

    const stats = [
        { 
            cardTitle: 'Listed users',
            value: users.length,
            subline: 'Users shown in this view'
        },
        {
            cardTitle: 'Roles represented',
            value: 3,
            subline: 'Admin · Manager · Staff'
        },
        {
            cardTitle: 'Listed admins',
            value: admin.length,
            subline: `${admin[0].name} has the Admin role`
        }
    ]

    

    return (
        <div className="bg-gray-50 w-full">
            {/* Header */}
            <Header />
            <SupplyView 
                users={users}
                userConfig={userConfig}   
                stats={stats} 
            />
            
        </div>
    )
}
         
    
