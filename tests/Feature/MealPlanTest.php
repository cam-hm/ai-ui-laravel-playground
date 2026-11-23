<?php

namespace Tests\Feature;

use App\Models\MealPlan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class MealPlanTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected(): void
    {
        $this->get(route('meal-plans.index'))->assertRedirect(route('login'));
        $this->post(route('meal-plans.store'), [])->assertRedirect(route('login'));
        $this->delete(route('meal-plans.destroy', MealPlan::factory()->create()))->assertRedirect(route('login'));
    }

    public function test_index_lists_only_own_entries_in_order(): void
    {
        $user = User::factory()->create();
        MealPlan::factory()->create(['user_id' => $user->id, 'day' => 1, 'meal' => 'breakfast', 'dish' => 'B']);
        MealPlan::factory()->create(['user_id' => $user->id, 'day' => 0, 'meal' => 'dinner', 'dish' => 'A2']);
        MealPlan::factory()->create(['user_id' => $user->id, 'day' => 0, 'meal' => 'breakfast', 'dish' => 'A1']);
        MealPlan::factory()->create(['dish' => 'Other']);

        $this->actingAs($user)->get(route('meal-plans.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('meal-plans')
                ->has('entries', 3)
                ->where('entries.0.dish', 'A1')
                ->where('entries.1.dish', 'A2')
                ->where('entries.2.dish', 'B'));
    }

    public function test_store_creates_entry(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->post(route('meal-plans.store'), [
            'day' => 3, 'meal' => 'lunch', 'dish' => 'Soup', 'notes' => null,
        ])->assertRedirect();

        $this->assertDatabaseHas('meal_plans', ['user_id' => $user->id, 'dish' => 'Soup', 'day' => 3]);
    }

    public function test_store_validates(): void
    {
        $this->actingAs(User::factory()->create())
            ->post(route('meal-plans.store'), [
                'day' => 9, 'meal' => 'brunch', 'dish' => str_repeat('a', 101), 'notes' => str_repeat('a', 501),
            ])->assertSessionHasErrors(['day', 'meal', 'dish', 'notes']);

        $this->post(route('meal-plans.store'), [])->assertSessionHasErrors(['day', 'meal', 'dish']);
    }

    public function test_user_can_delete_own_entry(): void
    {
        $user = User::factory()->create();
        $entry = MealPlan::factory()->create(['user_id' => $user->id]);

        $this->actingAs($user)->delete(route('meal-plans.destroy', $entry))->assertRedirect();
        $this->assertModelMissing($entry);
    }

    public function test_user_cannot_delete_others_entry(): void
    {
        $entry = MealPlan::factory()->create();

        $this->actingAs(User::factory()->create())
            ->delete(route('meal-plans.destroy', $entry))->assertForbidden();
        $this->assertModelExists($entry);
    }
}
