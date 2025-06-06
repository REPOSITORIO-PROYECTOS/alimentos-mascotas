import {
    BoltIcon,
    BookOpenIcon,
    CircleUserRoundIcon,
    Layers2Icon,
    LogOutIcon,
    PhoneCall,
    UserCircle2Icon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/context/store";
import Link from "next/link";

export default function UserButton() {
    const { user, logout } = useAuthStore();

    const handleLogout = () => {
        logout();
    };

    if (!user) {
        return null; // No mostrar el botón si no hay usuario
    }
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    size="icon"
                    variant="outline"
                    aria-label="Open account menu"
                >
                    <CircleUserRoundIcon size={16} aria-hidden="true" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="max-w-xs w-full">
                <DropdownMenuLabel className="flex items-center gap-3">
                    <UserCircle2Icon size={32} aria-hidden="true" />
                    {user && (
                        <div className="flex min-w-0 flex-col">
                            <span className="text-foreground truncate text-sm font-medium">
                                {user.name || "K. Kennedy"}
                            </span>
                            <span className="text-muted-foreground truncate text-xs font-normal">
                                {user.username || "k.kennedy@originui.com"}
                            </span>
                        </div>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    {user?.roles.includes("ROLE_ADMIN") && (
                        <>
                            <DropdownMenuItem asChild>
                                <Link href="/admin">
                                    <BoltIcon
                                        size={16}
                                        className="opacity-60"
                                        aria-hidden="true"
                                    />
                                    <span>Panel de administración</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="#Manual">
                                    <BookOpenIcon
                                        size={16}
                                        className="opacity-60"
                                        aria-hidden="true"
                                    />
                                    <span>Manual de usuario</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="#Soporte">
                                    <PhoneCall
                                        size={16}
                                        className="opacity-60"
                                        aria-hidden="true"
                                    />
                                    <span>Soporte</span>
                                </Link>
                            </DropdownMenuItem>
                        </>
                    )}
                    {
                        <DropdownMenuItem asChild>
                            <Link href="/products">
                                <Layers2Icon
                                    size={16}
                                    className="opacity-60"
                                    aria-hidden="true"
                                />
                                <span>Ver productos</span>
                            </Link>
                        </DropdownMenuItem>
                    }
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 hover:bg-red-100 focus:bg-red-100"
                >
                    <LogOutIcon
                        size={16}
                        className="opacity-60"
                        aria-hidden="true"
                    />
                    <span>Cerrar sesión</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
