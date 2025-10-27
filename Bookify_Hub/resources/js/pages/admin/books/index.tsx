import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Book, Star } from 'lucide-react';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { SearchWithSuggestions } from '@/components/search-with-suggestions';

interface BookType {
    id: number;
    title: string;
    author: string;
    publication_year: number;
    genre: string;
    rating: number;
    cover_image?: string;
    review_count: number;
    description: string;
    created_at: string;
}

export default function AdminBooksIndex() {
    const [books, setBooks] = useState<BookType[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchBooks();
        }, 300);
        return () => clearTimeout(debounce);
    }, [search]);

    const fetchBooks = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            params.append('per_page', 'all'); // Show all books
            
            const response = await fetch(`/api/books?${params}`, {
                credentials: 'include',
            });
            const data = await response.json();
            setBooks(data.data || []);
        } catch (error) {
            console.error('Error fetching books:', error);
            toast.error('Failed to fetch books');
        } finally {
            setLoading(false);
        }
    };

    const deleteBook = async (id: number, title: string) => {
        if (!confirm(`Are you sure you want to delete "${title}"?\nThis action cannot be undone.`)) return;
        
        try {
            const response = await fetch(`/api/admin/books/${id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                credentials: 'include',
            });

            if (response.ok) {
                toast.success(`"${title}" deleted successfully! 🗑️`);
                fetchBooks(); // Refresh list
            } else {
                toast.error('Failed to delete book');
            }
        } catch (error) {
            console.error('Error deleting book:', error);
            toast.error('An error occurred while deleting the book');
        }
    };

    return (
        <>
            <Head title="Manage Books - Admin" />
            <AdminLayout>
                <div className="container mx-auto px-4 py-6 max-w-7xl">
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 text-transparent bg-clip-text">Manage Books</h1>
                            <p className="text-purple-300 mt-1">
                                Add, edit, or remove books from the library
                            </p>
                        </div>
                        <Link href="/admin/books/create">
                            <Button size="lg" className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                                <Plus className="h-5 w-5" />
                                Add New Book
                            </Button>
                        </Link>
                    </div>

                    {/* Search with Auto-Suggest */}
                    <Card className="mb-6 bg-slate-800/50 border-purple-500/20">
                        <CardContent className="pt-6">
                            <SearchWithSuggestions
                                value={search}
                                onChange={setSearch}
                                placeholder="Search books by title or author..."
                            />
                        </CardContent>
                    </Card>

                    {/* Books Table */}
                    {loading ? (
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <Card key={i} className="animate-pulse">
                                    <CardContent className="p-6">
                                        <div className="flex gap-4">
                                            <div className="w-16 h-20 bg-muted rounded" />
                                            <div className="flex-1 space-y-3">
                                                <div className="h-4 bg-muted rounded w-1/3" />
                                                <div className="h-3 bg-muted rounded w-1/4" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : books.length === 0 ? (
                        <Card className="bg-slate-800/50 border-purple-500/20">
                            <CardContent className="text-center py-12">
                                <Book className="h-16 w-16 mx-auto text-purple-400 mb-4" />
                                <h3 className="text-lg font-semibold mb-2 text-white">No books found</h3>
                                <p className="text-purple-300 mb-4">
                                    {search ? 'Try a different search term' : 'Start by adding your first book'}
                                </p>
                                {!search && (
                                    <Link href="/admin/books/create">
                                        <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Your First Book
                                        </Button>
                                    </Link>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {books.map((book, index) => (
                                <motion.div
                                    key={book.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Card className="hover:shadow-lg transition-shadow bg-slate-800/50 border-purple-500/20">
                                        <CardContent className="p-6">
                                            <div className="flex gap-6">
                                                {/* Cover Image */}
                                                <div className="w-20 flex-shrink-0">
                                                    <div className="aspect-[2/3] bg-slate-900/30 rounded overflow-hidden">
                                                        {book.cover_image ? (
                                                            <img
                                                                src={`/storage/${book.cover_image}`}
                                                                alt={book.title}
                                                                className="w-full h-full object-contain"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                                                                <Book className="h-8 w-8 text-muted-foreground" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Book Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="text-xl font-bold truncate text-white">{book.title}</h3>
                                                            <p className="text-purple-300 mt-1">by {book.author}</p>
                                                            <p className="text-sm text-purple-300/80 line-clamp-2 mt-2">
                                                                {book.description}
                                                            </p>
                                                        </div>
                                                        
                                                        {/* Actions */}
                                                        <div className="flex gap-2 flex-shrink-0">
                                                            <Link href={`/admin/books/${book.id}/edit`}>
                                                                <Button variant="outline" size="sm" className="border-purple-500/50 text-purple-200 hover:bg-purple-500/20 hover:text-white">
                                                                    <Edit className="h-4 w-4 mr-2" />
                                                                    Edit
                                                                </Button>
                                                            </Link>
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm"
                                                                onClick={() => deleteBook(book.id, book.title)}
                                                                className="border-red-500/50 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                                                            >
                                                                <Trash2 className="h-4 w-4 mr-2" />
                                                                Delete
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    {/* Meta Info */}
                                                    <div className="flex items-center gap-4 mt-4 flex-wrap">
                                                        <Badge variant="secondary" className="bg-purple-500/20 text-purple-200 border-purple-500/30">{book.genre}</Badge>
                                                        <span className="text-sm text-purple-300">
                                                            {book.publication_year}
                                                        </span>
                                                        <div className="flex items-center gap-1">
                                                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                            <span className="text-sm font-medium text-white">
                                                                {Number(book.rating).toFixed(1)}
                                                            </span>
                                                            <span className="text-sm text-purple-300">
                                                                ({book.review_count} reviews)
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* Stats Footer */}
                    {!loading && books.length > 0 && (
                        <div className="mt-6 text-center text-sm text-muted-foreground">
                            Showing {books.length} {books.length === 1 ? 'book' : 'books'}
                        </div>
                    )}
                </div>
            </AdminLayout>
        </>
    );
}
