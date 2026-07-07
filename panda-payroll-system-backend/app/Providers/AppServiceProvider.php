<?php
namespace App\Providers;

use App\Repositories\All\AssigneeLevel\AssigneeLevelInterface;
use App\Repositories\All\AssigneeLevel\AssigneeLevelRepository;
use App\Repositories\All\ClinicalSuite\ClinicalSuiteInterface;
use App\Repositories\All\ClinicalSuite\ClinicalSuiteRepository;
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
use App\Repositories\All\CsConsultingDoctor\ConsultingInterface;
use App\Repositories\All\CsConsultingDoctor\ConsultingRepository;
use App\Repositories\All\CsDesignation\DesignationInterface;
use App\Repositories\All\CsDesignation\DesignationRepository;
use App\Repositories\All\CsMedicineStock\MedicineStockInterface;
use App\Repositories\All\CsMedicineStock\MedicineStockRepository;
use App\Repositories\All\Factory\FactoryInterface;
use App\Repositories\All\Factory\FactoryRepository;
use App\Repositories\All\HRCategory\HRCategoryInterface;
use App\Repositories\All\HRCategory\HRCategoryRepository;
use App\Repositories\All\HRDivision\HRDivisionInterface;
use App\Repositories\All\HRDivision\HRDivisionRepository;
use App\Repositories\All\SaCmChemicalManagementRecode\ChemicalManagementRecodeInterface;
use App\Repositories\All\SaCmChemicalManagementRecode\ChemicalManagementRecodeRepository;
use App\Repositories\All\SaCmCmrChemicalFormType\ChemicalFormTypeInterface;
use App\Repositories\All\SaCmCmrChemicalFormType\ChemicalFormTypeRepository;
use App\Repositories\All\SaCmCmrCommercialName\CommercialNameInterface;
use App\Repositories\All\SaCmCmrCommercialName\CommercialNameRepository;
use App\Repositories\All\SaCmCmrHazardType\CmrHazardTypeInterface;
use App\Repositories\All\SaCmCmrHazardType\CmrHazardTypeRepository;
use App\Repositories\All\SaCmCmrProductStandard\ProductStandardInterface;
use App\Repositories\All\SaCmCmrProductStandard\ProductStandardRepository;
use App\Repositories\All\SaCmCmrUseOfPPE\CmrUseOfPPEInterface;
use App\Repositories\All\SaCmCmrUseOfPPE\CmrUseOfPPERepository;
use App\Repositories\All\SaCmCmrZdhcCategory\ZdhcCategoryInterface;
use App\Repositories\All\SaCmCmrZdhcCategory\ZdhcCategoryRepository;
use App\Repositories\All\SaCmPirCertificateRecord\CertificateRecordInterface;
use App\Repositories\All\SaCmPirCertificateRecord\CertificateRecordRepository;
use App\Repositories\All\SaCmPirPositiveList\PositiveListInterface;
use App\Repositories\All\SaCmPirPositiveList\PositiveListRepository;
use App\Repositories\All\SaCmPirSuplierName\SuplierNameInterface;
use App\Repositories\All\SaCmPirSuplierName\SuplierNameRepository;
use App\Repositories\All\SaCmPirTestingLab\TestingLabInterface;
use App\Repositories\All\SaCmPirTestingLab\TestingLabRepository;
use App\Repositories\All\SaCmPurchaseInventory\PurchaseInventoryInterface;
use App\Repositories\All\SaCmPurchaseInventory\PurchaseInventoryRepository;
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
        $this->app->bind(HRCategoryInterface::class, HRCategoryRepository::class);
        $this->app->bind(HRDivisionInterface::class, HRDivisionRepository::class);
        $this->app->bind(ComResponsibleSectionInterface::class, ComResponsibleSectionRepository::class);
        $this->app->bind(PersonTypeInterface::class, PersonTypeRepository::class);
        $this->app->bind(ComPermissionInterface::class, ComPermissionRepository::class);
        $this->app->bind(ClinicalSuiteInterface::class, ClinicalSuiteRepository::class);
        $this->app->bind(DesignationInterface::class, DesignationRepository::class);
        $this->app->bind(ConsultingInterface::class, ConsultingRepository::class);
        $this->app->bind(MedicineStockInterface::class, MedicineStockRepository::class);

        $this->app->bind(ChemicalManagementRecodeInterface::class, ChemicalManagementRecodeRepository::class);
        $this->app->bind(CommercialNameInterface::class, CommercialNameRepository::class);
        $this->app->bind(ChemicalFormTypeInterface::class, ChemicalFormTypeRepository::class);
        $this->app->bind(ZdhcCategoryInterface::class, ZdhcCategoryRepository::class);
        $this->app->bind(ProductStandardInterface::class, ProductStandardRepository::class);
        $this->app->bind(CmrHazardTypeInterface::class, CmrHazardTypeRepository::class);
        $this->app->bind(CmrUseOfPPEInterface::class, CmrUseOfPPERepository::class);
        $this->app->bind(PurchaseInventoryInterface::class, PurchaseInventoryRepository::class);
        $this->app->bind(CertificateRecordInterface::class, CertificateRecordRepository::class);
        $this->app->bind(TestingLabInterface::class, TestingLabRepository::class);
        $this->app->bind(PositiveListInterface::class, PositiveListRepository::class);
        $this->app->bind(SuplierNameInterface::class, SuplierNameRepository::class);
        $this->app->bind(ComOrganizationInterface::class, ComOrganizationRepository::class);
    }
}
