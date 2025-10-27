import { Head, Link } from '@inertiajs/react';
import { Star, Trash2, Edit, BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import UserLayout from '@/layouts/user-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Review {
    id: number;
    book_id: number;
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
}

export default function MyReviews() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const response = await fetch('/api/my-reviews', {
                credentials: 'include',
            });
            
            if (!response.ok) {
                console.error('Failed to fetch reviews:', response.status);
                setReviews([]);
                setLoading(false);
                return;
            }
            
            const data = await response.json();
            console.log('My Reviews response:', data);
            
            // Backend returns: { success: true, reviews: { data: [...], ...pagination } }
            const myReviews = data.reviews?.data || data.data || [];
            console.log('My reviews:', myReviews);
            
            setReviews(myReviews);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            setReviews([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (reviewId: number) => {
        if (!confirm('Are you sure you want to delete this review?')) return;

        try {
            const review = reviews.find(r => r.id === reviewId);
            if (!review) return;

            // Get CSRF token
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            if (!csrfToken) {
                alert('Security token missing. Please refresh the page.');
                return;
            }

            const response = await fetch(`/api/books/${review.book_id}/reviews/${reviewId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'include',
            });

            if (response.status === 419) {
                alert('Session expired. Please refresh the page.');
                return;
            }

            if (response.ok) {
                setReviews(reviews.filter(r => r.id !== reviewId));
            } else {
                console.error('Failed to delete review:', response.status);
                alert('Failed to delete review. Please try again.');
            }
        } catch (error) {
            console.error('Error deleting review:', error);
            alert('An error occurred. Please try again.');
        }
    };

    if (loading) {
        return (
            <UserLayout>
                <Head title="My Reviews" />
                <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                </div>
            </UserLayout>
        );
    }

    return (
        <UserLayout>
            <Head title="My Reviews" />
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 text-transparent bg-clip-text mb-2">My Reviews</h1>
                    <p className="text-purple-300">
                        Manage all your book reviews
                    </p>
                </div>

                {reviews.length === 0 ? (
                    <Card className="bg-slate-800/50 border-purple-500/20">
                        <CardContent className="pt-6">
                            <div className="text-center py-12">
                                <Star className="mx-auto h-12 w-12 text-purple-400 mb-4" />
                                <h3 className="text-lg font-semibold text-white mb-2">No Reviews Yet</h3>
                                <p className="text-purple-300 mb-4">
                                    You haven't written any reviews yet. Start exploring books!
                                </p>
                                <Button asChild className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                                    <Link href="/books">
                                        <BookOpen className="mr-2 h-4 w-4" />
                                        Browse Books
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {reviews.map((review) => (
                            <Card key={review.id} className="bg-slate-800/50 border-purple-500/20 hover:border-purple-500/40 transition-all">
                                <CardContent className="pt-6">
                                    <div className="flex gap-4">
                                        {/* Book Cover */}
                                        <Link href={`/books/${review.book.id}`} className="flex-shrink-0">
                                            <div className="w-20 h-28 bg-muted rounded-md flex items-center justify-center">
                                                {review.book.cover_image ? (
                                                    <img
                                                        src={`/storage/${review.book.cover_image}`}
                                                        alt={review.book.title}
                                                        className="w-20 h-28 object-cover rounded-md"
                                                    />
                                                ) : (
                                                    <BookOpen className="h-8 w-8 text-muted-foreground" />
                                                )}
                                            </div>
                                        </Link>

                                        {/* Review Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <Link href={`/books/${review.book.id}`}>
                                                        <h3 className="font-semibold text-lg text-white hover:underline hover:text-purple-300 transition-colors">
                                                            {review.book.title}
                                                        </h3>
                                                    </Link>
                                                    <p className="text-sm text-purple-300">
                                                        by {review.book.author}
                                                    </p>
                                                    <Badge variant="secondary" className="mt-2">
                                                        {review.book.genre}
                                                    </Badge>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(review.id)}
                                                        className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                <div className="flex items-center gap-1 mb-2">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`h-4 w-4 ${
                                                                i < review.rating
                                                                    ? 'fill-yellow-400 text-yellow-400'
                                                                    : 'text-muted-foreground'
                                                            }`}
                                                        />
                                                    ))}
                                                    <span className="text-sm text-muted-foreground ml-2">
                                                        {new Date(review.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>

                                                {review.comment && (
                                                    <p className="text-sm text-purple-300">
                                                        {review.comment}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </UserLayout>
    );
}

