import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { fetchPublishedPage, type ContentPage } from "@/lib/cms";

export const Route = createFileRoute("/pages/$slug")({
  head: ({ loaderData }) => {
    const p = loaderData as ContentPage | undefined;
    if (!p) return { meta: [{ title: "Not found — sandiego.com" }] };
    const title = p.meta_title || `${p.title} — sandiego.com`;
    const desc = p.meta_description || p.title;
    const meta: Array<Record<string, string>> = [
      { title },
      { name: "description", content: desc },
      { property: "og:title", content: title },
      { property: "og:description", content: desc },
    ];
    if (p.hero_image) {
      meta.push({ property: "og:image", content: p.hero_image });
      meta.push({ name: "twitter:image", content: p.hero_image });
    }
    return { meta };
  },
  loader: async ({ params }) => {
    const page = await fetchPublishedPage(params.slug);
    if (!page) throw notFound();
    return page;
  },
  notFoundComponent: () => (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 container-page py-24 text-center">
        <h1 className="font-display text-4xl font-semibold">Page not found</h1>
        <p className="mt-3 text-muted-foreground">This page doesn't exist or hasn't been published.</p>
      </div>
      <Footer />
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 container-page py-24 text-center">
        <h1 className="font-display text-4xl font-semibold">Something went wrong</h1>
        <p className="mt-3 text-muted-foreground">{error.message}</p>
      </div>
      <Footer />
    </div>
  ),
  component: PageView,
});

function PageView() {
  const initial = Route.useLoaderData() as ContentPage;
  const [page, setPage] = useState<ContentPage>(initial);
  // Refresh on client to catch newly published edits
  useEffect(() => {
    (async () => {
      const p = await fetchPublishedPage(initial.slug);
      if (p) setPage(p);
    })();
  }, [initial.slug]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {page.hero_image && (
          <div className="relative h-[40vh] min-h-[300px] overflow-hidden">
            <img src={page.hero_image} alt={page.title} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          </div>
        )}
        <article className="container-page max-w-3xl py-12 md:py-16">
          <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: page.title }]} />
          <h1 className="mt-4 font-display text-4xl md:text-5xl font-semibold">{page.title}</h1>
          <div
            className="prose prose-neutral dark:prose-invert mt-8 max-w-none"
            dangerouslySetInnerHTML={{ __html: page.published_body?.html || "" }}
          />
        </article>
      </main>
      <Footer />
    </div>
  );
}
