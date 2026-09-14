<?php

namespace App\Policies;

use App\Models\User;

class ReportPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'manager'], true);
    }
}
