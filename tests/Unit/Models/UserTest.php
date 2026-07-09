<?php

use App\Models\User;

test('has fillable attributes', function () {
    $user = new User;
    expect($user->getFillable())->toBe(['name', 'email', 'password', 'role']);
});

test('hides sensitive attributes', function () {
    $user = new User;
    expect($user->getHidden())->toContain('password');
    expect($user->getHidden())->toContain('two_factor_secret');
    expect($user->getHidden())->toContain('two_factor_recovery_codes');
    expect($user->getHidden())->toContain('remember_token');
});

test('has casts', function () {
    $user = new User;
    expect($user->getCasts())->toHaveKey('email_verified_at', 'datetime');
    expect($user->getCasts())->toHaveKey('password', 'hashed');
});

test('can create user with factory', function () {
    $user = User::factory()->create();
    expect($user)->toBeInstanceOf(User::class);
    expect($user->name)->not->toBeEmpty();
    expect($user->email)->not->toBeEmpty();
});

test('unverified state works', function () {
    $user = User::factory()->unverified()->create();
    expect($user->email_verified_at)->toBeNull();
});

test('password is hashed', function () {
    $user = User::factory()->create(['password' => 'plain-text']);
    expect($user->password)->not->toBe('plain-text');
    expect(password_verify('plain-text', $user->password))->toBeTrue();
});
