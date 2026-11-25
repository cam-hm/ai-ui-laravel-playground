<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $recipe_id
 * @property int $position
 * @property string|null $quantity
 * @property string|null $unit
 * @property string $name
 */
class RecipeIngredient extends Model
{
    protected $fillable = ['recipe_id', 'position', 'quantity', 'unit', 'name'];

    /** @return BelongsTo<Recipe, $this> */
    public function recipe(): BelongsTo
    {
        return $this->belongsTo(Recipe::class);
    }
}
