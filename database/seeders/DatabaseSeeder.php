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

        // A second account with its own data, to check that users only see their own.
        $other = User::factory()->create([
            'name' => 'Other User',
            'email' => 'other@example.com',
        ]);

        foreach ([
            [1, 'lunch', 'Tomato soup', null],
            [3, 'dinner', 'Grilled salmon', 'With lemon'],
        ] as [$day, $meal, $dish, $notes]) {
            $other->mealPlans()->create(compact('day', 'meal', 'dish', 'notes'));
        }

        $this->seedRecipes($user, 0, 14);
        $this->seedRecipes($other, 14, 2);
    }

    private function seedRecipes(User $user, int $offset, int $count): void
    {
        $catalog = [
            ['Veggie chili', ['vegetarian', 'dinner', 'spicy'], 45, [[400, 'g', 'kidney beans'], [1, 'piece', 'onion'], [2, 'tbsp', 'chili powder']]],
            ['Pancakes', ['breakfast', 'vegetarian', 'quick'], 20, [[200, 'g', 'flour'], [300, 'ml', 'milk'], [2, 'piece', 'eggs']]],
            ['Chicken curry', ['dinner', 'spicy'], 50, [[500, 'g', 'chicken breast'], [400, 'ml', 'coconut milk'], [2, 'tbsp', 'curry paste']]],
            ['Greek salad', ['vegetarian', 'quick', 'lunch'], 15, [[3, 'piece', 'tomatoes'], [200, 'g', 'feta'], [1, 'piece', 'cucumber']]],
            ['Spaghetti carbonara', ['dinner', 'quick'], 25, [[200, 'g', 'spaghetti'], [100, 'g', 'bacon'], [2, 'piece', 'eggs']]],
            ['Overnight oats', ['breakfast', 'vegetarian', 'quick'], 5, [[80, 'g', 'oats'], [250, 'ml', 'milk'], [1, 'tbsp', 'honey']]],
            ['Tomato soup', ['vegetarian', 'lunch'], 35, [[800, 'g', 'tomatoes'], [1, 'piece', 'onion'], [500, 'ml', 'vegetable stock']]],
            ['Grilled salmon', ['dinner', 'fish', 'quick'], 20, [[2, 'piece', 'salmon fillets'], [1, 'piece', 'lemon'], [1, 'tbsp', 'olive oil']]],
            ['Banana bread', ['baking', 'vegetarian', 'dessert'], 70, [[3, 'piece', 'bananas'], [250, 'g', 'flour'], [100, 'g', 'sugar']]],
            ['Beef tacos', ['dinner', 'spicy'], 30, [[400, 'g', 'ground beef'], [8, 'piece', 'tortillas'], [1, 'tsp', 'cumin']]],
            ['Mushroom risotto', ['vegetarian', 'dinner'], 40, [[300, 'g', 'arborio rice'], [250, 'g', 'mushrooms'], [1, 'l', 'vegetable stock']]],
            ['Chocolate mousse', ['dessert', 'vegetarian'], 30, [[200, 'g', 'dark chocolate'], [3, 'piece', 'eggs'], [200, 'ml', 'cream']]],
            ['Avocado toast', ['breakfast', 'vegetarian', 'quick'], 10, [[2, 'piece', 'bread slices'], [1, 'piece', 'avocado'], [null, null, 'chili flakes']]],
            ['Lentil dal', ['vegetarian', 'dinner', 'spicy'], 40, [[250, 'g', 'red lentils'], [1, 'tsp', 'turmeric'], [1, 'piece', 'onion']]],
            ['Pesto pasta', ['vegetarian', 'quick', 'lunch'], 15, [[250, 'g', 'penne'], [3, 'tbsp', 'basil pesto'], [null, null, 'parmesan']]],
            ['Apple crumble', ['dessert', 'baking', 'vegetarian'], 55, [[4, 'piece', 'apples'], [150, 'g', 'flour'], [100, 'g', 'butter']]],
        ];

        foreach (array_slice($catalog, $offset, $count) as [$title, $tags, $time, $ingredients]) {
            $recipe = $user->recipes()->create([
                'title' => $title,
                'description' => "A simple homemade {$title}.",
                'servings' => 2 + count($tags),
                'total_time' => $time,
                'tags' => $tags,
                'steps' => ['Prepare and measure all ingredients.', 'Cook everything together until done.', 'Season to taste and serve.'],
            ]);

            foreach ($ingredients as $position => [$quantity, $unit, $name]) {
                $recipe->ingredients()->create(compact('position', 'quantity', 'unit', 'name'));
            }
        }
    }
}
