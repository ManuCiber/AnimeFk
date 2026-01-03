'use client'
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { Button } from "./ui/button";
import { Home, PlusCircle } from "lucide-react";
import Link from "next/link";
import SearchBar from "./SearchBar";
import { useState } from "react";

export default async function Header() {

    const [showCreatedBoard, setShowCreateBoard] = useState(false)
    const {user, isLoaded} = useUser()
    
    if(!isLoaded) return null
    
    return (
    <header className="sticky top-0 z-50 bg-background border-b shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 max-w-500 mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">P</span>
          </div>
          <span className="text-xl font-bold text-primary hidden sm:inline">
            Pinterest
          </span>
        </Link>

        {/* Navegación */}
        {user && (
          <nav className="hidden md:flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/" className="flex items-center gap-2">
                <Home className="w-5 h-5" />
                <span className="hidden lg:inline">Inicio</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/create" className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5" />
                <span className="hidden lg:inline">Crear</span>
              </Link>
            </Button>
          </nav>
        )}

        {/* Búsqueda */}
        <div className="flex-1 max-w-3xl mx-4 hidden md:block">
          <SearchBar />
        </div>

        {/* Usuario */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Button variant="ghost" size="icon" asChild className="md:hidden">
                <Link href="/create">
                  <PlusCircle className="w-6 h-6" />
                </Link>
              </Button>
              <Button variant="ghost" asChild className="hidden md:flex">
                <Link href={`/profile/${user.id}`}>
                  {user.firstName || 'Perfil'}
                </Link>
              </Button>
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10"
                  }
                }}
              />
            </>
          ) : (
            <SignInButton mode="modal">
              <Button>Iniciar sesión</Button>
            </SignInButton>
          )}
        </div>
      </div>

      {/* Búsqueda móvil */}
      <div className="md:hidden px-4 pb-3">
        <SearchBar />
      </div>
    </header>
  )
}
