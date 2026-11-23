<?php

namespace Database\Factories;

use App\Models\MealPlan;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<MealPlan> */
class MealPlanFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'day' => fake()->numberBetween(0, 6),
            'meal' => fake()->randomElement(MealPlan::MEALS),
            'dish' => fake()->words(3, true),
            'notes' => fake()->boolean() ? fake()->sentence() : null,
        ];
    }
}
