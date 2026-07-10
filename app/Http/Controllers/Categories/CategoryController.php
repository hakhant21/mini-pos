<?php

namespace App\Http\Controllers\Categories;

use App\Http\Controllers\Controller;
use App\Http\Requests\Categories\StoreCategoryRequest;
use App\Http\Requests\Categories\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(): Response
    {
        $categories = Category::query()
            ->withCount('products')
            ->orderBy('name')
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

        return redirect()->back()->with('success', 'Category created successfully.');
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

        return redirect()->back()->with('success', 'Category updated successfully.');
    }

    public function destroy(Category $category): RedirectResponse
    {
        if ($category->products()->exists()) {
            return redirect()->back()->with('error', 'Cannot delete category with associated products.');
        }

        $category->delete();

        return redirect()->back()->with('success', 'Category deleted successfully.');
    }

    public function restore(int $id): RedirectResponse
    {
        $category = Category::withTrashed()->findOrFail($id);
        $category->restore();

        return redirect()->back()->with('success', 'Category restored successfully.');
    }

    public function toggleActive(Category $category): RedirectResponse
    {
        $category->update(['is_active' => !$category->is_active]);

        return redirect()->back()->with('success', 'Category status updated successfully.');
    }
}
