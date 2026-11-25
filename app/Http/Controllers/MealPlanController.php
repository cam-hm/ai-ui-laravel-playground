<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMealPlanRequest;
use App\Models\MealPlan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MealPlanController extends Controller
{
    public function index(Request $request): Response
    {
        $entries = $request->user()->mealPlans()
            ->get()
            ->sort(fn (MealPlan $a, MealPlan $b) => [$a->day, array_search($a->meal, MealPlan::MEALS), $a->id]
                <=> [$b->day, array_search($b->meal, MealPlan::MEALS), $b->id])
            ->values()
            ->map(fn (MealPlan $e) => [
                'id' => $e->id,
                'day' => $e->day,
                'meal' => $e->meal,
                'dish' => $e->dish,
                'notes' => $e->notes,
            ]);

        return Inertia::render('meal-plans', [
            'entries' => $entries,
            'days' => MealPlan::DAYS,
            'meals' => MealPlan::MEALS,
        ]);
    }

    public function store(StoreMealPlanRequest $request): RedirectResponse
    {
        $request->user()->mealPlans()->create($request->validated());

        return back();
    }

    public function destroy(Request $request, MealPlan $mealPlan): RedirectResponse
    {
        abort_unless($mealPlan->user_id === $request->user()->id, 403);

        $mealPlan->delete();

        return back();
    }
}
