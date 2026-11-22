import NavigationBar from "@/components/NavigationBar";
import { navigationItems } from "@/constants";
import { RoleProvider } from "@/context/role-context";
import { Role } from "@/generated/prisma/enums";
import { auth } from "@/lib/auth";
import { authClient } from "@/lib/auth-client";
import { getUserRoleById } from "@/lib/auth-utils";
import { headers } from "next/headers";

export default async function MainLayout({ children }: { children: React.ReactNode }){
    //check if user is authenticated
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session?.user.id) { 
        return <div>Unauthorized</div>
    }

    const role = await getUserRoleById(session?.user.id) as Role

    return (
        <div className="flex min-h-screen w-full bg-gray-50">
            <RoleProvider role={role}>
                <NavigationBar role={role} />
                {children}
            </RoleProvider>
        </div>
    )
}