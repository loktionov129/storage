<?if(!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED!==true) die();

class CMailSender extends CBitrixComponent
{
    public function onPrepareComponentParams($arParams)
    {
        $result = array();
        return $result;
    }
	
    public function executeComponent()
    {    
		global $USER;
		if ($USER->IsAuthorized())
		{
			$rsUser = CUser::GetByID($USER->GetID());
			$arUser = $rsUser->Fetch();
			$this->arResult["LOGIN"] = $arUser["LOGIN"];
			$this->arResult["EMAIL"] = $arUser["EMAIL"];
		}
		else
		{
			$this->arResult["LOGIN"] = "";
			$this->arResult["EMAIL"] = "";
		}

		$this->includeComponentTemplate();
    }
}?>