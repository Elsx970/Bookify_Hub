import { Head, Link } from '@inertiajs/react';
import { BookOpen, Heart, MessageSquare, TrendingUp, Sparkles, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import UserLayout from '@/layouts/user-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface BookType {
    id: number;
    title: string;
    author: string;
    publication_year: number;
    genre: string;
    description: string;
    rating: number;
    cover_image?: string;
    review_count?: number;
    created_at?: string;
}

interface StatsType {
    totalBooks: number;
    totalGenres: number;
    totalReviews: number;
    totalFavorites: number;
}

// Force HMR update
export default function Dashboard() {
    const [stats, setStats] = useState<StatsType>({
        totalBooks: 0,
        totalGenres: 0,
        totalReviews: 0,
        totalFavorites: 0,
    });
    const [featuredBooks, setFeaturedBooks] = useState<BookType[]>([]);
    const [recentBooks, setRecentBooks] = useState<BookType[]>([]);
    const [topRatedBooks, setTopRatedBooks] = useState<BookType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch('/api/books?per_page=8&sort=rating_high').then((res) => res.json()),
            fetch('/api/books?per_page=8&sort=newest').then((res) => res.json()),
            fetch('/api/books?per_page=8&sort=rating_high&min_rating=4.5').then((res) => res.json()),
        ])
            .then(([allBooksResponse, recentResponse, topRatedResponse]) => {
                console.log('🔍 API Response:', { allBooksResponse, recentResponse, topRatedResponse });
                
                // Handle different response structures
                const allBooksArray = Array.isArray(allBooksResponse) 
                    ? allBooksResponse 
                    : (allBooksResponse.data || allBooksResponse.books || []);
                const recentArray = Array.isArray(recentResponse) 
                    ? recentResponse 
                    : (recentResponse.data || recentResponse.books || []);
                const topRatedArray = Array.isArray(topRatedResponse) 
                    ? topRatedResponse 
                    : (topRatedResponse.data || topRatedResponse.books || []);
                
                console.log('📚 Books Arrays:', { allBooksArray, recentArray, topRatedArray });

                setFeaturedBooks(allBooksArray.slice(0, 8));
                setRecentBooks(recentArray.slice(0, 8));
                setTopRatedBooks(topRatedArray.slice(0, 8));

                // Calculate stats
                const uniqueGenres = new Set(
                    allBooksArray.map((b: BookType) => b.genre)
                );
                setStats({
                    totalBooks: allBooksResponse.total || allBooksArray.length,
                    totalGenres: uniqueGenres.size,
                    totalReviews: allBooksArray.reduce(
                        (sum: number, b: BookType) => sum + (b.review_count || 0),
                        0
                    ),
                    totalFavorites: 0,
                });
            })
            .catch((error) => {
                console.error('Error fetching dashboard data:', error);
                setFeaturedBooks([]);
                setRecentBooks([]);
                setTopRatedBooks([]);
            })
            .finally(() => setLoading(false));
    }, []);

    const BookCard = ({ book, index }: { book: BookType; index: number }) => (
        <motion.div
            key={book.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
        >
            <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 h-full bg-slate-800/30 backdrop-blur-sm border-purple-500/20">
                <Link href={`/books/${book.id}`}>
                    <div className="relative aspect-[2/3] overflow-hidden bg-slate-900/20">
                        {book.cover_image ? (
                            <img
                                src={`/storage/${book.cover_image}`}
                                alt={book.title}
                                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                                <BookOpen className="h-8 w-8 text-muted-foreground" />
                            </div>
                        )}
                        <Badge className="absolute top-2 right-2 bg-black/70 text-white border-0 h-4">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                            <span className="text-[9px]">{Number(book.rating).toFixed(1)}</span>
                        </Badge>
                    </div>
                    <CardContent className="p-2 bg-transparent">
                        <h3 className="font-semibold text-xs line-clamp-2 mb-1 text-white group-hover:text-purple-300 transition-colors">
                            {book.title}
                        </h3>
                        <p className="text-[10px] text-purple-300 line-clamp-1">
                            {book.author}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                            <Badge variant="secondary" className="text-[9px] h-4 bg-purple-600/50 text-white border-purple-500/30">
                                {book.genre}
                            </Badge>
                            <span className="text-[10px] text-purple-300">
                                {book.publication_year}
                            </span>
                        </div>
                    </CardContent>
                </Link>
            </Card>
        </motion.div>
    );

    if (loading) {
        return (
            <>
                <Head title="Dashboard" />
                <UserLayout>
                    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-muted-foreground">Loading...</p>
                        </div>
                    </div>
                </UserLayout>
            </>
        );
    }

    return (
        <>
            <Head title="Dashboard" />
            <UserLayout>
                <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
                    <div className="container mx-auto px-4 py-8">
                        {/* Hero Section */}
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center mb-12"
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
                                <Sparkles className="h-4 w-4" />
                                <span className="text-sm font-medium">Welcome to Bookify Hub</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold mb-4">
                                Discover Your Next Great Read
                            </h1>
                            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                                Explore our curated collection of books, share your reviews, and connect with fellow readers
                            </p>
                        </motion.div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 }}
                            >
                                <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 rounded-lg bg-blue-500/10">
                                                <BookOpen className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold">{stats.totalBooks}</p>
                                                <p className="text-sm text-muted-foreground">Total Books</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 rounded-lg bg-purple-500/10">
                                                <TrendingUp className="h-6 w-6 text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold">{stats.totalGenres}</p>
                                                <p className="text-sm text-muted-foreground">Genres</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 rounded-lg bg-green-500/10">
                                                <MessageSquare className="h-6 w-6 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold">{stats.totalReviews}</p>
                                                <p className="text-sm text-muted-foreground">Reviews</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                <Card className="bg-gradient-to-br from-pink-500/10 to-pink-600/5 border-pink-500/20">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 rounded-lg bg-pink-500/10">
                                                <Heart className="h-6 w-6 text-pink-600" />
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold">{stats.totalFavorites}</p>
                                                <p className="text-sm text-muted-foreground">Favorites</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>

                        {/* Featured Books */}
                        {featuredBooks.length > 0 && (
                            <motion.section
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="mb-12"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold">Featured Books</h2>
                                        <p className="text-muted-foreground">Handpicked favorites just for you</p>
                                    </div>
                                    <Link href="/books">
                                        <span className="text-purple-400 hover:text-purple-300 hover:underline text-sm font-medium transition-colors">
                                            View All →
                                        </span>
                                    </Link>
                                </div>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-3">
                                    {featuredBooks.map((book, index) => (
                                        <BookCard key={book.id} book={book} index={index} />
                                    ))}
                                </div>
                            </motion.section>
                        )}

                        {/* Recently Added */}
                        {recentBooks.length > 0 && (
                            <motion.section
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 }}
                                className="mb-12"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">Recently Added</h2>
                                        <p className="text-purple-300">Fresh additions to our collection</p>
                                    </div>
                                    <Link href="/books?sort=newest">
                                        <span className="text-purple-400 hover:text-purple-300 hover:underline text-sm font-medium transition-colors">
                                            View All →
                                        </span>
                                    </Link>
                                </div>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-3">
                                    {recentBooks.map((book, index) => (
                                        <BookCard key={book.id} book={book} index={index} />
                                    ))}
                                </div>
                            </motion.section>
                        )}

                        {/* Top Rated */}
                        {topRatedBooks.length > 0 && (
                            <motion.section
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.7 }}
                                className="mb-12"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">Top Rated Books</h2>
                                        <p className="text-purple-300">Highest rated by our community</p>
                                    </div>
                                    <Link href="/books?sort=rating_high">
                                        <span className="text-purple-400 hover:text-purple-300 hover:underline text-sm font-medium transition-colors">
                                            View All →
                                        </span>
                                    </Link>
                                </div>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-3">
                                    {topRatedBooks.map((book, index) => (
                                        <BookCard key={book.id} book={book} index={index} />
                                    ))}
                                </div>
                            </motion.section>
                        )}
                    </div>
                </div>
            </UserLayout>
        </>
    );
}
