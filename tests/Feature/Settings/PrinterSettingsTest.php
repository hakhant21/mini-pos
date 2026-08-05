<?php

use App\Models\Printer;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create(['role' => 'admin']);
    $this->actingAs($this->user);
});

test('printer settings page loads', function () {
    $response = $this->get(route('settings.printer.edit'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('settings/printer')
        ->where('printer.enabled', false)
        ->where('printer.name', '')
        ->where('printer.address', '')
        ->where('printer.phone_one', null)
        ->where('printer.phone_two', null)
        ->where('printer.copies', 2)
        ->where('printer.auto_cut', true)
    );
});

test('printer settings can be updated', function () {
    $response = $this->patch(route('settings.printer.update'), [
        'enabled' => true,
        'name' => 'My Shop',
        'address' => '123 Main Street',
        'phone_one' => '09 123 456 789',
        'phone_two' => '09 987 654 321',
        'device_name' => 'RP58 Bluetooth',
        'device_address' => '00:11:22:33:44:55',
        'copies' => 2,
        'auto_cut' => true,
    ]);

    $response->assertRedirect();

    $settings = Printer::current();
    expect($settings->enabled)->toBeTrue()
        ->and($settings->name)->toBe('My Shop')
        ->and($settings->address)->toBe('123 Main Street')
        ->and($settings->phone_one)->toBe('09 123 456 789')
        ->and($settings->phone_two)->toBe('09 987 654 321')
        ->and($settings->device_name)->toBe('RP58 Bluetooth')
        ->and($settings->device_address)->toBe('00:11:22:33:44:55')
        ->and($settings->copies)->toBe(2)
        ->and($settings->auto_cut)->toBeTrue();
});

test('printer settings validates copies', function () {
    $response = $this->patch(route('settings.printer.update'), [
        'copies' => 0,
    ]);

    $response->assertSessionHasErrors('copies');
});

test('printer settings update keeps existing values when booleans omitted', function () {
    Printer::current()->update(['enabled' => true, 'auto_cut' => true, 'copies' => 3]);

    $this->patch(route('settings.printer.update'), [
        'device_name' => 'My Printer',
        'copies' => 3,
    ]);

    $settings = Printer::current();
    expect($settings->enabled)->toBeFalse()
        ->and($settings->auto_cut)->toBeFalse()
        ->and($settings->copies)->toBe(3);
});
