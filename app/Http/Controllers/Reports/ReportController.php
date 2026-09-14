<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Http\Requests\Report\ReportFilterRequest;
use App\Models\Product;
use App\Models\Sale;
use App\Models\StockTransaction;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function index(ReportFilterRequest $request): Response
    {
        $from = $request->date('from')?->startOfDay() ?? now()->startOfMonth();
        $to = $request->date('to')?->endOfDay() ?? now()->endOfDay();

        $completedSales = Sale::query()->where('status', 'completed')->whereBetween('sold_at', [$from, $to]);

        return Inertia::render('operations/Index', ['section' => 'reports', 'title' => 'Reports', 'description' => 'Turn store activity into clear, actionable business reports.', 'summary' => ['sales' => (clone $completedSales)->sum('total'), 'transactions' => (clone $completedSales)->count(), 'products' => Product::where('active', true)->count(), 'movements' => StockTransaction::whereBetween('created_at', [$from, $to])->count()], 'filters' => ['from' => $from->toDateString(), 'to' => $to->toDateString()]]);
    }
}
