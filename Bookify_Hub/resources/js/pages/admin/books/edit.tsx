import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { ArrowLeft, Search, Book, Loader2, ExternalLink } from 'lucide-react';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'react-toastify';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

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
}

interface PageProps {
    bookId?: number | string;
}

export default function AdminBooksEdit({ bookId }: PageProps) {
    // Get CSRF token from meta tag (more reliable)
    const getCsrfToken = () => {
        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (!token) {
            console.error('CSRF token not found in meta tag!');
        }
        return token || '';
    };
    
    // Convert bookId to number or get from URL if undefined
    const id = bookId ? (typeof bookId === 'string' ? parseInt(bookId) : bookId) : undefined;
    const [book, setBook] = useState<BookType | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        publication_year: '',
        genre: '',
        description: '',
        cover_image: null as File | null,
    });
    const [preview, setPreview] = useState<string | null>(null);
    const [googleBooksFilename, setGoogleBooksFilename] = useState<string>(''); // Store filename from Google Books
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Google Books state
    const [showGoogleBooksModal, setShowGoogleBooksModal] = useState(false);
    const [googleSearchQuery, setGoogleSearchQuery] = useState('');
    const [googleSearchResults, setGoogleSearchResults] = useState<any[]>([]);
    const [googleSearching, setGoogleSearching] = useState(false);

    const fetchBook = async () => {
        if (!id) {
            setError('Book ID is missing');
            return;
        }

        try {
            const response = await fetch(`/api/books/${id}`, {
                credentials: 'include',
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            setBook(data.book);
            setFormData({
                title: data.book.title,
                author: data.book.author,
                publication_year: data.book.publication_year,
                genre: data.book.genre,
                description: data.book.description,
                cover_image: null,
            });
            if (data.book.cover_image) {
                setPreview(`/storage/${data.book.cover_image}`);
            }
        } catch (error) {
            console.error('Error fetching book:', error);
            setError('Failed to load book data');
        }
    };

    useEffect(() => {
        fetchBook();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file size (2MB max)
            if (file.size > 2 * 1024 * 1024) {
                toast.error('Image size must be less than 2MB');
                return;
            }
            if (!file.type.startsWith('image/')) {
                toast.error('Please upload an image file');
                return;
            }
            console.log('Image selected for edit:', {
                name: file.name,
                size: (file.size / 1024).toFixed(2) + ' KB',
                type: file.type
            });
            setFormData((prev) => ({ ...prev, cover_image: file }));
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
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

    const selectGoogleBook = async (googleBook: any) => {
        // Update form with Google Books data
        setFormData(prev => ({
            ...prev,
            title: googleBook.title,
            author: googleBook.author,
            publication_year: googleBook.published_year || prev.publication_year,
            genre: googleBook.genre || prev.genre,
            description: googleBook.description || prev.description,
        }));

        // Download and set cover image if available
        if (googleBook.cover_image_url) {
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
                    body: JSON.stringify({ url: googleBook.cover_image_url }),
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
                    setPreview(data.url);
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
        
        if (!id) {
            setError('Book ID is missing');
            return;
        }

        setLoading(true);
        setError(null);

        const formDataToSend = new FormData();
        
        // Add CSRF token to FormData body
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
        formDataToSend.append('_token', csrfToken);
        
        Object.entries(formData).forEach(([key, value]) => {
            if (key === 'cover_image' && value) {
                formDataToSend.append(key, value);
                console.log('📎 Updating book with new image:', {
                    name: (value as File).name,
                    size: ((value as File).size / 1024).toFixed(2) + ' KB',
                    type: (value as File).type
                });
            } else if (key !== 'cover_image') {
                formDataToSend.append(key, value);
            }
        });
        
        // Add Google Books cover if available
        if (!formData.cover_image && googleBooksFilename) {
            formDataToSend.append('google_books_cover', googleBooksFilename);
            console.log('Using Google Books cover:', googleBooksFilename);
        }

        console.log('Sending update to backend...');

        try {
            const response = await fetch(`/api/admin/books/${id}`, {
                method: 'POST',
                body: formDataToSend,
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                credentials: 'include',
            });

            console.log('Response status:', response.status, response.statusText);

            const data = await response.json();
            console.log('Update response:', data);

            if (response.ok) {
                toast.success('Book updated successfully!');
                setTimeout(() => {
                router.visit('/admin/books');
                }, 500);
            } else {
                console.error('Update error:', data);
                setError(data.message || 'Error updating book');
                toast.error(data.message || 'Failed to update book');
            }
        } catch (error) {
            console.error('Error updating book:', error);
            setError('Error updating book');
            toast.error('An error occurred while updating the book');
        } finally {
            setLoading(false);
        }
    };

    if (!book) {
        return (
            <AdminLayout>
                <div className="container mx-auto px-4 py-6">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 bg-muted rounded w-3/4" />
                        <div className="h-64 bg-muted rounded" />
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <>
            <Head title={`Edit ${book.title}`} />
            <AdminLayout>
                <div className="container mx-auto px-4 py-6 max-w-3xl">
                    <Link href="/admin/books">
                        <Button variant="ghost" className="mb-4">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Books
                        </Button>
                    </Link>

                    <Card>
                        <CardHeader>
                            <CardTitle>Edit Book</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* Google Books Quick Import */}
                            <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-full bg-primary/10">
                                            <Book className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-sm">Replace with Google Books Data</h3>
                                            <p className="text-xs text-muted-foreground">
                                                Search and update book information from Google Books
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        onClick={() => setShowGoogleBooksModal(true)}
                                        size="sm"
                                        className="gap-2"
                                    >
                                        <Search className="h-3 w-3" />
                                        Search
                                    </Button>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {error && (
                                    <div className="p-4 bg-destructive/10 text-destructive rounded-md">
                                        {error}
                                    </div>
                                )}

                                <div>
                                    <Label htmlFor="title">Title *</Label>
                                    <Input
                                        id="title"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="author">Author *</Label>
                                    <Input
                                        id="author"
                                        name="author"
                                        value={formData.author}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <Label htmlFor="publication_year">Publication Year *</Label>
                                        <Input
                                            id="publication_year"
                                            name="publication_year"
                                            type="number"
                                            value={formData.publication_year}
                                            onChange={handleChange}
                                            min="1000"
                                            max={new Date().getFullYear()}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="genre">Genre *</Label>
                                        <Input
                                            id="genre"
                                            name="genre"
                                            value={formData.genre}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="description">Description *</Label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={6}
                                        className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="cover_image">Cover Image</Label>
                                    <Input
                                        id="cover_image"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="cursor-pointer"
                                    />
                                    {preview && (
                                        <div className="mt-2">
                                            <img
                                                src={preview}
                                                alt="Preview"
                                                className="h-48 w-32 object-cover rounded border"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <Button type="submit" disabled={loading}>
                                        {loading ? 'Updating...' : 'Update Book'}
                                    </Button>
                                    <Button type="button" variant="outline" asChild>
                                        <Link href="/admin/books">Cancel</Link>
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Google Books Search Modal */}
                <Dialog open={showGoogleBooksModal} onOpenChange={setShowGoogleBooksModal}>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Book className="h-5 w-5 text-primary" />
                                Replace with Google Books Data
                            </DialogTitle>
                            <DialogDescription>
                                Search for a book and replace current data automatically
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
                                        {googleSearchResults.map((googleBook, index) => (
                                            <Card
                                                key={index}
                                                className="cursor-pointer hover:border-primary transition-colors"
                                                onClick={() => selectGoogleBook(googleBook)}
                                            >
                                                <CardContent className="p-4">
                                                    <div className="flex gap-4">
                                                        {/* Book Cover */}
                                                        <div className="flex-shrink-0">
                                                            {googleBook.thumbnail ? (
                                                                <img
                                                                    src={googleBook.thumbnail}
                                                                    alt={googleBook.title}
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
                                                                {googleBook.title}
                                                            </h4>
                                                            <p className="text-sm text-muted-foreground line-clamp-1">
                                                                {googleBook.author}
                                                            </p>
                                                            <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
                                                                {googleBook.published_year && (
                                                                    <span className="bg-muted px-2 py-0.5 rounded">
                                                                        {googleBook.published_year}
                                                                    </span>
                                                                )}
                                                                {googleBook.genre && (
                                                                    <span className="bg-muted px-2 py-0.5 rounded">
                                                                        {googleBook.genre}
                                                                    </span>
                                                                )}
                                                                {googleBook.page_count && (
                                                                    <span className="bg-muted px-2 py-0.5 rounded">
                                                                        {googleBook.page_count} pages
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {googleBook.description && (
                                                                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                                                                    {googleBook.description}
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

