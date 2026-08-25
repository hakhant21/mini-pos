<?php

namespace App\Http\Controllers\Balances;

use App\Http\Controllers\Controller;
use App\Http\Requests\Balances\StoreBalanceRequest;
use App\Http\Requests\Balances\UpdateBalanceRequest;
use App\Http\Resources\BalanceResource;
use App\Models\Balance;
use App\Models\Sale;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BalanceController extends Controller
{
    public function index(Request $request): Response
    {
        $balances = Balance::query()
            ->with('user')
            ->when($request->filled('name'), function ($query) use ($request) {
                $query->whereHas('user', function ($q) use ($request) {
                    $q->where('name', 'like', '%' . $request->name . '%');
                });
            })
            ->when($request->filled('start_date'), function ($query) use ($request) {
                $query->whereDate('created_at', '>=', $request->start_date);
            })
            ->when($request->filled('end_date'), function ($query) use ($request) {
                $query->whereDate('created_at', '<=', $request->end_date);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return inertia('balances/index', [
            'balances' => BalanceResource::collection($balances),
        ]);
    }

    public function store(StoreBalanceRequest $request): RedirectResponse
    {
        $sales = Sale::where('created_at')->query();
        $openingAmount = $request->validated('opening_amount');

        $totalSaleAmount = $sales->sum('total_amount');
        $totalChangeAmount = $sales->sum('change');

        $closingAmount = $totalSaleAmount - $totalChangeAmount;

        Balance::create([
            'opening_amount' => $openingAmount,
            'closing_amount' => $closingAmount,
            'total_sale_amount' => $totalSaleAmount,
            'total_change_amount' => $totalChangeAmount,
            'user_id' => auth()->id(),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Balance created successfully.']);

        return redirect()->back();
    }

    public function update(UpdateBalanceRequest $request, Balance $balance): RedirectResponse
    {
        $data = $request->validated();

        $balance->update($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Balance updated successfully.']);

        return redirect()->back();
    }

    public function destroy(Balance $balance): RedirectResponse
    {
        $balance->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Balance deleted successfully.']);

        return redirect()->back();
    }
}
