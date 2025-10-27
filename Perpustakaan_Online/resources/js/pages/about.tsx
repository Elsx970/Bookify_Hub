import { Head, Link } from '@inertiajs/react';
import { Book, Users, Star, Target, Heart, Award } from 'lucide-react';
import UserLayout from '@/layouts/user-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function About() {
    const features = [
        {
            icon: Book,
            title: 'Vast Collection',
            description: 'Access thousands of books across multiple genres and categories.',
        },
        {
            icon: Star,
            title: 'User Reviews',
            description: 'Read honest reviews and ratings from our community of readers.',
        },
        {
            icon: Heart,
            title: 'Personal Library',
            description: 'Create your own collection of favorites and track your reading journey.',
        },
        {
            icon: Users,
            title: 'Community',
            description: 'Join a vibrant community of book lovers and share your thoughts.',
        },
        {
            icon: Target,
            title: 'Smart Recommendations',
            description: 'Discover new books based on your reading preferences.',
        },
        {
            icon: Award,
            title: 'Quality Content',
            description: 'Curated collection with detailed information and high-quality covers.',
        },
    ];

    return (
        <>
            <Head title="About Us" />
            <UserLayout>
                <div className="container mx-auto px-4 py-12 max-w-6xl">
                    {/* Hero Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-16"
                    >
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">About Bookify Hub</h1>
                        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                            Your ultimate destination for discovering, reviewing, and managing your favorite books
                        </p>
                    </motion.div>

                    {/* Mission Section */}
                    <Card className="mb-12">
                        <CardContent className="p-8">
                            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
                            <p className="text-muted-foreground mb-4">
                                At Bookify Hub, we believe in the power of reading to transform lives. Our mission is to create 
                                a comprehensive platform where book lovers can explore, discover, and share their passion for literature.
                            </p>
                            <p className="text-muted-foreground">
                                We strive to build a community where readers of all backgrounds can connect, share insights, 
                                and help each other find their next great read. Whether you're looking for a classic novel, 
                                the latest bestseller, or hidden gems, Bookify Hub is here to guide your literary journey.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Features Grid */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold mb-6 text-center">What We Offer</h2>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {features.map((feature, index) => (
                                <motion.div
                                    key={feature.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card className="h-full hover:shadow-lg transition-shadow">
                                        <CardContent className="p-6">
                                            <feature.icon className="h-12 w-12 mb-4 text-primary" />
                                            <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                                            <p className="text-sm text-muted-foreground">{feature.description}</p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Stats Section */}
                    <div className="mb-12 py-12 px-6 bg-muted/50 rounded-lg">
                        <div className="grid gap-8 md:grid-cols-3 text-center">
                            <div>
                                <div className="text-4xl font-bold mb-2">10,000+</div>
                                <div className="text-muted-foreground">Books Available</div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold mb-2">5,000+</div>
                                <div className="text-muted-foreground">Active Readers</div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold mb-2">50,000+</div>
                                <div className="text-muted-foreground">Reviews Written</div>
                            </div>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-4">Ready to Start Your Reading Journey?</h2>
                        <p className="text-muted-foreground mb-6">
                            Join thousands of readers who trust Bookify Hub for their literary adventures
                        </p>
                        <div className="flex gap-4 justify-center flex-wrap">
                            <Link href="/books">
                                <Button size="lg">
                                    Browse Books
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button size="lg" variant="outline">
                                    Sign Up Now
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </UserLayout>
        </>
    );
}

