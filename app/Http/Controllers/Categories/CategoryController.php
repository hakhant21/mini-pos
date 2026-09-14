<?php

namespace App\Http\Controllers\Categories;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', Category::class);

        return Inertia::render('operations/Index', ['section' => 'categories', 'title' => 'Categories', 'description' => 'Organize your products into fast, searchable groups.', 'categories' => Category::withCount('products')->latest()->paginate(20)]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', Category::class);

        $data = $request->validate(['name' => ['required', 'string', 'max:100', 'unique:categories,name'], 'description' => ['nullable', 'string']]);
        $data['slug'] = Str::slug($data['name']);
        Category::create($data);

        return back()->with('success', 'Category created.');
    }

    public function update(Request $request, Category $category): RedirectResponse
    {
        $this->authorize('update', $category);

        $data = $request->validate(['name' => ['required', 'string', 'max:100', 'unique:categories,name,'.$category->id], 'description' => ['nullable', 'string'], 'active' => ['boolean']]);
        $data['slug'] = Str::slug($data['name']);
        $category->update($data);

        return back()->with('success', 'Category updated.');
    }

    public function destroy(Category $category): RedirectResponse
    {
        $this->authorize('delete', $category);

        abort_if($category->products()->exists(), 422, 'Remove products from this category first.');
        $category->delete();

        return back()->with('success', 'Category deleted.');
    }
}
