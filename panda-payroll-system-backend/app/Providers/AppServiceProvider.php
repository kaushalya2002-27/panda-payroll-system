<?php
namespace App\Providers;

use App\Repositories\All\AssigneeLevel\AssigneeLevelInterface;
use App\Repositories\All\AssigneeLevel\AssigneeLevelRepository;

use App\Repositories\All\ComDepartment\DepartmentInterface;
use App\Repositories\All\ComDepartment\DepartmentRepository;
use App\Repositories\All\ComJobPosition\JobPositionInterface;
use App\Repositories\All\ComJobPosition\JobPositionRepository;
use App\Repositories\All\ComOrganization\ComOrganizationInterface;
use App\Repositories\All\ComOrganization\ComOrganizationRepository;
use App\Repositories\All\ComPermission\ComPermissionInterface;
use App\Repositories\All\ComPermission\ComPermissionRepository;
use App\Repositories\All\ComPersonType\PersonTypeInterface;
use App\Repositories\All\ComPersonType\PersonTypeRepository;
use App\Repositories\All\ComResponsibleSection\ComResponsibleSectionInterface;
use App\Repositories\All\ComResponsibleSection\ComResponsibleSectionRepository;
use App\Repositories\All\ComUserType\UserTypeInterface;
use App\Repositories\All\ComUserType\UserTypeRepository;


use App\Repositories\All\Factory\FactoryInterface;
use App\Repositories\All\Factory\FactoryRepository;


use App\Repositories\All\User\UserInterface;
use App\Repositories\All\User\UserRepository;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        $this->app->bind(DepartmentInterface::class, DepartmentRepository::class);
        $this->app->bind(FactoryInterface::class, FactoryRepository::class);
        $this->app->bind(UserInterface::class, UserRepository::class);
        $this->app->bind(JobPositionInterface::class, JobPositionRepository::class);
        $this->app->bind(UserTypeInterface::class, UserTypeRepository::class);
        $this->app->bind(AssigneeLevelInterface::class, AssigneeLevelRepository::class);

        $this->app->bind(ComResponsibleSectionInterface::class, ComResponsibleSectionRepository::class);
        $this->app->bind(PersonTypeInterface::class, PersonTypeRepository::class);
        $this->app->bind(ComPermissionInterface::class, ComPermissionRepository::class);



        $this->app->bind(ComOrganizationInterface::class, ComOrganizationRepository::class);
    }
}
