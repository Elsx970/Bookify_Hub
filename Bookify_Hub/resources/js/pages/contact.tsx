import { Head } from '@inertiajs/react';
import { Mail, MessageSquare, MapPin, Phone } from 'lucide-react';
import UserLayout from '@/layouts/user-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useState } from 'react';

export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, this would send to a backend API
        toast.success('Message sent! We\'ll get back to you soon.');
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    const contactInfo = [
        {
            icon: Mail,
            title: 'Email',
            content: 'support@bookifyhub.com',
            link: 'mailto:support@bookifyhub.com',
        },
        {
            icon: Phone,
            title: 'Phone',
            content: '+1 (555) 123-4567',
            link: 'tel:+15551234567',
        },
        {
            icon: MapPin,
            title: 'Address',
            content: '123 Library Street, Book City, BC 12345',
            link: null,
        },
        {
            icon: MessageSquare,
            title: 'Support Hours',
            content: 'Mon-Fri: 9AM - 6PM EST',
            link: null,
        },
    ];

    return (
        <>
            <Head title="Contact Us" />
            <UserLayout>
                <div className="container mx-auto px-4 py-12 max-w-6xl">
                    {/* Hero Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">Get In Touch</h1>
                        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                            Have a question or feedback? We'd love to hear from you!
                        </p>
                    </motion.div>

                    {/* Contact Info Grid */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
                        {contactInfo.map((item, index) => (
                            <motion.div
                                key={item.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="text-center h-full">
                                    <CardContent className="pt-6">
                                        <item.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                                        <h3 className="font-semibold mb-2">{item.title}</h3>
                                        {item.link ? (
                                            <a
                                                href={item.link}
                                                className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                            >
                                                {item.content}
                                            </a>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">{item.content}</p>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {/* Contact Form */}
                    <div className="grid gap-8 md:grid-cols-2">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle>Send Us a Message</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium mb-2 block">Name</label>
                                            <Input
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="Your name"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-2 block">Email</label>
                                            <Input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                placeholder="your@email.com"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-2 block">Subject</label>
                                            <Input
                                                value={formData.subject}
                                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                                placeholder="What's this about?"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-2 block">Message</label>
                                            <Textarea
                                                value={formData.message}
                                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                                placeholder="Tell us more..."
                                                rows={5}
                                                required
                                            />
                                        </div>
                                        <Button type="submit" className="w-full">
                                            Send Message
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <Card className="h-full">
                                <CardHeader>
                                    <CardTitle>Frequently Asked Questions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <h4 className="font-semibold mb-2">How do I add books to my favorites?</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Simply click the heart icon on any book detail page to add it to your favorites!
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-2">Can I edit my reviews?</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Yes! Go to any book you've reviewed and you'll see an option to edit your review.
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-2">How often is the library updated?</h4>
                                        <p className="text-sm text-muted-foreground">
                                            We add new books regularly! Check back often to discover the latest additions.
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-2">Is my data secure?</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Absolutely! We take your privacy seriously and use industry-standard encryption.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </UserLayout>
        </>
    );
}

