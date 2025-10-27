import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Heart, Star, Book } from 'lucide-react';
import UserLayout from '@/layouts/user-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface BookType {
    id: number;
    title: string;
    author: string;
    publication_year: number;
    genre: string;
    rating: number;
    cover_image?: string;
    review_count: number;
}

export default function BooksFavorites() {
    const [favorites, setFavorites] = useState<BookType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFavorites();
    }, []);

    const fetchFavorites = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/favorites', {
                credentials: 'include',
            });
            
            if (!response.ok) {
                console.error('Failed to fetch favorites:', response.status);
                setFavorites([]);
                setLoading(false);
                return;
            }
            
            const data = await response.json();
            console.log('📦 Favorites response:', data);
            
            // Backend returns: { success: true, total: X, favorites: { data: [...], ...pagination } }
            const favoriteBooks = data.favorites?.data || data.data || [];
            console.log('📚 Favorite books:', favoriteBooks);
            
            setFavorites(favoriteBooks);
        } catch (error) {
            console.error('Error fetching favorites:', error);
            setFavorites([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head title="My Favorites" />
            <UserLayout>
                <div className="container mx-auto px-4 py-6 max-w-7xl">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Heart className="h-8 w-8 fill-current" />
                            <h1 className="text-3xl font-bold">My Favorite Books</h1>
                        </div>
                        <p className="text-muted-foreground">
                            Books you've saved for later
                        </p>
                    </div>

                    {/* Favorites Grid */}
                    {loading ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {[...Array(6)].map((_, i) => (
                                <Card key={i} className="animate-pulse">
                                    <div className="aspect-[3/4] bg-muted" />
                                    <CardHeader>
                                        <div className="h-4 bg-muted rounded w-3/4" />
                                        <div className="h-3 bg-muted rounded w-1/2 mt-2" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-3 bg-muted rounded" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : favorites.length === 0 ? (
                        <div className="text-center py-12">
                            <Heart className="mx-auto h-16 w-16 text-muted-foreground opacity-50" />
                            <h3 className="mt-4 text-lg font-semibold">No favorites yet</h3>
                            <p className="text-muted-foreground mb-4">
                                Start exploring our collection and save books you love
                            </p>
                            <Link href="/books">
                                <button className="inline-flex items-center justify-center h-9 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                                    Browse Books
                                </button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid gap-3 grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8">
                            {favorites.map((book) => (
                                <Card key={book.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300 h-full bg-slate-800/50 border-pink-500/20">
                                    <Link href={`/books/${book.id}`}>
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
                                            <Badge className="absolute top-2 right-2 bg-pink-600/80 text-white border-0 h-4">
                                                <Heart className="h-3 w-3 fill-current mr-1" />
                                            </Badge>
                                            <Badge className="absolute top-2 left-2 bg-black/70 text-white border-0 h-4">
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
                                                <Badge variant="secondary" className="text-[9px] h-4 bg-pink-600/50 text-white border-pink-500/30">
                                                    {book.genre}
                                                </Badge>
                                                <span className="text-[10px] text-purple-300">
                                                    {book.publication_year}
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Link>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </UserLayout>
        </>
    );
}




