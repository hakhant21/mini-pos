<?php

namespace App\Http\Controllers\Suppliers;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SupplierController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', Supplier::class);

        return Inertia::render('operations/Index', ['section' => 'suppliers', 'title' => 'Suppliers', 'description' => 'Keep supplier contacts and purchasing terms in one place.', 'suppliers' => Supplier::latest()->paginate(20)]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', Supplier::class);

        Supplier::create($request->validate(['name' => ['required', 'string', 'max:255'], 'contact_name' => ['nullable', 'string', 'max:255'], 'email' => ['nullable', 'email'], 'phone' => ['nullable', 'string', 'max:50'], 'address' => ['nullable', 'string']]));

        return back()->with('success', 'Supplier created.');
    }

    public function update(Request $request, Supplier $supplier): RedirectResponse
    {
        $this->authorize('update', $supplier);

        $supplier->update($request->validate(['name' => ['required', 'string', 'max:255'], 'contact_name' => ['nullable', 'string', 'max:255'], 'email' => ['nullable', 'email'], 'phone' => ['nullable', 'string', 'max:50'], 'address' => ['nullable', 'string'], 'active' => ['boolean']]));

        return back()->with('success', 'Supplier updated.');
    }

    public function destroy(Supplier $supplier): RedirectResponse
    {
        $this->authorize('delete', $supplier);

        $supplier->update(['active' => false]);

        return back()->with('success', 'Supplier archived.');
    }
}
