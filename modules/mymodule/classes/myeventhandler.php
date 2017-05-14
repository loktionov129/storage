<?
class myeventhandler
{
    function MyOnBuildGlobalMenu(&$aGlobalMenu, &$aModuleMenu) 
    { 
        foreach($aModuleMenu as $k => $v)
        { 
            if($v["parent_menu"] == "global_menu_settings" && $v["items_id"] == "menu_users")
            { 
                $aModuleMenu[$k]["items"][] = Array(
                    "text" => "Кастомный пункт пользователей",
                    "url" => "user_custom.php?lang=".LANG,
                    "title" => "Своя страница пользователей"
                ); 
            } 
        } 
    }
}
