<?php

use App\Http\Requests\Units\UpdateUnitRequest;
use App\Models\Unit;
use Illuminate\Http\Request;
use Illuminate\Routing\Route;

test('authorizes requests', function () {
    $request = new UpdateUnitRequest;
    expect($request->authorize())->toBeTrue();
});

test('has validation rules', function () {
    $unit = Unit::factory()->create();
    $route = new Route('PATCH', '/units/{unit}', fn () => null);
    $route->bind(Request::create('/units/' . $unit->id, 'PATCH'));

    $request = new UpdateUnitRequest;
    $request->setRouteResolver(fn () => $route);

    $rules = $request->rules();

    expect($rules)->toHaveKeys(['name', 'abbreviation']);
    expect($rules['name'])->toContain('required');
    expect($rules['abbreviation'])->toContain('required');
});
