import { Head } from '@inertiajs/react';
import { Shield, Lock, Eye, Users, Bell, FileText } from 'lucide-react';
import UserLayout from '@/layouts/user-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

export default function Privacy() {
    const sections = [
        {
            icon: Shield,
            title: 'Information We Collect',
            content: 'We collect information you provide directly to us, such as your name, email address, and reading preferences when you create an account. We also collect information about your usage of our service, including books you review, favorite, and browse.',
        },
        {
            icon: Lock,
            title: 'How We Use Your Information',
            content: 'We use the information we collect to provide, maintain, and improve our services, personalize your experience, send you updates and recommendations, and protect our users and platform from fraudulent activities.',
        },
        {
            icon: Eye,
            title: 'Information Sharing',
            content: 'We do not sell your personal information. We may share your information with service providers who assist us in operating our platform, and only when required by law. Your reviews and public profile information are visible to other users.',
        },
        {
            icon: Users,
            title: 'Your Rights',
            content: 'You have the right to access, update, or delete your personal information at any time. You can also control your privacy settings and choose what information is visible to other users. Contact us if you wish to exercise these rights.',
        },
        {
            icon: Bell,
            title: 'Cookies & Tracking',
            content: 'We use cookies and similar tracking technologies to enhance your experience, remember your preferences, and analyze how our service is used. You can control cookie settings through your browser preferences.',
        },
        {
            icon: FileText,
            title: 'Data Security',
            content: 'We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no internet transmission is completely secure.',
        },
    ];

    return (
        <>
            <Head title="Privacy Policy" />
            <UserLayout>
                <div className="container mx-auto px-4 py-12 max-w-5xl">
                    {/* Hero Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
                        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                        <p className="text-muted-foreground mt-4 max-w-3xl mx-auto">
                            At Bookify Hub, we take your privacy seriously. This policy explains how we collect, 
                            use, and protect your personal information.
                        </p>
                    </motion.div>

                    {/* Privacy Sections */}
                    <div className="space-y-6 mb-12">
                        {sections.map((section, index) => (
                            <motion.div
                                key={section.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-3">
                                            <section.icon className="h-6 w-6 text-primary" />
                                            {section.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground leading-relaxed">
                                            {section.content}
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {/* Additional Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Us About Privacy</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground mb-4">
                                If you have any questions or concerns about this Privacy Policy or our data practices, 
                                please don't hesitate to contact us:
                            </p>
                            <div className="space-y-2 text-sm">
                                <p><strong>Email:</strong> privacy@bookifyhub.com</p>
                                <p><strong>Address:</strong> 123 Library Street, Book City, BC 12345</p>
                                <p className="mt-4 text-muted-foreground">
                                    We will respond to your inquiry within 30 days and work with you to resolve any concerns.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Update Notice */}
                    <div className="mt-8 p-6 bg-muted/50 rounded-lg">
                        <h3 className="font-semibold mb-2">Updates to This Policy</h3>
                        <p className="text-sm text-muted-foreground">
                            We may update this Privacy Policy from time to time. We will notify you of any changes 
                            by posting the new Privacy Policy on this page and updating the "Last updated" date. 
                            We encourage you to review this Privacy Policy periodically for any changes.
                        </p>
                    </div>
                </div>
            </UserLayout>
        </>
    );
}

