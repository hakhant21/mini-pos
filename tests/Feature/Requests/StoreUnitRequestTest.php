<?php

use App\Http\Requests\Units\StoreUnitRequest;

test('authorizes requests', function () {
    $request = new StoreUnitRequest;
    expect($request->authorize())->toBeTrue();
});

test('has validation rules', function () {
    $request = new StoreUnitRequest;
    $rules = $request->rules();

    expect($rules)->toHaveKeys(['name', 'abbreviation']);
    expect($rules['name'])->toContain('required', 'unique:units,name');
    expect($rules['abbreviation'])->toContain('required');
});
