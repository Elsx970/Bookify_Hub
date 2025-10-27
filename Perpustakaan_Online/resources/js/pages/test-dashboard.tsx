import { Head } from '@inertiajs/react';
import UserLayout from '@/layouts/user-layout';

export default function TestDashboard() {
    return (
        <>
            <Head title="Test Dashboard" />
            <UserLayout>
                <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
                    <div className="container mx-auto px-4 py-8">
                        <div className="text-center">
                            <h1 className="text-6xl font-bold mb-4 text-green-600">
                                ✅ SUCCESS!
                            </h1>
                            <h2 className="text-3xl font-bold mb-4">
                                User Layout (Navbar) Working!
                            </h2>
                            <p className="text-xl text-muted-foreground mb-8">
                                Jika Anda melihat NAVBAR di atas (bukan sidebar), berarti UserLayout sudah bekerja!
                            </p>
                            <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-500 rounded-lg p-8 max-w-2xl mx-auto">
                                <p className="text-lg mb-4">
                                    <strong>Yang harus Anda lihat:</strong>
                                </p>
                                <ul className="text-left space-y-2">
                                    <li>✅ Navbar horizontal di atas</li>
                                    <li>✅ Logo "Bookify Hub" di kiri</li>
                                    <li>✅ Menu: Home, Books, Favorites, My Reviews</li>
                                    <li>✅ Avatar user di kanan</li>
                                    <li>✅ Footer di bawah</li>
                                    <li>❌ TIDAK ADA sidebar "Platform"</li>
                                    <li>❌ TIDAK ADA menu "Repository", "Documentation"</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </UserLayout>
        </>
    );
}

