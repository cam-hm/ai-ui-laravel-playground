<?php

namespace App\Http\Controllers;

use App\Http\Requests\RecipeRequest;
use App\Models\Recipe;
use App\Models\RecipeIngredient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RecipeController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $search = trim((string) $request->query('search', ''));
        $tag = trim((string) $request->query('tag', ''));

        $query = $user->recipes()->orderBy('title')->orderBy('id');

        if ($search !== '') {
            $like = '%'.addcslashes($search, '%_\\').'%';
            $query->where(function ($q) use ($like) {
                $q->whereLike('title', $like)
                    ->orWhereHas('ingredients', fn ($i) => $i->whereLike('name', $like));
            });
        }

        if ($tag !== '') {
            $query->whereJsonContains('tags', $tag);
        }

        $recipes = $query->paginate(12)->withQueryString()
            ->through(fn (Recipe $r) => [
                'id' => $r->id,
                'title' => $r->title,
                'tags' => $r->tags,
                'servings' => $r->servings,
                'total_time' => $r->total_time,
            ]);

        $allTags = $user->recipes()->pluck('tags')->flatten()->unique()->sort()->values();

        return Inertia::render('recipes/index', [
            'recipes' => $recipes,
            'filters' => ['search' => $search, 'tag' => $tag],
            'allTags' => $allTags,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('recipes/form', ['recipe' => null, 'units' => Recipe::UNITS]);
    }

    public function store(RecipeRequest $request): RedirectResponse
    {
        $recipe = $request->user()->recipes()->create($this->attributes($request));
        $this->syncIngredients($recipe, $request);

        return to_route('recipes.show', $recipe);
    }

    public function show(Request $request, Recipe $recipe): Response
    {
        $this->authorizeOwner($request, $recipe);

        return Inertia::render('recipes/show', ['recipe' => $this->payload($recipe)]);
    }

    public function edit(Request $request, Recipe $recipe): Response
    {
        $this->authorizeOwner($request, $recipe);

        return Inertia::render('recipes/form', ['recipe' => $this->payload($recipe), 'units' => Recipe::UNITS]);
    }

    public function update(RecipeRequest $request, Recipe $recipe): RedirectResponse
    {
        $this->authorizeOwner($request, $recipe);

        $recipe->update($this->attributes($request));
        $this->syncIngredients($recipe, $request);

        return to_route('recipes.show', $recipe);
    }

    public function destroy(Request $request, Recipe $recipe): RedirectResponse
    {
        $this->authorizeOwner($request, $recipe);

        $recipe->delete();

        return to_route('recipes.index');
    }

    private function authorizeOwner(Request $request, Recipe $recipe): void
    {
        abort_unless($recipe->user_id === $request->user()?->id, 403);
    }

    /** @return array<string, mixed> */
    private function attributes(RecipeRequest $request): array
    {
        $data = $request->validated();

        return [
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'servings' => $data['servings'],
            'total_time' => $data['total_time'] ?? null,
            'tags' => array_values(array_unique(array_filter(array_map('trim', $data['tags'] ?? [])))),
            'steps' => array_values($data['steps']),
        ];
    }

    private function syncIngredients(Recipe $recipe, RecipeRequest $request): void
    {
        $recipe->ingredients()->delete();

        foreach (array_values($request->validated('ingredients')) as $position => $row) {
            $recipe->ingredients()->create([
                'position' => $position,
                'quantity' => $row['quantity'] ?? null,
                'unit' => $row['unit'] ?? null,
                'name' => $row['name'],
            ]);
        }
    }

    /** @return array<string, mixed> */
    private function payload(Recipe $recipe): array
    {
        return [
            'id' => $recipe->id,
            'title' => $recipe->title,
            'description' => $recipe->description,
            'servings' => $recipe->servings,
            'total_time' => $recipe->total_time,
            'tags' => $recipe->tags,
            'steps' => $recipe->steps,
            'ingredients' => $recipe->ingredients->map(fn (RecipeIngredient $i) => [
                'quantity' => $i->quantity === null ? null : (float) $i->quantity,
                'unit' => $i->unit,
                'name' => $i->name,
            ])->all(),
        ];
    }
}
