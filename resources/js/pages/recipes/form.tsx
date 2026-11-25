import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowDown, ArrowUp, Plus, X } from 'lucide-react';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { index, show, store, update } from '@/routes/recipes';

type IngredientRow = { quantity: string; unit: string; name: string };

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

const fieldClass =
    'w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30 [&>option]:bg-background';

function move<T>(list: T[], from: number, to: number): T[] {
    if (to < 0 || to >= list.length) {
        return list;
    }

    const copy = [...list];
    [copy[from], copy[to]] = [copy[to], copy[from]];

    return copy;
}

function RowControls({
    label,
    index: i,
    count,
    onMove,
    onRemove,
}: {
    label: string;
    index: number;
    count: number;
    onMove: (to: number) => void;
    onRemove: () => void;
}) {
    return (
        <div className="flex shrink-0 gap-1">
            <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-10"
                disabled={i === 0}
                onClick={() => onMove(i - 1)}
                aria-label={`Move ${label} ${i + 1} up`}
            >
                <ArrowUp />
            </Button>
            <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-10"
                disabled={i === count - 1}
                onClick={() => onMove(i + 1)}
                aria-label={`Move ${label} ${i + 1} down`}
            >
                <ArrowDown />
            </Button>
            <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-10"
                onClick={onRemove}
                aria-label={`Remove ${label} ${i + 1}`}
            >
                <X />
            </Button>
        </div>
    );
}

export default function RecipeForm({
    recipe,
    units,
}: {
    recipe: Recipe | null;
    units: string[];
}) {
    const form = useForm({
        title: recipe?.title ?? '',
        description: recipe?.description ?? '',
        servings: String(recipe?.servings ?? 2),
        total_time: recipe?.total_time ? String(recipe.total_time) : '',
        tags: (recipe?.tags ?? []).join(', '),
        ingredients: (recipe?.ingredients.length
            ? recipe.ingredients.map((i) => ({
                  quantity: i.quantity === null ? '' : String(i.quantity),
                  unit: i.unit ?? '',
                  name: i.name,
              }))
            : [{ quantity: '', unit: '', name: '' }]) as IngredientRow[],
        steps: recipe?.steps.length ? recipe.steps : [''],
    });

    const errors = form.errors as Record<string, string | undefined>;
    const { data, setData } = form;

    const setIngredient = (i: number, patch: Partial<IngredientRow>) =>
        setData(
            'ingredients',
            data.ingredients.map((row, idx) =>
                idx === i ? { ...row, ...patch } : row,
            ),
        );

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.transform((d) => ({
            ...d,
            tags: d.tags
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean),
        }));

        if (recipe) {
            form.put(update(recipe.id).url);
        } else {
            form.post(store().url);
        }
    };

    const title = recipe ? 'Edit recipe' : 'New recipe';

    return (
        <>
            <Head title={title} />
            <form
                onSubmit={submit}
                className="mx-auto flex w-full max-w-3xl flex-col gap-8 p-4"
            >
                <h1 className="text-2xl font-semibold tracking-tight">
                    {title}
                </h1>

                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={data.title}
                            maxLength={120}
                            className="h-10"
                            onChange={(e) => setData('title', e.target.value)}
                        />
                        <InputError message={errors.title} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">
                            Description (optional)
                        </Label>
                        <textarea
                            id="description"
                            rows={3}
                            value={data.description}
                            className={`${fieldClass} py-2`}
                            onChange={(e) =>
                                setData('description', e.target.value)
                            }
                        />
                        <InputError message={errors.description} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="servings">Servings (1–20)</Label>
                            <Input
                                id="servings"
                                type="number"
                                min={1}
                                max={20}
                                value={data.servings}
                                className="h-10"
                                onChange={(e) =>
                                    setData('servings', e.target.value)
                                }
                            />
                            <InputError message={errors.servings} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="total_time">
                                Total time, min (optional)
                            </Label>
                            <Input
                                id="total_time"
                                type="number"
                                min={1}
                                value={data.total_time}
                                className="h-10"
                                onChange={(e) =>
                                    setData('total_time', e.target.value)
                                }
                            />
                            <InputError message={errors.total_time} />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="tags">Tags (optional)</Label>
                        <Input
                            id="tags"
                            value={data.tags}
                            placeholder="vegetarian, quick"
                            className="h-10"
                            onChange={(e) => setData('tags', e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Separate tags with commas.
                        </p>
                        <InputError message={errors.tags} />
                    </div>
                </div>

                <fieldset className="grid min-w-0 gap-3">
                    <legend className="mb-1 text-lg font-semibold">
                        Ingredients
                    </legend>
                    <InputError message={errors.ingredients} />
                    <ul className="grid gap-4">
                        {data.ingredients.map((row, i) => (
                            <li
                                key={i}
                                className="grid gap-3 rounded-xl border p-3"
                            >
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-[6rem_6rem_minmax(0,1fr)]">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor={`qty-${i}`}>
                                            Quantity
                                        </Label>
                                        <Input
                                            id={`qty-${i}`}
                                            type="number"
                                            step="any"
                                            min={0}
                                            className="h-10"
                                            value={row.quantity}
                                            onChange={(e) =>
                                                setIngredient(i, {
                                                    quantity: e.target.value,
                                                })
                                            }
                                        />
                                        <InputError
                                            message={
                                                errors[
                                                    `ingredients.${i}.quantity`
                                                ]
                                            }
                                        />
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor={`unit-${i}`}>
                                            Unit
                                        </Label>
                                        <select
                                            id={`unit-${i}`}
                                            className={`${fieldClass} h-10`}
                                            value={row.unit}
                                            onChange={(e) =>
                                                setIngredient(i, {
                                                    unit: e.target.value,
                                                })
                                            }
                                        >
                                            <option value="">—</option>
                                            {units.map((u) => (
                                                <option key={u} value={u}>
                                                    {u}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError
                                            message={
                                                errors[`ingredients.${i}.unit`]
                                            }
                                        />
                                    </div>
                                    <div className="col-span-2 grid gap-1.5 sm:col-span-1">
                                        <Label htmlFor={`name-${i}`}>
                                            Name
                                        </Label>
                                        <Input
                                            id={`name-${i}`}
                                            className="h-10"
                                            maxLength={120}
                                            value={row.name}
                                            onChange={(e) =>
                                                setIngredient(i, {
                                                    name: e.target.value,
                                                })
                                            }
                                        />
                                        <InputError
                                            message={
                                                errors[`ingredients.${i}.name`]
                                            }
                                        />
                                    </div>
                                </div>
                                <RowControls
                                    label="ingredient"
                                    index={i}
                                    count={data.ingredients.length}
                                    onMove={(to) =>
                                        setData(
                                            'ingredients',
                                            move(data.ingredients, i, to),
                                        )
                                    }
                                    onRemove={() =>
                                        setData(
                                            'ingredients',
                                            data.ingredients.filter(
                                                (_, idx) => idx !== i,
                                            ),
                                        )
                                    }
                                />
                            </li>
                        ))}
                    </ul>
                    <Button
                        type="button"
                        variant="outline"
                        className="h-10 justify-self-start"
                        onClick={() =>
                            setData('ingredients', [
                                ...data.ingredients,
                                { quantity: '', unit: '', name: '' },
                            ])
                        }
                    >
                        <Plus /> Add ingredient
                    </Button>
                </fieldset>

                <fieldset className="grid min-w-0 gap-3">
                    <legend className="mb-1 text-lg font-semibold">
                        Steps
                    </legend>
                    <InputError message={errors.steps} />
                    <ol className="grid gap-4">
                        {data.steps.map((step, i) => (
                            <li
                                key={i}
                                className="grid gap-3 rounded-xl border p-3"
                            >
                                <div className="grid gap-1.5">
                                    <Label htmlFor={`step-${i}`}>
                                        Step {i + 1}
                                    </Label>
                                    <textarea
                                        id={`step-${i}`}
                                        rows={3}
                                        value={step}
                                        className={`${fieldClass} py-2`}
                                        onChange={(e) =>
                                            setData(
                                                'steps',
                                                data.steps.map((s, idx) =>
                                                    idx === i
                                                        ? e.target.value
                                                        : s,
                                                ),
                                            )
                                        }
                                    />
                                    <InputError
                                        message={errors[`steps.${i}`]}
                                    />
                                </div>
                                <RowControls
                                    label="step"
                                    index={i}
                                    count={data.steps.length}
                                    onMove={(to) =>
                                        setData(
                                            'steps',
                                            move(data.steps, i, to),
                                        )
                                    }
                                    onRemove={() =>
                                        setData(
                                            'steps',
                                            data.steps.filter(
                                                (_, idx) => idx !== i,
                                            ),
                                        )
                                    }
                                />
                            </li>
                        ))}
                    </ol>
                    <Button
                        type="button"
                        variant="outline"
                        className="h-10 justify-self-start"
                        onClick={() => setData('steps', [...data.steps, ''])}
                    >
                        <Plus /> Add step
                    </Button>
                </fieldset>

                <div className="flex gap-2">
                    <Button
                        type="submit"
                        className="h-10"
                        disabled={form.processing}
                    >
                        {recipe ? 'Save changes' : 'Create recipe'}
                    </Button>
                    <Button asChild variant="outline" className="h-10">
                        <Link href={recipe ? show(recipe.id) : index()}>
                            Cancel
                        </Link>
                    </Button>
                </div>
            </form>
        </>
    );
}

RecipeForm.layout = {
    breadcrumbs: [{ title: 'Recipes', href: index() }],
};
