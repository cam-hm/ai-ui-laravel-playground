<?php

namespace App\Http\Requests;

use App\Models\MealPlan;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMealPlanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, list<mixed>>
     */
    public function rules(): array
    {
        return [
            'day' => ['required', 'integer', 'between:0,6'],
            'meal' => ['required', Rule::in(MealPlan::MEALS)],
            'dish' => ['required', 'string', 'max:100'],
            'notes' => ['nullable', 'string', 'max:500'],
        ];
    }
}
