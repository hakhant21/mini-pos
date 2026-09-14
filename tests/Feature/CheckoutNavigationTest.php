<?php

use App\Models\User;

test('guests are redirected from store operations', function (string $path) {
    $this->get($path)->assertRedirect(route('login'));
})->with(['/checkout', '/products', '/inventory', '/reports']);

test('authenticated users can open checkout and operations', function (string $path) {
    $user = User::factory()->create(['role' => 'manager']);

    $this->actingAs($user)->get($path)->assertOk();
})->with(['/checkout', '/products', '/inventory', '/sales']);

test('unknown store operations return not found', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->get('/not-a-store-section')->assertNotFound();
});

test('reports reject an invalid date range', function () {
    $user = User::factory()->create(['role' => 'manager']);

    $this->actingAs($user)
        ->get(route('reports.index', ['from' => '2026-09-10', 'to' => '2026-09-09']))
        ->assertSessionHasErrors('to');
});

test('cashiers cannot access store management screens', function (string $path) {
    $user = User::factory()->create(['role' => 'cashier']);

    $this->actingAs($user)->get($path)->assertForbidden();
})->with(['/categories', '/suppliers', '/purchases', '/adjustments', '/reports', '/products/create']);

test('admins can access cashier and management screens', function (string $path) {
    $user = User::factory()->create(['role' => 'admin']);

    $this->actingAs($user)->get($path)->assertOk();
})->with(['/checkout', '/sales', '/products', '/categories', '/suppliers', '/purchases', '/inventory', '/adjustments', '/reports', '/products/create', '/purchases/create', '/adjustments/create']);
