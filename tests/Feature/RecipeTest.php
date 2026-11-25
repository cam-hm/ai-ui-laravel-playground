<?php

namespace Tests\Feature;

use App\Models\Recipe;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class RecipeTest extends TestCase
{
    use RefreshDatabase;

    /** @return array<string, mixed> */
    private function payload(array $override = []): array
    {
        return array_merge([
            'title' => 'Pasta',
            'description' => null,
            'servings' => 4,
            'total_time' => 20,
            'tags' => ['quick', 'vegetarian'],
            'ingredients' => [
                ['quantity' => '200.5', 'unit' => 'g', 'name' => 'Spaghetti'],
                ['quantity' => null, 'unit' => null, 'name' => 'Salt'],
            ],
            'steps' => ['Boil', 'Serve'],
        ], $override);
    }

    private function recipeFor(User $user, string $title, string $ingredient = 'Rice', array $tags = []): Recipe
    {
        $recipe = Recipe::factory()->create(['user_id' => $user->id, 'title' => $title, 'tags' => $tags]);
        $recipe->ingredients()->create(['name' => $ingredient, 'position' => 0]);

        return $recipe;
    }

    public function test_guests_are_redirected(): void
    {
        $recipe = Recipe::factory()->create();

        $this->get(route('recipes.index'))->assertRedirect(route('login'));
        $this->get(route('recipes.create'))->assertRedirect(route('login'));
        $this->post(route('recipes.store'), [])->assertRedirect(route('login'));
        $this->get(route('recipes.show', $recipe))->assertRedirect(route('login'));
        $this->get(route('recipes.edit', $recipe))->assertRedirect(route('login'));
        $this->put(route('recipes.update', $recipe), [])->assertRedirect(route('login'));
        $this->delete(route('recipes.destroy', $recipe))->assertRedirect(route('login'));
    }

    public function test_store_creates_recipe(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->post(route('recipes.store'), $this->payload())->assertRedirect();

        $recipe = $user->recipes()->firstOrFail();
        $this->assertSame(['quick', 'vegetarian'], $recipe->tags);
        $this->assertSame(['Boil', 'Serve'], $recipe->steps);
        $this->assertCount(2, $recipe->ingredients);
        $this->assertDatabaseHas('recipe_ingredients', ['recipe_id' => $recipe->id, 'name' => 'Spaghetti', 'unit' => 'g']);
    }

    public function test_store_validates(): void
    {
        $this->actingAs(User::factory()->create())
            ->post(route('recipes.store'), [])
            ->assertSessionHasErrors(['title', 'servings', 'ingredients', 'steps']);

        $this->post(route('recipes.store'), $this->payload([
            'title' => str_repeat('a', 121),
            'servings' => 21,
            'ingredients' => [['quantity' => 'x', 'unit' => 'bag', 'name' => '']],
            'steps' => [''],
        ]))->assertSessionHasErrors([
            'title', 'servings', 'ingredients.0.quantity', 'ingredients.0.unit', 'ingredients.0.name', 'steps.0',
        ]);
    }

    public function test_index_searches_filters_and_paginates_own_recipes(): void
    {
        $user = User::factory()->create();
        for ($i = 1; $i <= 13; $i++) {
            $this->recipeFor($user, sprintf('Recipe %02d', $i));
        }
        $this->recipeFor($user, 'Soup', 'Carrot', ['vegan']);
        $this->recipeFor(User::factory()->create(), 'Carrot cake', 'Carrot', ['vegan']);

        $this->actingAs($user)->get(route('recipes.index'))
            ->assertInertia(fn (Assert $p) => $p->component('recipes/index')->has('recipes.data', 12)->where('recipes.total', 14));

        $this->get(route('recipes.index', ['page' => 2]))
            ->assertInertia(fn (Assert $p) => $p->has('recipes.data', 2));

        $this->get(route('recipes.index', ['search' => 'carrot']))
            ->assertInertia(fn (Assert $p) => $p->has('recipes.data', 1)->where('recipes.data.0.title', 'Soup'));

        $this->get(route('recipes.index', ['search' => 'Recipe 05']))
            ->assertInertia(fn (Assert $p) => $p->has('recipes.data', 1));

        $this->get(route('recipes.index', ['tag' => 'vegan']))
            ->assertInertia(fn (Assert $p) => $p->has('recipes.data', 1)->where('allTags', ['vegan']));
    }

    public function test_show_and_edit_own_recipe(): void
    {
        $user = User::factory()->create();
        $recipe = $this->recipeFor($user, 'Mine');

        $this->actingAs($user)->get(route('recipes.show', $recipe))
            ->assertInertia(fn (Assert $p) => $p->component('recipes/show')->where('recipe.title', 'Mine')->has('recipe.ingredients', 1));
        $this->get(route('recipes.edit', $recipe))->assertOk();
    }

    public function test_update_replaces_ingredients(): void
    {
        $user = User::factory()->create();
        $recipe = $this->recipeFor($user, 'Mine');

        $this->actingAs($user)->put(route('recipes.update', $recipe), $this->payload(['title' => 'Changed']))
            ->assertRedirect(route('recipes.show', $recipe));

        $this->assertSame('Changed', $recipe->fresh()?->title);
        $this->assertCount(2, $recipe->ingredients()->get());
    }

    public function test_delete_own_recipe(): void
    {
        $user = User::factory()->create();
        $recipe = $this->recipeFor($user, 'Mine');

        $this->actingAs($user)->delete(route('recipes.destroy', $recipe))->assertRedirect(route('recipes.index'));
        $this->assertModelMissing($recipe);
        $this->assertDatabaseCount('recipe_ingredients', 0);
    }

    public function test_cannot_access_others_recipes(): void
    {
        $recipe = Recipe::factory()->create();
        $this->actingAs(User::factory()->create());

        $this->get(route('recipes.show', $recipe))->assertForbidden();
        $this->get(route('recipes.edit', $recipe))->assertForbidden();
        $this->put(route('recipes.update', $recipe), $this->payload())->assertForbidden();
        $this->delete(route('recipes.destroy', $recipe))->assertForbidden();
        $this->assertModelExists($recipe);
    }
}
