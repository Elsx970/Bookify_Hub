import { Head } from '@inertiajs/react';
import UserLayout from '@/layouts/user-layout';

export default function NavbarTest() {
    return (
        <>
            <Head title="Navbar Test" />
            <UserLayout>
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                    <div className="text-center space-y-6 p-12 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl">
                        <div className="text-8xl mb-4">✅</div>
                        <h1 className="text-5xl font-black text-green-600 dark:text-green-400 mb-4">
                            SUCCESS!
                        </h1>
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">
                            UserLayout (NAVBAR) is Working!
                        </h2>
                        
                        <div className="bg-green-100 dark:bg-green-900/30 border-4 border-green-500 rounded-xl p-8 text-left">
                            <p className="text-xl font-semibold mb-4 text-green-800 dark:text-green-200">
                                ✅ Yang HARUS Anda Lihat:
                            </p>
                            <ul className="space-y-3 text-lg text-gray-700 dark:text-gray-300">
                                <li className="flex items-start gap-3">
                                    <span className="text-green-600 font-bold">✓</span>
                                    <span><strong>NAVBAR</strong> horizontal di atas (bukan sidebar vertikal)</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-green-600 font-bold">✓</span>
                                    <span>Logo <strong>"Bookify Hub"</strong> di kiri navbar</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-green-600 font-bold">✓</span>
                                    <span>Menu: Home, Browse Books, My Favorites, My Reviews</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-green-600 font-bold">✓</span>
                                    <span>Avatar user (bulat) di kanan navbar</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-green-600 font-bold">✓</span>
                                    <span><strong>FOOTER</strong> di bawah halaman</span>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-red-100 dark:bg-red-900/30 border-4 border-red-500 rounded-xl p-8 text-left mt-6">
                            <p className="text-xl font-semibold mb-4 text-red-800 dark:text-red-200">
                                ❌ Yang TIDAK BOLEH Ada:
                            </p>
                            <ul className="space-y-3 text-lg text-gray-700 dark:text-gray-300">
                                <li className="flex items-start gap-3">
                                    <span className="text-red-600 font-bold">✗</span>
                                    <span>Sidebar di kiri dengan text "Laravel Starter Kit"</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-red-600 font-bold">✗</span>
                                    <span>Menu "Platform", "Dashboard", "Repository", "Documentation"</span>
                                </li>
                            </ul>
                        </div>

                        <div className="pt-6 text-sm text-gray-500 dark:text-gray-400">
                            <p>Halaman ini dibuat: {new Date().toLocaleString()}</p>
                            <p className="mt-2">URL: <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">/navbar-test</code></p>
                        </div>
                    </div>
                </div>
            </UserLayout>
        </>
    );
}

