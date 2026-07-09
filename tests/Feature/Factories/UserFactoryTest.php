<?php

use App\Models\User;

test('creates a user', function () {
    $user = User::factory()->create();
    expect($user)->toBeInstanceOf(User::class);
    expect($user->name)->not->toBeEmpty();
    expect($user->email)->not->toBeEmpty();
});

test('creates unverified user', function () {
    $user = User::factory()->unverified()->create();
    expect($user->email_verified_at)->toBeNull();
});
