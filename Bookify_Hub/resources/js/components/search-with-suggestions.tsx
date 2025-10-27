import { useState, useEffect, useRef } from 'react';
import { Search, Book, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';

interface BookSuggestion {
    id: number;
    title: string;
    author: string;
    cover_image?: string;
    rating: number;
    genre: string;
}

interface SearchWithSuggestionsProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export function SearchWithSuggestions({
    value,
    onChange,
    placeholder = "Search books by title or author...",
    className = "",
}: SearchWithSuggestionsProps) {
    const [suggestions, setSuggestions] = useState<BookSuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!value.trim() || value.length < 2) {
                setSuggestions([]);
                setShowSuggestions(false);
                return;
            }

            setLoading(true);
            try {
                const response = await fetch(`/api/books?search=${encodeURIComponent(value)}&per_page=8`, {
                    credentials: 'include',
                });
                const data = await response.json();
                setSuggestions(data.data || []);
                setShowSuggestions(true);
                setSelectedIndex(-1);
            } catch (error) {
                console.error('Error fetching suggestions:', error);
                setSuggestions([]);
            } finally {
                setLoading(false);
            }
        };

        const debounce = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(debounce);
    }, [value]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showSuggestions || suggestions.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
                    window.location.href = `/books/${suggestions[selectedIndex].id}`;
                }
                break;
            case 'Escape':
                setShowSuggestions(false);
                setSelectedIndex(-1);
                break;
        }
    };

    const handleSuggestionClick = (bookId: number) => {
        setShowSuggestions(false);
        setSelectedIndex(-1);
    };

    return (
        <div ref={wrapperRef} className={`relative ${className}`}>
            <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    ref={inputRef}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => value.length >= 2 && suggestions.length > 0 && setShowSuggestions(true)}
                    className="pl-9 pr-10"
                />
                {loading && (
                    <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                )}
            </div>

            <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute z-50 w-full mt-2 bg-popover border rounded-lg shadow-lg overflow-hidden"
                    >
                        <div className="max-h-96 overflow-y-auto">
                            {suggestions.map((book, index) => (
                                <Link
                                    key={book.id}
                                    href={`/books/${book.id}`}
                                    onClick={() => handleSuggestionClick(book.id)}
                                    className={`flex items-center gap-3 p-3 transition-colors ${
                                        index === selectedIndex
                                            ? 'bg-accent'
                                            : 'hover:bg-accent/50'
                                    } ${
                                        index < suggestions.length - 1 ? 'border-b' : ''
                                    }`}
                                >
                                    {/* Book Cover */}
                                    <div className="flex-shrink-0 w-12 h-16">
                                        {book.cover_image ? (
                                            <img
                                                src={`/storage/${book.cover_image}`}
                                                alt={book.title}
                                                className="w-full h-full object-cover rounded shadow-sm"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-muted rounded flex items-center justify-center">
                                                <Book className="h-6 w-6 text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Book Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm line-clamp-1">
                                            {book.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground line-clamp-1">
                                            {book.author}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-muted-foreground">
                                                {book.genre}
                                            </span>
                                            <span className="text-xs text-muted-foreground">•</span>
                                            <div className="flex items-center gap-1">
                                                <span className="text-xs font-medium">
                                                    {Number(book.rating).toFixed(1)}
                                                </span>
                                                <span className="text-xs text-yellow-500">★</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="p-2 bg-muted/50 text-center">
                            <p className="text-xs text-muted-foreground">
                                Press <kbd className="px-1.5 py-0.5 text-xs border rounded bg-background">Enter</kbd> to visit,{' '}
                                <kbd className="px-1.5 py-0.5 text-xs border rounded bg-background">↑↓</kbd> to navigate
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* No results */}
            <AnimatePresence>
                {showSuggestions && !loading && value.length >= 2 && suggestions.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute z-50 w-full mt-2 bg-popover border rounded-lg shadow-lg p-4 text-center"
                    >
                        <Book className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                            No books found for "{value}"
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

