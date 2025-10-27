import { useState } from 'react';
import { X, Star, Heart, Calendar, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';

interface Book {
    id: number;
    title: string;
    author: string;
    publication_year: number;
    genre: string;
    description: string;
    rating: number;
    cover_image?: string;
    review_count: number;
}

interface QuickViewModalProps {
    book: Book | null;
    isOpen: boolean;
    onClose: () => void;
}

export function BookQuickViewModal({ book, isOpen, onClose }: QuickViewModalProps) {
    if (!book) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={onClose}
                    >
                        <div
                            onClick={(e) => e.stopPropagation()}
                            className="bg-background border rounded-lg shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto"
                        >
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 rounded-full bg-background/80 hover:bg-muted transition-colors z-10"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            <div className="grid md:grid-cols-[250px_1fr] gap-6 p-6">
                                {/* Cover Image */}
                                <div className="aspect-[3/4] relative overflow-hidden bg-muted rounded-lg">
                                    {book.cover_image ? (
                                        <img
                                            src={`/storage/${book.cover_image}`}
                                            alt={book.title}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <BookOpen className="h-16 w-16 text-muted-foreground" />
                                        </div>
                                    )}
                                </div>

                                {/* Book Info */}
                                <div className="space-y-4">
                                    <div>
                                        <Badge variant="secondary" className="mb-2">
                                            {book.genre}
                                        </Badge>
                                        <h2 className="text-2xl font-bold mb-1">{book.title}</h2>
                                        <p className="text-lg text-muted-foreground mb-3">by {book.author}</p>

                                        <div className="flex items-center gap-4 text-sm">
                                            <div className="flex items-center gap-1">
                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                <span className="font-bold">{Number(book.rating).toFixed(1)}</span>
                                                <span className="text-muted-foreground">
                                                    ({book.review_count} {book.review_count === 1 ? 'review' : 'reviews'})
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                <Calendar className="h-4 w-4" />
                                                <span>{book.publication_year}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="prose dark:prose-invert prose-sm max-w-none">
                                        <p className="line-clamp-6">{book.description}</p>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <Link href={`/books/${book.id}`} className="flex-1">
                                            <Button className="w-full">
                                                <BookOpen className="h-4 w-4 mr-2" />
                                                View Details
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

