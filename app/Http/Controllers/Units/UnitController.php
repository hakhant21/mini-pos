<?php

namespace App\Http\Controllers\Units;

use App\Http\Controllers\Controller;
use App\Http\Requests\Units\StoreUnitRequest;
use App\Http\Requests\Units\UpdateUnitRequest;
use App\Http\Resources\UnitResource;
use App\Models\Unit;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class UnitController extends Controller
{
    public function index(): Response
    {
        $units = Unit::query()
            ->withCount('productVariants')
            ->orderBy('name')
            ->get();

        return inertia('units/index', [
            'units' => UnitResource::collection($units),
        ]);
    }

    public function store(StoreUnitRequest $request): RedirectResponse
    {
        Unit::create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Unit created successfully.']);

        return redirect()->back();
    }

    public function update(UpdateUnitRequest $request, Unit $unit): RedirectResponse
    {
        $unit->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Unit updated successfully.']);

        return redirect()->back();
    }

    public function destroy(Unit $unit): RedirectResponse
    {
        if ($unit->productVariants()->exists()) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Cannot delete unit that is in use by a variant.']);

            return redirect()->back();
        }

        $unit->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Unit deleted successfully.']);

        return redirect()->back();
    }
}
