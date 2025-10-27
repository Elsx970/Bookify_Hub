import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Star, Book } from 'lucide-react';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { toast } from 'react-toastify';

// Register Chart.js components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

interface AnalyticsData {
    totalStats: {
        books: number;
        users: number;
        reviews: number;
        favorites: number;
    };
    genreDistribution: { genre: string; count: number }[];
    topRatedBooks: { title: string; rating: number; review_count: number }[];
    mostReviewedBooks: { title: string; review_count: number; rating: number }[];
    recentActivity: { date: string; books_added: number }[];
}

export default function AdminAnalytics() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/admin/dashboard', { credentials: 'include' });
            if (!response.ok) throw new Error('Failed to fetch analytics');
            const result = await response.json();
            setData(result);
        } catch (error) {
            console.error('Error fetching analytics:', error);
            toast.error('Failed to load analytics data');
            // Fallback data
            setData({
                totalStats: { books: 0, users: 0, reviews: 0, favorites: 0 },
                genreDistribution: [],
                topRatedBooks: [],
                mostReviewedBooks: [],
                recentActivity: [],
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="container mx-auto px-4 py-6">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 bg-muted rounded w-1/3" />
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-32 bg-muted rounded" />
                            ))}
                        </div>
                        <div className="grid gap-6 md:grid-cols-2">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-80 bg-muted rounded" />
                            ))}
                        </div>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    // Genre Distribution Chart Data
    const genreChartData = {
        labels: data?.genreDistribution.slice(0, 8).map((g) => g.genre) || [],
        datasets: [
            {
                label: 'Books by Genre',
                data: data?.genreDistribution.slice(0, 8).map((g) => g.count) || [],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 206, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(153, 102, 255, 0.8)',
                    'rgba(255, 159, 64, 0.8)',
                    'rgba(199, 199, 199, 0.8)',
                    'rgba(83, 102, 255, 0.8)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(199, 199, 199, 1)',
                    'rgba(83, 102, 255, 1)',
                ],
                borderWidth: 2,
            },
        ],
    };

    // Top Rated Books Chart Data
    const topRatedChartData = {
        labels: data?.topRatedBooks.slice(0, 10).map((b) => b.title.substring(0, 20) + '...') || [],
        datasets: [
            {
                label: 'Rating',
                data: data?.topRatedBooks.slice(0, 10).map((b) => b.rating) || [],
                backgroundColor: 'rgba(75, 192, 192, 0.8)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
            },
        ],
    };

    // Most Reviewed Books Chart Data
    const mostReviewedChartData = {
        labels: data?.mostReviewedBooks.slice(0, 10).map((b) => b.title.substring(0, 20) + '...') || [],
        datasets: [
            {
                label: 'Review Count',
                data: data?.mostReviewedBooks.slice(0, 10).map((b) => b.review_count) || [],
                backgroundColor: 'rgba(153, 102, 255, 0.8)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 2,
            },
        ],
    };

    // Recent Activity Chart Data (last 30 days)
    const activityChartData = {
        labels: data?.recentActivity.map((a) => a.date) || [],
        datasets: [
            {
                label: 'Books Added',
                data: data?.recentActivity.map((a) => a.books_added) || [],
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                tension: 0.4,
                fill: true,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top' as const,
            },
        },
    };

    return (
        <>
            <Head title="Analytics - Admin" />
            <AdminLayout>
                <div className="container mx-auto px-4 py-6 max-w-7xl">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <BarChart3 className="h-8 w-8 text-primary" />
                            Analytics Dashboard
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Comprehensive insights into your library's performance
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Books</CardTitle>
                                <Book className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{data?.totalStats.books || 0}</div>
                                <p className="text-xs text-muted-foreground">In library catalog</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                                <Star className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{data?.totalStats.reviews || 0}</div>
                                <p className="text-xs text-muted-foreground">User feedback</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{data?.totalStats.users || 0}</div>
                                <p className="text-xs text-muted-foreground">Registered members</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Favorites</CardTitle>
                                <Star className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{data?.totalStats.favorites || 0}</div>
                                <p className="text-xs text-muted-foreground">Books wishlisted</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Charts */}
                    <div className="grid gap-6 md:grid-cols-2 mb-6">
                        {/* Genre Distribution */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Popular Genres</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-80">
                                    <Doughnut data={genreChartData} options={chartOptions} />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Activity */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Books Added (Last 30 Days)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-80">
                                    <Line data={activityChartData} options={chartOptions} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Bar Charts */}
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Top Rated Books */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Top Rated Books</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-80">
                                    <Bar data={topRatedChartData} options={{ ...chartOptions, indexAxis: 'y' as const }} />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Most Reviewed Books */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Most Reviewed Books</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-80">
                                    <Bar data={mostReviewedChartData} options={{ ...chartOptions, indexAxis: 'y' as const }} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </AdminLayout>
        </>
    );
}

