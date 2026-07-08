<?php

namespace App\Http\Controllers\Units;

use App\Http\Controllers\Controller;
use App\Http\Requests\Units\StoreUnitRequest;
use App\Http\Requests\Units\UpdateUnitRequest;
use App\Http\Resources\UnitResource;
use App\Models\Unit;
use Illuminate\Http\RedirectResponse;
use Inertia\Response;

class UnitController extends Controller
{
    public function index(): Response
    {
        $units = Unit::query()
            ->withCount('productVariants')
            ->orderBy('name')
            ->paginate(10);

        return inertia('units/index', [
            'units' => UnitResource::collection($units),
        ]);
    }

    public function store(StoreUnitRequest $request): RedirectResponse
    {
        Unit::create($request->validated());

        return redirect()->back()->with('success', 'Unit created successfully.');
    }

    public function update(UpdateUnitRequest $request, Unit $unit): RedirectResponse
    {
        $unit->update($request->validated());

        return redirect()->back()->with('success', 'Unit updated successfully.');
    }

    public function destroy(Unit $unit): RedirectResponse
    {
        if ($unit->productVariants()->exists()) {
            return redirect()->back()->with('error', 'Cannot delete unit that is in use by a variant.');
        }

        $unit->delete();

        return redirect()->back()->with('success', 'Unit deleted successfully.');
    }
}
