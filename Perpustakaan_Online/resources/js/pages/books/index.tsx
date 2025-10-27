import { Head, Link } from '@inertiajs/react';
import { Book, Star, Grid3x3, List, SlidersHorizontal, Eye } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import UserLayout from '@/layouts/user-layout';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { BookQuickViewModal } from '@/components/book-quick-view-modal';
import { SearchWithSuggestions } from '@/components/search-with-suggestions';

interface BookType {
    id: number;
    title: string;
    author: string;
    publication_year: number;
    genre: string;
    description: string;
    rating: number;
    cover_image?: string;
    review_count: number;
    created_at: string;
}

export default function BooksIndex() {
    const [books, setBooks] = useState<BookType[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [minRating, setMinRating] = useState('');
    const [sortBy, setSortBy] = useState('newest'); // newest, title_asc, title_desc, rating_high, rating_low
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showFilters, setShowFilters] = useState(false);
    const [genres, setGenres] = useState<string[]>([]);
    const [quickViewBook, setQuickViewBook] = useState<BookType | null>(null);
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

    const handleQuickView = (book: BookType, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setQuickViewBook(book);
        setIsQuickViewOpen(true);
    };

    const fetchBooks = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (selectedGenre) params.append('genre', selectedGenre);
            if (selectedYear) params.append('year', selectedYear);
            if (minRating) params.append('min_rating', minRating);
            params.append('sort', sortBy);
            params.append('per_page', 'all'); // Show all books
            
            const response = await fetch(`/api/books?${params}`, {
                credentials: 'include',
            });
            const data = await response.json();
            setBooks(data.data || []);
        } catch (error) {
            console.error('Error fetching books:', error);
        } finally {
            setLoading(false);
        }
    }, [search, selectedGenre, selectedYear, minRating, sortBy]);

    const fetchGenres = useCallback(async () => {
        try {
            const response = await fetch('/api/books/genres', {
                credentials: 'include',
            });
            const data = await response.json();
            setGenres(data);
        } catch (error) {
            console.error('Error fetching genres:', error);
        }
    }, []);

    useEffect(() => {
        fetchGenres();
    }, [fetchGenres]);

    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchBooks();
        }, 300);
        return () => clearTimeout(debounce);
    }, [fetchBooks]);

    const clearFilters = () => {
        setSearch('');
        setSelectedGenre('');
        setSelectedYear('');
        setMinRating('');
        setSortBy('newest');
    };

    return (
        <>
            <Head title="Books" />
            <UserLayout>
                <div className="container mx-auto px-4 py-6 max-w-7xl">
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 text-transparent bg-clip-text">Library Books</h1>
                            <p className="text-purple-300 mt-1">
                                Browse and discover our collection of {books.length} books
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant={viewMode === 'grid' ? 'default' : 'outline'}
                                size="icon"
                                onClick={() => setViewMode('grid')}
                                className={viewMode === 'grid' ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'border-purple-500/50 text-purple-200 hover:bg-purple-500/20'}
                            >
                                <Grid3x3 className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'default' : 'outline'}
                                size="icon"
                                onClick={() => setViewMode('list')}
                                className={viewMode === 'list' ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'border-purple-500/50 text-purple-200 hover:bg-purple-500/20'}
                            >
                                <List className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Search Bar with Auto-Suggest */}
                    <Card className="mb-4 bg-slate-800/50 border-purple-500/20">
                        <CardContent className="pt-6">
                            <SearchWithSuggestions
                                value={search}
                                onChange={setSearch}
                                placeholder="Search books by title, author, or description..."
                            />
                        </CardContent>
                    </Card>

                    {/* Filters & Sort */}
                    <Card className="mb-6 bg-slate-800/50 border-purple-500/20">
                        <CardHeader className="flex flex-row items-center justify-between py-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowFilters(!showFilters)}
                                className="text-purple-200 hover:text-white hover:bg-purple-500/20"
                            >
                                <SlidersHorizontal className="h-4 w-4 mr-2" />
                                {showFilters ? 'Hide' : 'Show'} Filters
                            </Button>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-purple-300">Sort by:</span>
                                <select
                                    className="flex h-8 w-[180px] rounded-md border border-purple-500/30 bg-slate-900/50 px-3 py-1 text-sm text-white shadow-xs outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                >
                                    <option value="newest" className="bg-slate-900 text-white">Newest First</option>
                                    <option value="oldest" className="bg-slate-900 text-white">Oldest First</option>
                                    <option value="title_asc" className="bg-slate-900 text-white">Title (A-Z)</option>
                                    <option value="title_desc" className="bg-slate-900 text-white">Title (Z-A)</option>
                                    <option value="rating_high" className="bg-slate-900 text-white">Highest Rating</option>
                                    <option value="rating_low" className="bg-slate-900 text-white">Lowest Rating</option>
                                </select>
                            </div>
                        </CardHeader>
                        <AnimatePresence>
                            {showFilters && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <CardContent className="grid gap-4 md:grid-cols-4 pb-6">
                                        <div>
                                            <label className="text-sm font-medium mb-2 block text-purple-200">Genre</label>
                                            <select
                                                className="flex h-9 w-full rounded-md border border-purple-500/30 bg-slate-900/50 px-3 py-1 text-sm text-white shadow-xs outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                                value={selectedGenre}
                                                onChange={(e) => setSelectedGenre(e.target.value)}
                                            >
                                                <option value="" className="bg-slate-900 text-white">All Genres</option>
                                                {genres.map((genre) => (
                                                    <option key={genre} value={genre} className="bg-slate-900 text-white">
                                                        {genre}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium mb-2 block text-purple-200">Publication Year</label>
                                            <Input
                                                type="number"
                                                placeholder="e.g. 2020"
                                                value={selectedYear}
                                                onChange={(e) => setSelectedYear(e.target.value)}
                                                className="bg-slate-900/50 border-purple-500/30 text-white placeholder:text-purple-300/50 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium mb-2 block text-purple-200">Minimum Rating</label>
                                            <select
                                                className="flex h-9 w-full rounded-md border border-purple-500/30 bg-slate-900/50 px-3 py-1 text-sm text-white shadow-xs outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                                value={minRating}
                                                onChange={(e) => setMinRating(e.target.value)}
                                            >
                                                <option value="" className="bg-slate-900 text-white">Any Rating</option>
                                                <option value="4" className="bg-slate-900 text-white">4+ Stars</option>
                                                <option value="3" className="bg-slate-900 text-white">3+ Stars</option>
                                                <option value="2" className="bg-slate-900 text-white">2+ Stars</option>
                                                <option value="1" className="bg-slate-900 text-white">1+ Stars</option>
                                            </select>
                                        </div>

                                        <div className="flex items-end">
                                            <Button
                                                variant="outline"
                                                onClick={clearFilters}
                                                className="w-full border-purple-500/50 text-purple-200 hover:bg-purple-500/20 hover:text-white"
                                            >
                                                Clear Filters
                                            </Button>
                                        </div>
                                    </CardContent>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Card>

                    {/* Books Display */}
                    {loading ? (
                        <div className={viewMode === 'grid' ? 'grid gap-3 grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8' : 'space-y-4'}>
                            {[...Array(16)].map((_, i) => (
                                <Card key={i} className="animate-pulse">
                                    {viewMode === 'grid' ? (
                                        <>
                                            <div className="aspect-[2/3] bg-muted" />
                                            <CardHeader className="p-2">
                                                <div className="h-3 bg-muted rounded w-3/4" />
                                                <div className="h-2 bg-muted rounded w-1/2 mt-2" />
                                            </CardHeader>
                                        </>
                                    ) : (
                                        <div className="flex gap-3 p-3">
                                            <div className="w-16 h-24 bg-muted rounded" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-3 bg-muted rounded w-3/4" />
                                                <div className="h-2 bg-muted rounded w-1/2" />
                                                <div className="h-2 bg-muted rounded w-full" />
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            ))}
                        </div>
                    ) : books.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-12"
                        >
                            <Book className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-semibold">No books found</h3>
                            <p className="text-muted-foreground mb-4">Try adjusting your filters or search query</p>
                            <Button onClick={clearFilters} variant="outline">Clear All Filters</Button>
                        </motion.div>
                    ) : (
                        <motion.div
                            layout
                            className={viewMode === 'grid' ? 'grid gap-3 grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8' : 'space-y-4'}
                        >
                            {books.map((book, index) => (
                                <motion.div
                                    key={book.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    layout
                                    className="relative"
                                >
                                    <Link href={`/books/${book.id}`}>
                                        {viewMode === 'grid' ? (
                                            <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 h-full bg-slate-800/50 border-purple-500/20 relative">
                                                {/* Quick View Button */}
                                                <button
                                                    onClick={(e) => handleQuickView(book, e)}
                                                    className="absolute top-2 left-2 z-10 p-1.5 bg-slate-900/80 hover:bg-slate-900 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg border border-purple-500/30"
                                                    title="Quick View"
                                                >
                                                    <Eye className="h-3 w-3 text-purple-300" />
                                                </button>
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
                                        ) : (
                                            <Card className="overflow-hidden hover:shadow-lg transition-shadow group bg-slate-800/50 border-purple-500/20">
                                                <div className="flex gap-3 p-3">
                                                    <div className="w-16 flex-shrink-0">
                                                        <div className="aspect-[2/3] relative overflow-hidden bg-slate-900/30 rounded">
                                                            {book.cover_image ? (
                                                                <img
                                                                    src={`/storage/${book.cover_image}`}
                                                                    alt={book.title}
                                                                    className="h-full w-full object-contain group-hover:scale-[1.02] transition-transform duration-300"
                                                                    loading="lazy"
                                                                />
                                                            ) : (
                                                                <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/10 to-primary/5">
                                                                    <Book className="h-6 w-6 text-muted-foreground" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold text-sm line-clamp-1 text-white group-hover:text-purple-300 transition-colors">{book.title}</h3>
                                                        <p className="text-xs text-purple-300 mb-1">{book.author} • {book.publication_year}</p>
                                                        <p className="text-xs text-purple-200 line-clamp-2 mb-2">{book.description}</p>
                                                        <div className="flex items-center gap-2 text-xs flex-wrap">
                                                            <div className="flex items-center gap-0.5">
                                                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                                <span className="font-medium text-white">{Number(book.rating).toFixed(1)}</span>
                                                                <span className="text-purple-300">({book.review_count})</span>
                                                            </div>
                                                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 bg-purple-600/50 text-white border-purple-500/30">{book.genre}</Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        )}
                                    </Link>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}

                    {/* Quick View Modal */}
                    <BookQuickViewModal
                        book={quickViewBook}
                        isOpen={isQuickViewOpen}
                        onClose={() => {
                            setIsQuickViewOpen(false);
                            setQuickViewBook(null);
                        }}
                    />
                </div>
            </UserLayout>
        </>
    );
}
