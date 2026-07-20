<?php

namespace App\Http\Controllers\Categories;

use App\Http\Controllers\Controller;
use App\Http\Requests\Categories\StoreCategoryRequest;
use App\Http\Requests\Categories\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(): Response
    {
        $categories = Category::query()
            ->withCount('products')
            ->orderBy('created_at', 'asc')
            ->get();

        return inertia('categories/index', [
            'categories' => CategoryResource::collection($categories),
        ]);
    }

    public function store(StoreCategoryRequest $request): RedirectResponse
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('images/categories', 'public');
        }

        Category::create($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Category created successfully.']);

        return redirect()->back();
    }

    public function update(UpdateCategoryRequest $request, Category $category): RedirectResponse
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            if ($category->image) {
                Storage::disk('public')->delete($category->image);
            }
            $data['image'] = $request->file('image')->store('images/categories', 'public');
        } else {
            unset($data['image']);
        }

        $category->update($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Category updated successfully.']);

        return redirect()->back();
    }

    public function destroy(Category $category): RedirectResponse
    {
        if ($category->products()->exists()) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Cannot delete category with associated products.']);

            return redirect()->back();
        }

        $category->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Category deleted successfully.']);

        return redirect()->back();
    }

    public function restore(int $id): RedirectResponse
    {
        $category = Category::withTrashed()->findOrFail($id);
        $category->restore();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Category restored successfully.']);

        return redirect()->back();
    }

    public function toggleActive(Category $category): RedirectResponse
    {
        $category->update(['is_active' => !$category->is_active]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Category status updated successfully.']);

        return redirect()->back();
    }
}
