import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './styles/globals.css';

export const metadata: Metadata = {
    title: 'Milking Tracker',
    description: 'Track milking sessions and play calming music for cattle.'
};

interface RootLayoutProps {
    children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
