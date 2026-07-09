<?php

use App\Models\Unit;

test('creates a unit', function () {
    $unit = Unit::factory()->create();
    expect($unit)->toBeInstanceOf(Unit::class);
    expect($unit->name)->not->toBeEmpty();
    expect($unit->abbreviation)->not->toBeEmpty();
});
