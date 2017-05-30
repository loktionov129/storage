<?
	$this->AddEditAction($arItem['ID'], $arItem['EDIT_LINK'], CIBlock::GetArrayByID($arItem["IBLOCK_ID"], "ELEMENT_EDIT"));
	$this->AddDeleteAction($arItem['ID'], $arItem['DELETE_LINK'], CIBlock::GetArrayByID($arItem["IBLOCK_ID"], "ELEMENT_DELETE"), array("CONFIRM" => GetMessage('CT_BNL_ELEMENT_DELETE_CONFIRM')));
?>
<article id="<?=$this->GetEditAreaId($arItem["ID"]);?>">
    <p><?=$arItem["SOME_INFO"]?></p>
</article>



// Настройка свойства инфоблока
//Подсказка в умном фильтре для посетителей	
$res_prop =CIBlockSectionPropertyLink::GetArray(99);

