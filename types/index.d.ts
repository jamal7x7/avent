import { LucideIcon } from 'lucide-react';
import { type ComponentType } from 'react';
import { type LucideProps } from 'lucide-react';




export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    url: string;
    icon: 'layout-grid' | 'folder' | 'book-open';
    isActive?: boolean;
}


export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;

    [key: string]: unknown;
}
