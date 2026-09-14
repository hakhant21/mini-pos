<?php

namespace App\Http\Controllers\Balances;

use App\Http\Controllers\Controller;
use App\Http\Requests\Balance\StoreBalanceRequest;
use App\Models\Balance;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;

class BalanceController extends Controller
{
    public function store(StoreBalanceRequest $request): RedirectResponse
    {
        DB::transaction(function () use ($request): void {
            $balance = Balance::query()
                ->where('user_id', $request->user()->id)
                ->whereDate('created_at', today())
                ->latest('id')
                ->first();

            if ($balance) {
                $balance->opening_amount = $request->validated('opening_amount');
                $balance->closing_amount = $balance->opening_amount + $balance->total_sale_amount - $balance->total_change_amount;
                $balance->save();
            } else {
                Balance::create([
                    'user_id' => $request->user()->id,
                    'opening_amount' => $request->validated('opening_amount'),
                    'closing_amount' => $request->validated('opening_amount'),
                ]);
            }
        });

        return to_route('dashboard')->with('success', 'Opening balance recorded.');
    }
}
