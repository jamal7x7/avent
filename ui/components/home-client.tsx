"use client";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import { Button } from "~/ui/primitives/button";

export default function HomeClient() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="relative w-full max-w-7xl mx-auto px-6 py-32 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-200/30 via-purple-200/30 to-pink-200/30 dark:from-blue-900/30 dark:via-purple-900/30 dark:to-pink-900/30 animate-pulse blur-2xl"></div>
        <div className="relative flex justify-center animate-fade-in delay-500">
          <div className="-mt-80 absolute w-80 h-80 bg-gradient-to-br from-blue-300/20 via-purple-300/20 to-pink-300/20 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-full blur-3xl -z-10"></div>
          <div className="relative backdrop-blur-md bg-white/30 dark:bg-gray-800/30 rounded-3xl p-10 shadow-sm mx-auto max-w-3xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-bold mb-3 animate-fade-in text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
              {t('hero_title_prefix', 'Welcome to')}
            </h3>
            <h1 className="text-5xl font-extrabold mb-6 leading-tight animate-fade-in text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
              {t('hero_title_suffix', 'Avent: Secure School Communication & Class Management')}
            </h1>
            <p className="text-lg mb-10 animate-fade-in delay-200 text-gray-800 dark:text-gray-200">
              {t('hero_subtitle', 'Experience seamless collaboration with top privacy and security for schools, teachers, and students.')}
            </p>
            <Link href="/auth/sign-up">
              <Button size="lg" className="px-12 py-5 text-sm font-bold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-purple-500 hover:to-blue-500 text-normal dark:text-white dark:shadow-xl transition-all duration-1200 animate-pulse rounded-full border-2 hover:border-gray-400 hover:dark:border-gray-100">
                {t('cta_primary', 'Create your free account now')}
              </Button>
            </Link>
          </div>
          <Image
            src={theme === 'dark' ? '/images/connected-people-dark.png' : '/images/connected-people-light.png'}
            alt={t('hero_image_alt', 'Connected students and teachers')}
            width={1200}
            height={800}
            className="rounded-4xl shadow-2xl border-4 border-white dark:border-gray-800 object-cover ml-8"
            priority
          />
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col items-center text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              {t('features_title', 'Why Avent?')}
            </h2>
            <div className="mt-2 h-1 w-12 rounded-full bg-primary" />
            <p className="mt-4 max-w-2xl text-center text-muted-foreground md:text-lg">
              {t('features_subtitle', 'Avent empowers schools with secure, efficient, and collaborative digital tools.')}
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-center">
              <svg className="h-10 w-10 text-primary mb-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M9 12l2 2l4 -4"></path><circle cx="12" cy="12" r="10"></circle></svg>
              <h3 className="font-semibold text-lg mb-2">{t('feature_security', 'End-to-End Encryption')}</h3>
              <p className="text-muted-foreground text-sm">{t('feature_security_desc', 'All messages and files are protected with industry-leading encryption.')}</p>
            </div>
            <div className="flex flex-col items-center">
              <svg className="h-10 w-10 text-primary mb-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              <h3 className="font-semibold text-lg mb-2">{t('feature_community', 'Class & Group Management')}</h3>
              <p className="text-muted-foreground text-sm">{t('feature_community_desc', 'Organize classes, groups, and assignments with ease.')}</p>
            </div>
            <div className="flex flex-col items-center">
              <svg className="h-10 w-10 text-primary mb-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
              <h3 className="font-semibold text-lg mb-2">{t('feature_customization', 'Customizable Permissions')}</h3>
              <p className="text-muted-foreground text-sm">{t('feature_customization_desc', 'Admins and teachers have full control over privacy and access.')}</p>
            </div>
            <div className="flex flex-col items-center">
              <svg className="h-10 w-10 text-primary mb-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              <h3 className="font-semibold text-lg mb-2">{t('feature_privacy', 'Privacy by Design')}</h3>
              <p className="text-muted-foreground text-sm">{t('feature_privacy_desc', 'Built from the ground up for student and teacher privacy.')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-xl bg-primary/10 p-8 md:p-12">
            <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:16px_16px]" />
            <div className="relative z-10 mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                {t('cta_title', 'Ready to transform your school communication?')}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground md:text-xl">
                {t('cta_desc', 'Join Avent and experience secure, modern, and effective digital collaboration for your educational community.')}
              </p>
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/auth/sign-up">
                  <Button size="lg" className="h-12 px-8">
                    {t('cta_primary', 'Get Started Free')}
                  </Button>
                </Link>
                <Link href="/auth/sign-in">
                  <Button variant="outline" size="lg" className="h-12 px-8">
                    {t('cta_secondary', 'Sign In')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
