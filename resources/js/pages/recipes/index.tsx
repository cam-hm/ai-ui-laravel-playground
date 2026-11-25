import { Head, Link, router } from '@inertiajs/react';
import { ChefHat, Clock, Plus, Users } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { create, index, show } from '@/routes/recipes';

type RecipeCard = {
    id: number;
    title: string;
    tags: string[];
    servings: number;
    total_time: number | null;
};

type Paginated = {
    data: RecipeCard[];
    current_page: number;
    last_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};

const selectClass =
    'h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30 [&>option]:bg-background';

export default function Recipes({
    recipes,
    filters,
    allTags,
}: {
    recipes: Paginated;
    filters: { search: string; tag: string };
    allTags: string[];
}) {
    const [search, setSearch] = useState(filters.search);

    const visit = (params: {
        search?: string;
        tag?: string;
        page?: number;
    }) => {
        const query: Record<string, string | number> = {};
        const s = params.search ?? filters.search;
        const t = params.tag ?? filters.tag;

        if (s) {
            query.search = s;
        }

        if (t) {
            query.tag = t;
        }

        if (params.page && params.page > 1) {
            query.page = params.page;
        }

        router.get(index().url, query, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        visit({ search });
    };

    const hasFilters = filters.search !== '' || filters.tag !== '';

    return (
        <>
            <Head title="Recipes" />
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Recipes
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Your personal recipe library.
                        </p>
                    </div>
                    <Button asChild className="h-10">
                        <Link href={create()}>
                            <Plus /> New recipe
                        </Link>
                    </Button>
                </div>

                <form
                    onSubmit={submit}
                    role="search"
                    className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem_auto] sm:items-end"
                >
                    <div className="grid gap-2">
                        <Label htmlFor="search">Search</Label>
                        <Input
                            id="search"
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Title or ingredient"
                            className="h-10"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="tag">Tag</Label>
                        <select
                            id="tag"
                            value={filters.tag}
                            onChange={(e) => visit({ tag: e.target.value })}
                            className={selectClass}
                        >
                            <option value="">All tags</option>
                            {allTags.map((t) => (
                                <option key={t} value={t}>
                                    {t}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" className="h-10 flex-1">
                            Search
                        </Button>
                        {hasFilters && (
                            <Button
                                type="button"
                                variant="outline"
                                className="h-10"
                                onClick={() => {
                                    setSearch('');
                                    router.get(index().url);
                                }}
                            >
                                Clear
                            </Button>
                        )}
                    </div>
                </form>

                <section aria-labelledby="recipes-heading">
                    <h2 id="recipes-heading" className="sr-only">
                        Recipe list
                    </h2>
                    {recipes.data.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-10 text-center">
                            <ChefHat
                                className="size-8 text-muted-foreground"
                                aria-hidden="true"
                            />
                            <p className="font-medium">
                                {hasFilters
                                    ? 'No recipes match your search'
                                    : 'No recipes yet'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {hasFilters
                                    ? 'Try another search term or tag.'
                                    : 'Create your first recipe to get started.'}
                            </p>
                        </div>
                    ) : (
                        <>
                            <p className="mb-3 text-sm text-muted-foreground">
                                {recipes.total}{' '}
                                {recipes.total === 1 ? 'recipe' : 'recipes'}
                            </p>
                            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {recipes.data.map((r) => (
                                    <li key={r.id}>
                                        <Link
                                            href={show(r.id)}
                                            className="flex h-full flex-col gap-3 rounded-xl border bg-card p-4 text-card-foreground shadow-xs transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                                        >
                                            <h3 className="font-semibold [overflow-wrap:anywhere]">
                                                {r.title}
                                            </h3>
                                            <div className="flex flex-wrap gap-1.5">
                                                {r.tags.map((t) => (
                                                    <Badge
                                                        key={t}
                                                        variant="secondary"
                                                    >
                                                        {t}
                                                    </Badge>
                                                ))}
                                            </div>
                                            <div className="mt-auto flex gap-4 pt-1 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1.5">
                                                    <Users
                                                        className="size-4"
                                                        aria-hidden="true"
                                                    />
                                                    {r.servings} servings
                                                </span>
                                                {r.total_time !== null && (
                                                    <span className="flex items-center gap-1.5">
                                                        <Clock
                                                            className="size-4"
                                                            aria-hidden="true"
                                                        />
                                                        {r.total_time} min
                                                    </span>
                                                )}
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                            {recipes.last_page > 1 && (
                                <nav
                                    aria-label="Pagination"
                                    className="mt-6 flex items-center justify-between gap-3"
                                >
                                    <Button
                                        variant="outline"
                                        className="h-10"
                                        disabled={!recipes.prev_page_url}
                                        onClick={() =>
                                            visit({
                                                page: recipes.current_page - 1,
                                            })
                                        }
                                    >
                                        Previous
                                    </Button>
                                    <span className="text-sm text-muted-foreground">
                                        Page {recipes.current_page} of{' '}
                                        {recipes.last_page}
                                    </span>
                                    <Button
                                        variant="outline"
                                        className="h-10"
                                        disabled={!recipes.next_page_url}
                                        onClick={() =>
                                            visit({
                                                page: recipes.current_page + 1,
                                            })
                                        }
                                    >
                                        Next
                                    </Button>
                                </nav>
                            )}
                        </>
                    )}
                </section>
            </div>
        </>
    );
}

Recipes.layout = {
    breadcrumbs: [{ title: 'Recipes', href: index() }],
};
