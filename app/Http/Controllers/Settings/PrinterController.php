<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Printer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PrinterController extends Controller
{
    public function edit(): Response
    {
        $settings = Printer::current();

        return Inertia::render('settings/printer', [
            'printer' => [
                'enabled' => $settings->enabled,
                'name' => $settings->name,
                'address' => $settings->address,
                'phone_one' => $settings->phone_one,
                'phone_two' => $settings->phone_two,
                'device_name' => $settings->device_name,
                'device_address' => $settings->device_address,
                'copies' => $settings->copies,
                'auto_cut' => $settings->auto_cut,
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'enabled' => ['nullable', 'boolean'],
            'name' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:255'],
            'phone_one' => ['nullable', 'string', 'max:50'],
            'phone_two' => ['nullable', 'string', 'max:50'],
            'device_name' => ['nullable', 'string', 'max:255'],
            'device_address' => ['nullable', 'string', 'max:255'],
            'copies' => ['required', 'integer', 'min:1', 'max:10'],
            'auto_cut' => ['nullable', 'boolean'],
        ]);

        $settings = Printer::current();
        $settings->update([
            'enabled' => $request->boolean('enabled'),
            'name' => $data['name'] ?? '',
            'address' => $data['address'] ?? '',
            'phone_one' => $data['phone_one'] ?? null,
            'phone_two' => $data['phone_two'] ?? null,
            'device_name' => $data['device_name'] ?? null,
            'device_address' => $data['device_address'] ?? null,
            'copies' => (int) $data['copies'],
            'auto_cut' => $request->boolean('auto_cut'),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Printer settings saved successfully.']);

        return redirect()->back();
    }
}
