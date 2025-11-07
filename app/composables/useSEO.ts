export const createWebsiteStructuredData = () => ({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'Resume Builder',
    'description': 'Build professional resumes for free. No servers, no registration, no payments. Unlimited downloads and resumes with complete privacy.',
    'url': 'https://resumeforfree.com',
    'potentialAction': {
        '@type': 'SearchAction',
        'target': {
            '@type': 'EntryPoint',
            'urlTemplate': 'https://resumeforfree.com/builder',
        },
        'query-input': 'required name=search_term_string',
    },
    'creator': {
        '@type': 'Organization',
        'name': 'Resume Builder',
        'url': 'https://resumeforfree.com',
    },
});
export const createSoftwareApplicationStructuredData = () => ({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'Resume Builder',
    'description': 'Free online resume builder with privacy-first approach. Create professional resumes without registration.',
    'url': 'https://resumeforfree.com',
    'applicationCategory': 'BusinessApplication',
    'operatingSystem': 'Web Browser',
    'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'USD',
        'availability': 'https://schema.org/InStock',
    },
    'featureList': [
        'Free resume builder',
        'No registration required',
        'Privacy-first approach',
        'Unlimited downloads',
        'PDF export',
        'Real-time preview',
        'Multiple resume management',
        'Local data storage',
    ],
    'screenshot': 'https://resumeforfree.com/og-image.png',
    'creator': {
        '@type': 'Organization',
        'name': 'Resume Builder',
        'url': 'https://resumeforfree.com',
    },
});
export const createBreadcrumbStructuredData = (items: Array<{ name: string; url: string }>) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'name': item.name,
        'item': item.url,
    })),
});
export const createFAQStructuredData = (faqs: Array<{ question: string; answer: string }>) => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqs.map(faq => ({
        '@type': 'Question',
        'name': faq.question,
        'acceptedAnswer': {
            '@type': 'Answer',
            'text': faq.answer,
        },
    })),
});
