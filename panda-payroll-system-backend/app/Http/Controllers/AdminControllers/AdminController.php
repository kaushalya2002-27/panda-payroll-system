<?php
namespace App\Http\Controllers\AdminControllers;

use App\Http\Controllers\Controller;
use App\Models\ComAssigneeLevel;
use App\Repositories\All\AssigneeLevel\AssigneeLevelInterface;
use App\Repositories\All\ComPermission\ComPermissionInterface;
use App\Repositories\All\User\UserInterface;
use App\Services\ProfileImageService;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    protected $userInterface;
    protected $comPermissionInterface;
    protected $assigneeLevelInterface;
    protected $profileImageService;

    public function __construct(UserInterface $userInterface, ComPermissionInterface $comPermissionInterface, AssigneeLevelInterface $assigneeLevelInterface, ProfileImageService $profileImageService)
    {
        $this->userInterface          = $userInterface;
        $this->comPermissionInterface = $comPermissionInterface;
        $this->assigneeLevelInterface = $assigneeLevelInterface;
        $this->profileImageService    = $profileImageService;
    }

    public function index()
    {
        $users = $this->userInterface->All();

        $userData = $users->map(function ($user) {
            $userArray = $user->toArray();

            //  wrap in try-catch so one bad record doesn't crash the whole list
            try {
                $permission = $this->comPermissionInterface->getById($user->userType);
            } catch (\Exception $e) {
                $permission = null;
            }

            $userArray['userType'] = [
                'id'          => $permission->id ?? null,
                'userType'    => $permission->userType ?? null,
                'description' => $permission->description ?? null,
            ];

            //  wrap in try-catch
            try {
                $assigneeLevel = $this->assigneeLevelInterface->getById($user->assigneeLevel);
            } catch (\Exception $e) {
                $assigneeLevel = null;
            }

            $userArray['userLevel'] = $assigneeLevel ? [
                'id'        => $assigneeLevel->id,
                'levelId'   => $assigneeLevel->levelId,
                'levelName' => $assigneeLevel->levelName,
            ] : [];

            $profileImages = is_array($user->profileImage) ? $user->profileImage : json_decode($user->profileImage, true) ?? [];
            $signedImages = [];

            foreach ($profileImages as $uri) {
                try {
                    $signed = $this->profileImageService->getImageUrl($uri);
                } catch (\Exception $e) {
                    $signed = null;
                }
                $signedImages[] = [
                    'fileName'  => $signed['fileName'] ?? null,
                    'imageUrl' => $signed['signedUrl'] ?? null,
                ];
            }

            $userArray['profileImage'] = $signedImages;

            return $userArray;
        });

        return response()->json($userData, 200);
    }


    public function show(Request $request)
    {
        $user     = $request->user();
        $userType = $user->userType;

        try {
            $permission = $this->comPermissionInterface->getById($userType);
        } catch (\Exception $e) {
            $permission = null;
        }

        $userData = $user->toArray();

        $userData['userType'] = [
            'id'          => $permission->id ?? null,
            'userType'    => $permission->userType ?? null,
            'description' => $permission->description ?? null,
        ];

        $userData['permissionObject'] = $permission ? (array) $permission->permissionObject : [];

        $userData['assigneeLevel'] = collect($user->assigneeLevel)->map(function ($level) {
        return [
            'id'        => $level->id ?? null,
            'levelId'   => $level->levelId ?? null,
            'levelName' => $level->levelName ?? null,
        ];
    });

        return response()->json($userData, 200);
    }

    public function update(Request $request, string $id)
    {
        $user = $this->userInterface->findById($id);

        $rules = [
            'availability' => 'nullable|boolean',
        ];

        // Apply these rules only when availability is 1
        if ($request->input('availability', $user->availability) == 1) {
            $rules = array_merge($rules, [
                'name'          => 'required|string',
                'department'    => 'nullable|string',
                'assigneeLevel' => 'required|string',
                'jobPosition'   => 'nullable|string',
                // employeeId is optional — Admin/Manager/CEO accounts
                // won't have one linked, only normal staff accounts will.
                'employeeId'    => 'nullable|numeric',
            ]);
        }

        $request->validate($rules);

        $user->name          = $request->input('name', $user->name);
        $user->department    = $request->input('department', $user->department);
        $user->assigneeLevel = $request->input('assigneeLevel', $user->assigneeLevel);
        $user->jobPosition   = $request->input('jobPosition', $user->jobPosition);
        $user->employeeId    = $request->input('employeeId', $user->employeeId);
        $user->availability  = $request->input('availability', $user->availability);

        $user->save();

        return response()->json($user->toArray(), 200);
    }


    public function assigneeLevel()
    {
        $sections = ComAssigneeLevel::all();

        return response()->json([
            'assigneeLevels' => $sections,
        ], 200);
    }

    /**
     * Give a guest user basic (Insight only) access and activate them.
     */
    public function giveAccess(string $id)
    {
        $user = $this->userInterface->findById($id);

        if (! $user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        // Default access: Insight page only, everything else false
        $defaultPermissionObject = [
            'INSIGHT_VIEW'                        => true,
            'ADMIN_USERS_VIEW'                     => false,
            'ADMIN_USERS_EDIT'                      => false,
            'ADMIN_USERS_DELETE'                    => false,
            'ADMIN_ACCESS_MNG_VIEW'                 => false,
            'ADMIN_ACCESS_MNG_CREATE'               => false,
            'ADMIN_ACCESS_MNG_EDIT'                 => false,
            'ADMIN_ACCESS_MNG_DELETE'               => false,
            'PAYROLL_DASHBOARD_VIEW'                => false,
            'PAYROLL_ALL_EMPLOYEES_VIEW'            => false,
            'PAYROLL_ALL_EMPLOYEES_EDIT'            => false,
            'PAYROLL_ALL_EMPLOYEES_DELETE'          => false,
            'PAYROLL_ADD_EMPLOYEE_VIEW'             => false,
            'PAYROLL_ADD_EMPLOYEE_CREATE'           => false,
            'PAYROLL_TIME_CARDS_VIEW'               => false,
            'PAYROLL_TIME_CARDS_CREATE'             => false,
            'PAYROLL_TIME_CARDS_EDIT'               => false,
            'PAYROLL_MONTHLY_SUMMARY_VIEW'          => false,
            'PAYROLL_PAY_SLIPS_VIEW'                => false,
            'PAYROLL_DETAIL_SHEETS_VIEW'            => false,
            'PAYROLL_PRODUCTS_RATES_VIEW'           => false,
            'PAYROLL_PRODUCTS_RATES_CREATE'         => false,
            'PAYROLL_PRODUCTS_RATES_EDIT'           => false,
            'PAYROLL_PRODUCTS_RATES_DELETE'         => false,
            'PAYROLL_DEPARTMENTS_POSITIONS_VIEW'    => false,
            'PAYROLL_DEPARTMENTS_POSITIONS_CREATE'  => false,
            'PAYROLL_DEPARTMENTS_POSITIONS_EDIT'    => false,
            'PAYROLL_DEPARTMENTS_POSITIONS_DELETE'  => false,
        ];

        // Make sure the permission name is unique
        $permissionName = $user->name;
        $existing = $this->comPermissionInterface->getByColumn(['userType' => $permissionName]);
        if ($existing->isNotEmpty()) {
            $permissionName = $user->name . ' (' . $user->id . ')';
        }

        $permission = $this->comPermissionInterface->create([
            'userType'         => $permissionName,
            'description'      => 'Individual access for ' . $user->name,
            'permissionObject' => $defaultPermissionObject,
        ]);

        // Link user to their new permission record and activate them
        $user->userType     = $permission->id;
        $user->availability = 1;
        $user->save();

        return response()->json([
            'message' => 'Access given successfully.',
            'user'    => $user,
        ], 200);
    }

}
