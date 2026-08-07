<?php

namespace App\Traits;

use Illuminate\Support\Facades\Storage;

trait HasImage
{
    public function uploadImage($path, $file, $disk = 'public')
    {
        $uid = uniqid();

        $path = $file->storeAs($path, $uid . '.' . $file->extension(), $disk);

        return $path;
    }

    public function deleteImage($image, $disk = 'public')
    {
        // Convert the database path to the correct storage path
        $filePath = str_replace('storage/', '', $image);

        if (Storage::disk($disk)->exists($filePath)) {
            Storage::disk($disk)->delete($filePath);

            return true;
        }

        return false;
    }
}
