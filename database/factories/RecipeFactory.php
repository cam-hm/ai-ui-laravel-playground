<?php

namespace Database\Factories;

use App\Models\Recipe;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Recipe> */
class RecipeFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'title' => fake()->words(3, true),
            'description' => fake()->sentence(),
            'servings' => fake()->numberBetween(1, 8),
            'total_time' => fake()->numberBetween(5, 120),
            'tags' => ['quick'],
            'steps' => [fake()->sentence(), fake()->sentence()],
        ];
    }
}
