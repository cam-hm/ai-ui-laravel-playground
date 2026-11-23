import { Form, Head, router } from '@inertiajs/react';
import { Trash2, UtensilsCrossed } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { destroy, index, store } from '@/routes/meal-plans';

type Entry = {
    id: number;
    day: number;
    meal: string;
    dish: string;
    notes: string | null;
};

const selectClass =
    'h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30 [&>option]:bg-background';

export default function MealPlans({
    entries,
    days,
    meals,
}: {
    entries: Entry[];
    days: string[];
    meals: string[];
}) {
    const [toDelete, setToDelete] = useState<Entry | null>(null);

    const confirmDelete = () => {
        if (!toDelete) {
            return;
        }

        router.delete(destroy(toDelete.id).url, {
            preserveScroll: true,
            onSuccess: () => setToDelete(null),
        });
    };

    return (
        <>
            <Head title="Meal plans" />
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Meal plans
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Plan your meals for the week.
                    </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
                    <section
                        aria-labelledby="entries-heading"
                        className="order-2 lg:order-1"
                    >
                        <h2 id="entries-heading" className="sr-only">
                            Planned meals
                        </h2>
                        {entries.length === 0 ? (
                            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-10 text-center">
                                <UtensilsCrossed
                                    className="size-8 text-muted-foreground"
                                    aria-hidden="true"
                                />
                                <p className="font-medium">
                                    No meals planned yet
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Use the form to add your first meal for the
                                    week.
                                </p>
                                <Button asChild variant="outline">
                                    <a href="#add-meal">Go to the form</a>
                                </Button>
                            </div>
                        ) : (
                            <ul className="divide-y rounded-xl border">
                                {entries.map((entry) => (
                                    <li
                                        key={entry.id}
                                        className="flex items-start justify-between gap-3 p-4"
                                    >
                                        <div className="min-w-0 space-y-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="text-sm font-medium">
                                                    {days[entry.day]}
                                                </span>
                                                <Badge
                                                    variant="secondary"
                                                    className="capitalize"
                                                >
                                                    {entry.meal}
                                                </Badge>
                                            </div>
                                            <p className="break-words">
                                                {entry.dish}
                                            </p>
                                            {entry.notes && (
                                                <p className="text-sm break-words text-muted-foreground">
                                                    {entry.notes}
                                                </p>
                                            )}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-10 shrink-0"
                                            onClick={() => setToDelete(entry)}
                                            aria-label={`Delete ${entry.dish} on ${days[entry.day]}`}
                                        >
                                            <Trash2 />
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    <Card id="add-meal" className="order-1 lg:order-2">
                        <CardHeader>
                            <CardTitle>
                                <h2>Add a meal</h2>
                            </CardTitle>
                            <CardDescription>
                                Choose a day and meal, then name the dish.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form
                                action={store().url}
                                method="post"
                                resetOnSuccess
                                options={{ preserveScroll: true }}
                                className="space-y-4"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        <div className="grid gap-2">
                                            <Label htmlFor="day">Day</Label>
                                            <select
                                                id="day"
                                                name="day"
                                                defaultValue="0"
                                                className={selectClass}
                                            >
                                                {days.map((d, i) => (
                                                    <option key={d} value={i}>
                                                        {d}
                                                    </option>
                                                ))}
                                            </select>
                                            <InputError message={errors.day} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="meal">Meal</Label>
                                            <select
                                                id="meal"
                                                name="meal"
                                                defaultValue={meals[0]}
                                                className={`${selectClass} capitalize`}
                                            >
                                                {meals.map((m) => (
                                                    <option key={m} value={m}>
                                                        {m}
                                                    </option>
                                                ))}
                                            </select>
                                            <InputError message={errors.meal} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="dish">Dish</Label>
                                            <Input
                                                id="dish"
                                                name="dish"
                                                maxLength={100}
                                                placeholder="e.g. Veggie curry"
                                            />
                                            <InputError message={errors.dish} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="notes">
                                                Notes (optional)
                                            </Label>
                                            <textarea
                                                id="notes"
                                                name="notes"
                                                rows={3}
                                                maxLength={500}
                                                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
                                            />
                                            <InputError
                                                message={errors.notes}
                                            />
                                        </div>
                                        <Button
                                            type="submit"
                                            className="w-full"
                                            disabled={processing}
                                        >
                                            Add meal
                                        </Button>
                                    </>
                                )}
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Dialog
                open={toDelete !== null}
                onOpenChange={(open) => !open && setToDelete(null)}
            >
                <DialogContent>
                    <DialogTitle>Delete this meal?</DialogTitle>
                    <DialogDescription>
                        {toDelete
                            ? `“${toDelete.dish}” on ${days[toDelete.day]} (${toDelete.meal}) will be removed from your plan.`
                            : ''}
                    </DialogDescription>
                    <DialogFooter className="gap-2">
                        <DialogClose asChild>
                            <Button variant="secondary">Cancel</Button>
                        </DialogClose>
                        <Button variant="destructive" onClick={confirmDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

MealPlans.layout = {
    breadcrumbs: [{ title: 'Meal plans', href: index() }],
};
