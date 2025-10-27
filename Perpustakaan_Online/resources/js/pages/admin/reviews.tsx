import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { MessageSquare, Trash2, Star, Book, Search } from 'lucide-react';
import AdminLayout from '@/layouts/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

interface ReviewType {
    id: number;
    user: {
        id: number;
        name: string;
        email: string;
    };
    book: {
        id: number;
        title: string;
        author: string;
        cover_image?: string;
    };
    rating: number;
    comment: string;
    created_at: string;
}

export default function AdminReviews() {
    const [reviews, setReviews] = useState<ReviewType[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterRating, setFilterRating] = useState('');

    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchReviews();
        }, 300);
        return () => clearTimeout(debounce);
    }, [search, filterRating]);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (filterRating) params.append('rating', filterRating);

            const response = await fetch(`/api/admin/reviews?${params}`, {
                credentials: 'include',
            });
            const data = await response.json();
            setReviews(data || []);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            toast.error('Failed to fetch reviews');
        } finally {
            setLoading(false);
        }
    };

    const deleteReview = async (id: number, bookTitle: string) => {
        if (!confirm(`Delete this review for "${bookTitle}"?\nThis action cannot be undone.`)) return;

        try {
            const response = await fetch(`/api/admin/reviews/${id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                credentials: 'include',
            });

            if (response.ok) {
                toast.success('Review deleted successfully! 🗑️');
                fetchReviews(); // Refresh list
            } else {
                toast.error('Failed to delete review');
            }
        } catch (error) {
            console.error('Error deleting review:', error);
            toast.error('An error occurred while deleting the review');
        }
    };

    const renderStars = (rating: number) => {
        return [...Array(5)].map((_, i) => (
            <Star
                key={i}
                className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                    }`}
            />
        ));
    };

    return (
        <>
            <Head title="Manage Reviews - Admin" />
            <AdminLayout>
                <div className="container mx-auto px-4 py-6 max-w-7xl">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <MessageSquare className="h-8 w-8 text-primary" />
                            Manage Reviews
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Monitor and moderate user reviews
                        </p>
                    </div>

                    {/* Filters */}
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by book title, author, or reviewer name..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                                <select
                                    value={filterRating}
                                    onChange={(e) => setFilterRating(e.target.value)}
                                    className="flex h-9 w-full md:w-48 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring"
                                >
                                    <option value="">All Ratings</option>
                                    <option value="5">5 Stars</option>
                                    <option value="4">4 Stars</option>
                                    <option value="3">3 Stars</option>
                                    <option value="2">2 Stars</option>
                                    <option value="1">1 Star</option>
                                </select>
                                {(search || filterRating) && (
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setSearch('');
                                            setFilterRating('');
                                        }}
                                    >
                                        Clear Filters
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Reviews List */}
                    {loading ? (
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <Card key={i} className="animate-pulse">
                                    <CardContent className="p-6">
                                        <div className="flex gap-4">
                                            <div className="w-16 h-20 bg-muted rounded" />
                                            <div className="flex-1 space-y-3">
                                                <div className="h-4 bg-muted rounded w-2/3" />
                                                <div className="h-3 bg-muted rounded w-1/2" />
                                                <div className="h-3 bg-muted rounded w-full" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : reviews.length === 0 ? (
                        <Card>
                            <CardContent className="text-center py-12">
                                <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No reviews found</h3>
                                <p className="text-muted-foreground">
                                    {search || filterRating ? 'Try adjusting your filters' : 'No reviews have been submitted yet'}
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {reviews.map((review, index) => (
                                <motion.div
                                    key={review.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                >
                                    <Card className="hover:shadow-lg transition-shadow">
                                        <CardContent className="p-6">
                                            <div className="flex gap-4">
                                                {/* Book Cover */}
                                                <Link href={`/books/${review.book.id}`} className="flex-shrink-0">
                                                    {review.book.cover_image ? (
                                                        <img
                                                            src={`/storage/${review.book.cover_image}`}
                                                            alt={review.book.title}
                                                            className="w-16 h-20 object-cover rounded shadow-sm hover:shadow-md transition-shadow"
                                                        />
                                                    ) : (
                                                        <div className="w-16 h-20 bg-muted rounded flex items-center justify-center">
                                                            <Book className="h-8 w-8 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                </Link>

                                                {/* Review Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-4 mb-2">
                                                        <div className="flex-1 min-w-0">
                                                            <Link
                                                                href={`/books/${review.book.id}`}
                                                                className="font-semibold hover:text-primary transition-colors line-clamp-1"
                                                            >
                                                                {review.book.title}
                                                            </Link>
                                                            <p className="text-sm text-muted-foreground">
                                                                by {review.book.author}
                                                            </p>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => deleteReview(review.id, review.book.title)}
                                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>

                                                    <div className="flex items-center gap-1 mb-2">
                                                        {renderStars(review.rating)}
                                                        <span className="ml-2 text-sm font-medium">
                                                            {review.rating}.0
                                                        </span>
                                                    </div>

                                                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                                        {review.comment}
                                                    </p>

                                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                        <span className="font-medium">
                                                            {review.user.name}
                                                        </span>
                                                        <span>•</span>
                                                        <span>
                                                            {new Date(review.created_at).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric',
                                                            })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* Stats Summary */}
                    {!loading && reviews.length > 0 && (
                        <div className="mt-6 flex items-center justify-center text-sm text-muted-foreground">
                            Showing {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                        </div>
                    )}
                </div>
            </AdminLayout>
        </>
    );
}

