<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;

class ProfileImageService
{
    /**
     * Get image URL. $path is the relative path within the "public" disk
     * (storage/app/public), as stored by uploadImageToGCS().
     *
     * @param string|null $path
     * @return array|null
     */
    public function getImageUrl($path)
    {
        if (empty($path)) {
            return null;
        }

        return [
            'signedUrl' => Storage::disk('public')->url($path),
            'fileName'  => basename($path),
        ];
    }

    public function uploadImageToGCS($file)
    {
        $path = $file->store('profile-images', 'public');

        return ['gsutil_uri' => $path];
    }

    public function deleteImageFromGCS($uri)
    {
        if (empty($uri)) {
            return true;
        }

        return Storage::disk('public')->delete($uri);
    }
}
