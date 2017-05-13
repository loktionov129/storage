<?
use Bitrix\Main\EventManager;
class mymodule extends CModule
{
    var $MODULE_ID = "mymodule";
    var $MODULE_VERSION;
    var $MODULE_VERSION_DATE;
    var $MODULE_NAME;
    var $MODULE_DESCRIPTION;
    var $MODULE_CSS;

    function mymodule()
    {
        $arModuleVersion = array();

        $path = str_replace("\\", "/", __FILE__);
        $path = substr($path, 0, strlen($path) - strlen("/index.php"));
        include($path."/version.php");

        if (is_array($arModuleVersion) && array_key_exists("VERSION", $arModuleVersion))
        {
            $this->MODULE_VERSION = $arModuleVersion["VERSION"];
            $this->MODULE_VERSION_DATE = $arModuleVersion["VERSION_DATE"];
        }

        $this->MODULE_NAME = "mymodule – модуль с компонентом";
        $this->MODULE_DESCRIPTION = "После установки вы сможете пользоваться компонентами my:date.current, my.mail.sender";
    }

    function InstallFiles($arParams = array())
    {
        CopyDirFiles($_SERVER["DOCUMENT_ROOT"]."/bitrix/modules/mymodule/install/components",
                     $_SERVER["DOCUMENT_ROOT"]."/bitrix/components", true, true);
                     
        CopyDirFiles($_SERVER["DOCUMENT_ROOT"]."/bitrix/modules/mymodule/admin",
                     $_SERVER["DOCUMENT_ROOT"]."/bitrix/admin", true, true);
        return true;
    }

    function UnInstallFiles()
    {
        DeleteDirFilesEx("/bitrix/components/my");
        \Bitrix\Main\IO\File::deleteFile($_SERVER["DOCUMENT_ROOT"]."/bitrix/admin/user_custom.php");
        return true;
    }


    function DoInstall()
    {   
        EventManager::getInstance()->registerEventHandler(
            "main",
            "OnBuildGlobalMenu",
            "mymodule",
            "myeventhandler", "MyOnBuildGlobalMenu"
        );
        
        global $DOCUMENT_ROOT, $APPLICATION;
        $this->InstallFiles();
        RegisterModule("mymodule");
        $APPLICATION->IncludeAdminFile("Установка модуля mymodule", $DOCUMENT_ROOT."/bitrix/modules/mymodule/install/step.php");
    }

    function DoUninstall()
    {
        EventManager::getInstance()->unRegisterEventHandler(
            "main",
            "OnBuildGlobalMenu",
            "mymodule",
            "myeventhandler", "MyOnBuildGlobalMenu"
        );
        
        global $DOCUMENT_ROOT, $APPLICATION;
        $this->UnInstallFiles();
        UnRegisterModule("mymodule");
        $APPLICATION->IncludeAdminFile("Деинсталляция модуля mymodule", $DOCUMENT_ROOT."/bitrix/modules/mymodule/install/unstep.php");
    }
}
?>
