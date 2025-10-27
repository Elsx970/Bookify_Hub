import { BookOpen } from 'lucide-react';
import { home } from '@/routes';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 md:p-10">
            <div className="w-full max-w-md">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col items-center gap-6">
                        <Link
                            href={home()}
                            className="flex flex-col items-center gap-3 font-medium group"
                        >
                            {/* Logo Icon */}
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-2xl shadow-purple-500/50 group-hover:shadow-purple-500/70 transition-all group-hover:scale-110">
                                    <BookOpen className="h-8 w-8 text-white" />
                                </div>
                            </div>
                            
                            {/* Logo Text */}
                            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent group-hover:from-purple-300 group-hover:via-pink-300 group-hover:to-purple-300 transition-all">
                                Bookify Hub
                            </span>
                        </Link>

                        <div className="space-y-2 text-center">
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 text-transparent bg-clip-text">{title}</h1>
                            <p className="text-center text-sm text-purple-300">
                                {description}
                            </p>
                        </div>
                    </div>
                    <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-lg shadow-2xl shadow-purple-500/10 p-6">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
