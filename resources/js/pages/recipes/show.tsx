import { Head, Link, router } from '@inertiajs/react';
import { Clock, Pencil, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
} from '@/components/ui/dialog';
import { destroy, edit, index } from '@/routes/recipes';

type Recipe = {
    id: number;
    title: string;
    description: string | null;
    servings: number;
    total_time: number | null;
    tags: string[];
    steps: string[];
    ingredients: {
        quantity: number | null;
        unit: string | null;
        name: string;
    }[];
};

export default function RecipeShow({ recipe }: { recipe: Recipe }) {
    const [confirming, setConfirming] = useState(false);

    return (
        <>
            <Head title={recipe.title} />
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-4">
                <div className="flex flex-col gap-4">
                    <div className="space-y-2">
                        <h1 className="text-2xl font-semibold tracking-tight [overflow-wrap:anywhere]">
                            {recipe.title}
                        </h1>
                        {recipe.description && (
                            <p className="[overflow-wrap:anywhere] text-muted-foreground">
                                {recipe.description}
                            </p>
                        )}
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                                <Users className="size-4" aria-hidden="true" />
                                {recipe.servings} servings
                            </span>
                            {recipe.total_time !== null && (
                                <span className="flex items-center gap-1.5">
                                    <Clock
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                    {recipe.total_time} min
                                </span>
                            )}
                        </div>
                        {recipe.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                {recipe.tags.map((t) => (
                                    <Badge key={t} variant="secondary">
                                        {t}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button asChild variant="outline" className="h-10">
                            <Link href={edit(recipe.id)}>
                                <Pencil /> Edit
                            </Link>
                        </Button>
                        <Button
                            variant="destructive"
                            className="h-10"
                            onClick={() => setConfirming(true)}
                        >
                            <Trash2 /> Delete
                        </Button>
                    </div>
                </div>

                <section aria-labelledby="ingredients-heading">
                    <h2
                        id="ingredients-heading"
                        className="mb-3 text-lg font-semibold"
                    >
                        Ingredients
                    </h2>
                    <ul className="divide-y rounded-xl border">
                        {recipe.ingredients.map((i, idx) => (
                            <li
                                key={idx}
                                className="flex gap-3 px-4 py-3 text-sm"
                            >
                                <span className="w-20 shrink-0 font-medium tabular-nums">
                                    {[i.quantity, i.unit]
                                        .filter((v) => v !== null && v !== '')
                                        .join(' ')}
                                </span>
                                <span className="[overflow-wrap:anywhere]">
                                    {i.name}
                                </span>
                            </li>
                        ))}
                    </ul>
                </section>

                <section aria-labelledby="steps-heading">
                    <h2
                        id="steps-heading"
                        className="mb-3 text-lg font-semibold"
                    >
                        Steps
                    </h2>
                    <ol className="space-y-4">
                        {recipe.steps.map((s, idx) => (
                            <li key={idx} className="flex gap-3">
                                <span
                                    className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground"
                                    aria-hidden="true"
                                >
                                    {idx + 1}
                                </span>
                                <p className="pt-0.5 [overflow-wrap:anywhere] whitespace-pre-line">
                                    {s}
                                </p>
                            </li>
                        ))}
                    </ol>
                </section>
            </div>

            <Dialog open={confirming} onOpenChange={setConfirming}>
                <DialogContent>
                    <DialogTitle>Delete this recipe?</DialogTitle>
                    <DialogDescription>
                        “{recipe.title}” will be permanently removed.
                    </DialogDescription>
                    <DialogFooter className="gap-2">
                        <DialogClose asChild>
                            <Button variant="secondary">Cancel</Button>
                        </DialogClose>
                        <Button
                            variant="destructive"
                            onClick={() =>
                                router.delete(destroy(recipe.id).url)
                            }
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

RecipeShow.layout = {
    breadcrumbs: [{ title: 'Recipes', href: index() }],
};
