<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Users\StoreUserRequest;
use App\Http\Requests\Users\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(): Response
    {
        $users = User::query()
            ->whereNot('id', auth()->user()->id)
            ->orderBy('name')
            ->get();

        return inertia('settings/users/index', [
            'users' => UserResource::collection($users),
        ]);
    }

    public function create(): Response
    {
        return inertia('settings/users/create-user');
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        User::create([
            ...$request->validated(),
            'password' => Hash::make($request->validated('password')),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'User created successfully.']);

        return redirect()->route('settings.users.index');
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $data = $request->validated();

        if (empty($data['password'])) {
            unset($data['password']);
        } else {
            $data['password'] = Hash::make($data['password']);
        }

        $user->update($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'User updated successfully.']);

        return redirect()->back();
    }

    public function destroy(User $user): RedirectResponse
    {
        if ($user->id === auth()->id()) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'You cannot delete your own account.']);

            return redirect()->back();
        }

        $user->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'User deleted successfully.']);

        return redirect()->back();
    }
}
