<?php

use App\Models\User;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk();
});

test('authenticated users can record their opening balance for today', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('balances.store'), [
        'opening_amount' => 50000,
    ]);

    $response->assertRedirect(route('dashboard'));
    $this->assertDatabaseHas('balances', [
        'user_id' => $user->id,
        'opening_amount' => 50000,
    ]);
});
