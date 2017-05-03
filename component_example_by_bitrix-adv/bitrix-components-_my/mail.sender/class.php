<?if(!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED!==true) die();

class CDemoSqr extends CBitrixComponent
{
    //Родительский метод проходит по всем параметрам переданным в $APPLICATION->IncludeComponent
    //и применяет к ним функцию htmlspecialcharsex. В данном случае такая обработка избыточна.
    //Переопределяем.
    public function onPrepareComponentParams($arParams)
    {
        $result = array(
            "CACHE_TYPE" => $arParams["CACHE_TYPE"],
            "CACHE_TIME" => isset($arParams["CACHE_TIME"]) ?$arParams["CACHE_TIME"]: 36000000,
            "X" => intval($arParams["X"]),
        );
        return $result;
    }

    public function sqr($x)
    {
        return $x * $x;
    }
	
    public function executeComponent()
    {
        if($this->startResultCache())
        {
            $this->arResult["Y"] = $this->sqr($this->arParams["X"]);
            $this->includeComponentTemplate();
        }
        return $this->arResult["Y"];
    }
	
}?>