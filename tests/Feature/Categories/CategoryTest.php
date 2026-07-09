<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

test('index loads categories', function () {
    Category::factory()->count(3)->create();

    $response = $this->get(route('categories.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('categories/index')
        ->has('categories.data', 3)
    );
});

test('store creates category', function () {
    $response = $this->post(route('categories.store'), [
        'name' => 'New Category',
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    expect(Category::where('name', 'New Category')->exists())->toBeTrue();
});

test('store validates required fields', function () {
    $response = $this->post(route('categories.store'), []);
    $response->assertSessionHasErrors('name');
});

test('store validates unique name', function () {
    Category::factory()->create(['name' => 'Existing']);

    $response = $this->post(route('categories.store'), [
        'name' => 'Existing',
    ]);
    $response->assertSessionHasErrors('name');
});

test('update modifies category', function () {
    $category = Category::factory()->create(['name' => 'Old Name']);

    $response = $this->patch(route('categories.update', $category), [
        'name' => 'Updated Name',
    ]);

    $response->assertRedirect();
    expect($category->fresh()->name)->toBe('Updated Name');
});

test('update validates unique name', function () {
    Category::factory()->create(['name' => 'First']);
    $second = Category::factory()->create(['name' => 'Second']);

    $response = $this->patch(route('categories.update', $second), [
        'name' => 'First',
    ]);
    $response->assertSessionHasErrors('name');
});

test('update allows same name', function () {
    $category = Category::factory()->create(['name' => 'Same']);

    $response = $this->patch(route('categories.update', $category), [
        'name' => 'Same',
    ]);

    $response->assertSessionDoesntHaveErrors('name');
});

test('destroy soft deletes category', function () {
    $category = Category::factory()->create();

    $response = $this->delete(route('categories.destroy', $category));

    $response->assertRedirect();
    expect(Category::find($category->id))->toBeNull();
    expect(Category::withTrashed()->find($category->id))->not->toBeNull();
});

test('destroy prevents deletion with products', function () {
    $category = Category::factory()->create();
    Product::factory()->forCategory($category)->create();

    $response = $this->delete(route('categories.destroy', $category));

    $response->assertRedirect();
    expect($response->getSession()->get('error'))->toContain('associated products');
    expect(Category::find($category->id))->not->toBeNull();
});

test('toggle active flips status', function () {
    $category = Category::factory()->create(['is_active' => true]);

    $this->patch(route('categories.toggle-active', $category));
    expect($category->fresh()->is_active)->toBeFalse();

    $this->patch(route('categories.toggle-active', $category));
    expect($category->fresh()->is_active)->toBeTrue();
});

test('restore brings back deleted category', function () {
    $category = Category::factory()->create();
    $category->delete();

    $this->patch(route('categories.restore', $category->id));

    expect(Category::find($category->id))->not->toBeNull();
});

test('guest is redirected', function () {
    auth()->logout();

    $this->get(route('categories.index'))->assertRedirect(route('login'));
});
