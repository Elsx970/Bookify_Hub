import { Head, Link } from '@inertiajs/react';
import { Book, Star, Heart, TrendingUp, ArrowRight, BookOpen, Users, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface BookType {
    id: number;
    title: string;
    author: string;
    rating: number;
    cover_image?: string;
    genre: string;
    review_count: number;
}

export default function Welcome() {
    const [featuredBooks, setFeaturedBooks] = useState<BookType[]>([]);
    const [stats, setStats] = useState({ books: 0, users: 0, reviews: 0 });

    useEffect(() => {
        // Fetch featured books (top rated)
        fetch('/api/books?sort=rating_high&per_page=6')
            .then((res) => res.json())
            .then((data) => setFeaturedBooks(data.data || []))
            .catch((err) => console.error('Error fetching books:', err));

        // Fetch public stats
        fetch('/api/stats')
            .then((res) => res.json())
            .then((data) => setStats(data || { books: 0, users: 0, reviews: 0 }))
            .catch(() => setStats({ books: 0, users: 0, reviews: 0 })); // Fallback data
    }, []);

    return (
        <>
            <Head title="Welcome to Bookify Hub" />
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                {/* Navbar */}
                <nav className="border-b border-purple-500/20 backdrop-blur-sm bg-slate-800/50 sticky top-0 z-50">
                    <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-2">
                            <BookOpen className="h-8 w-8 text-purple-400" />
                            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Bookify Hub
                            </span>
                        </Link>
                        <div className="flex items-center gap-3">
                            <Link href="/login">
                                <Button variant="ghost" className="text-purple-200 hover:text-white hover:bg-purple-500/20">Sign In</Button>
                            </Link>
                            <Link href="/register">
                                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">Get Started</Button>
                                </Link>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="relative overflow-hidden py-20 md:py-32">
                    <div className="absolute inset-0 bg-grid-primary/5 [mask-image:linear-gradient(0deg,transparent,black)]" />
                    <div className="container mx-auto px-4 relative">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-center max-w-4xl mx-auto"
                        >
                            <Badge className="mb-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-200" variant="secondary">
                                Your Digital Library Companion
                            </Badge>
                            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                                Discover Your Next
                                <br />
                                Favorite Book
                            </h1>
                            <p className="text-xl text-purple-300 mb-8 max-w-2xl mx-auto">
                                Explore thousands of books, read reviews from fellow readers, and build your perfect reading list.
                                Join our community of book lovers today!
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link href="/register">
                                    <Button size="lg" className="gap-2 text-lg px-8 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                                        Start Reading Free
                                        <ArrowRight className="h-5 w-5" />
                                    </Button>
                                </Link>
                                <Link href="/books">
                                    <Button size="lg" variant="outline" className="gap-2 text-lg px-8 border-purple-500/50 text-purple-200 hover:bg-purple-500/20 hover:border-purple-400">
                                        <Book className="h-5 w-5" />
                                        Browse Catalog
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                        </div>
                </section>

                {/* Stats Section */}
                <section className="py-12 border-y border-purple-500/20 bg-slate-800/30">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                className="text-center"
                            >
                                <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text mb-2">{stats.books.toLocaleString()}+</div>
                                <div className="text-sm text-purple-300">Books Available</div>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                className="text-center"
                            >
                                <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text mb-2">{stats.users.toLocaleString()}+</div>
                                <div className="text-sm text-purple-300">Active Readers</div>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="text-center"
                            >
                                <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text mb-2">{stats.reviews.toLocaleString()}+</div>
                                <div className="text-sm text-purple-300">Reviews Written</div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-20">
                    <div className="container mx-auto px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-12"
                        >
                            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white to-purple-200 text-transparent bg-clip-text">Why Choose Bookify Hub?</h2>
                            <p className="text-purple-300 max-w-2xl mx-auto">
                                Everything you need to manage your reading journey in one place
                            </p>
                        </motion.div>

                        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            {[
                                {
                                    icon: Book,
                                    title: 'Vast Collection',
                                    description: 'Access thousands of books across all genres. From classics to bestsellers.',
                                },
                                {
                                    icon: Star,
                                    title: 'Smart Recommendations',
                                    description: 'Get personalized book suggestions based on your reading history and preferences.',
                                },
                                {
                                    icon: Users,
                                    title: 'Community Reviews',
                                    description: 'Read honest reviews from real readers and share your own thoughts.',
                                },
                                {
                                    icon: Heart,
                                    title: 'Personal Wishlist',
                                    description: 'Save books you want to read and build your perfect reading list.',
                                },
                                {
                                    icon: TrendingUp,
                                    title: 'Track Progress',
                                    description: 'Monitor your reading journey with detailed statistics and insights.',
                                },
                                {
                                    icon: Award,
                                    title: 'Top Rated Books',
                                    description: 'Discover the best books rated by our community of avid readers.',
                                },
                            ].map((feature, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card className="h-full hover:shadow-lg transition-shadow bg-slate-800/50 border-purple-500/20">
                                        <CardContent className="pt-6 text-center">
                                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-4">
                                                <feature.icon className="h-6 w-6 text-purple-400" />
                                            </div>
                                            <h3 className="text-lg font-semibold mb-2 text-white">{feature.title}</h3>
                                            <p className="text-sm text-purple-300">{feature.description}</p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Featured Books */}
                {featuredBooks.length > 0 && (
                    <section className="py-20 bg-slate-800/20">
                        <div className="container mx-auto px-4">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="text-center mb-12"
                            >
                                <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white to-purple-200 text-transparent bg-clip-text">Top Rated Books</h2>
                                <p className="text-muted-foreground">Discover what our community loves</p>
                            </motion.div>

                            <div className="grid gap-3 grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8">
                                {featuredBooks.map((book, index) => (
                                    <motion.div
                                        key={book.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <Link href={`/books/${book.id}`}>
                                            <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 h-full bg-slate-800/50 border-purple-500/20">
                                                <div className="relative aspect-[2/3] overflow-hidden bg-slate-900/30">
                                                    {book.cover_image ? (
                                                        <img
                                                            src={`/storage/${book.cover_image}`}
                                                            alt={book.title}
                                                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                                                            loading="lazy"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                                                            <Book className="h-8 w-8 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                    <Badge className="absolute top-2 right-2 bg-black/70 text-white border-0 h-4">
                                                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                                                        <span className="text-[9px]">{Number(book.rating).toFixed(1)}</span>
                                                    </Badge>
                                                </div>
                                                <CardContent className="p-2">
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
                                            </Card>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="text-center mt-8">
                                <Link href="/books">
                                    <Button variant="outline" size="lg" className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                                        View All Books
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </section>
                )}

                {/* CTA Section */}
                <section className="py-20">
                    <div className="container mx-auto px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="max-w-4xl mx-auto text-center"
                        >
                            <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/10 border-purple-500/30">
                                <CardContent className="py-12 px-6">
                                    <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white to-purple-200 text-transparent bg-clip-text">
                                        Ready to Start Your Reading Journey?
                                    </h2>
                                    <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                                        Join thousands of readers who have found their next favorite book with Bookify Hub.
                                        Sign up now and get started for free!
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                        <Link href="/register">
                                            <Button size="lg" className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                                                Create Free Account
                                                <ArrowRight className="h-5 w-5" />
                                            </Button>
                                        </Link>
                                        <Link href="/login">
                                            <Button size="lg" variant="outline" className="border-purple-500/50 text-purple-200 hover:bg-purple-500/20">
                                                Sign In
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-purple-500/20 py-12 bg-slate-800/30">
                    <div className="container mx-auto px-4">
                        <div className="grid md:grid-cols-4 gap-8 mb-8">
                            <div>
                                <Link href="/" className="flex items-center gap-2 mb-4">
                                    <BookOpen className="h-6 w-6 text-purple-400" />
                                    <span className="text-xl font-bold">Bookify Hub</span>
                                </Link>
                                <p className="text-sm text-muted-foreground">
                                    Your trusted companion for discovering and tracking great books.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-4 text-white">Quick Links</h3>
                                <div className="space-y-2 text-sm">
                                    <Link href="/books" className="block text-purple-300 hover:text-white">
                                        Browse Books
                                    </Link>
                                    <Link href="/about" className="block text-purple-300 hover:text-white">
                                        About Us
                                    </Link>
                                    <Link href="/contact" className="block text-purple-300 hover:text-white">
                                        Contact
                                    </Link>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-4 text-white">Account</h3>
                                <div className="space-y-2 text-sm">
                                    <Link href="/login" className="block text-purple-300 hover:text-white">
                                        Sign In
                                    </Link>
                                    <Link href="/register" className="block text-purple-300 hover:text-white">
                                        Sign Up
                                    </Link>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-4 text-white">Legal</h3>
                                <div className="space-y-2 text-sm">
                                    <Link href="/privacy" className="block text-purple-300 hover:text-white">
                                        Privacy Policy
                                    </Link>
                                    <Link href="/terms" className="block text-purple-300 hover:text-white">
                                        Terms of Service
                                    </Link>
                                </div>
                            </div>
                        </div>
                        <div className="text-center text-sm text-purple-300 pt-8 border-t border-purple-500/20">
                            <p>© {new Date().getFullYear()} Bookify Hub. All rights reserved.</p>
                        </div>
                </div>
                </footer>
            </div>
        </>
    );
}
