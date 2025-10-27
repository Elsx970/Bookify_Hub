import { Head, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Book, Star, Heart, TrendingUp, Award } from 'lucide-react';
import UserLayout from '@/layouts/user-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface UserStats {
    total_reviews: number;
    total_favorites: number;
    average_rating: number;
    favorite_genre: string;
    recent_reviews: Array<{
        id: number;
        rating: number;
        comment: string;
        created_at: string;
        book: {
            id: number;
            title: string;
            author: string;
            genre: string;
            cover_image?: string;
        };
    }>;
    favorite_books: Array<{
        id: number;
        title: string;
        author: string;
        genre: string;
        rating: number;
        cover_image?: string;
    }>;
    genre_distribution: Record<string, number>;
}

export default function ProfileDashboard() {
    const { auth } = usePage().props;
    const [stats, setStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserStats();
    }, []);

    const fetchUserStats = async () => {
        try {
            const [reviewsRes, favoritesRes] = await Promise.all([
                fetch('/api/my-reviews', { credentials: 'include' }),
                fetch('/api/favorites', { credentials: 'include' }),
            ]);

            if (!reviewsRes.ok || !favoritesRes.ok) {
                console.error('Failed to fetch user stats');
                setLoading(false);
                return;
            }

            const reviewsData = await reviewsRes.json();
            const favoritesData = await favoritesRes.json();
            
            console.log('📦 Profile Reviews response:', reviewsData);
            console.log('📦 Profile Favorites response:', favoritesData);

            // Backend returns: { success: true, reviews: { data: [...] } }
            // Backend returns: { success: true, favorites: { data: [...] } }
            const reviews = reviewsData.reviews?.data || reviewsData.data || [];
            const favorites = favoritesData.favorites?.data || favoritesData.data || [];
            
            console.log('📝 Reviews for profile:', reviews);
            console.log('❤️ Favorites for profile:', favorites);

            const totalReviews = reviews.length;
            const avgRating = totalReviews > 0 
                ? reviews.reduce((sum: number, r: any) => sum + Number(r.rating), 0) / totalReviews 
                : 0;

            // Calculate genre distribution from reviews
            const genreCount: Record<string, number> = {};
            reviews.forEach((review: any) => {
                const genre = review.book?.genre || 'Unknown';
                genreCount[genre] = (genreCount[genre] || 0) + 1;
            });

            const favoriteGenre = Object.entries(genreCount)
                .sort(([, a], [, b]) => b - a)[0]?.[0] || 'None yet';

            setStats({
                total_reviews: totalReviews,
                total_favorites: favorites.length,
                average_rating: avgRating,
                favorite_genre: favoriteGenre,
                recent_reviews: reviews.slice(0, 10),
                favorite_books: favorites.slice(0, 10),
                genre_distribution: genreCount,
            });
        } catch (error) {
            console.error('Error fetching user stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <UserLayout>
                <Head title="My Profile" />
                <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                        <p className="text-purple-300">Loading your reading journey...</p>
                    </div>
                </div>
            </UserLayout>
        );
    }

    if (!stats) {
        return (
            <UserLayout>
                <Head title="My Profile" />
                <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-purple-300">Failed to load profile data</p>
                    </div>
                </div>
            </UserLayout>
        );
    }

    return (
        <>
            <Head title="My Profile" />
            <UserLayout>
                <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="container mx-auto px-4 py-6 max-w-7xl">
                    {/* Header */}
                    <div className="mb-6 text-center">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 text-transparent bg-clip-text mb-2">My Reading Dashboard</h1>
                        <p className="text-purple-300">
                            Welcome back, {auth.user?.name}! Here's your reading journey.
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-purple-200">Books Reviewed</CardTitle>
                                    <Star className="h-4 w-4 text-yellow-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-white">{stats.total_reviews}</div>
                                    <p className="text-xs text-purple-300">
                                        Avg rating: {stats.average_rating.toFixed(1)} ⭐
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                            <Card className="bg-gradient-to-br from-pink-500/10 to-pink-600/5 border-pink-500/20">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-pink-200">Favorite Books</CardTitle>
                                    <Heart className="h-4 w-4 text-pink-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-white">{stats.total_favorites}</div>
                                    <p className="text-xs text-pink-300">
                                        Books you loved
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-purple-200">Favorite Genre</CardTitle>
                                    <Award className="h-4 w-4 text-purple-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold truncate text-white">{stats.favorite_genre}</div>
                                    <p className="text-xs text-purple-300">
                                        {stats.genre_distribution[stats.favorite_genre] || 0} books
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                            <Card className="bg-gradient-to-br from-pink-500/10 to-pink-600/5 border-pink-500/20">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-pink-200">Reading Activity</CardTitle>
                                    <TrendingUp className="h-4 w-4 text-pink-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-white">
                                        {stats.total_reviews + stats.total_favorites}
                                    </div>
                                    <p className="text-xs text-pink-300">
                                        Total interactions
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Recent Reviews */}
                    <div className="grid gap-6 md:grid-cols-2 mb-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Reviews</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {stats.recent_reviews.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Star className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                        <p>No reviews yet</p>
                                        <p className="text-sm">Start reviewing books you've read!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {stats.recent_reviews.map((review) => (
                                            <div key={review.id} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                                                <div className="w-12 h-16 flex-shrink-0 bg-muted rounded overflow-hidden">
                                                    {review.book.cover_image ? (
                                                        <img
                                                            src={`/storage/${review.book.cover_image}`}
                                                            alt={review.book.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Book className="h-6 w-6 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-sm truncate">{review.book.title}</h4>
                                                    <p className="text-xs text-muted-foreground truncate">{review.book.author}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <div className="flex items-center gap-1">
                                                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                            <span className="text-xs font-medium">{Number(review.rating).toFixed(1)}</span>
                                                        </div>
                                                        <Badge variant="secondary" className="text-xs">{review.book.genre}</Badge>
                                                    </div>
                                                    {review.comment && (
                                                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{review.comment}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Favorite Books */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Favorite Books</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {stats.favorite_books.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Heart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                        <p>No favorites yet</p>
                                        <p className="text-sm">Add books to your favorites!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {stats.favorite_books.map((book) => (
                                            <div key={book.id} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                                                <div className="w-12 h-16 flex-shrink-0 bg-muted rounded overflow-hidden">
                                                    {book.cover_image ? (
                                                        <img
                                                            src={`/storage/${book.cover_image}`}
                                                            alt={book.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Book className="h-6 w-6 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-sm truncate">{book.title}</h4>
                                                    <p className="text-xs text-muted-foreground truncate">{book.author}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <div className="flex items-center gap-1">
                                                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                            <span className="text-xs font-medium">{Number(book.rating).toFixed(1)}</span>
                                                        </div>
                                                        <Badge variant="secondary" className="text-xs">{book.genre}</Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Genre Distribution */}
                    {Object.keys(stats.genre_distribution).length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Your Reading Preferences</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
                                    {Object.entries(stats.genre_distribution)
                                        .sort(([, a], [, b]) => b - a)
                                        .map(([genre, count]) => (
                                            <div key={genre} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                                <span className="font-medium text-sm">{genre}</span>
                                                <Badge variant="secondary">{count} books</Badge>
                                            </div>
                                        )                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
                </div>
            </UserLayout>
        </>
    );
}

