<?php

use App\Http\Resources\UnitResource;
use App\Models\Unit;

test('returns expected keys', function () {
    $unit = Unit::factory()->create();
    $resource = UnitResource::make($unit)->resolve(request());
    expect($resource)->toHaveKeys(['id', 'name', 'abbreviation', 'created_at', 'updated_at']);
});
