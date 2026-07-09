<?php

use App\Models\ProductVariant;
use App\Models\Unit;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

test('index loads units', function () {
    Unit::factory()->count(3)->create();

    $response = $this->get(route('units.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('units/index')
        ->has('units.data', 3)
    );
});

test('store creates unit', function () {
    $response = $this->post(route('units.store'), [
        'name' => 'Bottle',
        'abbreviation' => 'btl',
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');
    expect(Unit::where('name', 'Bottle')->exists())->toBeTrue();
});

test('store validates required fields', function () {
    $this->post(route('units.store'), [])
        ->assertSessionHasErrors(['name', 'abbreviation']);
});

test('store validates unique name', function () {
    Unit::factory()->create(['name' => 'Bottle']);

    $this->post(route('units.store'), [
        'name' => 'Bottle',
        'abbreviation' => 'btl',
    ])->assertSessionHasErrors('name');
});

test('update modifies unit', function () {
    $unit = Unit::factory()->create(['name' => 'Old']);

    $this->patch(route('units.update', $unit), [
        'name' => 'Updated',
        'abbreviation' => 'upd',
    ]);

    expect($unit->fresh()->name)->toBe('Updated');
});

test('update validates unique name', function () {
    Unit::factory()->create(['name' => 'First']);
    $second = Unit::factory()->create(['name' => 'Second']);

    $this->patch(route('units.update', $second), [
        'name' => 'First',
        'abbreviation' => 'xxx',
    ])->assertSessionHasErrors('name');
});

test('destroy deletes unit', function () {
    $unit = Unit::factory()->create();

    $this->delete(route('units.destroy', $unit));

    expect(Unit::find($unit->id))->toBeNull();
});

test('destroy prevents deletion when in use', function () {
    $unit = Unit::factory()->create();
    ProductVariant::factory()->withUnit($unit)->create();

    $response = $this->delete(route('units.destroy', $unit));

    $response->assertRedirect();
    expect($response->getSession()->get('error'))->toContain('in use');
    expect(Unit::find($unit->id))->not->toBeNull();
});

test('guest is redirected', function () {
    auth()->logout();
    $this->get(route('units.index'))->assertRedirect(route('login'));
});
