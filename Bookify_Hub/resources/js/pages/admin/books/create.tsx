import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, Upload, X, Book, Search, ExternalLink, Loader2 } from 'lucide-react';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'react-toastify';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

export default function AdminBooksCreate() {
    // Get CSRF token from meta tag (more reliable)
    const getCsrfToken = () => {
        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (!token) {
            console.error('CSRF token not found in meta tag!');
        }
        return token || '';
    };
    
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        publication_year: new Date().getFullYear(),
        genre: '',
        description: '',
        rating: 0,
    });
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [googleBooksFilename, setGoogleBooksFilename] = useState<string>(''); // Store filename from Google Books
    const [submitting, setSubmitting] = useState(false);

    // Google Books state
    const [showGoogleBooksModal, setShowGoogleBooksModal] = useState(false);
    const [googleSearchQuery, setGoogleSearchQuery] = useState('');
    const [googleSearchResults, setGoogleSearchResults] = useState<any[]>([]);
    const [googleSearching, setGoogleSearching] = useState(false);

    const genres = [
        'Fiction', 'Non-Fiction', 'Mystery', 'Thriller', 'Romance', 'Science Fiction',
        'Fantasy', 'Horror', 'Biography', 'History', 'Self-Help', 'Business',
        'Poetry', 'Drama', 'Adventure', 'Crime', 'Philosophy', 'Religion',
        'Science', 'Technology', 'Travel', 'Children', 'Young Adult', 'Comics'
    ];

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Match backend validation: max 2MB
            if (file.size > 2 * 1024 * 1024) { // 2MB limit (match backend)
                toast.error('Image size must be less than 2MB');
                return;
            }
            if (!file.type.startsWith('image/')) {
                toast.error('Please upload an image file');
                return;
            }
            console.log('Image selected:', {
                name: file.name,
                size: (file.size / 1024).toFixed(2) + ' KB',
                type: file.type
            });
            setCoverImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setCoverImage(null);
        setPreviewUrl('');
    };

    // Google Books functions
    const searchGoogleBooks = async () => {
        if (!googleSearchQuery.trim()) {
            toast.error('Please enter a search query');
            return;
        }

        setGoogleSearching(true);
        try {
            const response = await fetch(`/api/admin/google-books/search?query=${encodeURIComponent(googleSearchQuery)}`, {
                credentials: 'include',
            });
            
            console.log('Google Books API Response Status:', response.status);
            
            if (!response.ok) {
                console.error('Response not OK:', response.status, response.statusText);
                const errorText = await response.text();
                console.error('Error body:', errorText);
                toast.error(`API Error: ${response.status} ${response.statusText}`);
                setGoogleSearching(false);
                return;
            }
            
            const data = await response.json();
            console.log('Google Books API Data:', data);
            
            if (data.success) {
                setGoogleSearchResults(data.results || []);
                if (data.results.length === 0) {
                    toast.info('No books found. Try a different search term.');
                } else {
                    toast.success(`Found ${data.results.length} books!`);
                }
            } else {
                console.error('API returned success: false');
                toast.error('Failed to search Google Books');
            }
        } catch (error) {
            console.error('Google Books search error:', error);
            toast.error('Failed to search Google Books');
        } finally {
            setGoogleSearching(false);
        }
    };

    const selectGoogleBook = async (book: any) => {
        // Auto-fill form with Google Books data
        setFormData({
            title: book.title,
            author: book.author,
            publication_year: book.published_year || new Date().getFullYear(),
            genre: book.genre || '',
            description: book.description || '',
            rating: 0, // Default rating
        });

        // Download and set cover image if available
        if (book.cover_image_url) {
            try {
                toast.info('Downloading cover image...');
                
                const csrfToken = getCsrfToken();
                console.log('Using CSRF Token:', csrfToken ? 'Found' : 'NOT FOUND');
                
                const response = await fetch('/api/admin/google-books/download-cover', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    credentials: 'include',
                    body: JSON.stringify({ url: book.cover_image_url }),
                });
                
                console.log('Cover download response status:', response.status);
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Cover download failed:', response.status, errorText);
                    toast.warning('Book data imported, but failed to download cover image');
                    return;
                }
                
                const data = await response.json();
                console.log('Cover download success:', data);
                console.log('Cover URL:', data.url);
                
                if (data.success && data.url && data.filename) {
                    setPreviewUrl(data.url);
                    setGoogleBooksFilename(data.filename); // Store filename for form submission
                    console.log('Preview URL set to:', data.url);
                    console.log('Google Books filename:', data.filename);
                    toast.success('Book data imported from Google Books!');
                } else {
                    console.error('No URL in response:', data);
                    toast.warning('Book data imported, but failed to download cover image');
                }
            } catch (error) {
                console.error('Cover download error:', error);
                toast.warning('Book data imported, but failed to download cover image');
            }
        } else {
            toast.success('Book data imported from Google Books!');
        }

        // Close modal
        setShowGoogleBooksModal(false);
        setGoogleSearchQuery('');
        setGoogleSearchResults([]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation
        if (!formData.title.trim()) {
            toast.error('Please enter a title');
            return;
        }
        if (!formData.author.trim()) {
            toast.error('Please enter an author');
            return;
        }
        if (!formData.genre) {
            toast.error('Please select a genre');
            return;
        }

        setSubmitting(true);

        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('author', formData.author);
            data.append('publication_year', formData.publication_year.toString());
            data.append('genre', formData.genre);
            data.append('description', formData.description);
            data.append('rating', formData.rating.toString());
            
            // CRITICAL: Add CSRF token to FormData body
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            data.append('_token', csrfToken);
            
            if (coverImage) {
                data.append('cover_image', coverImage);
                console.log('📎 Uploading book with image:', {
                    name: coverImage.name,
                    size: (coverImage.size / 1024).toFixed(2) + ' KB',
                    type: coverImage.type
                });
            } else if (googleBooksFilename) {
                // If cover was downloaded from Google Books, send the filename
                data.append('google_books_cover', googleBooksFilename);
                console.log('Using Google Books cover:', googleBooksFilename);
            } else {
                console.log('No image selected');
            }

            console.log('Sending FormData to backend...');
            
            const response = await fetch('/api/admin/books', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                credentials: 'include',
                body: data,
            });

            console.log('Response status:', response.status, response.statusText);
            
            const result = await response.json();
            console.log('Upload response:', result);

            if (response.ok) {
                toast.success('Book added successfully!');
                // Small delay to ensure image is saved
                setTimeout(() => {
                router.visit('/admin/books');
                }, 500);
            } else {
                console.error('Upload error:', result);
                toast.error(result.message || 'Failed to add book');
            }
        } catch (error) {
            console.error('Error adding book:', error);
            toast.error('An error occurred while adding the book');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <Head title="Add New Book - Admin" />
            <AdminLayout>
                <div className="container mx-auto px-4 py-6 max-w-4xl">
                    {/* Header */}
                    <div className="mb-6">
                    <Link href="/admin/books">
                        <Button variant="ghost" className="mb-4">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Books
                        </Button>
                    </Link>
                        <h1 className="text-3xl font-bold">Add New Book</h1>
                        <p className="text-muted-foreground mt-1">
                            Fill in the details to add a new book to the library
                        </p>
                    </div>

                    {/* Google Books Quick Import */}
                    <Card className="mb-6 border-primary/20 bg-primary/5">
                        <CardContent className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-primary/10">
                                    <Book className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Import from Google Books</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Search and import book data instantly
                                    </p>
                                </div>
                            </div>
                            <Button
                                type="button"
                                onClick={() => setShowGoogleBooksModal(true)}
                                className="gap-2"
                            >
                                <Search className="h-4 w-4" />
                                Search Books
                            </Button>
                        </CardContent>
                    </Card>

                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-6 md:grid-cols-3">
                            {/* Cover Image Upload */}
                            <div className="md:col-span-1">
                    <Card>
                        <CardHeader>
                                        <CardTitle className="text-base">Cover Image</CardTitle>
                        </CardHeader>
                        <CardContent>
                                        <div className="space-y-4">
                                            {previewUrl ? (
                                                <div className="relative aspect-[3/4] bg-muted rounded-lg overflow-hidden group">
                                                    <img
                                                        src={previewUrl}
                                                        alt="Cover preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={removeImage}
                                                        className="absolute top-2 right-2 p-2 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                    </div>
                                            ) : (
                                                <label className="aspect-[3/4] flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                                                    <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                                                    <span className="text-sm text-muted-foreground text-center px-4">
                                                        Click to upload cover image
                                                    </span>
                                                    <span className="text-xs text-muted-foreground mt-2">
                                                        PNG, JPG up to 2MB
                                                    </span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={handleImageChange}
                                                    />
                                                </label>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Book Details */}
                            <div className="md:col-span-2 space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Book Details</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Title */}
                                <div>
                                    <Label htmlFor="title">Title *</Label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                placeholder="Enter book title"
                                        required
                                    />
                                </div>

                                        {/* Author */}
                                <div>
                                    <Label htmlFor="author">Author *</Label>
                                    <Input
                                        id="author"
                                        value={formData.author}
                                                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                                placeholder="Enter author name"
                                        required
                                    />
                                </div>

                                        {/* Year & Genre */}
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                                <Label htmlFor="year">Publication Year *</Label>
                                        <Input
                                                    id="year"
                                            type="number"
                                            min="1000"
                                            max={new Date().getFullYear()}
                                                    value={formData.publication_year}
                                                    onChange={(e) => setFormData({ ...formData, publication_year: parseInt(e.target.value) })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="genre">Genre *</Label>
                                                <select
                                            id="genre"
                                            value={formData.genre}
                                                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                                                    className="flex h-9 w-full rounded-md border border-purple-500/30 bg-slate-800/50 text-white px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-purple-500 focus:ring-2 focus:ring-purple-500/20 hover:border-purple-500/50 transition-colors"
                                            required
                                                >
                                                    <option value="" className="bg-slate-800 text-purple-300">Select genre</option>
                                                    {genres.map((genre) => (
                                                        <option key={genre} value={genre} className="bg-slate-800 text-white hover:bg-purple-600">{genre}</option>
                                                    ))}
                                                </select>
                                    </div>
                                </div>

                                        {/* Rating */}
                                <div>
                                            <Label htmlFor="rating">Initial Rating (Optional)</Label>
                                            <Input
                                                id="rating"
                                                type="number"
                                                min="0"
                                                max="5"
                                                step="0.1"
                                                value={formData.rating}
                                                onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                                                placeholder="0.0 - 5.0"
                                    />
                                </div>

                                        {/* Description */}
                                <div>
                                            <Label htmlFor="description">Description</Label>
                                            <Textarea
                                                id="description"
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                placeholder="Enter book description or summary..."
                                                rows={6}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Submit Buttons */}
                                <div className="flex gap-3 justify-end">
                                    <Link href="/admin/books">
                                        <Button type="button" variant="outline">
                                            Cancel
                                        </Button>
                                    </Link>
                                    <Button type="submit" disabled={submitting}>
                                        {submitting ? (
                                            <>Processing...</>
                                        ) : (
                                            <>
                                                <Book className="h-4 w-4 mr-2" />
                                                Add Book
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Google Books Search Modal */}
                <Dialog open={showGoogleBooksModal} onOpenChange={setShowGoogleBooksModal}>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Book className="h-5 w-5 text-primary" />
                                Import from Google Books
                            </DialogTitle>
                            <DialogDescription>
                                Search for a book and import its data automatically
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            {/* Search Input */}
                            <div className="flex gap-2">
                                    <Input
                                    placeholder="Search by title, author, or ISBN..."
                                    value={googleSearchQuery}
                                    onChange={(e) => setGoogleSearchQuery(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && searchGoogleBooks()}
                                    className="flex-1"
                                />
                                <Button
                                    onClick={searchGoogleBooks}
                                    disabled={googleSearching || !googleSearchQuery.trim()}
                                >
                                    {googleSearching ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Searching...
                                        </>
                                    ) : (
                                        <>
                                            <Search className="h-4 w-4 mr-2" />
                                            Search
                                        </>
                                    )}
                                </Button>
                            </div>

                            {/* Search Results */}
                            {googleSearchResults.length > 0 && (
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold text-muted-foreground">
                                        Found {googleSearchResults.length} books
                                    </h3>
                                    <div className="grid gap-3 max-h-96 overflow-y-auto">
                                        {googleSearchResults.map((book, index) => (
                                            <Card
                                                key={index}
                                                className="cursor-pointer hover:border-primary transition-colors"
                                                onClick={() => selectGoogleBook(book)}
                                            >
                                                <CardContent className="p-4">
                                                    <div className="flex gap-4">
                                                        {/* Book Cover */}
                                                        <div className="flex-shrink-0">
                                                            {book.thumbnail ? (
                                                                <img
                                                                    src={book.thumbnail}
                                                                    alt={book.title}
                                                                    className="w-16 h-24 object-cover rounded"
                                                                />
                                                            ) : (
                                                                <div className="w-16 h-24 bg-muted rounded flex items-center justify-center">
                                                                    <Book className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                    )}
                                </div>

                                                        {/* Book Info */}
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-semibold text-sm line-clamp-1">
                                                                {book.title}
                                                            </h4>
                                                            <p className="text-sm text-muted-foreground line-clamp-1">
                                                                {book.author}
                                                            </p>
                                                            <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
                                                                {book.published_year && (
                                                                    <span className="bg-muted px-2 py-0.5 rounded">
                                                                        {book.published_year}
                                                                    </span>
                                                                )}
                                                                {book.genre && (
                                                                    <span className="bg-muted px-2 py-0.5 rounded">
                                                                        {book.genre}
                                                                    </span>
                                                                )}
                                                                {book.page_count && (
                                                                    <span className="bg-muted px-2 py-0.5 rounded">
                                                                        {book.page_count} pages
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {book.description && (
                                                                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                                                                    {book.description}
                                                                </p>
                                                            )}
                                                        </div>

                                                        {/* Select Icon */}
                                                        <div className="flex-shrink-0">
                                                            <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                                        </div>
                                </div>
                        </CardContent>
                    </Card>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* No results message */}
                            {!googleSearching && googleSearchResults.length === 0 && googleSearchQuery && (
                                <div className="text-center py-12 text-muted-foreground">
                                    <Search className="h-12 w-12 mx-auto mb-4 opacity-30" />
                                    <p>No books found. Try a different search term.</p>
                                </div>
                            )}
                </div>
                    </DialogContent>
                </Dialog>
            </AdminLayout>
        </>
    );
}
