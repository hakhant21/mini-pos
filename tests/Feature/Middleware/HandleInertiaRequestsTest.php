<?php

use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

test('shares locale', function () {
    $response = $this->get(route('sales.index'));
    $response->assertInertia(fn ($page) => $page->where('locale', config('app.locale')));
});

test('shares app name', function () {
    $response = $this->get(route('sales.index'));
    $response->assertInertia(fn ($page) => $page->where('name', config('app.name')));
});

test('shares auth user', function () {
    $response = $this->get(route('sales.index'));
    $response->assertInertia(fn ($page) => $page->where('auth.user.id', $this->user->id));
});

test('shares sidebar state', function () {
    $this->withUnencryptedCookie('sidebar_state', 'true');
    $response = $this->get(route('sales.index'));
    $response->assertInertia(fn ($page) => $page->where('sidebarOpen', true));
});
