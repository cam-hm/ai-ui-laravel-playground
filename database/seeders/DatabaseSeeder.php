<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        $user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        foreach ([
            [0, 'breakfast', 'Overnight oats', 'Add berries'],
            [0, 'dinner', 'Veggie stir-fry', null],
            [2, 'lunch', 'Chicken Caesar salad', 'Dressing on the side'],
            [4, 'dinner', 'Homemade pizza', 'Family pizza night'],
            [6, 'breakfast', 'Pancakes', null],
        ] as [$day, $meal, $dish, $notes]) {
            $user->mealPlans()->create(compact('day', 'meal', 'dish', 'notes'));
        }
    }
}
