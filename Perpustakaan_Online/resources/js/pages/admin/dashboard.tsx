import { Head, Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Book, Users, Star, Heart, Plus, Edit, Trash2, BarChart3, ArrowRight, BookOpen, FileText } from 'lucide-react';
import AdminLayout from '@/layouts/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

interface StatsData {
    totalStats: {
        books: number;
        users: number;
        reviews: number;
        favorites: number;
    };
}

export default function AdminDashboard() {
    const { auth } = usePage().props as any;
    const [stats, setStats] = useState<StatsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (auth.user?.role !== 'admin') {
            toast.error('Access denied. Admin only.');
            return;
        }
        fetchStats();
    }, [auth.user?.role]);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/admin/dashboard', { credentials: 'include' });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
            toast.error('Failed to load dashboard data. Please try again.');
            // Set default data to prevent blank screen
            setStats({
                totalStats: {
                    books: 0,
                    users: 0,
                    reviews: 0,
                    favorites: 0,
                },
            });
        } finally {
            setLoading(false);
        }
    };

    if (auth.user?.role !== 'admin') {
        return (
            <AdminLayout>
                <Head title="Access Denied" />
                <div className="container mx-auto px-4 py-12 text-center">
                    <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
                    <p className="text-muted-foreground">You don't have permission to access this page.</p>
                </div>
            </AdminLayout>
        );
    }

    return (
        <>
            <Head title="Admin Dashboard" />
            <AdminLayout>
                <div className="min-h-screen">
                    <div className="container mx-auto px-4 py-8 max-w-7xl">
                        {/* Header */}
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8"
                        >
                            <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
                            <p className="text-muted-foreground text-lg">
                                Manage your library and monitor activity
                            </p>
                        </motion.div>

                        {/* Main Management Cards */}
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
                            {/* Books Management - PRIMARY */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 }}
                                className="lg:col-span-2"
                            >
                                <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-200/50 dark:border-blue-800/50 hover:shadow-xl transition-shadow h-full">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="text-2xl mb-2">📚 Books Management</CardTitle>
                                                <p className="text-sm text-muted-foreground">
                                                    Add, edit, and manage all books in the library
                                                </p>
                                            </div>
                                            <div className="p-3 bg-blue-500/20 rounded-full">
                                                <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="text-center p-4 bg-background/50 rounded-lg">
                                                <div className="text-3xl font-bold text-blue-600">
                                                    {loading ? '...' : stats?.totalStats.books || 0}
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-1">Total Books</div>
                                            </div>
                                            <div className="text-center p-4 bg-background/50 rounded-lg">
                                                <div className="text-3xl font-bold text-purple-600">
                                                    {loading ? '...' : stats?.totalStats.reviews || 0}
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-1">Reviews</div>
                                            </div>
                                            <div className="text-center p-4 bg-background/50 rounded-lg">
                                                <div className="text-3xl font-bold text-pink-600">
                                                    {loading ? '...' : stats?.totalStats.favorites || 0}
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-1">Favorites</div>
                                            </div>
                                        </div>

                                        <div className="flex gap-3 pt-4">
                                            <Link href="/admin/books" className="flex-1">
                                                <Button className="w-full gap-2" size="lg">
                                                    <Book className="h-5 w-5" />
                                                    View All Books
                                                    <ArrowRight className="h-4 w-4 ml-auto" />
                                                </Button>
                                            </Link>
                                            <Link href="/admin/books/create">
                                                <Button size="lg" variant="outline" className="gap-2">
                                                    <Plus className="h-5 w-5" />
                                                    Add New
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* Analytics Card */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-200/50 dark:border-purple-800/50 hover:shadow-xl transition-shadow h-full">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="text-xl mb-2">📊 Analytics</CardTitle>
                                                <p className="text-sm text-muted-foreground">
                                                    View detailed statistics
                                                </p>
                                            </div>
                                            <div className="p-3 bg-purple-500/20 rounded-full">
                                                <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                                                <span className="text-sm font-medium">Total Users</span>
                                                <span className="text-lg font-bold text-purple-600">
                                                    {loading ? '...' : stats?.totalStats.users || 0}
                                                </span>
                                            </div>
                                            <Link href="/admin/analytics">
                                                <Button variant="outline" className="w-full gap-2">
                                                    View Full Analytics
                                                    <ArrowRight className="h-4 w-4 ml-auto" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>

                        {/* Quick Actions */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <Link href="/admin/books/create">
                                    <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                                        <CardContent className="p-6 text-center">
                                            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                                                <Plus className="h-6 w-6 text-green-600" />
                                            </div>
                                            <h3 className="font-semibold mb-1">Add New Book</h3>
                                            <p className="text-xs text-muted-foreground">Upload and create a new book entry</p>
                                        </CardContent>
                                    </Card>
                                </Link>

                                <Link href="/admin/books">
                                    <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                                        <CardContent className="p-6 text-center">
                                            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                                                <Edit className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <h3 className="font-semibold mb-1">Edit Books</h3>
                                            <p className="text-xs text-muted-foreground">Update existing book information</p>
                                        </CardContent>
                                    </Card>
                                </Link>

                                <Link href="/admin/books">
                                    <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                                        <CardContent className="p-6 text-center">
                                            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                                                <Trash2 className="h-6 w-6 text-red-600" />
                                            </div>
                                            <h3 className="font-semibold mb-1">Manage Books</h3>
                                            <p className="text-xs text-muted-foreground">View, edit, or delete books</p>
                                        </CardContent>
                                    </Card>
                                </Link>

                                <Link href="/admin/reviews">
                                    <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                                        <CardContent className="p-6 text-center">
                                            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-yellow-500/10 flex items-center justify-center group-hover:bg-yellow-500/20 transition-colors">
                                                <FileText className="h-6 w-6 text-yellow-600" />
                                            </div>
                                            <h3 className="font-semibold mb-1">Manage Reviews</h3>
                                            <p className="text-xs text-muted-foreground">Monitor and moderate reviews</p>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </div>
                        </motion.div>

                        {/* Info Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="mt-8"
                        >
                            <Card className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-primary/10 rounded-full">
                                            <Book className="h-6 w-6 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold mb-1">Welcome to Admin Panel</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Manage your entire book library from here. Add new books, edit existing ones, and monitor user activity.
                                            </p>
                                        </div>
                                        <Link href="/admin/books">
                                            <Button>
                                                Get Started
                                                <ArrowRight className="h-4 w-4 ml-2" />
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </AdminLayout>
        </>
    );
}
