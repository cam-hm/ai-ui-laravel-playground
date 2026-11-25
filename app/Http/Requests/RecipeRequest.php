<?php

namespace App\Http\Requests;

use App\Models\Recipe;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RecipeRequest extends FormRequest
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
            'title' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:1000'],
            'servings' => ['required', 'integer', 'between:1,20'],
            'total_time' => ['nullable', 'integer', 'min:1', 'max:65535'],
            'tags' => ['nullable', 'array', 'max:20'],
            'tags.*' => ['string', 'max:30'],
            'ingredients' => ['required', 'array', 'min:1', 'max:100'],
            'ingredients.*.quantity' => ['nullable', 'numeric', 'min:0', 'max:1000000'],
            'ingredients.*.unit' => ['nullable', Rule::in(Recipe::UNITS)],
            'ingredients.*.name' => ['required', 'string', 'max:120'],
            'steps' => ['required', 'array', 'min:1', 'max:100'],
            'steps.*' => ['required', 'string', 'max:2000'],
        ];
    }

    public function messages(): array
    {
        return [
            'ingredients.required' => 'Add at least one ingredient.',
            'ingredients.min' => 'Add at least one ingredient.',
            'steps.required' => 'Add at least one step.',
            'steps.min' => 'Add at least one step.',
            'ingredients.*.name.required' => 'Enter a name for this ingredient.',
            'steps.*.required' => 'Write this step or remove it.',
        ];
    }
}
