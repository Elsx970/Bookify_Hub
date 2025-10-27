import { Link, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import { BookOpen, Heart, LayoutGrid, MessageSquare, Search, Settings, User, LogOut, Menu, X, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AppLogo from '@/components/app-logo';
import { motion, AnimatePresence } from 'framer-motion';

export default function UserLayout({ children }: { children: React.ReactNode }) {
    const { auth } = usePage().props as any;
    const user = auth.user;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = [
        { name: 'Home', href: '/dashboard', icon: Home },
        { name: 'Browse Books', href: '/books', icon: BookOpen },
        { name: 'My Favorites', href: '/favorites', icon: Heart },
        { name: 'My Reviews', href: '/my-reviews', icon: MessageSquare },
    ];

    const userMenuItems = [
        { name: 'My Profile', href: '/profile/dashboard', icon: User },
        { name: 'Settings', href: '/settings/profile', icon: Settings },
    ];

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Modern Navbar */}
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                className="sticky top-0 z-50 w-full bg-gradient-to-r from-slate-900/95 via-purple-900/95 to-slate-900/95 backdrop-blur-md border-b border-purple-500/20 shadow-lg shadow-purple-500/10"
            >
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    {/* Logo & Brand */}
                    <Link href="/dashboard" className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/50">
                            <BookOpen className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
                                Bookify Hub
                            </span>
                            <p className="text-xs text-purple-300">Discover Your Next Great Read</p>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-purple-100 hover:bg-purple-500/20 hover:text-white transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/20"
                            >
                                <item.icon className="h-4 w-4" />
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {/* User Menu */}
                    <div className="hidden md:flex items-center gap-3">
                        <Link href="/books">
                            <Button variant="ghost" size="icon" className="text-purple-100 hover:bg-purple-500/20 hover:text-white">
                                <Search className="h-5 w-5" />
                            </Button>
                        </Link>
                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 overflow-hidden">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center ring-2 ring-purple-400/50 hover:ring-purple-300 transition-all hover:scale-110">
                                            <User className="h-5 w-5 text-white" />
                                        </div>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56 bg-slate-900 border-purple-500/30" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none text-white">{user.name}</p>
                                            <p className="text-xs leading-none text-purple-300">
                                                {user.email}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-purple-500/20" />
                                    {userMenuItems.map((item) => (
                                        <DropdownMenuItem key={item.name} asChild>
                                            <Link href={item.href} className="flex items-center text-purple-100 focus:bg-purple-500/20">
                                                <item.icon className="mr-2 h-4 w-4" />
                                                <span>{item.name}</span>
                                            </Link>
                                        </DropdownMenuItem>
                                    ))}
                                    <DropdownMenuSeparator className="bg-purple-500/20" />
                                    <DropdownMenuItem onClick={handleLogout} className="flex items-center text-red-400 focus:text-red-300 focus:bg-red-500/20">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Log out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Link href="/login">
                                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                                    Login
                                </Button>
                            </Link>
                        )}
                    </div>

                    {/* Mobile Nav Toggle */}
                    <div className="md:hidden flex items-center">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-purple-100 hover:bg-purple-500/20"
                        >
                            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </Button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="md:hidden bg-slate-900/95 border-t border-purple-500/20"
                        >
                            <div className="flex flex-col p-4 space-y-2">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className="flex items-center gap-3 px-3 py-3 text-base font-medium text-purple-100 hover:text-white hover:bg-purple-500/20 rounded-lg"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <item.icon className="h-5 w-5" />
                                        {item.name}
                                    </Link>
                                ))}
                                {user && (
                                    <>
                                        <div className="border-t border-purple-500/20 my-2"></div>
                                        <div className="px-3 py-2">
                                            <p className="text-sm font-medium text-white">{user.name}</p>
                                            <p className="text-xs text-purple-300">{user.email}</p>
                                        </div>
                                        {userMenuItems.map((item) => (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                className="flex items-center gap-3 px-3 py-2 text-sm text-purple-100 hover:text-white hover:bg-purple-500/20 rounded-lg"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                <item.icon className="h-4 w-4" />
                                                {item.name}
                                            </Link>
                                        ))}
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg w-full text-left"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            Log out
                                        </button>
                                    </>
                                )}
                                {!user && (
                                    <Link href="/login">
                                        <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                                            Login
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.nav>

            {/* Main Content */}
            <main className="flex-1">
                {children}
            </main>

            {/* Modern Footer */}
            <footer className="bg-slate-900/50 border-t border-purple-500/20 py-8 backdrop-blur-sm">
                <div className="container mx-auto px-4 max-w-7xl text-purple-200 text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                        <div>
                            <Link href="/" className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                                    <BookOpen className="h-6 w-6 text-white" />
                                </div>
                                <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
                                    Bookify Hub
                                </span>
                            </Link>
                            <p className="text-purple-300">Your ultimate destination for discovering and reviewing books.</p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
                            <ul className="space-y-2">
                                <li><Link href="/books" className="text-purple-300 hover:text-purple-100 transition-colors">Browse Books</Link></li>
                                <li><Link href="/favorites" className="text-purple-300 hover:text-purple-100 transition-colors">My Favorites</Link></li>
                                <li><Link href="/my-reviews" className="text-purple-300 hover:text-purple-100 transition-colors">My Reviews</Link></li>
                                <li><Link href="/profile/dashboard" className="text-purple-300 hover:text-purple-100 transition-colors">My Profile</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-4">Company</h3>
                            <ul className="space-y-2">
                                <li><Link href="/about" className="text-purple-300 hover:text-purple-100 transition-colors">About Us</Link></li>
                                <li><Link href="/contact" className="text-purple-300 hover:text-purple-100 transition-colors">Contact</Link></li>
                                <li><Link href="/privacy" className="text-purple-300 hover:text-purple-100 transition-colors">Privacy Policy</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="text-center border-t border-purple-500/20 pt-6 mt-6 text-purple-300">
                        &copy; {new Date().getFullYear()} Bookify Hub. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
