import { Head, Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Star, Heart, BookOpen, User, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import UserLayout from '@/layouts/user-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/input';
import { toast } from 'react-toastify';

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
    reviews?: ReviewType[];
}

interface RecommendationType {
    id: number;
    title: string;
    author: string;
    genre: string;
    rating: number;
    cover_image?: string;
    review_count: number;
}

interface ReviewType {
    id: number;
    user: { id: number; name: string; email: string };
    rating: number;
    comment: string;
    created_at: string;
}

interface PageProps extends Record<string, unknown> {
    id?: number;
    auth: {
        user?: {
            id: number;
            name: string;
            email: string;
            role: string;
        };
    };
}

export default function BooksShow({ id: propId }: PageProps) {
    const { auth } = usePage<PageProps>().props;
    
    // Get book ID from URL or props
    const getBookId = (): string => {
        if (propId) return String(propId);
        const path = window.location.pathname;
        const match = path.match(/\/books\/(\d+)/);
        return match ? match[1] : '';
    };
    
    const id = getBookId();
    const [book, setBook] = useState<BookType | null>(null);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const [favoriteLoading, setFavoriteLoading] = useState(false);
    const [userReview, setUserReview] = useState<ReviewType | null>(null);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [recommendations, setRecommendations] = useState<RecommendationType[]>([]);

    useEffect(() => {
        if (!id || id === 'undefined') return;
        fetchBook();
        checkFavorite();
        fetchUserReview();
        fetchRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchBook = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/books/${id}`, {
                credentials: 'include',
            });
            const data = await response.json();
            setBook(data.book);
        } catch (error) {
            console.error('Error fetching book:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkFavorite = async () => {
        try {
            const response = await fetch(`/api/favorites/${id}/check`, {
                credentials: 'include',
            });
            const data = await response.json();
            setIsFavorite(data.is_favorited);
        } catch (error) {
            console.error('Error checking favorite:', error);
        }
    };

    const fetchUserReview = async () => {
        try {
            const response = await fetch(`/api/books/${id}/reviews/my-review`, {
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                setUserReview(data.review);
                if (data.review) {
                    setReviewRating(data.review.rating);
                    setReviewComment(data.review.comment);
                }
            }
        } catch (error) {
            console.error('Error fetching review:', error);
        }
    };

    const fetchRecommendations = async () => {
        try {
            const response = await fetch(`/api/books/${id}/recommendations`, {
                credentials: 'include',
            });
            const data = await response.json();
            setRecommendations(data.recommendations || []);
        } catch (error) {
            console.error('Error fetching recommendations:', error);
        }
    };

    const toggleFavorite = async () => {
        setFavoriteLoading(true);
        try {
            console.log('Toggling favorite for book:', id);
            
            // Get fresh CSRF token from meta tag
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            console.log('CSRF Token:', csrfToken ? 'Found' : 'Missing');
            
            if (!csrfToken) {
                toast.error('Security token missing. Please refresh the page.');
                setFavoriteLoading(false);
                return;
            }
            
            const response = await fetch(`/api/favorites/${id}/toggle`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'include',
            });
            
            console.log('Response status:', response.status);
            
            if (response.status === 419) {
                toast.error('Session expired. Please refresh the page.');
                setFavoriteLoading(false);
                return;
            }
            
            const data = await response.json();
            console.log('Response data:', data);
            
            if (response.ok) {
                setIsFavorite(data.is_favorited);
                
                if (data.is_favorited) {
                    toast.success('Added to favorites!');
                } else {
                    toast.info('Removed from favorites');
                }
            } else {
                console.error('Failed response:', data);
                toast.error(data.message || 'Failed to update favorite status');
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            toast.error('Failed to update favorite status');
        } finally {
            setFavoriteLoading(false);
        }
    };

    const submitReview = async () => {
        try {
            // Get fresh CSRF token from meta tag
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            
            if (!csrfToken) {
                toast.error('Security token missing. Please refresh the page.');
                return;
            }
            
            const url = userReview 
                ? `/api/books/${id}/reviews/${userReview.id}`
                : `/api/books/${id}/reviews`;
            
            const method = userReview ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'include',
                body: JSON.stringify({
                    rating: reviewRating,
                    comment: reviewComment,
                }),
            });

            if (response.status === 419) {
                toast.error('Session expired. Please refresh the page.');
                return;
            }

            if (response.ok) {
                setShowReviewForm(false);
                fetchUserReview();
                fetchBook();
                toast.success(userReview ? 'Review updated successfully!' : 'Review added successfully!');
            } else {
                const data = await response.json();
                toast.error(data.message || 'Failed to submit review');
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            toast.error('An error occurred while submitting your review');
        }
    };

    if (loading || !book) {
        return (
            <UserLayout>
                <div className="container mx-auto px-4 py-6">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 bg-muted rounded w-3/4" />
                        <div className="h-64 bg-muted rounded" />
                        <div className="h-32 bg-muted rounded" />
                    </div>
                </div>
            </UserLayout>
        );
    }

    return (
        <>
            <Head title={book.title} />
            <UserLayout>
                {/* Cinematic Hero Section */}
                <div className="relative">
                    {/* Backdrop with gradient overlay */}
                    <div className="absolute inset-0 h-[300px] overflow-hidden">
                        {book.cover_image && (
                            <>
                                <div 
                                    className="absolute inset-0 bg-cover bg-center blur-3xl scale-110 opacity-20"
                                    style={{ backgroundImage: `url(/storage/${book.cover_image})` }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
                            </>
                        )}
                    </div>

                    {/* Hero Content */}
                    <div className="container relative mx-auto px-4 py-6 max-w-7xl">
                        <Link href="/books">
                            <Button variant="ghost" size="sm" className="mb-4 hover:bg-purple-500/20 backdrop-blur-sm text-purple-200 hover:text-white">
                                ← Back to Books
                            </Button>
                        </Link>

                        <div className="grid gap-6 md:grid-cols-[200px_1fr] lg:grid-cols-[240px_1fr]">
                            {/* Cover Image - Elevated & Compact */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <Card className="overflow-hidden shadow-2xl border-2 border-purple-500/30 bg-slate-800/50">
                                    <div className="aspect-[2/3] bg-slate-900/50">
                                        {book.cover_image ? (
                                            <img
                                                src={`/storage/${book.cover_image}`}
                                                alt={book.title}
                                                className="h-full w-full object-contain"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full">
                                                <BookOpen className="h-16 w-16 text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </motion.div>

                            {/* Book Info - Enhanced & Compact */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="space-y-4"
                            >
                                <div>
                                    <Badge variant="secondary" className="mb-2 text-xs bg-purple-500/20 text-purple-200 border-purple-500/30">
                                        {book.genre}
                                    </Badge>
                                    <h1 className="text-3xl md:text-4xl font-bold mb-2 leading-tight bg-gradient-to-r from-white to-purple-200 text-transparent bg-clip-text">{book.title}</h1>
                                    <p className="text-lg md:text-xl text-purple-300 mb-3">by {book.author}</p>
                                    
                                    <div className="flex items-center gap-4 flex-wrap">
                                        {/* Enhanced Rating Display - Compact */}
                                        <div className="flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-purple-500/30 shadow-lg">
                                            <div className="flex gap-0.5">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        className={`h-4 w-4 ${
                                                            star <= Math.round(Number(book.rating))
                                                                ? 'fill-yellow-400 text-yellow-400'
                                                                : 'fill-none text-purple-300/30'
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-lg font-bold bg-gradient-to-r from-yellow-400 to-orange-400 text-transparent bg-clip-text leading-tight">
                                                    {Number(book.rating).toFixed(1)}
                                                </span>
                                                <span className="text-[10px] text-purple-300 leading-tight">
                                                    {book.review_count} {book.review_count === 1 ? 'review' : 'reviews'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-purple-500/20">
                                            <Calendar className="h-4 w-4 text-purple-400" />
                                            <span className="text-sm text-white">{book.publication_year}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="prose dark:prose-invert max-w-none">
                                    <p className="text-base leading-relaxed text-purple-100">{book.description}</p>
                                </div>

                                {auth.user && (
                                    <div className="flex gap-3 flex-wrap">
                                        <Button
                                            onClick={toggleFavorite}
                                            disabled={favoriteLoading}
                                            size="lg"
                                            className={`flex-1 md:flex-none transition-all ${
                                                isFavorite 
                                                    ? 'bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white' 
                                                    : 'border-pink-500/50 text-pink-200 hover:bg-pink-500/20 hover:text-white'
                                            }`}
                                            variant={isFavorite ? 'default' : 'outline'}
                                        >
                                            <Heart className={`h-5 w-5 mr-2 ${isFavorite ? 'fill-current animate-pulse' : ''}`} />
                                            {favoriteLoading ? 'Loading...' : (isFavorite ? 'Favorited' : 'Add to Favorites')}
                                        </Button>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="container mx-auto px-4 py-6 max-w-7xl">
                    {/* Reviews */}
                    <Card className="bg-slate-800/50 border-purple-500/20">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                                Reviews ({book.review_count})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {auth.user && (
                                <div className="mb-6">
                                    {userReview ? (
                                        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 border-purple-500/30">
                                            <CardContent className="pt-6">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div>
                                                        <p className="font-semibold text-white">Your Review</p>
                                                        <div className="flex items-center gap-1 mt-1">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <Star
                                                                    key={star}
                                                                    className={`h-4 w-4 ${
                                                                        star <= userReview.rating
                                                                            ? 'fill-yellow-400 text-yellow-400'
                                                                            : 'fill-none text-purple-300/30'
                                                                    }`}
                                                                />
                                                            ))}
                                                            <span className="ml-2 text-yellow-400 font-medium">{userReview.rating}.0</span>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setShowReviewForm(true)}
                                                        className="border-purple-500/50 text-purple-200 hover:bg-purple-500/20"
                                                    >
                                                        Edit
                                                    </Button>
                                                </div>
                                                <p className="text-purple-200">{userReview.comment}</p>
                                            </CardContent>
                                        </Card>
                                    ) : (
                                        <Button
                                            onClick={() => setShowReviewForm(true)}
                                            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                                        >
                                            Write a Review
                                        </Button>
                                    )}

                                    {showReviewForm && (
                                        <Card className="mt-4 bg-slate-800/50 border-purple-500/20">
                                            <CardContent className="pt-6">
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block mb-3 text-purple-200 font-medium">Your Rating</label>
                                                        <div className="flex gap-2">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <button
                                                                    key={star}
                                                                    type="button"
                                                                    onClick={() => setReviewRating(star)}
                                                                    className="transition-all hover:scale-125 focus:outline-none focus:scale-125"
                                                                >
                                                                    <Star
                                                                        className={`h-10 w-10 transition-all ${
                                                                            star <= reviewRating
                                                                                ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]'
                                                                                : 'fill-none text-purple-300/30 hover:text-purple-300/60'
                                                                        }`}
                                                                    />
                                                                </button>
                                                            ))}
                                                            <span className="ml-3 text-2xl font-bold text-yellow-400">
                                                                {reviewRating}.0
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block mb-2 text-purple-200 font-medium">Comment</label>
                                                        <Textarea
                                                            value={reviewComment}
                                                            onChange={(e) => setReviewComment(e.target.value)}
                                                            rows={4}
                                                            className="bg-slate-900/50 border-purple-500/30 text-white placeholder:text-purple-300/50"
                                                            placeholder="Share your thoughts about this book..."
                                                        />
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button 
                                                            onClick={submitReview}
                                                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                                                        >
                                                            {userReview ? 'Update Review' : 'Submit Review'}
                                                        </Button>
                                                        <Button 
                                                            variant="outline" 
                                                            onClick={() => setShowReviewForm(false)}
                                                            className="border-purple-500/50 text-purple-200 hover:bg-purple-500/20 hover:text-white"
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            )}

                            {/* Reviews List */}
                            <div className="space-y-4">
                                {book.reviews && book.reviews.length > 0 ? (
                                    book.reviews.map((review) => (
                                        <Card key={review.id} className="bg-slate-900/30 border-purple-500/10 hover:border-purple-500/30 transition-all">
                                            <CardContent className="pt-6">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                                            <User className="h-5 w-5 text-white" />
                                                        </div>
                                                        <div>
                                                            <span className="font-semibold text-white">{review.user.name}</span>
                                                            <p className="text-xs text-purple-300">
                                                                {new Date(review.created_at).toLocaleDateString('en-US', { 
                                                                    year: 'numeric', 
                                                                    month: 'long', 
                                                                    day: 'numeric' 
                                                                })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1 bg-yellow-400/10 px-3 py-1 rounded-full">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <Star
                                                                key={star}
                                                                className={`h-3 w-3 ${
                                                                    star <= review.rating
                                                                        ? 'fill-yellow-400 text-yellow-400'
                                                                        : 'fill-none text-purple-300/30'
                                                                }`}
                                                            />
                                                        ))}
                                                        <span className="ml-1 text-sm font-medium text-yellow-400">{review.rating}.0</span>
                                                    </div>
                                                </div>
                                                <p className="text-purple-100 mt-3">{review.comment}</p>
                                            </CardContent>
                                        </Card>
                                    ))
                                ) : (
                                    <div className="text-center py-12">
                                        <Star className="h-12 w-12 mx-auto text-purple-400 mb-3 opacity-50" />
                                        <p className="text-purple-300">No reviews yet. Be the first to review this book!</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recommendations Section */}
                    {recommendations.length > 0 && (
                        <Card className="bg-slate-800/50 border-purple-500/20">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center gap-2 text-white text-lg">
                                    <BookOpen className="h-4 w-4 text-purple-400" />
                                    You Might Also Like
                                </CardTitle>
                                <p className="text-xs text-purple-300">
                                    Based on genre and ratings similar to this book
                                </p>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-3 grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
                                    {recommendations.slice(0, 7).map((recBook) => (
                                        <Card 
                                            key={recBook.id} 
                                            className="group overflow-hidden hover:shadow-lg transition-all duration-300 h-full bg-slate-900/50 border-purple-500/20"
                                        >
                                            <Link href={`/books/${recBook.id}`}>
                                                <div className="relative aspect-[2/3] overflow-hidden bg-slate-900/30">
                                                    {recBook.cover_image ? (
                                                        <img
                                                            src={`/storage/${recBook.cover_image}`}
                                                            alt={recBook.title}
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
                                                        <span className="text-[9px]">{Number(recBook.rating).toFixed(1)}</span>
                                                    </Badge>
                                                </div>
                                                <CardContent className="p-2">
                                                    <h4 className="font-semibold text-xs line-clamp-2 mb-1 text-white group-hover:text-purple-300 transition-colors">
                                                        {recBook.title}
                                                    </h4>
                                                    <p className="text-[10px] text-purple-300 line-clamp-1">
                                                        {recBook.author}
                                                    </p>
                                                </CardContent>
                                            </Link>
                                        </Card>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </UserLayout>
        </>
    );
}

